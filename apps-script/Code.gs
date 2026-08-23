// Growth-metric ingest endpoint for the Coding Practice apps
// (problem-sets/python + problem-sets/webdev in the
// Madison-Park-CPWD.github.io repo). Receives one POST per "Download My
// Work" click, containing a student's full attempt history across every
// exercise they've touched — see docs/practice-design-session-summary-*.md
// in that repo for the design context. See README.md in this folder for
// how to deploy this as a Web App.
//
// Deliberately write-only: this file never reads back what's already in
// the sheet through the public endpoint. The Web App has to be deployed
// with "Who has access: Anyone" so anonymous student browsers can POST to
// it, which means the URL itself can't be treated as a secret — keeping
// it write-only keeps the worst case of that being spam rows, not a data
// leak. Don't add a doGet() (or anything else) that reads sheet contents
// back out through this same endpoint.

// CODE_VERSION: bump this on every change handed over for pasting into
// the Apps Script editor — shows up in the doGet() response, so visiting
// the deployed URL confirms exactly which version is actually live
// (useful both for you, pasting in the editor, and for testing from here).
const CODE_VERSION = "1";

const SHEET_NAME = "Attempts";
const HEADER = [
  "Received At", "Student", "Track", "Unit", "Exercise",
  "Attempt Timestamp", "Passed", "Test Results", "Submission",
];

const ERROR_LOG_SHEET_NAME = "ErrorLog";
const ERROR_LOG_HEADER = ["Timestamp", "Message", "Context"];

// Neither console.error() nor Logger.log() reliably surfaced in the
// Executions view for real Web App-triggered runs (only for
// manually-run-in-editor ones) — a real gap in that view, not a
// logging-API choice. Writing to a sheet tab is already proven reliable
// (see "Attempts"), so errors go there instead, where they're always
// visible without depending on that view at all.
function logError(message, context) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(ERROR_LOG_SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(ERROR_LOG_SHEET_NAME);
      sheet.getRange(1, 1, 1, ERROR_LOG_HEADER.length).setValues([ERROR_LOG_HEADER]);
      sheet.setFrozenRows(1);
    }
    sheet.appendRow([new Date().toISOString(), message, context || ""]);
  } catch (err) {
    // If even the error-logging write fails, there's nothing further to
    // do — don't let a logging failure break the actual response.
  }
}

// Visiting the deployed URL directly in a browser hits this — useful for
// confirming the deployment itself works before testing the real POST
// flow from the practice apps.
function doGet() {
  return ContentService.createTextOutput(
    "This endpoint only accepts POST requests from the practice apps. (Code.gs v" + CODE_VERSION + ")"
  );
}

function doPost(e) {
  // Multiple students can submit within the same moment; without a lock,
  // two concurrent executions could both read "last row" before either
  // has written, and clobber each other's rows. waitLock() lives inside
  // the try now (not before it) so a lock-timeout also comes back as a
  // clean JSON error instead of an unhandled platform error; lockAcquired
  // tracks whether releaseLock() is actually safe to call in finally,
  // since waitLock() throwing means the lock was never ours to release.
  const lock = LockService.getScriptLock();
  let lockAcquired = false;
  try {
    lock.waitLock(30000);
    lockAcquired = true;

    const parsed = parsePayload(e);
    if (parsed.error) {
      return jsonResponse({ status: "error", message: parsed.error });
    }
    const rows = buildRows(parsed.data);
    if (rows.length > 0) {
      appendRows(rows);
    }
    return jsonResponse({ status: "ok", rowsWritten: rows.length });
  } catch (err) {
    logError("doPost failed", String(err));
    return jsonResponse({ status: "error", message: String(err) });
  } finally {
    if (lockAcquired) {
      lock.releaseLock();
    }
  }
}

// Parses and shape-validates the request body. Returns { data } on
// success or { error } on failure — never throws, so a malformed or
// unexpected request can't crash the execution before the lock releases.
// Every rejection goes to the "ErrorLog" sheet tab via logError() (see
// above for why, not the Executions view) — this endpoint has to accept
// requests from anyone, so a malformed request needs to leave a visible
// trace to debug, not vanish.
function parsePayload(e) {
  if (!e || !e.postData || !e.postData.contents) {
    logError("parsePayload rejected: missing request body", "");
    return { error: "missing request body" };
  }
  let data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    logError("parsePayload rejected: body is not valid JSON", String(err) + " | raw contents: " + e.postData.contents);
    return { error: "body is not valid JSON" };
  }
  if (typeof data.student !== "string" || !data.student.trim()) {
    logError("parsePayload rejected: missing student", JSON.stringify(data.student));
    return { error: "missing student" };
  }
  if (data.track !== "python" && data.track !== "webdev") {
    logError("parsePayload rejected: invalid track", JSON.stringify(data.track));
    return { error: "track must be \"python\" or \"webdev\"" };
  }
  if (!Array.isArray(data.units)) {
    logError("parsePayload rejected: units is not an array", JSON.stringify(data.units));
    return { error: "units must be an array" };
  }
  return { data: data };
}

// Flattens the nested { units: [{ unit, exercises: [{ exercise, history }] }] }
// payload into one row per attempt — the shape the growth-metric calc
// script (not written yet) will read from the sheet. Skips anything
// malformed at the unit/exercise/attempt level rather than failing the
// whole batch over one bad entry.
function buildRows(data) {
  const receivedAt = new Date().toISOString();
  const rows = [];
  (data.units || []).forEach(function (unit) {
    if (!unit || typeof unit.unit !== "string" || !Array.isArray(unit.exercises)) return;
    unit.exercises.forEach(function (ex) {
      if (!ex || typeof ex.exercise !== "string" || !Array.isArray(ex.history)) return;
      ex.history.forEach(function (attempt) {
        if (!attempt || typeof attempt.timestamp !== "string") return;

        let submission;
        if (data.track === "python") {
          submission = JSON.stringify({ code: attempt.code });
        } else {
          submission = JSON.stringify({ html: attempt.html, css: attempt.css, js: attempt.js });
        }

        rows.push([
          receivedAt,
          data.student,
          data.track,
          unit.unit,
          ex.exercise,
          attempt.timestamp,
          !!attempt.passed,
          JSON.stringify(attempt.testResults || []),
          submission,
        ]);
      });
    });
  });
  return rows;
}

const EXERCISE_COLUMN = 5; // must match HEADER's "Exercise" position

function appendRows(rows) {
  const sheet = getOrCreateSheet();
  // Reset the WHOLE row range back to Sheets' default format first, then
  // force plain text on ONLY the Exercise column. The reset matters, not
  // just the narrower scope: an earlier version of this fix set plain-
  // text format on every column (including the boolean "Passed" one,
  // which corrupted every false into the string "FALSE" -- and
  // !!"FALSE" is true in JS). Sheets' cell format is persistent metadata
  // that sticks around regardless of what later code does -- simply no
  // longer setting "@" on that column doesn't undo it, since it was
  // already set. Explicitly resetting to "General" every call guarantees
  // a clean, known state regardless of what any earlier deployment left
  // behind.
  const fullRange = sheet.getRange(1, 1, sheet.getMaxRows(), HEADER.length);
  fullRange.setNumberFormat("General");
  sheet.getRange(1, EXERCISE_COLUMN, sheet.getMaxRows(), 1).setNumberFormat("@");
  SpreadsheetApp.flush();

  sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, HEADER.length).setValues(rows);
}

function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.getRange(1, 1, 1, HEADER.length).setValues([HEADER]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
