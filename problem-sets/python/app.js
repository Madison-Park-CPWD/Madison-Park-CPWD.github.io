let pyodide = null;
let currentUnitIndex = 0;
let currentIndex = 0;
let solved = new Set();
let UNITS = []; // populated at boot by loadUnits()

const unitSelectEl = document.getElementById("unit-select");
const sidebarEl = document.getElementById("sidebar");
const problemPanelEl = document.getElementById("problem-panel");
const editorEl = document.getElementById("code-editor");
const consoleEl = document.getElementById("console");
const runBtn = document.getElementById("run-btn");
const resetBtn = document.getElementById("reset-btn");
const statusDot = document.getElementById("status-dot");
const statusText = document.getElementById("status-text");
const studentNameEl = document.getElementById("student-name");
const changeNameBtn = document.getElementById("change-name-btn");
const downloadBtn = document.getElementById("download-btn");
const reflectionOverlay = document.getElementById("reflection-overlay");
const reflectionUnitTitleEl = document.getElementById("reflection-unit-title");
const reflectionPromptEl = document.getElementById("reflection-prompt-text");
const reflectionTextarea = document.getElementById("reflection-textarea");
const reflectionSaveBtn = document.getElementById("reflection-save-btn");
const reflectionSkipBtn = document.getElementById("reflection-skip-btn");

// Fetches units/manifest.json (an ordered list of unit ids), then fetches
// units/<id>.json for each one, in that order. Reordering lessons only ever
// means editing manifest.json — no JS file needs to change.
async function loadUnits() {
  const manifestRes = await fetch("units/manifest.json");
  if (!manifestRes.ok) throw new Error(`Couldn't load units/manifest.json (${manifestRes.status})`);
  const order = await manifestRes.json();

  const units = [];
  for (const id of order) {
    const res = await fetch(`units/${id}.json`);
    if (!res.ok) {
      console.error(`Couldn't load units/${id}.json (${res.status}) — skipping it.`);
      continue;
    }
    units.push(await res.json());
  }
  return units;
}

function currentUnit() { return UNITS[currentUnitIndex]; }
function currentExercises() { return currentUnit().exercises; }

function solvedKey() { return `solved-${currentUnit().id}`; }
function draftKey(id) { return `draft-${currentUnit().id}-${id}`; }
function saveDraft(id, code) { localStorage.setItem(draftKey(id), code); }
function loadDraft(id) { return localStorage.getItem(draftKey(id)); }

function loadSolvedForUnit() {
  solved = new Set(JSON.parse(localStorage.getItem(solvedKey()) || "[]"));
}
function saveSolved() {
  localStorage.setItem(solvedKey(), JSON.stringify([...solved]));
}

// --- Attempt history: every "Run Tests" click gets logged (code + timestamp +
// pass/fail), not just the final solved status, so a downloaded export shows
// the whole trail of attempts, not just a snapshot of the end state. ---

function historyKey(unitId, exerciseId) {
  return `history-${unitId}-${exerciseId}`;
}

function loadHistory(unitId, exerciseId) {
  return JSON.parse(localStorage.getItem(historyKey(unitId, exerciseId)) || "[]");
}

function appendHistory(unitId, exerciseId, entry) {
  const key = historyKey(unitId, exerciseId);
  const hist = loadHistory(unitId, exerciseId);
  hist.push(entry);
  localStorage.setItem(key, JSON.stringify(hist));
}

// --- Unit reflections: one short free-text reflection per unit, prompted
// once the first time every exercise in that unit has been solved. Stored
// separately from exercise history so a student can only be asked once per
// unit (checked via hasReflection), but still shows up in their export. ---

function reflectionKey(unitId) {
  return `reflection-${unitId}`;
}

function hasReflection(unitId) {
  return localStorage.getItem(reflectionKey(unitId)) !== null;
}

function loadReflection(unitId) {
  const raw = localStorage.getItem(reflectionKey(unitId));
  return raw ? JSON.parse(raw) : null;
}

function saveReflection(unitId, text) {
  localStorage.setItem(reflectionKey(unitId), JSON.stringify({
    text,
    timestamp: new Date().toISOString(),
  }));
}

