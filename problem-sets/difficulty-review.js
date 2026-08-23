// Standalone reference page for rating exercise difficulty — not linked
// from either student-facing app. Reads both tracks' real unit data live
// (same fetch shape as each app's loadUnits()). Any exercise that already
// has a `difficulty` value in its JSON shows as confirmed with that value;
// anything else gets a rough algorithmic guess as a starting point. A
// click always confirms/overrides a row. This page cannot write back to
// the repo, so its output is a JSON blob of decisions to hand to Claude —
// meaning this same page stays useful as new units get added later: only
// the new, undecided exercises need attention on a repeat pass.

const TRACKS = [
  { key: "python", label: "Python", unitsDir: "python/units" },
  { key: "webdev", label: "Web Dev", unitsDir: "webdev/units" },
];

function storageKey(track, unitId, exerciseId) {
  return `difficulty-review-${track}-${unitId}-${exerciseId}`;
}

function loadOverride(track, unitId, exerciseId) {
  const raw = localStorage.getItem(storageKey(track, unitId, exerciseId));
  if (!raw) return null;
  const n = Number(raw);
  if (n === 1 || n === 2 || n === 3) return n;
  return null;
}

function saveOverride(track, unitId, exerciseId, value) {
  localStorage.setItem(storageKey(track, unitId, exerciseId), String(value));
}

// An exercise's own `difficulty` field, once one has actually been applied
// to its unit JSON, is the real source of truth — takes priority over the
// algorithmic guess. This is what lets a later pass (after new units get
// added) show already-decided exercises as already-confirmed without
// depending on this browser's localStorage still holding the same override
// from the original pass.
function existingDifficulty(ex) {
  const d = ex.difficulty;
  if (d === 1 || d === 2 || d === 3) return d;
  return null;
}

// Resolves the value + confirmed-state a row should show, in priority
// order: an override made on this page in this browser (most recent
// intent), then a `difficulty` value already applied to the JSON, then
// the algorithmic guess as a last resort for anything undecided.
function resolveDifficulty(track, unit, ex) {
  const override = loadOverride(track.key, unit.id, ex.id);
  if (override !== null) return { value: override, confirmed: true };
  const existing = existingDifficulty(ex);
  if (existing !== null) return { value: existing, confirmed: true };
  return { value: null, confirmed: false };
}

// Total character length of an exercise's starter code, regardless of
// whether it's a plain line array (Python) or an {html, css, js} object
// of line arrays (Web Dev) — both just get flattened and joined.
function starterLength(starter) {
  if (Array.isArray(starter)) {
    return starter.join("\n").length;
  }
  const parts = [starter.html || [], starter.css || [], starter.js || []];
  return parts.map(lines => lines.join("\n")).join("\n").length;
}

