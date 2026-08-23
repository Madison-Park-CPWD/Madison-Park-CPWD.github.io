// Growth-metric calculation script. Reads the "Attempts" sheet (written by
// Code.gs's doPost()), computes the three metrics decided in
// docs/practice-design-session-summary-*.md — Grit, first-attempt success
// rate, error-reading — plus the difficulty-normalized growth trend, and
// writes results to two new tabs. Run manually (runGrowthMetrics) or wire
// up a time-based trigger later; this never runs automatically on its own.
//
// Deliberately NOT reachable through the public doPost()/doGet() endpoint
// — this reads student data, so it only ever runs from inside the Apps
// Script editor (or a trigger you control), never through the public URL.

// GROWTH_METRICS_VERSION: bump this on every change handed over for
// pasting into the Apps Script editor — logged at the start of every run,
// so the Execution log confirms exactly which version actually ran (this
// file has no doGet() to check against directly, unlike Code.gs).
const GROWTH_METRICS_VERSION = "1";

// Update this if it's wrong — used to fetch unit/difficulty data live from
// the deployed site rather than duplicating it here, so re-rating
// difficulty never requires touching this script.
const SITE_BASE_URL = "https://madison-park-cpwd.github.io/";
const TRACK_UNIT_DIRS = { python: "problem-sets/python/units", webdev: "problem-sets/webdev/units" };
const GROWTH_CONFIG_URL = "problem-sets/growth-metric-config.json";

const GROWTH_SCORES_SHEET_NAME = "GrowthScores";
const GROWTH_SCORES_HEADER = [
  "Student", "Exercises Attempted", "Exercises Solved", "Grit (avg attempts to solve)",
  "First-Attempt Success Rate", "Error-Reading (repeat-mistake rate)",
  "Weeks With Data", "Growth Score", "Computed At",
];

const WEEK_SCORES_SHEET_NAME = "WeekScores";
const WEEK_SCORES_HEADER = ["Student", "Week Starting (Mon)", "Relative Performance (avg)", "Exercises This Week"];

// How many weeks count as "early" and "recent" when computing the growth
// trend — trailing N vs. leading N, shrinks automatically for students
// with fewer than 2N weeks of data (see computeGrowthScore).
const GROWTH_TREND_WINDOW_WEEKS = 2;

function runGrowthMetrics() {
  console.log("GrowthMetrics.gs v" + GROWTH_METRICS_VERSION);

  const expectedAttemptsLookup = buildExpectedAttemptsLookup();
  console.log("sample lookup keys: " + JSON.stringify(Object.keys(expectedAttemptsLookup).slice(0, 5)));

  const attempts = readAttempts();
  const grouped = groupByStudentExercise(attempts);

  const growthScoreRows = [];
  const weekScoreRows = [];
  const computedAt = new Date().toISOString();

  Object.keys(grouped).forEach(function (student) {
    const exerciseGroups = grouped[student];
    const statsList = [];
    const relativePerformances = [];

    Object.keys(exerciseGroups).forEach(function (exerciseKey) {
      const sortedAttempts = exerciseGroups[exerciseKey].slice().sort(function (a, b) {
        return a.timestamp < b.timestamp ? -1 : a.timestamp > b.timestamp ? 1 : 0;
      });
      const stats = computeExerciseStats(sortedAttempts);
      statsList.push(stats);

      if (sortedAttempts.length > 1) {
        console.log(student + " " + exerciseKey + ": group has "
          + exerciseGroups[exerciseKey].length + " raw attempts, sorted = "
          + JSON.stringify(sortedAttempts.map(function (a) { return { t: a.timestamp, p: a.passed }; }))
          + " -> attemptsTaken=" + stats.attemptsTaken + " solved=" + stats.solved);
      }

      if (stats.solved) {
        const expectedAttempts = expectedAttemptsLookup[exerciseKey];
        if (typeof expectedAttempts !== "number") {
          console.error("no lookup match for solved exercise key: " + JSON.stringify(exerciseKey));
        }
        const rp = computeRelativePerformance(stats, expectedAttempts);
        if (rp !== null) {
          relativePerformances.push({ firstPassTimestamp: stats.firstPassTimestamp, relativePerformance: rp });
        }
      }
    });

    const studentMetrics = computeStudentMetrics(statsList);
    const weekScores = computeWeekScores(relativePerformances);
    const growthScore = computeGrowthScore(weekScores, GROWTH_TREND_WINDOW_WEEKS);

    growthScoreRows.push([
      student,
      studentMetrics.attemptedCount,
      studentMetrics.solvedCount,
      studentMetrics.grit,
      studentMetrics.firstAttemptSuccessRate,
      studentMetrics.errorReadingRate,
      weekScores.length,
      growthScore,
      computedAt,
    ]);

    weekScores.forEach(function (w) {
      weekScoreRows.push([student, w.week, w.score, w.count]);
    });
  });

  writeGrowthScores(growthScoreRows);
  writeWeekScores(weekScoreRows);
}

