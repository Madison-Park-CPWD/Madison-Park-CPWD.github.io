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

### Difficulty values applied, lookup table added

The review page got a real pass: all 204 exercises across both tracks now
have a `difficulty` value in their unit JSON, applied from the teacher's
"Copy results" JSON output. Applied as a targeted text insertion keyed on
each exercise's `id`/`title` lines rather than a full JSON re-dump — a
first attempt at a full re-dump was caught and reverted because it
silently reformatted `webdev/units/01-html-basics.json`'s hand-compacted
single-line test objects (a real risk worth remembering: re-serializing
JSON through a formatter can quietly rewrite unrelated parts of a file
that started out hand-formatted differently than the serializer's
defaults). Verified after the fact: every touched file parses, the diff
is purely additive (no deletions), and all 204 applied values were
cross-checked against the source decisions with zero mismatches.

Worth noting: of the 204 ratings, **zero landed on `3` (hard)** — 110
came in as `1`, 94 as `2`. Either the current exercise set genuinely has
no "hard" exercises by the teacher's judgment, or it's worth a deliberate
second look later; not treated as a bug, just flagged.

Added `problem-sets/growth-metric-config.json` — the
category → `expected_attempts` lookup table Plan 2 called for
(`{1: 1.5, 2: 3, 3: 5}`). These are illustrative placeholders, not
measured from real attempt data (none exists yet); the file's own notes
say so explicitly and describe the later cohort-override plan (once an
exercise has enough of its own history, its empirical average should
override the category default). Category 3's number is unvalidated by
even a single rated exercise right now.

### Where the metric computation lives: Apps Script, not the client

Decided `relative_performance`/`week_score`/the trend get computed in
Apps Script, not in either track's `app.js`, even though the math only
needs one student's own `history` + the lookup table above (so it
*could* run client-side). Reasoning: the actual purpose — comparing
growth across students, and later overriding `expected_attempts` per
exercise from real cohort data — only works once data is centralized in
the Sheet; keeping the metric logic there also means it can keep getting
tuned without ever touching the student-facing practice apps, which stay
focused on "run exercises, log history."

### Export pipeline: batched per exercise, not per attempt (client side, implemented)

Before the Apps Script side can be written, data has to get from a
student's browser to the Sheet at all — that ingestion step didn't exist
yet, so this session started designing and building the client half of
it. Decided against uploading on every "Run Tests" click (`appendHistory`
already fires that often, every attempt, pass or fail) in favor of
batching: one upload per exercise, containing that exercise's *entire*
attempt history so far, triggered by either of two events —

1. **Solved** — inside `runTests()`'s existing `if (allPass)` branch, both
   tracks.
2. **Left with unsolved attempts** — switching exercises (sidebar click),
   switching units (`switchToUnitIndex`), or closing/navigating away from
   the page (`beforeunload`). Added after confirming a real gap: without
   this, an exercise a student attempted and never solved would leave
   *zero* record anywhere but that student's own browser — invisible to
   Grit, which specifically needs to see effort on things that don't come
   easily. An exercise with zero attempts still uploads nothing, since
   there's nothing to say.

Implemented as `exportExerciseIfNeeded(unitId, exerciseId)` in both
`app.js` files, backed by a per-exercise `exported-<unit>-<exercise>`
count in `localStorage` (how many history entries were already sent) —
calling it is a safe no-op whenever there's nothing new since the last
export, so every call site just calls it speculatively rather than
tracking send-state itself. `EXPORT_ENDPOINT_URL` is `null` right now — a
deliberate no-op until the Apps Script Web App exists and gets deployed;
critically, this means nothing collected before deployment is lost: the
exported-count only advances on an actual send, so the very first call
after the URL gets set uploads everything accumulated for that exercise
in one batch, no manual backfill needed. Uses `navigator.sendBeacon()`
(falling back to a `keepalive` `fetch()` if the browser refuses to queue
it) specifically so the `beforeunload` case still fires reliably, which a
plain `fetch()` can't guarantee during page teardown.