// Full `description` (all lines joined, HTML tags stripped) — shown in
// full next to each row so a difficulty judgment doesn't require leaving
// the page to go read the exercise itself.
function descriptionSnippet(description) {
  const full = (description || []).join(" ");
  return full.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

// Rough starting guess only — position in the unit (exercises are already
// sequenced easiest-to-hardest), test count, and starter-code length each
// map to a 1-3 score, then get combined with position weighted heaviest
// since it's the most reliable of the three. A human confirms or
// overrides every row; this just saves starting from a blank slate.
function algorithmicGuess(index, count, testCount, starterLen) {
  let positionScore;
  if (count <= 1) {
    positionScore = 1;
  } else {
    positionScore = 1 + Math.round((index / (count - 1)) * 2);
  }

  let testScore;
  if (testCount <= 1) {
    testScore = 1;
  } else if (testCount <= 3) {
    testScore = 2;
  } else {
    testScore = 3;
  }

  let starterScore;
  if (starterLen < 40) {
    starterScore = 3;
  } else if (starterLen <= 120) {
    starterScore = 2;
  } else {
    starterScore = 1;
  }

  const combined = positionScore * 0.5 + testScore * 0.3 + starterScore * 0.2;
  let rounded = Math.round(combined);
  if (rounded < 1) rounded = 1;
  if (rounded > 3) rounded = 3;
  return rounded;
}

// The manifest only gives ids, not filenames (filenames carry an
// ordering-number prefix the id doesn't), so each unit file is found by
// trying the numbered-filename pattern both apps' own units already use.
async function loadTrackUnits(track) {
  const manifestRes = await fetch(`${track.unitsDir}/manifest.json`);
  if (!manifestRes.ok) throw new Error(`Couldn't load ${track.unitsDir}/manifest.json (${manifestRes.status})`);
  const unitIds = await manifestRes.json();

  const units = [];
  for (const unitId of unitIds) {
    const unit = await fetchUnitById(track.unitsDir, unitId);
    if (unit) units.push(unit);
  }
  return units;
}

// Unit filenames are `<NN>-<unitId>.json` with an unknown NN, so try each
// number until one resolves — small, fixed search space (units per track
// stay well under 99), and avoids needing a second manifest of filenames.
async function fetchUnitById(unitsDir, unitId) {
  for (let n = 1; n <= 99; n++) {
    const nn = String(n).padStart(2, "0");
    const res = await fetch(`${unitsDir}/${nn}-${unitId}.json`);
    if (res.ok) return res.json();
  }
  console.error(`[difficulty-review] couldn't find a unit file for "${unitId}" in ${unitsDir}`);
  return null;
}

function updateProgress(total, done) {
  document.getElementById("progress").textContent = `${done} of ${total} rated`;
}

function collectDecisions(trackData) {
  const decisions = [];
  trackData.forEach(({ track, units }) => {
    units.forEach(unit => {
      unit.exercises.forEach((ex, index) => {
        const resolved = resolveDifficulty(track, unit, ex);
        let value = resolved.value;
        if (value === null) {
          const testCount = ex.tests.length;
          value = algorithmicGuess(index, unit.exercises.length, testCount, starterLength(ex.starter));
        }
        decisions.push({
          track: track.key,
          unit: unit.id,
          exercise: ex.id,
          title: ex.title,
          difficulty: value,
          confirmed: resolved.confirmed,
        });
      });
    });
  });
  return decisions;
}

async function loadAndRenderReview() {
  const root = document.getElementById("review-root");
  root.textContent = "Loading…";

  let trackData;
  try {
    trackData = [];
    for (const track of TRACKS) {
      const units = await loadTrackUnits(track);
      trackData.push({ track, units });
    }
  } catch (err) {
    root.textContent = `Couldn't load unit data: ${err.message}`;
    return;
  }

  root.innerHTML = "";
  let totalExercises = 0;
  let ratedExercises = 0;

  trackData.forEach(({ track, units }) => {
    const trackHeading = document.createElement("h2");
    trackHeading.className = "track-title";
    trackHeading.textContent = track.label;
    root.appendChild(trackHeading);

    units.forEach(unit => {
      const unitHeading = document.createElement("h3");
      unitHeading.className = "unit-title";
      unitHeading.textContent = unit.title;
      root.appendChild(unitHeading);

      unit.exercises.forEach((ex, index) => {
        totalExercises++;
        const testCount = ex.tests.length;
        const guess = algorithmicGuess(index, unit.exercises.length, testCount, starterLength(ex.starter));
        const resolved = resolveDifficulty(track, unit, ex);
        if (resolved.confirmed) ratedExercises++;

        const row = document.createElement("div");
        row.className = "ex-row";

        const info = document.createElement("div");
        info.className = "ex-info";
        const titleEl = document.createElement("div");
        titleEl.className = "ex-title";
        titleEl.textContent = `${ex.id} — ${ex.title}`;
        const metaEl = document.createElement("div");
        metaEl.className = "ex-meta";
        metaEl.textContent = `${testCount} test${testCount === 1 ? "" : "s"}`;
        const snippetEl = document.createElement("div");
        snippetEl.className = "ex-snippet";
        snippetEl.textContent = descriptionSnippet(ex.description);
        info.append(titleEl, metaEl, snippetEl);

        let rowIsRated = resolved.confirmed;

        const buttons = document.createElement("div");
        buttons.className = "diff-buttons";
        [1, 2, 3].forEach(value => {
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "diff-btn";
          btn.textContent = String(value);
          const isActive = resolved.confirmed && resolved.value === value;
          const isGuessOnly = !resolved.confirmed && guess === value;
          if (isActive) btn.classList.add("active");
          if (isGuessOnly) btn.classList.add("guess");
          btn.addEventListener("click", () => {
            saveOverride(track.key, unit.id, ex.id, value);
            buttons.querySelectorAll(".diff-btn").forEach(b => b.classList.remove("active", "guess"));
            btn.classList.add("active");
            if (!rowIsRated) {
              rowIsRated = true;
              ratedExercises++;
              updateProgress(totalExercises, ratedExercises);
            }
          });
          buttons.appendChild(btn);
        });

        row.append(info, buttons);
        root.appendChild(row);
      });
    });
  });

  updateProgress(totalExercises, ratedExercises);

  document.getElementById("copy-btn").addEventListener("click", async () => {
    const decisions = collectDecisions(trackData);
    const json = JSON.stringify(decisions, null, 2);
    const statusEl = document.getElementById("copy-status");
    try {
      await navigator.clipboard.writeText(json);
      statusEl.textContent = "Copied!";
    } catch (err) {
      console.error("[difficulty-review] clipboard write failed:", err);
      statusEl.textContent = "Copy failed — see console.";
    }
    setTimeout(() => { statusEl.textContent = ""; }, 2500);
  });
}

document.addEventListener("DOMContentLoaded", loadAndRenderReview);
