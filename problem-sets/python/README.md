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
  "int-math",
  "float-math"
]
```

## Linking directly to a unit
Add `#<unit-id>` to the URL to open the site straight into that lesson, e.g.:
```
https://<your-username>.github.io/<repo-name>/python/#float-math
```
This works for sharing a specific lesson's link in Google Classroom, and also
means browser back/forward and bookmarks behave correctly when moving between
units. If the id after `#` doesn't match any unit (typo, or a unit that's been
removed), the site just falls back to the first lesson in the list rather than
showing an error.

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

## Student names and the "Download My Work" button
Every student is asked for their name the first time they open the site
(saved in their browser, editable any time via the "change" link next to
their name in the header). Every click of **Run Tests** — not just the final
successful one — is logged in that student's browser: the code they
submitted, a timestamp, and whether it passed. Clicking **Download My Work**
exports all of it as a single Markdown file — something a student hands in
themselves, rather than something you have to go collect.

This is intentionally a manual, student-initiated action rather than an
automatic one — turning submission into something the student is responsible
for, the same way handing in any other assignment works.

**Report format:** the export is organized by calendar day, most recent day
first — built for a daily-assignment workflow, so today's work is always at
the top rather than buried under older material. Within a day, each exercise
they touched shows every attempt made that day. If they'd also worked on that
same exercise on an earlier day, that prior history is pulled in right below,
under an "Earlier attempts on this exercise" heading — so if a student is
still stuck on something from three days ago, you'll see that the moment you
look at today's entry for it, without having to go dig through older days
yourself.

## Limitations to know about
- **Work only exists in the student's own browser until they download it.**
  Since there's no backend, attempt history lives in `localStorage` — if a
  student clears their browser data, switches browsers/devices, or uses
  private/incognito mode, that history is gone. Worth a heads-up to students
  that they should download their work periodically rather than only at the
  very end of a unit.
- **No protection against infinite loops.** Pyodide runs in the main browser
  tab, so a stray `while True:` could freeze a student's own tab (it can't
  affect anyone else, since there's no server). Not a risk yet since no
  exercises use loops — worth revisiting once loop-based exercises are added.
- **First load takes a few seconds** while Pyodide downloads (~10MB, cached by
  the browser afterward) — the header status indicator shows "Loading
  Python…" until it's ready.
