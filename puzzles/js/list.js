// Standalone reference page for posting links into Google Classroom — not
// linked from index.html, not part of the student flow. Reads
// data/manifest.json + each puzzle file live (same fetch shape as
// loadPuzzles() in app.js, kept separate rather than shared, since this
// page never mounts a harness and shouldn't pull in that code to do so),
// so it can never go stale the way a hand-maintained list would.

async function loadAndRenderList() {
  const root = document.getElementById("puzzle-list-root");

  let ids;
  try {
    const manifestRes = await fetch("data/manifest.json");
    if (!manifestRes.ok) throw new Error(`Couldn't load data/manifest.json (${manifestRes.status})`);
    ids = await manifestRes.json();
  } catch (err) {
    root.textContent = `Couldn't load the puzzle list: ${err.message}`;
    return;
  }

  const puzzles = [];
  for (const id of ids) {
    const res = await fetch(`data/${id}.json`);
    if (!res.ok) {
      console.error(`Couldn't load data/${id}.json (${res.status}) — skipping it.`);
      continue;
    }
    puzzles.push(await res.json());
  }

  if (!puzzles.length) {
    root.textContent = "No puzzles available yet.";
    return;
  }

  root.innerHTML = "";
  const list = document.createElement("div");
  list.className = "puzzle-list";

  puzzles.forEach((puzzle) => {
    const row = document.createElement("a");
    row.className = "puzzle-list-item";
    row.href = `index.html#${puzzle.id}`;

    const titleEl = document.createElement("span");
    titleEl.className = "puzzle-list-title";
    titleEl.textContent = puzzle.title;

    const meta = document.createElement("span");
    meta.className = "puzzle-list-meta";

    const idEl = document.createElement("span");
    idEl.className = "puzzle-list-id";
    idEl.textContent = `#${puzzle.id}`;

    const typeEl = document.createElement("span");
    typeEl.className = "puzzle-list-type";
    typeEl.textContent = puzzle.harness_type;

    meta.append(idEl, typeEl);
    row.append(titleEl, meta);
    list.appendChild(row);
  });

  root.appendChild(list);
}

document.addEventListener("DOMContentLoaded", loadAndRenderList);
