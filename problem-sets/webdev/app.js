let currentUnitIndex = 0;
let currentIndex = 0;
let solved = new Set();
let UNITS = []; // populated at boot by loadUnits()

const unitSelectEl = document.getElementById("unit-select");
const sidebarEl = document.getElementById("sidebar");
const problemPanelEl = document.getElementById("problem-panel");
const htmlEditorEl = document.getElementById("html-editor");
const cssEditorEl = document.getElementById("css-editor");
const jsEditorEl = document.getElementById("js-editor");
const previewFrameEl = document.getElementById("preview-frame");
const jsConsoleEl = document.getElementById("js-console");
const testFrameEl = document.getElementById("test-frame");
const consoleEl = document.getElementById("console");
const runBtn = document.getElementById("run-btn");
const resetBtn = document.getElementById("reset-btn");
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
// each unit file in that order — identical pattern to the Python track's
// app.js, reused verbatim (this part has nothing to do with how exercises
// get checked, only how they're loaded).
async function loadUnits() {
  const manifestRes = await fetch("units/manifest.json");
  if (!manifestRes.ok) throw new Error(`Couldn't load units/manifest.json (${manifestRes.status})`);
  const order = await manifestRes.json();

  const units = [];
  for (let i = 0; i < order.length; i++) {
    const id = order[i];
    const prefix = String(i + 1).padStart(2, "0");
    const filename = `${prefix}-${id}.json`;
    const res = await fetch(`units/${filename}`);
    if (!res.ok) {
      console.error(`Couldn't load units/${filename} (${res.status}) — skipping it.`);
      continue;
    }
    units.push(await res.json());
  }
  return units;
}

function currentUnit() { return UNITS[currentUnitIndex]; }
function currentExercises() { return currentUnit().exercises; }

function solvedKey() { return `solved-${currentUnit().id}`; }

// One draft per editor pane per exercise — draft-<unit>-<exercise>-html,
// -css, -js — same key shape the Python track uses (draft-<unit>-<exercise>),
// just with a `part` segment added since there are three editors here
// instead of one.
function draftKey(id, part) { return `draft-${currentUnit().id}-${id}-${part}`; }
function saveDraft(id, part, code) { localStorage.setItem(draftKey(id, part), code); }
function loadDraft(id, part) { return localStorage.getItem(draftKey(id, part)); }

function loadSolvedForUnit() {
  solved = new Set(JSON.parse(localStorage.getItem(solvedKey()) || "[]"));
}
function saveSolved() {
  localStorage.setItem(solvedKey(), JSON.stringify([...solved]));
}

// --- Attempt history: every "Run Tests" click gets logged (html/css/js +
// timestamp + pass/fail), not just the final solved status — same shape as
// the Python track's history, just three code fields instead of one. ---

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

// --- Growth-metric export: fires only when the student clicks "Download
// My Work" (see downloadExport() below) — that action is the intended
// submission step, so it's the one moment data is expected to leave the
// browser. Sends every exercise's full attempt history (solved or not)
// in one payload; nothing incremental to track between clicks, since each
// click just sends a fresh, complete snapshot of everything currently in
// localStorage. EXPORT_ENDPOINT_URL stays null (a deliberate no-op) until
// the Apps Script Web App is deployed and its URL is dropped in here. ---

const EXPORT_ENDPOINT_URL = "https://script.google.com/macros/s/AKfycbw3uwZCYcLYUC3abFycNB6Z8vwFJzzxOcjqDAfNUSrgR-eiWBI-7myShhv2rb91qz7aQQ/exec";

