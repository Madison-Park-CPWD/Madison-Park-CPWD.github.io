const MAX_ROWS = 30; // safety cap — see generateBounds()

const CONFIDENCE_OPTIONS = [
  { value: "low", label: "Not very" },
  { value: "medium", label: "Pretty sure" },
  { value: "high", label: "Very sure" },
];

const puzzleRootEl = document.getElementById("puzzle-root");

// Fetches data/manifest.json (an ordered list of puzzle ids), then fetches
// each puzzle file in that order — same shape as the practice app's
// units/manifest.json + per-unit-JSON loading.
async function loadPuzzles() {
  const manifestRes = await fetch("data/manifest.json");
  if (!manifestRes.ok) throw new Error(`Couldn't load data/manifest.json (${manifestRes.status})`);
  const ids = await manifestRes.json();

  const puzzles = [];
  for (const id of ids) {
    const res = await fetch(`data/${id}.json`);
    if (!res.ok) {
      console.error(`Couldn't load data/${id}.json (${res.status}) — skipping it.`);
      continue;
    }
    puzzles.push(await res.json());
  }
  return puzzles;
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// One new component per puzzle type, one line here — no growing switch
// statement as more harness types are added.
const HARNESS_REGISTRY = {
  trace: renderTraceHarness,
  "ancestor-trace": renderAncestorTraceHarness,
  "descend-trace": renderDescendTraceHarness,
  "depth-quiz": renderDepthQuizHarness,
  "selector-match": renderSelectorMatchHarness,
};

function puzzleForHash(puzzles) {
  const hash = decodeURIComponent(location.hash.replace(/^#/, ""));
  return puzzles.find((p) => p.id === hash) || puzzles[0];
}

async function init() {
  let puzzles;
  try {
    puzzles = await loadPuzzles();
  } catch (err) {
    puzzleRootEl.textContent = `Couldn't load puzzles: ${err.message}`;
    return;
  }
  if (!puzzles.length) {
    puzzleRootEl.textContent = "No puzzles available yet.";
    return;
  }

  function mount() {
    const puzzle = puzzleForHash(puzzles);
    const renderer = HARNESS_REGISTRY[puzzle.harness_type];
    puzzleRootEl.innerHTML = "";
    if (!renderer) {
      puzzleRootEl.textContent = `Unknown puzzle type: ${puzzle.harness_type}`;
      return;
    }
    renderer(puzzleRootEl, puzzle);
  }

  window.addEventListener("hashchange", mount);
  mount();
}

// --- trace harness ---
//
// Generalized over payload.levels (any length, not fixed at 2): one nested
// "for" line and one editable field per level, a full cross-product of rows,
// row-by-row unlock, confidence gate, check/hint/recheck, no persistence —
// see docs/puzzle-design-session-summary-2026-08-10.md for the design
// history (Session 3: puzzles are one-and-done, no streak, no localStorage).
function renderTraceHarness(root, puzzle) {
  const levels = puzzle.payload.levels;
  const outputFormat = puzzle.payload.output_format;

  let state = null;
  let rowElements = []; // one entry per currently-unlocked row, in order
  let placeholderEl = null;

  // Bounds are re-rolled within each level's [min, max] every instance; if a
  // puzzle's levels would produce more rows than a student can reasonably
  // trace by hand, resample a few times before falling back to the smallest
  // possible bounds (and warning, since that means the JSON itself needs
  // smaller ranges, not something this harness can fix at runtime).
  function generateBounds() {
    for (let attempt = 0; attempt < 20; attempt++) {
      const bounds = levels.map((l) => randInt(l.min, l.max));
      const total = bounds.reduce((a, b) => a * b, 1);
      if (total <= MAX_ROWS) return bounds;
    }
    const bounds = levels.map((l) => l.min);
    const total = bounds.reduce((a, b) => a * b, 1);
    if (total > MAX_ROWS) {
      console.warn(
        `[puzzles] "${puzzle.id}" produces ${total} rows even at minimum level bounds, ` +
        `exceeding the ${MAX_ROWS}-row cap. Reduce the level ranges in ${puzzle.id}.json.`
      );
    }
    return bounds;
  }

  // N-ary cross product over the levels, in nesting order (first level
  // changes slowest, last level changes fastest) — the same order the
  // matching nested "for" loops would print in.
  function buildRows(bounds) {
    let combos = [[]];
    for (let i = 0; i < levels.length; i++) {
      const next = [];
      for (const combo of combos) {
        for (let v = 0; v < bounds[i]; v++) next.push(combo.concat([v]));
      }
      combos = next;
    }
    return combos.map((values) => ({ values, output: formatOutput(values) }));
  }

  function formatOutput(values) {
    let out = outputFormat;
    levels.forEach((l, i) => {
      out = out.split(`{${l.var}}`).join(String(values[i]));
    });
    return out;
  }

  function emptyEntry() {
    const entry = {};
    levels.forEach((l) => { entry[l.var] = ""; });
    entry.output = "";
    return entry;
  }

  function isRowFilled(entry) {
    return levels.every((l) => entry[l.var].trim() !== "") && entry.output.trim() !== "";
  }

  function allFilled() {
    return state.entries.every(isRowFilled);
  }

  function evaluateRow(idx) {
    const row = state.rows[idx];
    const entry = state.entries[idx];
    const levelsMatch = levels.every((l, i) => entry[l.var].trim() === String(row.values[i]));
    return levelsMatch && entry.output.trim() === row.output;
  }

  function maybeUnlockNext() {
    if (state.checked) return;
    const activeIdx = state.unlocked - 1;
    if (activeIdx >= state.rows.length - 1) return;
    if (isRowFilled(state.entries[activeIdx])) {
      state.unlocked = Math.min(state.unlocked + 1, state.rows.length);
    }
  }

  function readyForConfidence() {
    return state.unlocked === state.rows.length && allFilled() && !state.checked;
  }

  // --- static chrome (built once per mount; per-instance parts are
  // refreshed by fullRender()/handleFieldChange(), never rebuilt wholesale,
  // so a student's cursor stays put while typing) ---

  root.innerHTML = `
    <div class="puzzle-card">
      <p class="puzzle-eyebrow">Trace it &middot; nested loops</p>
      <h2 class="puzzle-title"></h2>
      <p class="puzzle-scenario"></p>
      <div class="code-panel"></div>
      <p class="code-bounds"></p>
      <div class="trace-table"></div>
      <div class="confidence-gate" hidden>
        <p class="confidence-prompt">How sure are you this chart is right?</p>
        <div class="confidence-options"></div>
      </div>
      <div class="check-action" hidden>
        <button type="button" class="btn btn-primary check-btn">Check the Chart</button>
      </div>
      <div class="result-summary" hidden>
        <p class="result-text"></p>
        <button type="button" class="btn btn-secondary recheck-btn" hidden>Recheck</button>
        <button type="button" class="btn btn-secondary new-btn">New Chart</button>
      </div>
    </div>
  `;

  const titleEl = root.querySelector(".puzzle-title");
  const scenarioEl = root.querySelector(".puzzle-scenario");
  const codePanelEl = root.querySelector(".code-panel");
  const codeBoundsEl = root.querySelector(".code-bounds");
  const tableEl = root.querySelector(".trace-table");
  const confidenceGateEl = root.querySelector(".confidence-gate");
  const confidenceOptionsEl = root.querySelector(".confidence-options");
  const checkActionEl = root.querySelector(".check-action");
  const checkBtn = root.querySelector(".check-btn");
  const resultSummaryEl = root.querySelector(".result-summary");
  const resultTextEl = root.querySelector(".result-text");
  const recheckBtn = root.querySelector(".recheck-btn");
  const newBtn = root.querySelector(".new-btn");

  titleEl.textContent = puzzle.title;
  scenarioEl.textContent = puzzle.scenario;

  levels.forEach((l, i) => {
    const line = document.createElement("div");
    line.className = "code-line";
    line.style.paddingLeft = `${i * 1.25}rem`;
    const kwFor = document.createElement("span");
    kwFor.className = "code-kw";
    kwFor.textContent = "for ";
    const varSpan = document.createElement("span");
    varSpan.textContent = l.var;
    const kwIn = document.createElement("span");
    kwIn.className = "code-kw";
    kwIn.textContent = " in ";
    const rangeSpan = document.createElement("span");
    rangeSpan.className = "code-range";
    rangeSpan.textContent = `range(${l.label}):`;
    line.append(kwFor, varSpan, kwIn, rangeSpan);
    codePanelEl.appendChild(line);
  });
  const printLine = document.createElement("div");
  printLine.className = "code-line";
  printLine.style.paddingLeft = `${levels.length * 1.25}rem`;
  const printFn = document.createElement("span");
  printFn.className = "code-fn";
  printFn.textContent = "print";
  printLine.append(printFn, document.createTextNode(`(${levels.map((l) => l.var).join(", ")})`));
  codePanelEl.appendChild(printLine);

  checkBtn.addEventListener("click", handleCheck);
  recheckBtn.addEventListener("click", handleRecheck);
  newBtn.addEventListener("click", newInstance);

  function createRowElement(idx) {
    const entry = state.entries[idx];

    const wrap = document.createElement("div");
    wrap.className = "trace-row-wrap";

    const rowEl = document.createElement("div");
    rowEl.className = "trace-row";

    const inputs = {};
    levels.forEach((l) => {
      const field = document.createElement("label");
      field.className = "trace-field";
      const labelSpan = document.createElement("span");
      labelSpan.className = "trace-field-label";
      labelSpan.textContent = l.var;
      const input = document.createElement("input");
      input.type = "text";
      input.inputMode = "numeric";
      input.value = entry[l.var];
      input.placeholder = "?";
      input.addEventListener("input", (e) => {
        entry[l.var] = e.target.value;
        handleFieldChange();
      });
      field.append(labelSpan, input);
      rowEl.appendChild(field);
      inputs[l.var] = input;
    });

    const outputField = document.createElement("label");
    outputField.className = "trace-field trace-field-output";
    const outputLabel = document.createElement("span");
    outputLabel.className = "trace-field-label";
    outputLabel.textContent = `print(${levels.map((l) => l.var).join(", ")}) →`;
    const outputInput = document.createElement("input");
    outputInput.type = "text";
    outputInput.value = entry.output;
    outputInput.placeholder = `e.g. ${levels.map(() => "0").join(" ")}`;
    outputInput.addEventListener("input", (e) => {
      entry.output = e.target.value;
      handleFieldChange();
    });
    outputField.append(outputLabel, outputInput);
    rowEl.appendChild(outputField);

    const statusIcon = document.createElement("span");
    statusIcon.className = "trace-status";
    rowEl.appendChild(statusIcon);

    wrap.appendChild(rowEl);

    tableEl.insertBefore(wrap, placeholderEl);
    return { idx, rowEl, inputs, outputInput, statusIcon };
  }

  function ensurePlaceholder() {
    if (placeholderEl) return;
    placeholderEl = document.createElement("div");
    placeholderEl.className = "trace-row trace-row-locked";
    placeholderEl.textContent = "Finish the row above first";
    tableEl.appendChild(placeholderEl);
  }

  function removePlaceholder() {
    if (!placeholderEl) return;
    placeholderEl.remove();
    placeholderEl = null;
  }

  // Only ever adds new row elements for newly-unlocked rows and appends/
  // removes the single "next" placeholder — never rebuilds an existing
  // row's inputs, so a student's cursor never jumps mid-keystroke.
  function syncTableStructure() {
    while (rowElements.length < state.unlocked) {
      removePlaceholder();
      rowElements.push(createRowElement(rowElements.length));
    }
    if (state.unlocked < state.rows.length) ensurePlaceholder();
    else removePlaceholder();
  }

  // Wrong rows get marked (red row, ✗) but never told the correct
  // answer — a hint that hands over the exact expected value removes any
  // reason to keep trying, per the same "any UI chrome that reveals the
  // answer is a leak" principle behind the Session 5/6 hint fixes.
  function updateRowVisualState() {
    rowElements.forEach(({ idx, rowEl, inputs, outputInput, statusIcon }) => {
      let result = null;
      if (state.results) result = state.results[idx];
      const isLockedCorrect = !!(state.checked && result && result.correct);

      rowEl.classList.toggle("trace-row-correct", isLockedCorrect);
      rowEl.classList.toggle("trace-row-wrong", !!(state.checked && result && !result.correct));

      levels.forEach((l) => { inputs[l.var].disabled = isLockedCorrect; });
      outputInput.disabled = isLockedCorrect;

      if (state.checked && result && result.correct) {
        statusIcon.textContent = "✓";
        statusIcon.className = "trace-status trace-status-ok";
      } else if (state.checked && result) {
        statusIcon.textContent = "✗";
        statusIcon.className = "trace-status trace-status-err";
      } else {
        statusIcon.textContent = "";
        statusIcon.className = "trace-status";
      }
    });
  }

  function renderConfidenceOptions() {
    confidenceOptionsEl.innerHTML = "";
    CONFIDENCE_OPTIONS.forEach((opt) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "confidence-btn";
      if (state.confidence === opt.value) btn.className += " confidence-btn-active";
      btn.textContent = opt.label;
      btn.addEventListener("click", () => {
        state.confidence = opt.value;
        updateChrome();
      });
      confidenceOptionsEl.appendChild(btn);
    });
  }

  function updateChrome() {
    const ready = readyForConfidence();
    confidenceGateEl.hidden = !ready;
    checkActionEl.hidden = !ready;
    if (ready) {
      renderConfidenceOptions();
      checkBtn.disabled = !state.confidence;
    }

    resultSummaryEl.hidden = !state.checked;
    if (state.checked) {
      const correctCount = state.results.filter((r) => r.correct).length;
      const allCorrect = correctCount === state.results.length;
      if (allCorrect) {
        resultTextEl.textContent = "All rows traced correctly.";
      } else {
        resultTextEl.textContent = `${correctCount} of ${state.results.length} correct so far. Fix the highlighted rows above, then recheck.`;
      }
      recheckBtn.hidden = allCorrect;
    }
  }

  function handleFieldChange() {
    maybeUnlockNext();
    syncTableStructure();
    updateChrome();
  }

  function handleCheck() {
    state.results = state.rows.map((row, idx) => ({ correct: evaluateRow(idx), expected: row }));
    state.checked = true;
    updateRowVisualState();
    updateChrome();
  }

  function handleRecheck() {
    state.results = state.results.map((r, idx) => {
      if (r.correct) return r;
      return { correct: evaluateRow(idx), expected: r.expected };
    });
    updateRowVisualState();
    updateChrome();
  }

  function fullRender() {
    codeBoundsEl.innerHTML = "";
    codeBoundsEl.appendChild(document.createTextNode("This chart:"));
    levels.forEach((l, i) => {
      codeBoundsEl.appendChild(document.createElement("br"));
      const span = document.createElement("span");
      span.className = "code-bound-line";
      span.textContent = `${l.label} = ${state.bounds[i]}`;
      codeBoundsEl.appendChild(span);
    });

    tableEl.innerHTML = "";
    rowElements = [];
    placeholderEl = null;
    syncTableStructure();
    updateRowVisualState();
    updateChrome();
  }

  function newInstance() {
    const bounds = generateBounds();
    const rows = buildRows(bounds);
    state = {
      bounds,
      rows,
      entries: rows.map(emptyEntry),
      unlocked: 1,
      confidence: null,
      checked: false,
      results: null,
    };
    fullRender();
  }

  newInstance();
}

// --- ancestor-trace harness ---
//
// Same UI rhythm as the trace harness (row-by-row unlock, confidence gate,
// check/hint/recheck, one-and-done — no shared code with renderTraceHarness
// on purpose, see docs/puzzle-design-session-summary-2026-08-10.md's
// "Natural next steps": a new harness type should be addable without
// touching or re-reading an existing one), but the thing being traced is a
// tree's containment chain, not a numeric range.

// Depth-first search for the tree's single target: true node, returning its
// ancestor tags closest-first (immediate parent, then grandparent, ...).
function ancestorChain(tree) {
  function search(node, ancestors) {
    if (node.target) return ancestors.slice().reverse();
    for (const child of node.children || []) {
      const result = search(child, ancestors.concat([node.tag]));
      if (result) return result;
    }
    return null;
  }
  return search(tree, []);
}

function tagOpenText(node) {
  if (node.class) return `<${node.tag} class="${node.class}">`;
  return `<${node.tag}>`;
}

// Flattens a tree into printable open/close-tag lines with indentation —
// same visual technique as the trace harness's code panel, applied to a
// tree instead of a flat levels array. `class` is optional on any node and
// only rendered when present — used by descend-trace to disambiguate
// same-tag siblings at a fork; ancestor-trace's trees never set it, so
// output for those is unchanged. `isRoot` is only ever passed true by the
// top-level caller (descend-trace, marking its "Start at" line) — every
// recursive call omits it, so only that single opening line is ever
// flagged, never the matching closing tag or any descendant.
function buildTreeLines(node, depth, lines, isRoot) {
  const hasChildren = (node.children || []).length > 0;
  if (!hasChildren) {
    lines.push({ text: `${tagOpenText(node)}</${node.tag}>`, depth, isTarget: !!node.target, isRoot: !!isRoot });
    return;
  }
  lines.push({ text: tagOpenText(node), depth, isTarget: !!node.target, isRoot: !!isRoot });
  node.children.forEach((child) => buildTreeLines(child, depth + 1, lines));
  lines.push({ text: `</${node.tag}>`, depth, isTarget: false });
}

// DFS returning the list of node objects from root to the tree's single
// target: true node, inclusive — descend-trace needs the actual node
// objects (not just tags) at each depth, since each row's options are that
// depth's real `children` array.
function pathToTarget(tree) {
  function search(node, path) {
    const nextPath = path.concat([node]);
    if (node.target) return nextPath;
    for (const child of node.children || []) {
      const result = search(child, nextPath);
      if (result) return result;
    }
    return null;
  }
  return search(tree, []);
}

// Checks a node against structured match criteria — used by selector-match
// in place of a real CSS selector parser, since content only ever needs to
// *display* something that looks like a selector, not evaluate arbitrary
// CSS. Any field the rule doesn't specify is unconstrained — but criteria
// with *neither* field specified would silently match every node, which
// should only ever happen as a loud content-authoring mistake, not quietly.
function nodeMatchesCriteria(criteria, node) {
  if (criteria.tag === undefined && criteria.class === undefined) {
    console.error("[puzzles] rule criteria has neither tag nor class — matches everything:", criteria);
  }
  if (criteria.tag !== undefined && criteria.tag !== node.tag) return false;
  if (criteria.class !== undefined && criteria.class !== node.class) return false;
  return true;
}

// A rule matches a target if the target itself satisfies `match`, and (if
// present) `ancestor` is satisfied per its combinator: "child" checks only
// the immediate parent (ancestors[0]); "descendant" (the default/anything
// else) checks whether *any* ancestor, at any distance, satisfies it —
// real CSS combinator semantics, not a depth number. `ancestors` is
// closest-first (immediate parent first, root last), same convention
// ancestorChain() already returns.
function ruleMatchesTarget(rule, target, ancestors) {
  if (!nodeMatchesCriteria(rule.match, target)) return false;
  if (!rule.ancestor) return true;
  if (rule.ancestor.combinator === "child") {
    return ancestors.length > 0 && nodeMatchesCriteria(rule.ancestor, ancestors[0]);
  }
  return ancestors.some((a) => nodeMatchesCriteria(rule.ancestor, a));
}

function renderAncestorTraceHarness(root, puzzle) {
  const instances = puzzle.payload.instances;

  let state = null;
  let rowElements = [];
  let placeholderEl = null;
  let currentInstanceIndex = -1;

  function pickInstanceIndex() {
    if (instances.length === 1) return 0;
    let idx;
    do { idx = Math.floor(Math.random() * instances.length); } while (idx === currentInstanceIndex);
    return idx;
  }

  root.innerHTML = `
    <div class="puzzle-card">
      <p class="puzzle-eyebrow">Trace it &middot; containment</p>
      <h2 class="puzzle-title"></h2>
      <p class="puzzle-scenario"></p>
      <div class="code-panel"></div>
      <div class="trace-table"></div>
      <div class="confidence-gate" hidden>
        <p class="confidence-prompt">How sure are you this chain is right?</p>
        <div class="confidence-options"></div>
      </div>
      <div class="check-action" hidden>
        <button type="button" class="btn btn-primary check-btn">Check the Chain</button>
      </div>
      <div class="result-summary" hidden>
        <p class="result-text"></p>
        <button type="button" class="btn btn-secondary recheck-btn" hidden>Recheck</button>
        <button type="button" class="btn btn-secondary new-btn">New Tree</button>
      </div>
    </div>
  `;

  const titleEl = root.querySelector(".puzzle-title");
  const scenarioEl = root.querySelector(".puzzle-scenario");
  const codePanelEl = root.querySelector(".code-panel");
  const tableEl = root.querySelector(".trace-table");
  const confidenceGateEl = root.querySelector(".confidence-gate");
  const confidenceOptionsEl = root.querySelector(".confidence-options");
  const checkActionEl = root.querySelector(".check-action");
  const checkBtn = root.querySelector(".check-btn");
  const resultSummaryEl = root.querySelector(".result-summary");
  const resultTextEl = root.querySelector(".result-text");
  const recheckBtn = root.querySelector(".recheck-btn");
  const newBtn = root.querySelector(".new-btn");

  titleEl.textContent = puzzle.title;
  scenarioEl.textContent = puzzle.scenario;

  checkBtn.addEventListener("click", handleCheck);
  recheckBtn.addEventListener("click", handleRecheck);
  newBtn.addEventListener("click", newInstance);

  function isRowFilled(entry) { return entry.value.trim() !== ""; }
  function allFilled() { return state.entries.every(isRowFilled); }
  function readyForConfidence() { return state.unlocked === state.chain.length && allFilled() && !state.checked; }

  function maybeUnlockNext() {
    if (state.checked) return;
    const activeIdx = state.unlocked - 1;
    if (activeIdx >= state.chain.length - 1) return;
    if (isRowFilled(state.entries[activeIdx])) {
      state.unlocked = Math.min(state.unlocked + 1, state.chain.length);
    }
  }

  // Tag names, not exact-syntax Python — case doesn't matter here.
  function evaluateRow(idx) {
    return state.entries[idx].value.trim().toLowerCase() === state.chain[idx].toLowerCase();
  }

  function createRowElement(idx) {
    const entry = state.entries[idx];
    const wrap = document.createElement("div");
    wrap.className = "trace-row-wrap";

    const rowEl = document.createElement("div");
    rowEl.className = "trace-row";

    const field = document.createElement("label");
    field.className = "trace-field";
    const labelSpan = document.createElement("span");
    labelSpan.className = "trace-field-label";
    // Deliberately not "N levels up" — that number is itself a hint about
    // how deep the chain goes, which the student should have to work out.
    labelSpan.textContent = "next level up";
    const input = document.createElement("input");
    input.type = "text";
    input.value = entry.value;
    input.placeholder = "tag name";
    input.addEventListener("input", (e) => {
      entry.value = e.target.value;
      handleFieldChange();
    });
    field.append(labelSpan, input);
    rowEl.appendChild(field);

    const statusIcon = document.createElement("span");
    statusIcon.className = "trace-status";
    rowEl.appendChild(statusIcon);

    wrap.appendChild(rowEl);

    tableEl.insertBefore(wrap, placeholderEl);
    return { idx, rowEl, input, statusIcon };
  }

  function ensurePlaceholder() {
    if (placeholderEl) return;
    placeholderEl = document.createElement("div");
    placeholderEl.className = "trace-row trace-row-locked";
    placeholderEl.textContent = "Name the element above first";
    tableEl.appendChild(placeholderEl);
  }

  function removePlaceholder() {
    if (!placeholderEl) return;
    placeholderEl.remove();
    placeholderEl = null;
  }

  function syncTableStructure() {
    while (rowElements.length < state.unlocked) {
      removePlaceholder();
      rowElements.push(createRowElement(rowElements.length));
    }
    if (state.unlocked < state.chain.length) ensurePlaceholder();
    else removePlaceholder();
  }

  // Wrong rows get marked (red row, ✗) but never told the correct
  // ancestor — revealing it would remove any reason to keep tracing.
  function updateRowVisualState() {
    rowElements.forEach(({ idx, rowEl, input, statusIcon }) => {
      let result = null;
      if (state.results) result = state.results[idx];
      const isLockedCorrect = !!(state.checked && result && result.correct);

      rowEl.classList.toggle("trace-row-correct", isLockedCorrect);
      rowEl.classList.toggle("trace-row-wrong", !!(state.checked && result && !result.correct));
      input.disabled = isLockedCorrect;

      if (state.checked && result && result.correct) {
        statusIcon.textContent = "✓";
        statusIcon.className = "trace-status trace-status-ok";
      } else if (state.checked && result) {
        statusIcon.textContent = "✗";
        statusIcon.className = "trace-status trace-status-err";
      } else {
        statusIcon.textContent = "";
        statusIcon.className = "trace-status";
      }
    });
  }

  function renderConfidenceOptions() {
    confidenceOptionsEl.innerHTML = "";
    CONFIDENCE_OPTIONS.forEach((opt) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "confidence-btn";
      if (state.confidence === opt.value) btn.className += " confidence-btn-active";
      btn.textContent = opt.label;
      btn.addEventListener("click", () => {
        state.confidence = opt.value;
        updateChrome();
      });
      confidenceOptionsEl.appendChild(btn);
    });
  }

  function updateChrome() {
    const ready = readyForConfidence();
    confidenceGateEl.hidden = !ready;
    checkActionEl.hidden = !ready;
    if (ready) {
      renderConfidenceOptions();
      checkBtn.disabled = !state.confidence;
    }

    resultSummaryEl.hidden = !state.checked;
    if (state.checked) {
      const correctCount = state.results.filter((r) => r.correct).length;
      const allCorrect = correctCount === state.results.length;
      if (allCorrect) {
        resultTextEl.textContent = "Ancestor chain traced correctly.";
      } else {
        resultTextEl.textContent = `${correctCount} of ${state.results.length} correct so far. Fix the highlighted rows above, then recheck.`;
      }
      recheckBtn.hidden = allCorrect;
    }
  }

  function handleFieldChange() {
    maybeUnlockNext();
    syncTableStructure();
    updateChrome();
  }

  function handleCheck() {
    state.results = state.chain.map((_, idx) => ({ correct: evaluateRow(idx) }));
    state.checked = true;
    updateRowVisualState();
    updateChrome();
  }

  function handleRecheck() {
    state.results = state.results.map((r, idx) => {
      if (r.correct) return r;
      return { correct: evaluateRow(idx) };
    });
    updateRowVisualState();
    updateChrome();
  }

  // No depth-based indentation — indentation would hand the nesting depth
  // away for free, which is exactly what tracing the tags is supposed to
  // require the student to work out.
  function renderCodePanel(tree) {
    codePanelEl.innerHTML = "";
    const lines = [];
    buildTreeLines(tree, 0, lines);
    lines.forEach(({ text, isTarget }) => {
      const line = document.createElement("div");
      line.className = "code-line";
      if (isTarget) line.className += " code-line-target";
      line.textContent = text;
      codePanelEl.appendChild(line);
    });
  }

  function fullRender() {
    renderCodePanel(state.tree);
    tableEl.innerHTML = "";
    rowElements = [];
    placeholderEl = null;
    syncTableStructure();
    updateRowVisualState();
    updateChrome();
  }

  function newInstance() {
    currentInstanceIndex = pickInstanceIndex();
    const tree = instances[currentInstanceIndex].tree;
    const chain = ancestorChain(tree);
    if (!chain || !chain.length) {
      console.error(`[puzzles] "${puzzle.id}" instance ${currentInstanceIndex} has no target node — check the tree JSON.`);
      return;
    }
    state = {
      tree,
      chain,
      entries: chain.map(() => ({ value: "" })),
      unlocked: 1,
      confidence: null,
      checked: false,
      results: null,
    };
    fullRender();
  }

  newInstance();
}

function optionLabel(node) {
  if (node.class) return `${node.tag}.${node.class}`;
  return node.tag;
}

// --- descend-trace harness ---
//
// Root-to-target direction, but deliberately kept free-text like the other
// two harnesses, not click-to-choose. An earlier version rendered each
// fork's children as buttons — but with only one correct path, clicking
// among a few visible options is recognition, not recall: multiple-choice
// scaffolds the answer in a way typing it doesn't. Same fix the `class`
// field already existed for (disambiguating same-tag siblings) works just
// as well as a typed answer format ("div.description") as it does as a
// button label, so the content didn't need to change, only the mechanic.
// Every row's expected answer comes from the *true* path, same reasoning
// as before (independent per-row correctness, nothing cascades from a
// student's own wrong answers) — that part didn't change either.
function renderDescendTraceHarness(root, puzzle) {
  const instances = puzzle.payload.instances;

  let state = null;
  let rowElements = [];
  let placeholderEl = null;
  let currentInstanceIndex = -1;

  function pickInstanceIndex() {
    if (instances.length === 1) return 0;
    let idx;
    do { idx = Math.floor(Math.random() * instances.length); } while (idx === currentInstanceIndex);
    return idx;
  }

  root.innerHTML = `
    <div class="puzzle-card">
      <p class="puzzle-eyebrow">Trace it &middot; path finding</p>
      <h2 class="puzzle-title"></h2>
      <p class="puzzle-scenario"></p>
      <div class="code-panel"></div>
      <p class="code-bounds path-start"></p>
      <div class="trace-table"></div>
      <div class="confidence-gate" hidden>
        <p class="confidence-prompt">How sure are you this path is right?</p>
        <div class="confidence-options"></div>
      </div>
      <div class="check-action" hidden>
        <button type="button" class="btn btn-primary check-btn">Check the Path</button>
      </div>
      <div class="result-summary" hidden>
        <p class="result-text"></p>
        <button type="button" class="btn btn-secondary recheck-btn" hidden>Recheck</button>
        <button type="button" class="btn btn-secondary new-btn">New Path</button>
      </div>
    </div>
  `;

  const titleEl = root.querySelector(".puzzle-title");
  const scenarioEl = root.querySelector(".puzzle-scenario");
  const codePanelEl = root.querySelector(".code-panel");
  const pathStartEl = root.querySelector(".path-start");
  const tableEl = root.querySelector(".trace-table");
  const confidenceGateEl = root.querySelector(".confidence-gate");
  const confidenceOptionsEl = root.querySelector(".confidence-options");
  const checkActionEl = root.querySelector(".check-action");
  const checkBtn = root.querySelector(".check-btn");
  const resultSummaryEl = root.querySelector(".result-summary");
  const resultTextEl = root.querySelector(".result-text");
  const recheckBtn = root.querySelector(".recheck-btn");
  const newBtn = root.querySelector(".new-btn");

  titleEl.textContent = puzzle.title;
  scenarioEl.textContent = puzzle.scenario;

  checkBtn.addEventListener("click", handleCheck);
  recheckBtn.addEventListener("click", handleRecheck);
  newBtn.addEventListener("click", newInstance);

  // state.steps[i] is the node the student is trying to name at row i —
  // path[0] is the root, so steps = path.slice(1) (root's child through
  // the target itself).
  function rowCount() { return state.steps.length; }
  function isRowFilled(idx) { return state.entries[idx].value.trim() !== ""; }
  function allFilled() { return state.entries.every((_, idx) => isRowFilled(idx)); }
  function readyForConfidence() { return state.unlocked === rowCount() && allFilled() && !state.checked; }

  function maybeUnlockNext() {
    if (state.checked) return;
    const activeIdx = state.unlocked - 1;
    if (activeIdx >= rowCount() - 1) return;
    if (isRowFilled(activeIdx)) {
      state.unlocked = Math.min(state.unlocked + 1, rowCount());
    }
  }

  // Tag names (and the class used only where a sibling needs
  // disambiguating), not exact-syntax Python — case doesn't matter here.
  function evaluateRow(idx) {
    return state.entries[idx].value.trim().toLowerCase() === optionLabel(state.steps[idx]).toLowerCase();
  }

  function createRowElement(idx) {
    const entry = state.entries[idx];
    const wrap = document.createElement("div");
    wrap.className = "trace-row-wrap";

    const rowEl = document.createElement("div");
    rowEl.className = "trace-row";

    const field = document.createElement("label");
    field.className = "trace-field trace-field-path";
    const labelSpan = document.createElement("span");
    labelSpan.className = "trace-field-label";
    labelSpan.textContent = "next step down";
    const input = document.createElement("input");
    input.type = "text";
    input.value = entry.value;
    input.placeholder = "tag or tag.class";
    input.addEventListener("input", (e) => {
      entry.value = e.target.value;
      handleFieldChange();
    });
    field.append(labelSpan, input);
    rowEl.appendChild(field);

    const statusIcon = document.createElement("span");
    statusIcon.className = "trace-status";
    rowEl.appendChild(statusIcon);

    wrap.appendChild(rowEl);

    tableEl.insertBefore(wrap, placeholderEl);
    return { idx, rowEl, input, statusIcon };
  }

  function ensurePlaceholder() {
    if (placeholderEl) return;
    placeholderEl = document.createElement("div");
    placeholderEl.className = "trace-row trace-row-locked";
    placeholderEl.textContent = "Name the step above first";
    tableEl.appendChild(placeholderEl);
  }

  function removePlaceholder() {
    if (!placeholderEl) return;
    placeholderEl.remove();
    placeholderEl = null;
  }

  function syncTableStructure() {
    while (rowElements.length < state.unlocked) {
      removePlaceholder();
      rowElements.push(createRowElement(rowElements.length));
    }
    if (state.unlocked < rowCount()) ensurePlaceholder();
    else removePlaceholder();
  }

  // Wrong rows get marked (red row, ✗) but never told the correct step —
  // revealing it would remove any reason to keep tracing the path.
  function updateRowVisualState() {
    rowElements.forEach(({ idx, rowEl, input, statusIcon }) => {
      let result = null;
      if (state.results) result = state.results[idx];
      const isLockedCorrect = !!(state.checked && result && result.correct);

      rowEl.classList.toggle("trace-row-correct", isLockedCorrect);
      rowEl.classList.toggle("trace-row-wrong", !!(state.checked && result && !result.correct));
      input.disabled = isLockedCorrect;

      if (state.checked && result && result.correct) {
        statusIcon.textContent = "✓";
        statusIcon.className = "trace-status trace-status-ok";
      } else if (state.checked && result) {
        statusIcon.textContent = "✗";
        statusIcon.className = "trace-status trace-status-err";
      } else {
        statusIcon.textContent = "";
        statusIcon.className = "trace-status";
      }
    });
  }

  function renderConfidenceOptions() {
    confidenceOptionsEl.innerHTML = "";
    CONFIDENCE_OPTIONS.forEach((opt) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "confidence-btn";
      if (state.confidence === opt.value) btn.className += " confidence-btn-active";
      btn.textContent = opt.label;
      btn.addEventListener("click", () => {
        state.confidence = opt.value;
        updateChrome();
      });
      confidenceOptionsEl.appendChild(btn);
    });
  }

  function updateChrome() {
    const ready = readyForConfidence();
    confidenceGateEl.hidden = !ready;
    checkActionEl.hidden = !ready;
    if (ready) {
      renderConfidenceOptions();
      checkBtn.disabled = !state.confidence;
    }

    resultSummaryEl.hidden = !state.checked;
    if (state.checked) {
      const correctCount = state.results.filter((r) => r.correct).length;
      const allCorrect = correctCount === state.results.length;
      if (allCorrect) {
        resultTextEl.textContent = "Path traced correctly.";
      } else {
        resultTextEl.textContent = `${correctCount} of ${state.results.length} correct so far. Fix the highlighted steps above, then recheck.`;
      }
      recheckBtn.hidden = allCorrect;
    }
  }

  function handleFieldChange() {
    maybeUnlockNext();
    syncTableStructure();
    updateChrome();
  }

  function handleCheck() {
    state.results = state.steps.map((_, idx) => ({ correct: evaluateRow(idx) }));
    state.checked = true;
    updateRowVisualState();
    updateChrome();
  }

  function handleRecheck() {
    state.results = state.results.map((r, idx) => {
      if (r.correct) return r;
      return { correct: evaluateRow(idx) };
    });
    updateRowVisualState();
    updateChrome();
  }

  // No depth-based indentation — same reasoning as ancestor-trace: with
  // the tree flush-left, finding the branch that leads to the target has
  // to come from reading the tag/class structure itself, not from
  // eyeballing how far a line is indented.
  function renderTreePanel(tree) {
    codePanelEl.innerHTML = "";
    const lines = [];
    buildTreeLines(tree, 0, lines, true);
    lines.forEach(({ text, isTarget, isRoot }) => {
      const line = document.createElement("div");
      line.className = "code-line";
      if (isTarget || isRoot) line.className += " code-line-target";
      line.textContent = text;
      codePanelEl.appendChild(line);
    });
  }

  function fullRender() {
    renderTreePanel(state.tree);
    // The root itself is never one of the rows below (naming it would be
    // copying the first visible line, not a real decision) — without this,
    // "starting from the top" reads as ambiguous about whether row 1 means
    // the root or the root's child.
    pathStartEl.textContent = `Start at: ${optionLabel(state.tree)}`;
    tableEl.innerHTML = "";
    rowElements = [];
    placeholderEl = null;
    syncTableStructure();
    updateRowVisualState();
    updateChrome();
  }

  function newInstance() {
    currentInstanceIndex = pickInstanceIndex();
    const tree = instances[currentInstanceIndex].tree;
    const path = pathToTarget(tree);
    if (!path || path.length < 2) {
      console.error(`[puzzles] "${puzzle.id}" instance ${currentInstanceIndex} has no reachable target — check the tree JSON.`);
      return;
    }
    const steps = path.slice(1);
    state = {
      tree,
      steps,
      entries: steps.map(() => ({ value: "" })),
      unlocked: 1,
      confidence: null,
      checked: false,
      results: null,
    };
    fullRender();
  }

  newInstance();
}