Verified via an isolated simulation (fake `localStorage`/`sendBeacon`,
no real browser available this session): confirmed nothing sends while
the endpoint is unset, exported-count stays at 0 so later deployment
doesn't lose data, a real send correctly batches all accumulated
attempts and advances the count, an immediate repeat call is a true
no-op, and an untouched exercise never sends anything.

### Superseded: export trigger changed from event-driven to "Download My Work" only

The event-driven design above (solve, leave-unsolved, `beforeunload`) got
replaced the same session, before any Apps Script side was built against
it — decided that "Download My Work" becomes the actual submission step
(downloaded file handed in via Classroom, or similar), so it's the one
deliberate moment data should leave the browser, not something that
happens silently in the background on every navigation.

`exportExerciseIfNeeded()` and its per-exercise `exported-<unit>-<exercise>`
dedup bookkeeping are gone. In their place: `exportAllHistoryToSheet()`,
called once from inside `downloadExport()` right after the local Markdown
file downloads. It walks every unit → every exercise → `loadHistory()`
(same shape `buildExportMarkdown()` already uses) and sends everything
with at least one attempt — solved or not — as a single payload. No
dedup needed: since it only fires on an explicit, infrequent click, each
call just sends a fresh complete snapshot; a click with nothing new to
add is cheap enough not to bother skipping. `EXPORT_ENDPOINT_URL` is
still `null`, same deliberate-no-op-until-deployed pattern as before.
`switchToUnitIndex`, the sidebar click handler, and the `beforeunload`
listener are all back to their pre-export form — net effect is 40 fewer
lines than the event-driven version, not more, since one trigger point
replaced four.

Known tradeoff, confirmed acceptable: data now only reaches the Sheet if
a student clicks Download — an optional convenience today. This only
works as intended once that click becomes a required part of the
workflow (e.g. downloaded file submitted via Classroom), not something
students can just skip; if it stays optional, coverage will have gaps.

Re-verified with a fresh isolated simulation: no-op while
`EXPORT_ENDPOINT_URL` is unset; correctly omits units/exercises with zero
attempts from the payload; correctly includes full per-attempt history
for everything else; repeated clicks each send a complete fresh snapshot
(no state carried between calls, by design).

### Security model: the endpoint URL can't be a secret, so it has to be write-only

Discussed before writing any Apps Script: nothing embedded in client-side
JS on a static site can function as a real secret (an API key included
in `app.js` ships to every visitor's browser, visible via dev tools,
exactly like the endpoint URL itself). So access control can't come from
hiding the URL or gating it with a token — it has to come from what the
Apps Script *does* when hit. Decided: the endpoint stays strictly
write-only (`doPost()` only, no matching read-back), so the worst case of
the URL being effectively public is spam rows, not a data leak. Payload
validation (reject malformed shape) is the other half of that — not real
security against a motivated actor, but keeps garbage out of the sheet.
Google Workspace domain-restriction (limiting the Web App to signed-in
BPS accounts instead of fully public) was named as a possible stronger
option, but whether it works cleanly with a cross-origin `fetch()`/
`sendBeacon()` call rather than a direct browser visit is unverified —
left as a later exploration, not assumed to work.

### Apps Script ingest endpoint built (`apps-script/`)

`apps-script/Code.gs` — `doPost()` receives one batch per "Download My
Work" click, validates it (`student` non-empty string, `track` is
`"python"`/`"webdev"`, `units` is an array — malformed requests get a
clean `{status: "error", ...}` response, never an unhandled exception),
then flattens the nested `{units: [{unit, exercises: [{exercise,
history}]}]}` payload into one row per *attempt* (not per exercise) in an
"Attempts" sheet tab, auto-created with a header row on first use.
Columns: received-at, student, track, unit, exercise, attempt timestamp,
passed, test results (JSON), and submission (JSON — `{code}` for Python,
`{html, css, js}` for Web Dev) — keeping full code per attempt, not just
pass/fail, so a suspicious growth score stays auditable by hand, same
principle already established for `history` itself. Uses
`LockService.getScriptLock()` around the whole write so concurrent
submissions from different students can't interleave and clobber rows.
`doGet()` returns a plain confirmation message — a way to sanity-check a
deployment is live without needing to test the real POST flow first.

