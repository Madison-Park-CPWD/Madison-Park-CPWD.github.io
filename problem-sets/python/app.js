let pyodide = null;
let currentUnitIndex = 0;
let currentIndex = 0;
let solved = new Set();

const unitSelectEl = document.getElementById("unit-select");
const sidebarEl = document.getElementById("sidebar");
const problemPanelEl = document.getElementById("problem-panel");
const editorEl = document.getElementById("code-editor");
const consoleEl = document.getElementById("console");
const runBtn = document.getElementById("run-btn");
const resetBtn = document.getElementById("reset-btn");
const statusDot = document.getElementById("status-dot");
const statusText = document.getElementById("status-text");

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

unitSelectEl.addEventListener("change", () => {
  currentUnitIndex = Number(unitSelectEl.value);
  loadSolvedForUnit();
  selectExercise(0);
});

function renderSidebar() {
  sidebarEl.innerHTML = "";
  currentExercises().forEach((ex, i) => {
    const btn = document.createElement("button");
    btn.className = "sidebar-item" + (i === currentIndex ? " active" : "") + (solved.has(ex.id) ? " solved" : "");
    btn.innerHTML = `
      <span class="idx">${solved.has(ex.id) ? "✓" : ex.id}</span>
      <span class="title">${ex.title}</span>
      <span class="op">${ex.op}</span>
    `;
    btn.addEventListener("click", () => selectExercise(i));
    sidebarEl.appendChild(btn);
  });
}

function selectExercise(i) {
  currentIndex = i;
  const ex = currentExercises()[i];
  problemPanelEl.innerHTML = `<h2>${ex.id}. ${ex.title}</h2>${ex.description}`;
  editorEl.value = loadDraft(ex.id) || ex.starter;
  consoleEl.innerHTML = `<div class="placeholder">Click "Run Tests" to check your solution against ${ex.tests.length} test case${ex.tests.length === 1 ? "" : "s"}.</div>`;
  renderSidebar();
}

editorEl.addEventListener("input", () => {
  saveDraft(currentExercises()[currentIndex].id, editorEl.value);
});

resetBtn.addEventListener("click", () => {
  const ex = currentExercises()[currentIndex];
  if (confirm("Reset this exercise back to the starter code? Your current draft will be lost.")) {
    editorEl.value = ex.starter;
    saveDraft(ex.id, ex.starter);
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
  for (const test of ex.tests) {
    const { stdout, error } = await runOneTest(code, test.stdin);
    const actual = stdout.trim();
    const pass = !error && actual === test.expected;
    if (!pass) allPass = false;

    const row = document.createElement("div");
    row.className = "test-row";
    const inputLabel = test.stdin ? escapeHtml(test.stdin.replace(/\n/g, "  ")) : "(none)";
    if (error) {
      row.innerHTML = `
        <span class="test-status fail">✗</span>
        <span class="test-detail">
          <span class="label">input:</span> ${inputLabel}
          <div class="error-trace">${escapeHtml(error)}</div>
        </span>`;
    } else {
      row.innerHTML = `
        <span class="test-status ${pass ? "pass" : "fail"}">${pass ? "✓" : "✗"}</span>
        <span class="test-detail">
          <span class="label">input:</span> ${inputLabel}
          &nbsp;&nbsp;<span class="label">expected:</span> ${escapeHtml(test.expected)}
          ${pass ? "" : `&nbsp;&nbsp;<span class="label">got:</span> <span class="mismatch">${escapeHtml(actual || "(no output)")}</span>`}
        </span>`;
    }
    consoleEl.appendChild(row);
  }

  const summary = document.createElement("div");
  summary.className = "summary " + (allPass ? "all-pass" : "some-fail");
  summary.textContent = allPass
    ? `All ${ex.tests.length} test${ex.tests.length === 1 ? "" : "s"} passed! 🎉`
    : `Some tests failed — check the output above.`;
  consoleEl.appendChild(summary);

  if (allPass) {
    solved.add(ex.id);
    saveSolved();
    renderSidebar();
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

runBtn.addEventListener("click", runTests);

// Boot
renderUnitSelect();
loadSolvedForUnit();
renderSidebar();
selectExercise(0);
initPyodide();