// --- Reading Attempts ---

// Returns a flat array of { student, track, unit, exercise, timestamp,
// passed, testResults }, one entry per row, skipping the header row and
// anything that fails to parse (a malformed row shouldn't crash the whole
// calculation — this is defensive against manual edits to the sheet).
function readAttempts() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Attempts");
  if (!sheet || sheet.getLastRow() < 2) return [];

  const values = sheet.getRange(2, 1, sheet.getLastRow() - 1, 9).getValues();
  const attempts = [];
  values.forEach(function (row) {
    const student = row[1];
    const track = row[2];
    const unit = row[3];
    const exercise = row[4];
    const timestamp = row[5];
    const passed = row[6];
    const testResultsRaw = row[7];
    if (!student || !track || !unit || !exercise || !timestamp) return;

    let testResults = [];
    try {
      testResults = JSON.parse(testResultsRaw) || [];
    } catch (err) {
      testResults = [];
    }

    attempts.push({
      student: String(student),
      track: String(track),
      unit: String(unit),
      exercise: String(exercise),
      timestamp: String(timestamp),
      passed: !!passed,
      testResults: testResults,
    });
  });
  return attempts;
}

// Groups into { student: { "track|unit|exercise": [attempts] } }.
function groupByStudentExercise(attempts) {
  const grouped = {};
  attempts.forEach(function (a) {
    const exerciseKey = a.track + "|" + a.unit + "|" + a.exercise;
    if (!grouped[a.student]) grouped[a.student] = {};
    if (!grouped[a.student][exerciseKey]) grouped[a.student][exerciseKey] = [];
    grouped[a.student][exerciseKey].push(a);
  });
  return grouped;
}

// --- Per-exercise stats (pure logic, no Apps Script services) ---

function failingIndexSet(testResults) {
  const idx = [];
  (testResults || []).forEach(function (t, i) {
    if (!t || !t.passed) idx.push(i);
  });
  return idx;
}

function hadErrorPattern(testResults) {
  return (testResults || []).map(function (t) { return !!(t && t.hadError); });
}