Caught and fixed a real bug in the client code from a prior session
before it could bite silently once deployed: `exportAllHistoryToSheet()`
was building its `sendBeacon()` payload as a `Blob` with type
`application/json`. A cross-origin request with that content type
triggers CORS preflight behavior Apps Script Web Apps don't handle
cleanly (a well-documented gotcha for this exact static-site-to-Apps-
Script pattern) — changed to `text/plain`, which `doPost()` still parses
as JSON regardless of the declared type, in both `app.js` files.

Verified via isolated simulation (`parsePayload`/`buildRows` extracted
and run against the actual payload shape `exportAllHistoryToSheet()`
sends, for both tracks, plus four malformed-input cases): correctly
flattens real payloads into per-attempt rows with the right values in
the right columns, and cleanly rejects bad JSON, an unknown track, a
missing body, and a blank student name. What this *can't* verify without
a real deployed URL and a real browser: whether the actual cross-origin
POST is delivered successfully end-to-end once live — that needs a real
smoke test (click "Download My Work" against the live deployed URL,
confirm a row appears) once the Apps Script is actually deployed.

### Deployed and smoke-tested

The Apps Script got deployed for real (under the BPS Google account, not
personal Gmail — identifiable student data belongs on district-managed
infrastructure, and this data includes student names). `EXPORT_ENDPOINT_URL`
is now set to the real deployed URL in both `app.js` files.

Smoke-tested via `curl` before trusting it with real student traffic:
`doGet()` sanity check matched exactly; a `doPost()` test with a fake
student name wrote rows correctly (`{"status":"ok","rowsWritten":2}`).
Worth recording two things learned from the process itself, not just the
result:

- Apps Script Web Apps respond to a POST with a `302` redirect to a
  `script.googleusercontent.com/macros/echo?...` URL that serves the
  actual response body — but `doPost()` (parsing + the sheet write)
  already executes on the original request, *before* that redirect is
  even involved. `curl -L` mishandled following that specific redirect
  (looked like a failure), but the underlying write had already
  succeeded regardless — confirmed by ending up with 4 test rows instead
  of 2, since a "failed" first attempt had silently written its rows
  anyway. This is a good reliability signal for the real client, not just
  a curl quirk to shrug off: `sendBeacon()` never reads a response either
  (fire-and-forget), so this confirms the write doesn't depend on the
  client successfully handling that response step.
- The response carried `access-control-allow-origin: *`, meaning Apps
  Script's own infrastructure sets a permissive CORS header — good
  evidence against the cross-origin concern raised earlier, though it
  doesn't fully replace an actual browser test (curl isn't subject to a
  browser's CORS enforcement the way `fetch()`/`sendBeacon()` are).

The four test rows (student `__SMOKE_TEST_delete_me__`) need deleting
from the "Attempts" sheet before real student data starts arriving.

### Error visibility: the Executions view doesn't reliably show logs for real requests