// --- depth-quiz harness ---
//
// The inverse of what ancestor-trace/descend-trace already require: there,
// depth is a side effect the student has to work around (indentation
// stripped, nothing shown); here it's the entire graded question. Reuses
// ancestorChain() directly for the answer — the number of ancestors *is*
// "how deep is this?" — so there's no new tree-math, only a single-field
// UI, the degenerate one-row case of the same confidence-gate/check/hint/
// recheck shell every other harness uses.
function renderDepthQuizHarness(root, puzzle) {
  const instances = puzzle.payload.instances;

  let state = null;
  let currentInstanceIndex = -1;
  let rowEl = null;
  let inputEl = null;
  let statusIconEl = null;

  function pickInstanceIndex() {
    if (instances.length === 1) return 0;
    let idx;
    do { idx = Math.floor(Math.random() * instances.length); } while (idx === currentInstanceIndex);
    return idx;
  }

  root.innerHTML = `
    <div class="puzzle-card">
      <p class="puzzle-eyebrow">Trace it &middot; nesting depth</p>
      <h2 class="puzzle-title"></h2>
      <p class="puzzle-scenario"></p>
      <div class="code-panel"></div>
      <div class="trace-table"></div>
      <div class="confidence-gate" hidden>
        <p class="confidence-prompt">How sure are you?</p>
        <div class="confidence-options"></div>
      </div>
      <div class="check-action" hidden>
        <button type="button" class="btn btn-primary check-btn">Check</button>
      </div>
      <div class="result-summary" hidden>
        <p class="result-text"></p>
        <button type="button" class="btn btn-secondary recheck-btn" hidden>Recheck</button>
        <button type="button" class="btn btn-secondary new-btn">New Element</button>
      </div>
    </div>
  `;

  const titleEl = root.querySelector(".puzzle-title");
  const scenarioEl = root.querySelector(".puzzle-scenario");
  const codePanelEl = root.querySelector(".code-panel");
  const tableEl = root.querySelector(".trace-table");
  const confidenceGateEl = root.querySelector(".confidence-gate");
  const confidenceOptionsEl = root.querySelector(".confidence-options");
  const checkActionEl = root.querySelector(".check-action");
  const checkBtn = root.querySelector(".check-btn");
  const resultSummaryEl = root.querySelector(".result-summary");
  const resultTextEl = root.querySelector(".result-text");
  const recheckBtn = root.querySelector(".recheck-btn");
  const newBtn = root.querySelector(".new-btn");

  titleEl.textContent = puzzle.title;
  scenarioEl.textContent = puzzle.scenario;

  checkBtn.addEventListener("click", handleCheck);
  recheckBtn.addEventListener("click", handleRecheck);
  newBtn.addEventListener("click", newInstance);

  function isFilled() { return state.entry.value.trim() !== ""; }
  function readyForConfidence() { return isFilled() && !state.checked; }
  function evaluate() { return state.entry.value.trim() === String(state.answer); }

  function createRow() {
    const wrap = document.createElement("div");
    wrap.className = "trace-row-wrap";

    rowEl = document.createElement("div");
    rowEl.className = "trace-row";

    const field = document.createElement("label");
    field.className = "trace-field";
    const labelSpan = document.createElement("span");
    labelSpan.className = "trace-field-label";
    labelSpan.textContent = "depth";
    inputEl = document.createElement("input");
    inputEl.type = "text";
    inputEl.inputMode = "numeric";
    inputEl.value = state.entry.value;
    inputEl.placeholder = "?";
    inputEl.addEventListener("input", (e) => {
      state.entry.value = e.target.value;
      updateChrome();
    });
    field.append(labelSpan, inputEl);
    rowEl.appendChild(field);

    statusIconEl = document.createElement("span");
    statusIconEl.className = "trace-status";
    rowEl.appendChild(statusIconEl);

    wrap.appendChild(rowEl);

    tableEl.appendChild(wrap);
  }

  // Wrong gets marked (red row, ✗) but never told the correct depth —
  // revealing it would remove any reason to keep counting.
  function updateRowVisualState() {
    const isCorrect = !!(state.checked && state.correct);
    rowEl.classList.toggle("trace-row-correct", isCorrect);
    rowEl.classList.toggle("trace-row-wrong", !!(state.checked && !state.correct));
    inputEl.disabled = isCorrect;

    if (state.checked && state.correct) {
      statusIconEl.textContent = "✓";
      statusIconEl.className = "trace-status trace-status-ok";
    } else if (state.checked) {
      statusIconEl.textContent = "✗";
      statusIconEl.className = "trace-status trace-status-err";
    } else {
      statusIconEl.textContent = "";
      statusIconEl.className = "trace-status";
    }
  }

  function renderConfidenceOptions() {
    confidenceOptionsEl.innerHTML = "";
    CONFIDENCE_OPTIONS.forEach((opt) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "confidence-btn";
      if (state.confidence === opt.value) btn.className += " confidence-btn-active";
      btn.textContent = opt.label;
      btn.addEventListener("click", () => {
        state.confidence = opt.value;
        updateChrome();
      });
      confidenceOptionsEl.appendChild(btn);
    });
  }

  function updateChrome() {
    const ready = readyForConfidence();
    confidenceGateEl.hidden = !ready;
    checkActionEl.hidden = !ready;
    if (ready) {
      renderConfidenceOptions();
      checkBtn.disabled = !state.confidence;
    }

    resultSummaryEl.hidden = !state.checked;
    if (state.checked) {
      if (state.correct) {
        resultTextEl.textContent = "Correct.";
      } else {
        resultTextEl.textContent = "Not quite — try again, then recheck.";
      }
      recheckBtn.hidden = state.correct;
    }
  }

  function handleCheck() {
    state.correct = evaluate();
    state.checked = true;
    updateRowVisualState();
    updateChrome();
  }

  function handleRecheck() {
    state.correct = evaluate();
    updateRowVisualState();
    updateChrome();
  }

  function renderCodePanel(tree) {
    codePanelEl.innerHTML = "";
    const lines = [];
    buildTreeLines(tree, 0, lines);
    lines.forEach(({ text, isTarget }) => {
      const line = document.createElement("div");
      line.className = "code-line";
      if (isTarget) line.className += " code-line-target";
      line.textContent = text;
      codePanelEl.appendChild(line);
    });
  }

  function newInstance() {
    currentInstanceIndex = pickInstanceIndex();
    const tree = instances[currentInstanceIndex].tree;
    const chain = ancestorChain(tree);
    if (!chain) {
      console.error(`[puzzles] "${puzzle.id}" instance ${currentInstanceIndex} has no target node — check the tree JSON.`);
      return;
    }
    state = {
      tree,
      answer: chain.length,
      entry: { value: "" },
      confidence: null,
      checked: false,
      correct: false,
    };
    renderCodePanel(tree);
    tableEl.innerHTML = "";
    createRow();
    updateRowVisualState();
    updateChrome();
  }

  newInstance();
}