// The unit a currently-open reflection modal refers to — captured at the
// moment the modal opens, since the student could in theory switch units
// (via the dropdown or a hash change) while it's still open.
let reflectionTargetUnit = null;

function showReflectionModal(unit) {
  reflectionTargetUnit = unit;
  reflectionUnitTitleEl.textContent = unit.title;
  reflectionPromptEl.textContent = unit.reflection_prompt;
  reflectionTextarea.value = "";
  reflectionOverlay.classList.add("open");
  reflectionTextarea.focus();
}

function closeReflectionModal() {
  reflectionOverlay.classList.remove("open");
  reflectionTargetUnit = null;
}

reflectionSaveBtn.addEventListener("click", () => {
  if (reflectionTargetUnit) {
    const text = reflectionTextarea.value.trim();
    saveReflection(reflectionTargetUnit.id, text);
  }
  closeReflectionModal();
});

reflectionSkipBtn.addEventListener("click", () => {
  // Record an empty reflection so we know not to ask again for this unit,
  // without forcing the student to write something they don't want to.
  if (reflectionTargetUnit) {
    saveReflection(reflectionTargetUnit.id, "");
  }
  closeReflectionModal();
});

// --- Student name, used to label the downloaded export. Asked once, editable
// any time via the "change" link next to the name in the header. ---

function getStudentName() {
  return localStorage.getItem("student-name") || "";
}

function setStudentName(name) {
  localStorage.setItem("student-name", name.trim());
}

function promptForStudentName() {
  const current = getStudentName();
  const entered = window.prompt("What's your name? (used to label your downloaded work)", current);
  if (entered && entered.trim()) {
    setStudentName(entered);
    renderStudentName();
  }
}

function renderStudentName() {
  const name = getStudentName();
  studentNameEl.textContent = name ? name : "Set your name";
}

function renderUnitSelect() {
  unitSelectEl.innerHTML = "";
  UNITS.forEach((unit, i) => {
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = unit.title;
    if (i === currentUnitIndex) opt.selected = true;
    unitSelectEl.appendChild(opt);
  });
}

// --- Hash-based deep linking, e.g. python/#int-math loads that unit directly ---