Follow-up questions surfaced a real, non-obvious Apps Script limitation.
`parsePayload()`'s rejection branches originally logged via
`console.error()`. Testing that from the actual deployed Web App (a
malformed-body `curl` POST) produced the correct clean error *response*,
but the Executions view showed no logged content for that row — only a
manually-run-in-editor test (`doPost()` called with no arguments, via the
editor's Run button) showed its log. Suspected `console.error()`
specifically; switched to `Logger.log()` (the older mechanism) and
redeployed — same result: still invisible for real Web App-triggered
runs, still visible for manual runs. Two different logging APIs failing
identically for the same trigger-type distinction ruled out "wrong API"
as the explanation — it's a real gap in that view for Web App-triggered
executions specifically, not a logging-API choice.

Fix: stopped depending on the Executions view for this at all. Added
`logError(message, context)` in `Code.gs`, writing directly to a new
"ErrorLog" sheet tab (auto-created on first use, same pattern as
"Attempts") via `SpreadsheetApp` — already proven reliable, since real
student data was already landing correctly in "Attempts" the whole time.
Every `parsePayload()` rejection and the outer `doPost()` catch now call
this instead of any console/Logger call. Verified via curl against the
redeployed version: the malformed-JSON test's response was still the
correct clean error, and this time a real row appeared in "ErrorLog"
(`parsePayload rejected: body is not valid JSON`) — confirmed directly,
not just inferred from the response.

Separately, an unexplained anomaly surfaced during this process: the
Executions list showed 3 `doGet`s against one deployed version when
neither Claude nor the user had made more than one (Claude: 1, user: 0).
Not resolved — no confirmed cause. Flagged as low-risk regardless of
cause, since `doGet()` has zero side effects (no sheet access, static
response only), but worth keeping an eye on if it recurs, especially
once real student traffic starts and unexplained-request-counting
becomes harder to reason about by inspection.

### Fully verified end-to-end

With the ErrorLog fix confirmed live, both halves of the pipeline are now
directly verified against the real deployed endpoint (not just curl
responses): a successful submission lands in "Attempts" with the right
data, and a malformed one lands in "ErrorLog" with a readable message —
both checked by the user directly in the Sheet, not just inferred from
JSON response bodies.

Still open: the one verification this session's tooling genuinely can't
do — an actual browser, on the live deployed site, clicking "Download My
Work" and confirming a real row appears via the real client code path
(`sendBeacon()`/`fetch()`), not curl standing in for it. High confidence
after everything above, but not yet a completed check. Also still open,
deliberately deferred: the calc script that reads the "Attempts" sheet to
compute `relative_performance`/`week_score`/the trend (now has real data
to read), and the display/leaderboard layer.

## Session 3 — real browser test confirmed, calc script built, a real data-corruption bug found and fixed

### The one remaining verification passed

The user clicked "Download My Work" on the live deployed site (a real
browser, real `sendBeacon()`/`fetch()`, not curl standing in) and
confirmed a row landed correctly — closing the one gap Session 2 flagged
as unverifiable from this session's tooling alone.

### `apps-script/GrowthMetrics.gs` built

New file in the same Apps Script project as `Code.gs` (not a Web App —
runs manually from the editor, or a future time-based trigger; never
reachable through the public URL, since it reads student data). Reads
"Attempts," groups by student + `track|unit|exercise`, and computes:

- **Per-exercise stats**: `attemptsTaken` (position of first `{passed:
  true}`, or total attempts if never solved), `firstPassTimestamp`,
  whether attempt #1 passed, and same-mistake detection between every
  pair of *consecutive* failed attempts (identical failing-test-index set
  + identical `hadError` pattern, exactly the rule decided when
  `testResults` was designed).
- **Grit** = average `attemptsTaken` across solved exercises.
  **First-attempt success rate** = fraction of attempted exercises where
  try #1 passed. **Error-reading rate** = fraction of consecutive-failure
  pairs that repeated the identical mistake (lower is better; `null`,
  not `0`, when a student has no failure pairs to measure at all).
- **Growth trend**: `relative_performance = expected_attempts /
  attemptsTaken` per solved exercise (skipped, not zeroed, when no
  difficulty/expected_attempts data exists for that exercise) →
  `week_score(w)` bucketed by Monday-of-week (UTC, a plain date-math
  function, not `Utilities.formatDate`, to stay timezone-independent and
  sidestep ISO week-numbering's year-boundary edge cases) →
  `growth_score` = avg(most recent N weeks) / avg(earliest N weeks), N
  shrinking automatically for students with under `2×N` weeks of data,
  `null` outright below 2 weeks (a trend needs at least two points).
- `expected_attempts` comes from fetching the live site's unit JSON files
  + `growth-metric-config.json` via `UrlFetchApp` — one source of truth,
  no duplicated difficulty data inside the calc script itself.

Writes to two new tabs: **GrowthScores** (one row per student — the three
metrics plus growth score) and **WeekScores** (one row per student per
week — the audit trail behind the growth number, same "never reduce to a
summary-only record" principle as keeping full code per attempt).

All pure-logic functions (stats, same-mistake detection, week bucketing,
the growth-score ratio, every edge case — unsolved exercises, zero
activity, single-week data, zero failure-pairs) verified via isolated
simulation with hand-checked synthetic data before ever touching Apps
Script — same methodology used all session. Every value matched by hand.

### Two real bugs found only by running it against real data

**Bug 1 — wasteful, noisy unit-file fetching.** The first version guessed
filename number-prefixes 1–99 until one worked (mirroring
`difficulty-review.js`'s existing pattern, harmless there since it's
client-side and failures aren't logged). In Apps Script, every guess-miss
is a real HTTP request *and* got logged as an "Error" by the new
diagnostics — for a unit late in a 19-unit manifest, that's ~18 wasted
requests and 18 false-alarm log lines before succeeding. Fixed by using
the manifest's own array index directly (`String(index + 1).padStart(2,
"0")`), the same deterministic convention `loadUnits()` already uses in
both apps' `app.js` — no guessing needed at all. Verified against the
live site: all 20 real unit files resolve on the first request, zero
failures, all 204 exercises confirmed carrying a `difficulty` field.

**Bug 2 — Google Sheets silently corrupts numeric-looking exercise IDs.**
Even after fixing Bug 1, `WeekScores` stayed empty. Diagnostic logging
(`console.log`/`console.error` — reliable here since `runGrowthMetrics`
only ever runs manually, unlike `Code.gs`'s Web App-triggered functions)
showed the actual cause: solved-exercise keys read back from "Attempts"
were `"python|print-input-fstrings|1"`, not `|01"` — Google Sheets'
`setValues()` had silently reinterpreted the string `"01"` as the number
`1` at write time, in `Code.gs`. This isn't a display quirk — the
leading zero is permanently gone from the stored data itself. Only
exercises `01`–`09` are affected (`10`+ look identical as a number or a
zero-padded string, so the bug is invisible for most of the range).

First fix attempt: `range.setNumberFormat("@")` (plain-text format) on
just the newly-written range, immediately before `setValues()` — the
textbook fix for this Sheets/Apps Script gotcha. Verified with a
single-row `curl` POST sending exercise id `"01"` explicitly, confirmed
directly in the sheet: cell showed `01`, correctly. **This verification
was misleading** — the user then re-exported their real multi-exercise
data through the actual fixed deployment, and it corrupted again anyway
(`1`, `2`, `3`...). A single isolated row surviving didn't prove a real
multi-row batch would; it should have been tested with a multi-exercise
payload from the start, matching what `exportAllHistoryToSheet()` (and
the earlier multi-row smoke tests in Session 2) actually send.

Real fix: format the *whole column* (`sheet.getRange(1, 1,
sheet.getMaxRows(), HEADER.length).setNumberFormat("@")`), every time
`appendRows()` runs (not just once at sheet creation — the sheet already
existed with unformatted columns, so a creation-time-only fix wouldn't
retroactively help), plus an explicit `SpreadsheetApp.flush()` before
`setValues()` to force the format change to actually commit first rather
than risk being reordered/batched with the write. This time verified with
a 7-exercise single-batch `curl` payload (`exercises 01`–`07` in one
POST, deliberately mirroring the shape that broke) — confirmed directly
in the sheet by the user: all seven read `01` through `07` correctly.

**Consequence**: every row already in "Attempts" (written before this
fix) has this corruption baked in permanently — the fix only prevents it
going forward. Since the underlying `localStorage` data was never
corrupted (this only happens at the sheet-write step), the clean fix is
deleting the existing Attempts rows and re-clicking "Download My Work"
once the fix is deployed, not a data-repair script. Not yet done as of
this writing — the next step once this session's changes are committed.

**Lesson worth keeping**: a passing single-instance test doesn't
generalize to "the batch case works" for anything involving spreadsheet
formatting/write-ordering — verify with a payload shaped like real usage
(multiple rows, multiple columns) from the start, not the smallest
possible reproduction.

Worth naming as a general lesson, not just this one bug: this is the
second time in this project a full-fidelity round-trip test (not just
"did the request succeed") caught something a response-code check alone
would have missed entirely — the `doPost()` response was `{"status":
"ok"}` the whole time, even while every write after it was silently
losing data.

Still open: re-verify `WeekScores`/`GrowthScores` populate correctly
against clean, regenerated data; decide on and build the display/
leaderboard layer.

## Session 4 — a self-inflicted regression, its real fix, and a version-tracking convention

### Bug 3: the leading-zero fix broke the "Passed" boolean column

After the Bug 2 fix (whole-column plain-text format) was live, a growth
score of exactly `1.0` looked plausible at first (all-1.5 relative
performance, consistent with mostly first-try test data) — but a targeted
synthetic test (an exercise solved in 3 attempts, expecting
`relative_performance = 3/3 = 1.0`) came back as `3` instead, proving
`attemptsTaken` was always computing as `1` regardless of real attempt
count. Diagnostic logging of the raw attempts feeding
`computeExerciseStats()` showed the actual cause directly: every attempt
read back with `passed: true`, even ones written as `passed: false`.

Root cause: Bug 2's fix formatted the *entire* row range as plain text,
including the boolean "Passed" column. A JS boolean `false` written into
a text-formatted cell becomes the string `"FALSE"` — and `!!"FALSE"` is
`true` in JavaScript, since any non-empty string is truthy. Every failed
attempt was silently being read back as a pass. This fully explains the
suspiciously-uniform earlier results: with every `attemptsTaken` forced
to `1`, `relative_performance` always equals raw `expected_attempts`
exactly, matching what looked at first like a benign "mostly first-try"
coincidence.

First fix attempt: narrow the plain-text formatting to only the Exercise
column. Verified correctly in the sheet (a combined test — leading-zero
exercise ID *and* real fail/fail/pass attempts in one batch — displayed
correctly). But `runGrowthMetrics` still read every attempt as passed.
Second, deeper root cause: Sheets' cell format is *persistent metadata*
that doesn't get undone just because a later script version stops
setting it — column 7 was still stuck in the plain-text state Bug 2's
fix had left it in. Narrowing the format call going forward only stopped
adding more damage; it didn't undo the existing damage.

Real fix: `appendRows()` now explicitly resets the *whole* row range back
to `"General"` (Sheets' default format) on every call, *then* forces
plain text on only the Exercise column — guaranteeing a known-clean state
regardless of what any earlier deployment left behind, rather than
relying on "don't make it worse from here." Verified two levels deep this
time: the sheet display showed `false`/`false`/`true` correctly (as
Bug 2's first, insufficient fix had also shown), *and*, more importantly,
`runGrowthMetrics`'s own diagnostic log confirmed `attemptsTaken=3` —
checking what the calculation actually reads, not just what the sheet
displays, since those had already diverged once.

**Consequence, again**: format resets don't retroactively fix
already-corrupted *values* — anything written while the whole-column bug
was live (which includes the "clean" re-export done after only the Bug 2
fix, since Bug 3 was still present then) needs deleting and
re-exporting once more.

**Lesson worth keeping, sharper this time**: verifying a fix by checking
what a sheet *displays* isn't the same as verifying what gets *read back*
by code — they diverged twice in this one investigation (Bug 2's
"01" looked right displayed as text; Bug 3's "false" looked right
displayed as the word "FALSE", while both were silently wrong for
anything that actually parsed the value programmatically).

### Version tracking added, per explicit request

Pasting updated `.gs` files into the Apps Script editor was error-prone —
the editor leaves a file in select-all mode after a paste, making it hard
to visually confirm the right version landed. Added `CODE_VERSION` /
`GROWTH_METRICS_VERSION` constants to both files, bumped on every handoff.
`Code.gs`'s shows up directly in the `doGet()` response (checkable by
visiting the URL, by either the user or Claude via `curl`); `GrowthMetrics.gs`
has no public endpoint, so its version gets logged as the first line of
every `runGrowthMetrics()` run instead.

Verified live: `Code.gs v1` and the redeployed URL confirmed via `curl`
(both the `doGet()` version string and the combined leading-zero +
fail/fail/pass test), and confirmed the live GitHub Pages `app.js` files
picked up the new `EXPORT_ENDPOINT_URL` after a short propagation delay.

### Bug 4: empty `testResults` on pre-existing history trivially "matched" as same-mistake

Spotted by the user reviewing real exported data before running the
calculation for real: rows from before `testResults` was added to
`appendHistory()` (see Session 2/3) correctly show `[]` — expected, not a
bug, per the rollout note from when that field was designed. But
`computeExerciseStats()`'s failure-pair loop didn't check for this: two
consecutive failed attempts with **both** sides empty compare as
trivially identical (`sameArray([], [])` is `true`), so every
pre-`testResults` consecutive failure was silently counting as a
confirmed "repeated the same mistake" — real-looking signal from zero
actual information.

Fixed: a failure pair only counts toward `totalFailurePairs`/
`sameMistakePairs` at all when *both* attempts have non-empty
`testResults`; pairs missing that data are skipped entirely rather than
defaulting to "same" or "different." Verified via four cases (both
empty, one empty, both real-and-same, both real-and-different) — only
the two real-data cases count, and only the genuinely-same one increments
`sameMistakePairs`. `GROWTH_METRICS_VERSION` bumped to `2`.

Still open: the actual final delete-and-re-export-and-reverify cycle
(not yet done as of this writing, now additionally waiting on this Bug 4
fix being pasted in first); the calc script's outputs still haven't been
checked against a fully clean dataset end to end.

### Fully verified against real, clean data — pipeline confirmed correct end to end

The user deleted all "Attempts" data, re-exported via "Download My Work"
through the fully-fixed `Code.gs`, and ran `runGrowthMetrics` (v2) against
it. Real result for 18 attempted/18 solved exercises: Grit `1.111`,
first-attempt success `0.889`, error-reading blank, growth score `1.2`.

Checked for internal consistency, not just plausibility: `1.111 = 20/18`
and `0.889 = 16/18` are exactly what falls out of the same underlying
pattern — 16 exercises solved in 1 try, 2 solved in 2 tries
(`16×1 + 2×2 = 20` total attempts across 18 solved; `16/18` of them
first-try) — two independently-computed metrics landing on the same
implied pattern is a real consistency check, not just "the number looks
reasonable." Error-reading correctly came back blank (`null`, not `0`)
given only 2 exercises ever needed a second try, essentially no chance of
a genuine *consecutive*-failure pair to measure a repeat-mistake rate
from. `WeekScores`' 3 weeks (`1.25`, `1.5`, `1.5`) correctly produced
`growth_score = 1.5/1.25 = 1.2` by hand-check against the actual formula.

This closes out the growth-metric pipeline build: logging (`testResults`
on every attempt) → batched export (`Download My Work`) → Apps Script
ingest (`Code.gs`, write-only, validated, plain-text-safe) → calculation
(`GrowthMetrics.gs`, three metrics + the difficulty-normalized trend) →
real, internally-consistent output. Four real bugs were found and fixed
along the way (guess-based unit fetching, two separate Sheets
format-corruption issues, and the empty-testResults false-match), each
caught only by verifying against real or realistically-shaped data rather
than the smallest reproduction that would pass.

Still open, deliberately deferred from the start of this whole
investigation: the storage/display layer — how this reaches the teacher
or students to actually look at (a Sheet view, a dashboard, something
else), and the leaderboard/visibility question (private-only vs.
cross-student) named back when the growth metric was first proposed.