// --- selector-match harness ---
//
// Tests real CSS combinator semantics — descendant (.sidebar p, any
// ancestor at any distance) and child (main > p, immediate parent only) —
// against the target's actual ancestor chain, via ruleMatchesTarget().
// An earlier version used an invented data-depth attribute shown directly
// on the target's own line, which didn't require any containment
// reasoning at all (everything needed was already sitting on one line);
// combinators fix that by requiring the ancestor chain to actually be
// walked. Same row-unlock/confidence-gate/check/hint/recheck shell as
// descend-trace, one row per rule instead of one row per path step.
function renderSelectorMatchHarness(root, puzzle) {
  const instances = puzzle.payload.instances;

  let state = null;
  let rowElements = [];
  let placeholderEl = null;
  let currentInstanceIndex = -1;

  function pickInstanceIndex() {
    if (instances.length === 1) return 0;
    let idx;
    do { idx = Math.floor(Math.random() * instances.length); } while (idx === currentInstanceIndex);
    return idx;
  }

  root.innerHTML = `
    <div class="puzzle-card">
      <p class="puzzle-eyebrow">Trace it &middot; CSS selectors</p>
      <h2 class="puzzle-title"></h2>
      <p class="puzzle-scenario"></p>
      <div class="code-panel"></div>
      <div class="code-panel css-rules-panel"></div>
      <div class="trace-table"></div>
      <div class="confidence-gate" hidden>
        <p class="confidence-prompt">How sure are you about these rules?</p>
        <div class="confidence-options"></div>
      </div>
      <div class="check-action" hidden>
        <button type="button" class="btn btn-primary check-btn">Check the Rules</button>
      </div>
      <div class="result-summary" hidden>
        <p class="result-text"></p>
        <button type="button" class="btn btn-secondary recheck-btn" hidden>Recheck</button>
        <button type="button" class="btn btn-secondary new-btn">New Element</button>
      </div>
    </div>
  `;

  const titleEl = root.querySelector(".puzzle-title");
  const scenarioEl = root.querySelector(".puzzle-scenario");
  const codePanelEl = root.querySelector(".code-panel");
  const rulesPanelEl = root.querySelector(".css-rules-panel");
  const tableEl = root.querySelector(".trace-table");
  const confidenceGateEl = root.querySelector(".confidence-gate");
  const confidenceOptionsEl = root.querySelector(".confidence-options");
  const checkActionEl = root.querySelector(".check-action");
  const checkBtn = root.querySelector(".check-btn");
  const resultSummaryEl = root.querySelector(".result-summary");
  const resultTextEl = root.querySelector(".result-text");
  const recheckBtn = root.querySelector(".recheck-btn");
  const newBtn = root.querySelector(".new-btn");

  titleEl.textContent = puzzle.title;
  scenarioEl.textContent = puzzle.scenario;

  checkBtn.addEventListener("click", handleCheck);
  recheckBtn.addEventListener("click", handleRecheck);
  newBtn.addEventListener("click", newInstance);

  function rowCount() { return state.rules.length; }
  function isRowFilled(idx) { return state.entries[idx].value.trim() !== ""; }
  function allFilled() { return state.entries.every((_, idx) => isRowFilled(idx)); }
  function readyForConfidence() { return state.unlocked === rowCount() && allFilled() && !state.checked; }

  function maybeUnlockNext() {
    if (state.checked) return;
    const activeIdx = state.unlocked - 1;
    if (activeIdx >= rowCount() - 1) return;
    if (isRowFilled(activeIdx)) {
      state.unlocked = Math.min(state.unlocked + 1, rowCount());
    }
  }

  function expectedAnswer(idx) {
    const rule = state.rules[idx];
    if (ruleMatchesTarget(rule, state.target, state.ancestors)) return rule.color;
    return "none";
  }

  function evaluateRow(idx) {
    return state.entries[idx].value.trim().toLowerCase() === expectedAnswer(idx).toLowerCase();
  }

  function createRowElement(idx) {
    const entry = state.entries[idx];
    const rule = state.rules[idx];

    const wrap = document.createElement("div");
    wrap.className = "trace-row-wrap";

    const rowEl = document.createElement("div");
    rowEl.className = "trace-row";

    const ruleLabel = document.createElement("span");
    ruleLabel.className = "trace-field-label";
    ruleLabel.textContent = rule.display;
    rowEl.appendChild(ruleLabel);

    const field = document.createElement("label");
    field.className = "trace-field trace-field-path";
    const inputPrompt = document.createElement("span");
    inputPrompt.className = "trace-field-label";
    inputPrompt.textContent = "matches? type its color, or “none”";
    const input = document.createElement("input");
    input.type = "text";
    input.value = entry.value;
    input.placeholder = "e.g. teal, or “none”";
    input.addEventListener("input", (e) => {
      entry.value = e.target.value;
      handleFieldChange();
    });
    field.append(inputPrompt, input);
    rowEl.appendChild(field);

    const statusIcon = document.createElement("span");
    statusIcon.className = "trace-status";
    rowEl.appendChild(statusIcon);

    wrap.appendChild(rowEl);

    tableEl.insertBefore(wrap, placeholderEl);
    return { idx, rowEl, input, statusIcon };
  }

  function ensurePlaceholder() {
    if (placeholderEl) return;
    placeholderEl = document.createElement("div");
    placeholderEl.className = "trace-row trace-row-locked";
    placeholderEl.textContent = "Answer the rule above first";
    tableEl.appendChild(placeholderEl);
  }

  function removePlaceholder() {
    if (!placeholderEl) return;
    placeholderEl.remove();
    placeholderEl = null;
  }

  function syncTableStructure() {
    while (rowElements.length < state.unlocked) {
      removePlaceholder();
      rowElements.push(createRowElement(rowElements.length));
    }
    if (state.unlocked < rowCount()) ensurePlaceholder();
    else removePlaceholder();
  }

  // Wrong rows get marked (red row, ✗) but never told which color/rule was
  // actually right — revealing it would remove any reason to reconsider.
  function updateRowVisualState() {
    rowElements.forEach(({ idx, rowEl, input, statusIcon }) => {
      let result = null;
      if (state.results) result = state.results[idx];
      const isLockedCorrect = !!(state.checked && result && result.correct);

      rowEl.classList.toggle("trace-row-correct", isLockedCorrect);
      rowEl.classList.toggle("trace-row-wrong", !!(state.checked && result && !result.correct));
      input.disabled = isLockedCorrect;

      if (state.checked && result && result.correct) {
        statusIcon.textContent = "✓";
        statusIcon.className = "trace-status trace-status-ok";
      } else if (state.checked && result) {
        statusIcon.textContent = "✗";
        statusIcon.className = "trace-status trace-status-err";
      } else {
        statusIcon.textContent = "";
        statusIcon.className = "trace-status";
      }
    });
  }

  function renderConfidenceOptions() {
    confidenceOptionsEl.innerHTML = "";
    CONFIDENCE_OPTIONS.forEach((opt) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "confidence-btn";
      if (state.confidence === opt.value) btn.className += " confidence-btn-active";
      btn.textContent = opt.label;
      btn.addEventListener("click", () => {
        state.confidence = opt.value;
        updateChrome();
      });
      confidenceOptionsEl.appendChild(btn);
    });
  }

  function updateChrome() {
    const ready = readyForConfidence();
    confidenceGateEl.hidden = !ready;
    checkActionEl.hidden = !ready;
    if (ready) {
      renderConfidenceOptions();
      checkBtn.disabled = !state.confidence;
    }

    resultSummaryEl.hidden = !state.checked;
    if (state.checked) {
      const correctCount = state.results.filter((r) => r.correct).length;
      const allCorrect = correctCount === state.results.length;
      if (allCorrect) {
        resultTextEl.textContent = "All rules answered correctly.";
      } else {
        resultTextEl.textContent = `${correctCount} of ${state.results.length} correct so far. Fix the highlighted rules above, then recheck.`;
      }
      recheckBtn.hidden = allCorrect;
    }
  }

  function handleFieldChange() {
    maybeUnlockNext();
    syncTableStructure();
    updateChrome();
  }

  function handleCheck() {
    state.results = state.rules.map((_, idx) => ({ correct: evaluateRow(idx) }));
    state.checked = true;
    updateRowVisualState();
    updateChrome();
  }

  function handleRecheck() {
    state.results = state.results.map((r, idx) => {
      if (r.correct) return r;
      return { correct: evaluateRow(idx) };
    });
    updateRowVisualState();
    updateChrome();
  }

  function renderTreePanel(tree) {
    codePanelEl.innerHTML = "";
    const lines = [];
    buildTreeLines(tree, 0, lines);
    lines.forEach(({ text, isTarget }) => {
      const line = document.createElement("div");
      line.className = "code-line";
      if (isTarget) line.className += " code-line-target";
      line.textContent = text;
      codePanelEl.appendChild(line);
    });
  }

  // Rules are always shown in full, same principle as the tree above —
  // only the answer rows unlock progressively, never the thing being
  // asked about. Without this, the student is asked "what color does this
  // rule apply" with no way to ever see what color it declares.
  function renderRulesPanel(rules) {
    rulesPanelEl.innerHTML = "";
    rules.forEach((rule, idx) => {
      const selectorLine = document.createElement("div");
      selectorLine.className = "code-line";
      selectorLine.textContent = `${rule.display} {`;
      rulesPanelEl.appendChild(selectorLine);

      const colorLine = document.createElement("div");
      colorLine.className = "code-line";
      colorLine.style.paddingLeft = "1.25rem";
      colorLine.textContent = `color: ${rule.color};`;
      rulesPanelEl.appendChild(colorLine);

      const closeLine = document.createElement("div");
      closeLine.className = "code-line";
      closeLine.textContent = "}";
      rulesPanelEl.appendChild(closeLine);

      if (idx < rules.length - 1) {
        const spacer = document.createElement("div");
        spacer.className = "code-line";
        spacer.textContent = " ";
        rulesPanelEl.appendChild(spacer);
      }
    });
  }

  function newInstance() {
    currentInstanceIndex = pickInstanceIndex();
    const instance = instances[currentInstanceIndex];
    const tree = instance.tree;
    const path = pathToTarget(tree);
    if (!path || !path.length) {
      console.error(`[puzzles] "${puzzle.id}" instance ${currentInstanceIndex} has no target node — check the tree JSON.`);
      return;
    }
    const target = path[path.length - 1];
    // Closest-first ancestor chain (immediate parent first, root last) —
    // same convention ancestorChain() returns, needed here as node objects
    // (not just tags) so combinator rules can check tag/class per ancestor.
    const ancestors = path.slice(0, path.length - 1).reverse();
    state = {
      tree,
      target,
      ancestors,
      rules: instance.rules,
      entries: instance.rules.map(() => ({ value: "" })),
      unlocked: 1,
      confidence: null,
      checked: false,
      results: null,
    };
    renderTreePanel(tree);
    renderRulesPanel(instance.rules);
    tableEl.innerHTML = "";
    rowElements = [];
    placeholderEl = null;
    syncTableStructure();
    updateRowVisualState();
    updateChrome();
  }

  newInstance();
}

document.addEventListener("DOMContentLoaded", init);
