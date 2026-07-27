# Python Practice (track)

Real Python, running in the browser via **Pyodide** (CPython compiled to
WebAssembly). No server, no account, no login for students.

See the repo root [`README.md`](../README.md) for overall architecture and
GitHub Pages hosting steps — this file covers just what's specific to this
track.

## Files
- `index.html` — page structure, including the lesson (unit) dropdown
- `style.css` — visual design (dark IDE-style theme)
- `exercises.js` — all lesson content, organized into units, plus the
  `UNIT_ORDER` list that controls what order lessons appear in
- `app.js` — loads Pyodide, runs student code against each test case, shows
  pass/fail results

## Reordering or adding lessons
Open `exercises.js`:
- To **reorder existing units**, edit the `UNIT_ORDER` list near the bottom of
  the file — just move the id strings, nothing else needs to change.
- To **add a new unit**, copy one of the existing unit objects in `UNIT_DATA`,
  give it a new `id`, fill in its `exercises` array, then add that `id` to
  `UNIT_ORDER` wherever you want it to appear.
- To **draft a unit without showing it to students yet**, leave its `id` out
  of `UNIT_ORDER` — it stays in the file but won't appear on the site.

## Limitations to know about
- **No teacher dashboard.** There's no backend, so there's no way to see who's
  solved what remotely. If you need to check completion, a simple manual
  checkpoint (e.g., a Google Form where students paste their "all tests
  passed" screenshot) covers the gap without adding a dependency.
- **No protection against infinite loops.** Pyodide runs in the main browser
  tab, so a stray `while True:` could freeze a student's own tab (it can't
  affect anyone else, since there's no server). Not a risk yet since no
  exercises use loops — worth revisiting once loop-based exercises are added.
- **First load takes a few seconds** while Pyodide downloads (~10MB, cached by
  the browser afterward) — the header status indicator shows "Loading
  Python…" until it's ready.
