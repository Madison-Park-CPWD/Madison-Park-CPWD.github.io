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

## Session 2 — Growth metric: definition, then the logging + difficulty changes it needs

Spans both tracks (Python and Web Dev), not just Python — noting that here
since this doc's title predates Web Dev's build.

### Why not a naive self-baseline

First framing considered: compare a student's attempts-to-solve early in
the term vs. later. Rejected — curriculum difficulty increases over time
(`dictionaries`/`try-except`/`functions` vs.
`print-input-fstrings`/`variable-types`), so a genuinely-improving
student's raw attempts-to-solve trends *up* anyway, showing false decline.
Any usable metric has to normalize for exercise difficulty before looking
at trend.

### The metric

`relative_performance = expected_attempts / attempts_taken` per solved
exercise (needs a per-exercise `expected_attempts` baseline — see the
`difficulty` field below), bucketed by calendar week
(`week_score(w) = average(relative_performance)` over exercises first-passed
that week — chosen over exercise-count windows since a fixed-size window
conflates "grew" with "attempted more," and calendar weeks don't), and
trended via a rolling comparison rather than one week vs. the next
(single-week comparisons are noisy on low-volume weeks).

Known, accepted limitation: self-referential growth metrics are gameable
by sandbagging an early baseline. Partial mitigation only: `history` keeps
full code per attempt (not just pass/fail), so a suspicious score is
auditable by hand — never collapse that down to a summary-only record.

### Three metrics, partial-success canned

Partial success (code-diffing, or "only failed 1 test") was considered and
dropped — most exercises have no single canonical solution, so diffing
against a reference isn't meaningful, and "1 of N tests failed" isn't
comparable across exercises with different test counts or different
per-test weight.

Shipping: **Grit** (attempts to first pass), **first-attempt success
rate** — both already fully derivable from existing `history` data — and
**error-reading** (does a failed attempt repeat the same mistake as the
previous one on that exercise), which needed a logging change. **Misread
error** (prompt comprehension) stays parked — no computable version from
telemetry, would need manual/LLM review, not a formula.

### Logging change (implemented)

Added a `testResults` field to every `appendHistory()` call in both
tracks' `app.js` — `[{ passed, hadError }, ...]`, one entry per test, in
test order, collected in the existing per-test loop in each `runTests()`
(no new pass over the tests). `hadError` is the same crashed-vs-wrong-output
distinction each track's error nudge already makes. "Same mistake" (for
error-reading, computed later, not part of this change) = identical
failing-test-index set + identical `hadError` pattern between two
consecutive failed attempts. Old `history` entries predate this field —
anything computed from it must treat its absence as "no data."

### `difficulty` field + review page (implemented)

Added a `1`/`2`/`3` `difficulty` field to the exercise schema (both
tracks) — deliberately coarse for fast manual authoring. A separate
code-level lookup table (not per-exercise data, not yet added — belongs
next to wherever the growth-metric math itself gets implemented) maps
category → an actual `expected_attempts` number; that's also where a
later cohort-derived refinement can override the category default per
exercise once real attempt data exists.

Built `problem-sets/difficulty-review.html` + `difficulty-review.js` to
make rating ~120 exercises across both tracks tractable — not linked from
either student app, same "standalone reference page, live-fetches real
data" pattern as `puzzles/list.html`. Pre-fills an algorithmic 1/2/3 guess
per exercise (weighted: position-in-unit heaviest, then test count, then
starter-code length — position is the most reliable signal since
exercises are already sequenced easiest-to-hardest within a unit) so
reviewing is mostly confirming, not deciding from scratch; a click
overrides any row, saved to that browser's `localStorage` so the pass can
be done incrementally. A static page can't write back to the repo, so its
job stops at producing a `JSON.stringify`'d list of decisions (a "Copy
results" button) — Claude applies the finalized values to the actual unit
JSON files afterward.

Sanity-checked the algorithmic guess against all 19 Python units + the one
Web Dev unit by re-running the same heuristic in a throwaway Python
script: guesses cluster around 2 with a mild upward drift toward the end
of most units and occasional dips to 1 early on — reasonable as a rough
starting point, not mistaken for an actual rating.

Still open, deliberately deferred: actually running the review page
end-to-end to produce real `difficulty` values, adding the
category → `expected_attempts` lookup table, writing the code that
computes `relative_performance`/`week_score`/the rolling trend from
stored history, and the storage/display layer (Apps Script → Google Sheet
pipeline, leaderboard question) — all explicitly out of scope until the
metric itself was defined, which this session did.
