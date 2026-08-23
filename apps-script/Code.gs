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

const SHEET_NAME = "Attempts";
const HEADER = [
  "Received At", "Student", "Track", "Unit", "Exercise",
  "Attempt Timestamp", "Passed", "Test Results", "Submission",
];

// Visiting the deployed URL directly in a browser hits this — useful for
// confirming the deployment itself works before testing the real POST
// flow from the practice apps.
function doGet() {
  return ContentService.createTextOutput(
    "This endpoint only accepts POST requests from the practice apps."
  );
}

function doPost(e) {
  // Multiple students can submit within the same moment; without a lock,
  // two concurrent executions could both read "last row" before either
  // has written, and clobber each other's rows.
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
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
    return jsonResponse({ status: "error", message: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// Parses and shape-validates the request body. Returns { data } on
// success or { error } on failure — never throws, so a malformed or
// unexpected request can't crash the execution before the lock releases.
function parsePayload(e) {
  if (!e || !e.postData || !e.postData.contents) {
    return { error: "missing request body" };
  }
  let data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    return { error: "body is not valid JSON" };
  }
  if (typeof data.student !== "string" || !data.student.trim()) {
    return { error: "missing student" };
  }
  if (data.track !== "python" && data.track !== "webdev") {
    return { error: "track must be \"python\" or \"webdev\"" };
  }
  if (!Array.isArray(data.units)) {
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

function appendRows(rows) {
  const sheet = getOrCreateSheet();
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