function exportAllHistoryToSheet() {
  if (!EXPORT_ENDPOINT_URL) return;

  const units = UNITS.map(unit => ({
    unit: unit.id,
    exercises: unit.exercises
      .map(ex => ({ exercise: ex.id, history: loadHistory(unit.id, ex.id) }))
      .filter(e => e.history.length > 0),
  })).filter(u => u.exercises.length > 0);
  if (units.length === 0) return;

  const payload = JSON.stringify({
    student: getStudentName(),
    track: "webdev",
    units,
  });
  // text/plain, not application/json — a cross-origin request with a JSON
  // content type triggers CORS preflight behavior Apps Script Web Apps
  // don't handle cleanly. doPost() parses the body as JSON regardless of
  // the declared type, so this loses nothing.
  const blob = new Blob([payload], { type: "text/plain" });
  const queued = navigator.sendBeacon(EXPORT_ENDPOINT_URL, blob);
  if (!queued) {
    fetch(EXPORT_ENDPOINT_URL, { method: "POST", body: payload, keepalive: true }).catch(() => {});
  }
}

// --- Unit reflections: identical subsystem to the Python track's — depends
// only on unit.reflection_prompt and a solved-count transition, nothing
// track-specific. ---

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
  if (reflectionTargetUnit) {
    saveReflection(reflectionTargetUnit.id, "");
  }
  closeReflectionModal();
});

// --- Student name — literal "student-name" key, already global/not unit-
// scoped, so it's naturally shared with the Python track in the same
// browser: a student sets it once, it's correct everywhere on this site. ---

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

// --- Hash-based deep linking, e.g. webdev/#html-basics loads that unit directly ---

function unitIndexForHash(hash) {
  const id = hash.replace(/^#/, "");
  if (!id) return -1;
  return UNITS.findIndex(u => u.id === id);
}

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
  htmlEditorEl.value = loadDraft(ex.id, "html") || ex.starter.html.join("\n");
  cssEditorEl.value = loadDraft(ex.id, "css") || ex.starter.css.join("\n");
  jsEditorEl.value = loadDraft(ex.id, "js") || ex.starter.js.join("\n");
  consoleEl.innerHTML = `<div class="placeholder">Click "Run Tests" to check your solution against ${ex.tests.length} test case${ex.tests.length === 1 ? "" : "s"}.</div>`;
  renderSidebar();
  updatePreview();
}

function wireEditor(el, part) {
  el.addEventListener("input", () => {
    saveDraft(currentExercises()[currentIndex].id, part, el.value);
    schedulePreviewUpdate();
  });
}
wireEditor(htmlEditorEl, "html");
wireEditor(cssEditorEl, "css");
wireEditor(jsEditorEl, "js");

resetBtn.addEventListener("click", () => {
  const ex = currentExercises()[currentIndex];
  if (confirm("Reset this exercise back to the starter code? Your current draft will be lost.")) {
    htmlEditorEl.value = ex.starter.html.join("\n");
    cssEditorEl.value = ex.starter.css.join("\n");
    jsEditorEl.value = ex.starter.js.join("\n");
    saveDraft(ex.id, "html", htmlEditorEl.value);
    saveDraft(ex.id, "css", cssEditorEl.value);
    saveDraft(ex.id, "js", jsEditorEl.value);
    updatePreview();
  }
});

// --- Rendering: combine the three panes into one document and hand it to
// a sandboxed iframe via srcdoc. allow-scripts + allow-same-origin: the
// former so student JS actually runs, the latter so this page can read
// contentDocument/getComputedStyle afterward. Same-origin srcdoc content
// on a static site with no backend — nothing of value for a script to
// reach beyond the student's own tab. ---