function unitIndexForHash(hash) {
  const id = hash.replace(/^#/, "");
  if (!id) return -1;
  return UNITS.findIndex(u => u.id === id);
}

// Switches to a unit by index, optionally updating the URL hash to match
// (skip updating the hash when we're reacting to a hash change that already
// happened, e.g. the back/forward buttons, to avoid a redundant history entry).
function switchToUnitIndex(i, { updateHash = true } = {}) {
  if (i < 0 || i >= UNITS.length || i === currentUnitIndex) return;
  currentUnitIndex = i;
  loadSolvedForUnit();
  renderUnitSelect();
  selectExercise(0);
  if (updateHash) {
    window.location.hash = UNITS[i].id;
  }
}

window.addEventListener("hashchange", () => {
  const idx = unitIndexForHash(window.location.hash);
  if (idx >= 0) switchToUnitIndex(idx, { updateHash: false });
});

unitSelectEl.addEventListener("change", () => {
  switchToUnitIndex(Number(unitSelectEl.value));
});

function renderSidebar() {
  sidebarEl.innerHTML = "";
  currentExercises().forEach((ex, i) => {
    const btn = document.createElement("button");
    btn.className = "sidebar-item" + (i === currentIndex ? " active" : "") + (solved.has(ex.id) ? " solved" : "");
    btn.innerHTML = `
      <span class="idx">${solved.has(ex.id) ? "✓" : ex.id}</span>
      <span class="title">${ex.title}</span>
      <span class="op">${ex.sidebar_tag}</span>
    `;
    btn.addEventListener("click", () => selectExercise(i));
    sidebarEl.appendChild(btn);
  });
}

function selectExercise(i) {
  currentIndex = i;
  const ex = currentExercises()[i];
  problemPanelEl.innerHTML = `<h2>${ex.id}. ${ex.title}</h2>${ex.description.join("\n")}`;
  editorEl.value = loadDraft(ex.id) || ex.starter.join("\n");
  consoleEl.innerHTML = `<div class="placeholder">Click "Run Tests" to check your solution against ${ex.tests.length} test case${ex.tests.length === 1 ? "" : "s"}.</div>`;
  renderSidebar();
}

editorEl.addEventListener("input", () => {
  saveDraft(currentExercises()[currentIndex].id, editorEl.value);
});

resetBtn.addEventListener("click", () => {
  const ex = currentExercises()[currentIndex];
  if (confirm("Reset this exercise back to the starter code? Your current draft will be lost.")) {
    const starterCode = ex.starter.join("\n");
    editorEl.value = starterCode;
    saveDraft(ex.id, starterCode);
  }
});

async function initPyodide() {
  statusText.textContent = "Loading Python…";
  statusDot.className = "status-dot loading";
  pyodide = await loadPyodide();
  statusText.textContent = "Python ready";
  statusDot.className = "status-dot ready";
  runBtn.disabled = false;
}

// Runs `code` against a single test case's stdin, returns {stdout, error}
async function runOneTest(code, stdin) {
  pyodide.globals.set("__student_code", code);
  pyodide.globals.set("__test_stdin", stdin);
  const result = await pyodide.runPythonAsync(`
import sys, io, builtins, traceback

_output = io.StringIO()
_old_stdout = sys.stdout
sys.stdout = _output

_input_lines = iter(__test_stdin.split(chr(10)))
def _fake_input(prompt=""):
    return next(_input_lines)
_old_input = builtins.input
builtins.input = _fake_input

_error = None
try:
    exec(__student_code, {})
except StopIteration:
    _error = "Your program tried to read more input than this test case provides."
except Exception:
    _error = traceback.format_exc()

sys.stdout = _old_stdout
builtins.input = _old_input

[_output.getvalue(), _error]
  `);
  const [stdout, error] = result.toJs();
  result.destroy();
  return { stdout: stdout.replace(/\n$/, ""), error };
}

async function runTests() {
  const ex = currentExercises()[currentIndex];
  const code = editorEl.value;
  runBtn.disabled = true;
  runBtn.textContent = "Running…";
  consoleEl.innerHTML = "";

  let allPass = true;
  let hadCrash = false;
  const rows = [];
  for (const test of ex.tests) {
    const stdinStr = test.stdin.join("\n");
    const { stdout, error } = await runOneTest(code, stdinStr);
    const actual = stdout.trim();
    // Most tests check for an exact match against `expected`. A few
    // (introspection exercises using help(), mainly) can't be exact-matched
    // safely, since the built-in output is verbose and can shift wording
    // slightly between Python versions. Those use `expected_contains`
    // instead: a list of substrings that must all appear somewhere in the
    // output, regardless of the surrounding text.
    const usesContains = Array.isArray(test.expected_contains);
    const pass = !error && (usesContains
      ? test.expected_contains.every(s => actual.includes(s))
      : actual === test.expected);
    if (!pass) allPass = false;
    if (error) hadCrash = true;

    const row = document.createElement("div");
    row.className = "test-row";
    const inputLabel = test.stdin.length ? escapeHtml(test.stdin.join("  ")) : "(none)";
    if (error) {
      row.innerHTML = `
        <span class="test-status fail">✗</span>
        <span class="test-detail">
          <span class="label">input:</span> ${inputLabel}
          <div class="error-trace">${escapeHtml(error)}</div>
        </span>`;
    } else if (usesContains) {
      const mustInclude = test.expected_contains.map(s => `"${escapeHtml(s)}"`).join(", ");
      row.innerHTML = `
        <span class="test-status ${pass ? "pass" : "fail"}">${pass ? "✓" : "✗"}</span>
        <span class="test-detail">
          <span class="label">input:</span> ${inputLabel}
          &nbsp;&nbsp;<span class="label">must include:</span> <span class="value-block">${mustInclude}</span>
          ${pass ? "" : `&nbsp;&nbsp;<span class="label">got:</span> <span class="mismatch value-block">${escapeHtml(actual || "(no output)")}</span>`}
        </span>`;
    } else {
      row.innerHTML = `
        <span class="test-status ${pass ? "pass" : "fail"}">${pass ? "✓" : "✗"}</span>
        <span class="test-detail">
          <span class="label">input:</span> ${inputLabel}
          &nbsp;&nbsp;<span class="label">expected:</span> <span class="value-block">${escapeHtml(test.expected)}</span>
          ${pass ? "" : `&nbsp;&nbsp;<span class="label">got:</span> <span class="mismatch value-block">${escapeHtml(actual || "(no output)")}</span>`}
        </span>`;
    }
    rows.push(row);
  }

  // On a failing run, show a short nudge *before* the raw test rows/error
  // trace — pushes the student to actually read the question and the error
  // rather than jumping straight back into editing code. Worded differently
  // depending on whether Python crashed vs. just produced the wrong output.
  if (!allPass) {
    const nudge = document.createElement("div");
    nudge.className = "error-nudge";
    nudge.innerHTML = hadCrash
      ? `<strong>Before you touch your code again:</strong> your program crashed. Read the error message below, especially its last line — what is it telling you, specifically? Then re-read the question above and see where that lines up with your code.`
      : `<strong>Before you touch your code again:</strong> your program ran, but the output isn't right. Compare "expected" and "got" below closely, then re-read the question above — what's different about what it's asking for?`;
    consoleEl.appendChild(nudge);
  }

  rows.forEach(row => consoleEl.appendChild(row));

  const summary = document.createElement("div");
  summary.className = "summary " + (allPass ? "all-pass" : "some-fail");
  summary.textContent = allPass
    ? `All ${ex.tests.length} test${ex.tests.length === 1 ? "" : "s"} passed! 🎉`
    : `Some tests failed — check the output above.`;
  consoleEl.appendChild(summary);

  // Track completion state before/after so the reflection prompt fires
  // exactly once, right when the last exercise in a unit gets solved.
  const wasFullyComplete = solved.size === currentExercises().length;

  if (allPass) {
    solved.add(ex.id);
    saveSolved();
    renderSidebar();
  }

  appendHistory(currentUnit().id, ex.id, {
    timestamp: new Date().toISOString(),
    code,
    passed: allPass,
  });

  const nowFullyComplete = solved.size === currentExercises().length;
  const unit = currentUnit();
  if (!wasFullyComplete && nowFullyComplete && unit.reflection_prompt && !hasReflection(unit.id)) {
    showReflectionModal(unit);
  }

  runBtn.disabled = false;
  runBtn.textContent = "Run Tests";
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// --- Export: grouped by calendar day (most recent day first), matching a
// daily-assignment workflow. Whenever an exercise shows up on a given day,
// its full prior history (from earlier days) is pulled in right there too,
// so you never have to hunt across days to see if this is a repeat struggle
// on the same problem. ---

// Local calendar-day key, e.g. "2026-07-27" — sorts correctly as a string
// and is used purely for grouping/comparison, never shown to the reader.
function localDayKey(isoTimestamp) {
  const d = new Date(isoTimestamp);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function localDayLabel(isoTimestamp) {
  return new Date(isoTimestamp).toLocaleDateString(undefined, {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
}

// Reflections aren't tied to a single day the way attempts are, so they get
// their own section up top rather than being folded into the day-by-day
// trail below — a quick summary of how the student felt about each unit,
// before the blow-by-blow of every attempt.
function buildReflectionsSection() {
  const entries = UNITS
    .map(unit => ({ unit, reflection: loadReflection(unit.id) }))
    .filter(({ reflection }) => reflection && reflection.text && reflection.text.trim().length > 0);

  if (entries.length === 0) return [];

  const lines = ["## Unit Reflections", ""];
  entries.forEach(({ unit, reflection }) => {
    const when = new Date(reflection.timestamp).toLocaleString();
    lines.push(`### ${unit.title}`, "", `_${when}_`, "", reflection.text, "");
  });
  return lines;
}

function buildExportMarkdown() {
  const name = getStudentName() || "(name not set)";
  const generatedAt = new Date().toLocaleString();
  const lines = [`# Python Practice — ${name}`, "", `Exported ${generatedAt}`, ""];

  lines.push(...buildReflectionsSection());

  // Flatten every attempt across every unit/exercise into one list, each
  // tagged with where it came from, then sort chronologically so grouping
  // by day (and by exercise-within-a-day) comes out in the order things
  // actually happened.
  const allEntries = [];
  UNITS.forEach(unit => {
    unit.exercises.forEach(ex => {
      loadHistory(unit.id, ex.id).forEach(attempt => {
        allEntries.push({
          unitId: unit.id,
          unitTitle: unit.title,
          exerciseId: ex.id,
          exerciseTitle: ex.title,
          timestamp: attempt.timestamp,
          code: attempt.code,
          passed: attempt.passed,
          dayKey: localDayKey(attempt.timestamp),
        });
      });
    });
  });

  if (allEntries.length === 0) {
    lines.push("_No attempts recorded yet._");
    return lines.join("\n");
  }

  allEntries.sort((a, b) => a.timestamp.localeCompare(b.timestamp));

  const todayKey = localDayKey(new Date().toISOString());
  const dayKeys = [...new Set(allEntries.map(e => e.dayKey))].sort().reverse(); // most recent day first

  dayKeys.forEach(dayKey => {
    const entriesThisDay = allEntries.filter(e => e.dayKey === dayKey);
    const dayLabel = localDayLabel(entriesThisDay[0].timestamp);
    lines.push(`## ${dayLabel}${dayKey === todayKey ? " (Today)" : ""}`, "");

    // Group this day's entries by exercise, preserving the chronological
    // order in which each exercise was first touched that day.
    const exerciseOrder = [];
    const byExercise = new Map();
    entriesThisDay.forEach(e => {
      const key = `${e.unitId}::${e.exerciseId}`;
      if (!byExercise.has(key)) {
        byExercise.set(key, []);
        exerciseOrder.push(key);
      }
      byExercise.get(key).push(e);
    });

    exerciseOrder.forEach(key => {
      const attemptsToday = byExercise.get(key);
      const { unitTitle, exerciseId, exerciseTitle, unitId } = attemptsToday[0];
      lines.push(`### ${unitTitle} — ${exerciseId}. ${exerciseTitle}`, "");

      lines.push("**Attempts this day:**", "");
      attemptsToday.forEach(a => {
        const when = new Date(a.timestamp).toLocaleTimeString();
        lines.push(`- ${when} — ${a.passed ? "PASSED" : "did not pass"}`, "", "```python", a.code, "```", "");
      });

      // Pull in any attempts on this same exercise from earlier days, so a
      // repeat struggle (or a since-resolved one) is visible right here.
      const earlier = allEntries
        .filter(e => e.unitId === unitId && e.exerciseId === exerciseId && e.dayKey < dayKey);
      if (earlier.length > 0) {
        lines.push("**Earlier attempts on this exercise (for context):**", "");
        earlier.forEach(a => {
          const when = new Date(a.timestamp).toLocaleString();
          lines.push(`- ${when} — ${a.passed ? "PASSED" : "did not pass"}`, "", "```python", a.code, "```", "");
        });
      }
    });
  });

  return lines.join("\n");
}

function downloadExport() {
  const name = getStudentName();
  if (!name) {
    promptForStudentName();
    if (!getStudentName()) return; // user cancelled the prompt; nothing to label the file with
  }

  const markdown = buildExportMarkdown();
  const safeName = getStudentName().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "student";
  const dateStamp = new Date().toISOString().slice(0, 10);
  const filename = `python-practice-${safeName}-${dateStamp}.md`;

  const blob = new Blob([markdown], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

changeNameBtn.addEventListener("click", promptForStudentName);
downloadBtn.addEventListener("click", downloadExport);

runBtn.addEventListener("click", runTests);

// Boot
async function boot() {
  try {
    UNITS = await loadUnits();
  } catch (err) {
    problemPanelEl.innerHTML = `<h2>Couldn't load exercises</h2><p>${escapeHtml(err.message)}</p><p>If you're opening this file directly from disk, run a local web server instead (e.g. <code>python3 -m http.server</code>) — browsers block fetching local files with <code>file://</code> URLs.</p>`;
    return;
  }
  if (UNITS.length === 0) {
    problemPanelEl.innerHTML = `<h2>No units found</h2><p>Check <code>units/manifest.json</code> — it's either empty or references files that don't exist.</p>`;
    return;
  }

  const initialIdx = unitIndexForHash(window.location.hash);
  currentUnitIndex = initialIdx >= 0 ? initialIdx : 0;

  renderUnitSelect();
  loadSolvedForUnit();
  renderSidebar();
  selectExercise(0);
  initPyodide();

  renderStudentName();
  if (!getStudentName()) {
    promptForStudentName();
  }
}

boot();
