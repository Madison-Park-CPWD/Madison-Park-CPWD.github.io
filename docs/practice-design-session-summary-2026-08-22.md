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