// Overrides console.log/warn/error/info inside the iframe to relay each
// call to the parent via postMessage (still calling the original after,
// so a student who opens real DevTools sees it too), plus a window
// "error" listener for uncaught exceptions. Injected as its own <script>
// ahead of the student's — authored by us, not student input, so it
// doesn't need the </script>-escaping student code gets.
function consoleShimScript() {
  return `(function() {
    function formatOne(a) {
      if (a === undefined) return "undefined";
      if (a === null) return "null";
      if (typeof a === "string") return a;
      if (typeof a === "function") return a.toString();
      // DOM nodes: JSON.stringify gives "{}", since an element's real
      // properties (tagName, attributes, ...) live on the prototype chain
      // as getters, not as its own enumerable properties. Show the actual
      // markup instead — far more useful for a student debugging DOM code.
      if (a && typeof a.nodeType === "number" && typeof a.outerHTML === "string") {
        return a.outerHTML.length > 200 ? a.outerHTML.slice(0, 200) + "…" : a.outerHTML;
      }
      // Event objects have the same underlying issue (getter-based
      // properties) and JSON.stringify them to "{}" too.
      if (a && typeof a.type === "string" && typeof a.preventDefault === "function") {
        var ctorName = (a.constructor && a.constructor.name) || "Event";
        return "[" + ctorName + " type=\\"" + a.type + "\\"]";
      }
      try {
        var json = JSON.stringify(a);
        // Anything else whose meaningful state lives on getters (Map, Set,
        // most class instances) silently stringifies to "{}" too — not
        // wrong, just useless. Fall back to native toString so something
        // shows up instead of an empty object.
        if (json === "{}" && a.constructor && a.constructor !== Object) {
          return String(a);
        }
        return json;
      } catch (e) {
        return String(a);
      }
    }

    function relay(level, args) {
      var formatted = args.map(formatOne).join(" ");
      window.parent.postMessage({ __webdevConsole: true, level: level, message: formatted }, "*");
    }
    ["log", "warn", "error", "info"].forEach(function(level) {
      var original = console[level];
      console[level] = function() {
        relay(level, Array.prototype.slice.call(arguments));
        if (original) original.apply(console, arguments);
      };
    });
    window.addEventListener("error", function(e) {
      relay("error", [e.message + " (line " + e.lineno + ")"]);
    });
  })();`;
}

function buildDocumentSource(html, css, js) {
  // Neutralize a literal "</script" inside student JS (e.g. a string they
  // build containing that text) so it can't prematurely close the <script>
  // block when this string gets parsed as HTML by the iframe. `<\/script`
  // is still valid, identical JS at runtime — this only affects how the
  // *outer* HTML parser sees it.
  const safeJs = js.replace(/<\/script/gi, "<\\/script");
  return `<!DOCTYPE html>
<html>
<head><style>${css}</style></head>
<body>
${html}
<script>${consoleShimScript()}</script>
<script>${safeJs}</script>
</body>
</html>`;
}

let previewDebounceTimer = null;
function schedulePreviewUpdate() {
  clearTimeout(previewDebounceTimer);
  previewDebounceTimer = setTimeout(updatePreview, 400);
}

function clearJsConsole() {
  jsConsoleEl.innerHTML = `<div class="placeholder">console.log() output from the preview above shows up here.</div>`;
}

function appendJsConsoleMessage(level, message) {
  if (jsConsoleEl.querySelector(".placeholder")) jsConsoleEl.innerHTML = "";
  const row = document.createElement("div");
  row.className = `js-console-row js-console-${level}`;
  row.textContent = message;
  jsConsoleEl.appendChild(row);
  jsConsoleEl.scrollTop = jsConsoleEl.scrollHeight;
}

// Only the visible preview relays into this panel — the hidden test-frame
// also runs the same shim (buildDocumentSource is shared), but its
// messages are deliberately ignored here via the event.source check, so
// running tests never spams the console meant for live preview debugging.
window.addEventListener("message", (event) => {
  if (event.source !== previewFrameEl.contentWindow) return;
  if (!event.data || !event.data.__webdevConsole) return;
  appendJsConsoleMessage(event.data.level, event.data.message);
});

function updatePreview() {
  clearJsConsole();
  previewFrameEl.srcdoc = buildDocumentSource(htmlEditorEl.value, cssEditorEl.value, jsEditorEl.value);
}

// Loads `src` into `iframeEl` and resolves once it's actually rendered —
// setting .srcdoc is async, so every check needs to wait for this before
// touching contentDocument.
function loadFrame(iframeEl, src) {
  return new Promise((resolve) => {
    function onLoad() {
      iframeEl.removeEventListener("load", onLoad);
      resolve();
    }
    iframeEl.addEventListener("load", onLoad);
    iframeEl.srcdoc = src;
  });
}