function sameArray(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

// "Same mistake" = identical set of failing test indices AND identical
// hadError pattern across those tests, between two consecutive failed
// attempts on the same exercise.
function sameMistake(prevResults, currResults) {
  return sameArray(failingIndexSet(prevResults), failingIndexSet(currResults))
    && sameArray(hadErrorPattern(prevResults), hadErrorPattern(currResults));
}

// attempts must already be sorted ascending by timestamp.
function computeExerciseStats(attempts) {
  let firstPassIndex = -1;
  for (let i = 0; i < attempts.length; i++) {
    if (attempts[i].passed) { firstPassIndex = i; break; }
  }
  const solved = firstPassIndex !== -1;
  const attemptsTaken = solved ? firstPassIndex + 1 : attempts.length;
  const firstPassTimestamp = solved ? attempts[firstPassIndex].timestamp : null;
  const firstAttemptPassed = attempts.length > 0 && !!attempts[0].passed;

  let sameMistakePairs = 0;
  let totalFailurePairs = 0;
  for (let i = 1; i < attempts.length; i++) {
    if (!attempts[i - 1].passed && !attempts[i].passed) {
      totalFailurePairs++;
      if (sameMistake(attempts[i - 1].testResults, attempts[i].testResults)) {
        sameMistakePairs++;
      }
    }
  }

  return {
    solved: solved,
    attemptsTaken: attemptsTaken,
    firstPassTimestamp: firstPassTimestamp,
    firstAttemptPassed: firstAttemptPassed,
    sameMistakePairs: sameMistakePairs,
    totalFailurePairs: totalFailurePairs,
    totalAttempts: attempts.length,
  };
}

// --- Per-student aggregation across all their exercises ---

function computeStudentMetrics(exerciseStatsList) {
  let totalAttemptsTaken = 0;
  let solvedCount = 0;
  let firstAttemptPassCount = 0;
  let attemptedCount = 0;
  let sameMistakeTotal = 0;
  let failurePairTotal = 0;

  exerciseStatsList.forEach(function (s) {
    attemptedCount++;
    if (s.solved) {
      solvedCount++;
      totalAttemptsTaken += s.attemptsTaken;
    }
    if (s.firstAttemptPassed) firstAttemptPassCount++;
    sameMistakeTotal += s.sameMistakePairs;
    failurePairTotal += s.totalFailurePairs;
  });

  return {
    attemptedCount: attemptedCount,
    solvedCount: solvedCount,
    grit: solvedCount > 0 ? (totalAttemptsTaken / solvedCount) : null,
    firstAttemptSuccessRate: attemptedCount > 0 ? (firstAttemptPassCount / attemptedCount) : null,
    // Lower is better here — the fraction of consecutive-failure pairs
    // that repeated the identical mistake rather than trying something
    // different. null when a student has no consecutive-failure pairs at
    // all (either they don't fail twice in a row, or have too little data).
    errorReadingRate: failurePairTotal > 0 ? (sameMistakeTotal / failurePairTotal) : null,
  };
}

// --- Difficulty-normalized growth trend ---

function computeRelativePerformance(exerciseStats, expectedAttempts) {
  if (!exerciseStats.solved) return null;
  if (typeof expectedAttempts !== "number") return null;
  return expectedAttempts / exerciseStats.attemptsTaken;
}

// Monday (UTC) of the week containing `isoTimestamp`, as "yyyy-MM-dd" —
// used as a sortable, timezone-independent week-bucket key. Avoids ISO
// week-numbering's year-boundary edge cases entirely.
function weekKey(isoTimestamp) {
  const d = new Date(isoTimestamp);
  const utcDate = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = utcDate.getUTCDay(); // 0=Sun, 1=Mon, ... 6=Sat
  let diff;
  if (day === 0) {
    diff = -6;
  } else {
    diff = 1 - day;
  }
  utcDate.setUTCDate(utcDate.getUTCDate() + diff);
  return utcDate.toISOString().slice(0, 10);
}

// solvedExercisesWithRP: [{ firstPassTimestamp, relativePerformance }].
// Returns [{ week, score, count }] sorted ascending by week.
function computeWeekScores(solvedExercisesWithRP) {
  const byWeek = {};
  solvedExercisesWithRP.forEach(function (e) {
    const wk = weekKey(e.firstPassTimestamp);
    if (!byWeek[wk]) byWeek[wk] = [];
    byWeek[wk].push(e.relativePerformance);
  });
  const weeks = Object.keys(byWeek).sort();
  return weeks.map(function (wk) {
    const vals = byWeek[wk];
    const sum = vals.reduce(function (a, b) { return a + b; }, 0);
    return { week: wk, score: sum / vals.length, count: vals.length };
  });
}

// growth_score = avg(score, most recent N weeks) / avg(score, earliest N
// weeks) — N shrinks to floor(weeks/2) when there isn't enough data for
// two full non-overlapping windows, and returns null below 2 weeks of
// data entirely (a "trend" needs at least two points).
function computeGrowthScore(weekScores, windowSize) {
  if (weekScores.length < 2) return null;
  const n = Math.max(1, Math.min(windowSize, Math.floor(weekScores.length / 2)));
  const early = weekScores.slice(0, n);
  const recent = weekScores.slice(weekScores.length - n);
  const avg = function (arr) {
    return arr.reduce(function (s, w) { return s + w.score; }, 0) / arr.length;
  };
  const earlyAvg = avg(early);
  if (earlyAvg === 0) return null;
  return avg(recent) / earlyAvg;
}

// --- Difficulty lookup, fetched live from the deployed site ---

function fetchJson(url) {
  const res = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
  const code = res.getResponseCode();
  if (code !== 200) {
    console.error("fetchJson: HTTP " + code + " for " + url);
    return null;
  }
  try {
    return JSON.parse(res.getContentText());
  } catch (err) {
    console.error("fetchJson: JSON parse failed for " + url + ": " + err);
    return null;
  }
}

// Returns { "track|unit|exercise": expected_attempts }, combining each
// exercise's difficulty field with the category lookup table.
function buildExpectedAttemptsLookup() {
  const categoryLookup = fetchExpectedAttemptsByCategory();
  console.log("categoryLookup: " + JSON.stringify(categoryLookup));

  const lookup = {};
  Object.keys(TRACK_UNIT_DIRS).forEach(function (track) {
    const dir = TRACK_UNIT_DIRS[track];
    const manifestUrl = SITE_BASE_URL + dir + "/manifest.json";
    const manifest = fetchJson(manifestUrl);
    if (!manifest) {
      console.error("buildExpectedAttemptsLookup: couldn't load manifest at " + manifestUrl);
      return;
    }
    console.log(track + " manifest has " + manifest.length + " units: " + JSON.stringify(manifest));

    manifest.forEach(function (unitId, index) {
      // Filenames carry a two-digit prefix matching position in the
      // manifest (01-, 02-, ...) — the same deterministic convention
      // loadUnits() in each app's own app.js already relies on, so this
      // fetches the exact file directly instead of guessing numbers
      // until one works (which wasted requests and buried real errors
      // under expected near-miss 404s).
      const prefix = String(index + 1).padStart(2, "0");
      const unitUrl = SITE_BASE_URL + dir + "/" + prefix + "-" + unitId + ".json";
      const unit = fetchJson(unitUrl);
      if (!unit) {
        console.error("buildExpectedAttemptsLookup: couldn't load unit file at " + unitUrl);
        return;
      }
      (unit.exercises || []).forEach(function (ex) {
        const expected = categoryLookup[ex.difficulty];
        if (typeof expected === "number") {
          lookup[track + "|" + unitId + "|" + ex.id] = expected;
        } else {
          console.error("buildExpectedAttemptsLookup: no expected_attempts for difficulty="
            + JSON.stringify(ex.difficulty) + " on " + track + "|" + unitId + "|" + ex.id);
        }
      });
    });
  });

  console.log("expectedAttemptsLookup has " + Object.keys(lookup).length + " entries");
  return lookup;
}

function fetchExpectedAttemptsByCategory() {
  const config = fetchJson(SITE_BASE_URL + GROWTH_CONFIG_URL);
  if (!config || !config.expected_attempts_by_category) {
    console.error("fetchExpectedAttemptsByCategory: no expected_attempts_by_category in config: " + JSON.stringify(config));
    return {};
  }
  return config.expected_attempts_by_category;
}

// --- Writing output ---

function writeGrowthScores(rows) {
  const sheet = getOrCreateOutputSheet(GROWTH_SCORES_SHEET_NAME, GROWTH_SCORES_HEADER);
  clearDataRows(sheet, GROWTH_SCORES_HEADER.length);
  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, GROWTH_SCORES_HEADER.length).setValues(rows);
  }
}

function writeWeekScores(rows) {
  const sheet = getOrCreateOutputSheet(WEEK_SCORES_SHEET_NAME, WEEK_SCORES_HEADER);
  clearDataRows(sheet, WEEK_SCORES_HEADER.length);
  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, WEEK_SCORES_HEADER.length).setValues(rows);
  }
}

function getOrCreateOutputSheet(name, header) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.getRange(1, 1, 1, header.length).setValues([header]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

// Each run recomputes everything from scratch (idempotent, not
// incremental) — simplest correct option given class-sized data volumes;
// clearing before writing avoids stale rows from students/exercises that
// no longer appear (e.g. if Attempts data were ever pruned).
function clearDataRows(sheet, numCols) {
  if (sheet.getLastRow() > 1) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, numCols).clearContent();
  }
}
