# Python Practice App — Design & To-Do

Context: this tracks design decisions, open questions, and outstanding work
for the Pyodide-based Python practice site (`problem-sets/python/`) —
`manifest.json` + one JSON file per unit, `app.js`/`index.html`/`style.css`,
retry-until-green test harness. Mirrors
`docs/puzzle-design-session-summary-*.md`'s role for the sibling puzzles
app: a running log of decisions and open work, not one-time reference
documentation — that's what `problem-sets/python/README.md` is for.

## Conventions

- **Filenames carry a date suffix**, `YYYY-MM-DD`, reflecting the date of
  the file's most recent update — same convention as the puzzle design
  docs, so multiple versions can be told apart at a glance without opening
  each one.
- **No ternary operator.** Use `if`/`else` instead, even where it costs
  more lines — same rule and same reasoning as the puzzles app
  (`docs/puzzle-design-session-summary-2026-08-14.md`'s Conventions
  section): ternaries measurably slow down reading the code, and that cost
  applies every time the file is read afterward, not just once.

## To-dos

1. **Update the README files.** At least `problem-sets/python/README.md`
   has drifted from actual behavior — e.g. it still says "Not a risk yet
   since no exercises use loops" under infinite-loop risk, but loop-based
   units (`for-loops`, `nested-ifs`) already exist. Needs a pass to
   reconcile documented behavior with what's actually shipped.
2. **Refactor all ternary expressions to `if`/`else`** in
   `problem-sets/python/app.js`, per the style convention above — this app
   predates that decision, so it still has ternaries the puzzles app
   (`puzzles/app.js`) no longer does.
3. **Write a second functions unit, and add a basic classes unit if there
   isn't one.** Checked `units/manifest.json`: a `functions` unit already
   exists (19 units total), so this is a follow-up set, not a first one —
   but there's no classes/OOP unit anywhere yet, confirming the "if we
   don't have it" suspicion.