function runAction(action, doc) {
  if (action.type === "click") {
    const el = doc.querySelector(action.selector);
    if (el) el.click();
    return;
  }
  console.error(`[webdev] unknown action type "${action.type}" — check the unit JSON.`);
}

// Runs one test's `check` against `doc`. Returns { pass, foundNothing,
// actual } — foundNothing distinguishes "the selector matched zero
// elements" (usually a missing element or typo) from "found it, but the
// checked property didn't match" (present but wrong), which the nudge
// text below uses the same way Python's nudge branches on crashed-vs-
// wrong-output.
function runOneCheck(test, doc) {
  if (test.check === "exists") {
    const found = !!doc.querySelector(test.selector);
    return { pass: found, foundNothing: !found };
  }
  if (test.check === "count") {
    const count = doc.querySelectorAll(test.selector).length;
    return { pass: count === test.expected, foundNothing: count === 0, actual: count };
  }

  const el = doc.querySelector(test.selector);
  if (!el) {
    return { pass: false, foundNothing: true };
  }
  if (test.check === "text") {
    const actual = el.textContent.trim();
    return { pass: actual === test.expected, foundNothing: false, actual };
  }
  if (test.check === "style") {
    const actual = getComputedStyle(el)[test.property];
    return { pass: actual === test.expected, foundNothing: false, actual };
  }
  if (test.check === "attribute") {
    const actual = el.getAttribute(test.attribute);
    return { pass: actual === test.expected, foundNothing: false, actual };
  }

  console.error(`[webdev] unknown check type "${test.check}" in test "${test.description}" — check the unit JSON.`);
  return { pass: false, foundNothing: false, checkError: true };
}

// Each test gets a fresh iframe reload — same philosophy as the Python
// track's runOneTest, which execs student code fresh per test case rather
// than accumulating state. Matters more here: without it, one test's
// click action could leave DOM/JS state that leaks into the next test.
async function runOneTest(html, css, js, test) {
  const src = buildDocumentSource(html, css, js);
  await loadFrame(testFrameEl, src);
  const doc = testFrameEl.contentDocument;

  try {
    if (test.actions) {
      test.actions.forEach(action => runAction(action, doc));
    }
    return runOneCheck(test, doc);
  } catch (err) {
    // A malformed test entry (bad selector syntax, etc.) is a content bug,
    // not a student mistake — log it for whoever's authoring the unit,
    // don't show the student a confusing internal error.
    console.error(`[webdev] test "${test.description}" threw while checking — likely a content bug:`, err);
    return { pass: false, foundNothing: false, checkError: true };
  }
}

