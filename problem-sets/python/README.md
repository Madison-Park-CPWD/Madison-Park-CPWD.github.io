# Python Practice (track)

Real Python, running in the browser via **Pyodide** (CPython compiled to
WebAssembly). No server, no account, no login for students.

See the repo root [`README.md`](../README.md) for overall architecture and
GitHub Pages hosting steps — this file covers just what's specific to this
track.

## Files
```
python/
├── index.html          ← page structure, including the lesson dropdown
├── style.css            ← visual design (dark IDE-style theme)
├── app.js                ← loads Pyodide, fetches unit data, runs tests
└── units/
    ├── manifest.json      ← ordered list of unit ids — controls lesson order
    ├── int-math.json
    ├── print-input-fstrings.json
    └── ...one file per unit, as many as you like
```

Each unit is its own small JSON file rather than one giant JS file — built
this way so that with ~300 exercises down the road, each lesson stays a
short, easy-to-review file, and editing one lesson can never accidentally
break another. `app.js` fetches `units/manifest.json` first, then fetches
each listed unit file in that order, at page load.

## Reordering lessons
Open `units/manifest.json` and reorder the id strings — that's it, nothing
else needs to change:
```json
[
  "print-input-fstrings",
  "int-math"
]
```

## Adding a new unit
1. Create a new file `units/<your-unit-id>.json` shaped like this:
   ```json
   {
     "id": "your-unit-id",
     "title": "Human-Readable Title",
     "exercises": [
       {
         "id": "01",
         "source_unit": "your-unit-id",
         "title": "Exercise Title",
         "sidebar_tag": "short tag shown in sidebar",
         "description": [
           "<p>One line of HTML per array entry —",
           "no escaping newlines by hand.</p>"
         ],
         "starter": [
           "a = int(input())",
           "",
           "# TODO: ..."
         ],
         "tests": [
           { "stdin": ["3", "4"], "expected": "7" }
         ]
       }
     ]
   }
   ```
2. Add `"your-unit-id"` to `units/manifest.json` wherever you want it to
   appear in the lesson order.

**Field notes:**
- `description` and `starter` are arrays of lines, not one long string — write
  each line as its own array entry (a blank line is just `""`), and the app
  joins them with newlines automatically. `description` is still raw HTML.
- `tests[].stdin` is an array of one entry per `input()` call the student's
  code will make (e.g. `["3", "4"]` for two separate calls reading `3` then
  `4`). An exercise that needs no input at all uses `"stdin": []`.
- `source_unit` records which unit file an exercise currently lives in. The
  app never reads it — it's purely so that if you ever cut an exercise out of
  one unit file and paste it into another, you can still tell where it
  originally came from. If you do move one, update this field by hand to
  match its new home.

**To draft a unit without showing it to students yet:** just leave its file
out of `manifest.json` — it can sit in the `units/` folder unfinished, and
won't show up on the site until you add it to the list.

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