async function runTests() {
  const ex = currentExercises()[currentIndex];
  const html = htmlEditorEl.value;
  const css = cssEditorEl.value;
  const js = jsEditorEl.value;
  runBtn.disabled = true;
  runBtn.textContent = "Running…";
  consoleEl.innerHTML = "";

  let allPass = true;
  let foundNothingAny = false;
  const rows = [];
  const testResults = [];
  for (const test of ex.tests) {
    const result = await runOneTest(html, css, js, test);
    if (!result.pass) allPass = false;
    if (result.foundNothing) foundNothingAny = true;
    testResults.push({ passed: result.pass, hadError: !!(result.foundNothing || result.checkError) });

    const row = document.createElement("div");
    row.className = "test-row";
    const hasActual = result.actual !== undefined;
    row.innerHTML = `
      <span class="test-status ${result.pass ? "pass" : "fail"}">${result.pass ? "✓" : "✗"}</span>
      <span class="test-detail">
        ${escapeHtml(test.description)}
        ${result.pass ? "" : (hasActual
          ? `&nbsp;&nbsp;<span class="label">expected:</span> <span class="value-block">${escapeHtml(String(test.expected))}</span>&nbsp;&nbsp;<span class="label">got:</span> <span class="mismatch value-block">${escapeHtml(String(result.actual))}</span>`
          : `&nbsp;&nbsp;<span class="mismatch">element not found</span>`)}
      </span>`;
    rows.push(row);
  }

  // Same nudge-before-details pattern as the Python track, branching on
  // what's actually diagnostic here: nothing found at all, vs. found but
  // wrong, rather than Python's crashed-vs-wrong-output split.
  if (!allPass) {
    const nudge = document.createElement("div");
    nudge.className = "error-nudge";
    nudge.innerHTML = foundNothingAny
      ? `<strong>Before you touch your code again:</strong> at least one check couldn't find the element it was looking for at all. Check your selector against the question above — is the element there, spelled the way it's asking for?`
      : `<strong>Before you touch your code again:</strong> the element is there, but something about it isn't right yet. Compare "expected" and "got" below closely, then re-read the question above.`;
    consoleEl.appendChild(nudge);
  }

  rows.forEach(row => consoleEl.appendChild(row));

  const summary = document.createElement("div");
  summary.className = "summary " + (allPass ? "all-pass" : "some-fail");
  summary.textContent = allPass
    ? `All ${ex.tests.length} test${ex.tests.length === 1 ? "" : "s"} passed! 🎉`
    : `Some tests failed — check the output above.`;
  consoleEl.appendChild(summary);

  const wasFullyComplete = solved.size === currentExercises().length;

  if (allPass) {
    solved.add(ex.id);
    saveSolved();
    renderSidebar();
  }

  appendHistory(currentUnit().id, ex.id, {
    timestamp: new Date().toISOString(),
    html, css, js,
    passed: allPass,
    testResults,
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

// --- Export: same day-grouped structure as the Python track's, with one
// code block per non-empty pane instead of a single python block. ---

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

function pushCodeBlocks(lines, attempt) {
  if (attempt.html && attempt.html.trim()) lines.push("```html", attempt.html, "```", "");
  if (attempt.css && attempt.css.trim()) lines.push("```css", attempt.css, "```", "");
  if (attempt.js && attempt.js.trim()) lines.push("```js", attempt.js, "```", "");
}

function buildExportMarkdown() {
  const name = getStudentName() || "(name not set)";
  const generatedAt = new Date().toLocaleString();
  const lines = [`# Web Dev Practice — ${name}`, "", `Exported ${generatedAt}`, ""];

  lines.push(...buildReflectionsSection());

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
          html: attempt.html,
          css: attempt.css,
          js: attempt.js,
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
  const dayKeys = [...new Set(allEntries.map(e => e.dayKey))].sort().reverse();

  dayKeys.forEach(dayKey => {
    const entriesThisDay = allEntries.filter(e => e.dayKey === dayKey);
    const dayLabel = localDayLabel(entriesThisDay[0].timestamp);
    lines.push(`## ${dayLabel}${dayKey === todayKey ? " (Today)" : ""}`, "");

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
        lines.push(`- ${when} — ${a.passed ? "PASSED" : "did not pass"}`, "");
        pushCodeBlocks(lines, a);
      });

      const earlier = allEntries
        .filter(e => e.unitId === unitId && e.exerciseId === exerciseId && e.dayKey < dayKey);
      if (earlier.length > 0) {
        lines.push("**Earlier attempts on this exercise (for context):**", "");
        earlier.forEach(a => {
          const when = new Date(a.timestamp).toLocaleString();
          lines.push(`- ${when} — ${a.passed ? "PASSED" : "did not pass"}`, "");
          pushCodeBlocks(lines, a);
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
    if (!getStudentName()) return;
  }

  const markdown = buildExportMarkdown();
  const safeName = getStudentName().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "student";
  const dateStamp = new Date().toISOString().slice(0, 10);
  const filename = `webdev-practice-${safeName}-${dateStamp}.md`;

  const blob = new Blob([markdown], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);

  exportAllHistoryToSheet();
}

changeNameBtn.addEventListener("click", promptForStudentName);
downloadBtn.addEventListener("click", downloadExport);

runBtn.addEventListener("click", runTests);

// Boot — no Pyodide-style async runtime to wait for, so unlike the Python
// track's boot(), there's no "loading…" gate: Run Tests is enabled from
// the moment the page loads.
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

  renderStudentName();
  if (!getStudentName()) {
    promptForStudentName();
  }
}

boot();
