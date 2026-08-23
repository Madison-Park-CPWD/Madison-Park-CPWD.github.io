# Growth-metric ingest (Apps Script)

Receives one POST per "Download My Work" click from either practice app
(`problem-sets/python`, `problem-sets/webdev`) and appends flattened
per-attempt rows to a Google Sheet. See
`docs/practice-design-session-summary-*.md` for the design context — this
file only covers deploying `Code.gs`.

This code doesn't run from GitHub Pages — it has to be pasted into an
actual Apps Script project and deployed as a Web App. These are manual
steps only you can do (no API access to your Google account from here).

## Deploy it

1. Create a new Google Sheet (or open the one you want attempt data to
   land in) — this becomes the destination spreadsheet.
2. **Extensions → Apps Script.** A new script project opens, bound to
   that sheet.
3. Delete the default `myFunction() {}` boilerplate. Paste in the full
   contents of `Code.gs` from this folder.
4. Save (the disk icon, or Cmd/Ctrl+S).
5. **Deploy → New deployment.** Click the gear icon next to "Select
   type," choose **Web app**.
6. Settings:
   - **Execute as:** Me
   - **Who has access:** Anyone
   
   ("Anyone" is required — student browsers submit anonymously, with no
   Google login. See the design doc for why this is an acceptable
   tradeoff: the endpoint only ever writes, never reads sheet contents
   back out, so the worst case of the URL being public is spam rows, not
   a data leak.)
7. Click **Deploy**. The first time, Google will ask you to authorize the
   script's access to the spreadsheet — review and accept.
8. Copy the **Web app URL** (ends in `/exec`). Send that to Claude — it
   gets dropped into `EXPORT_ENDPOINT_URL` in both
   `problem-sets/python/app.js` and `problem-sets/webdev/app.js`.

## Sanity-check the deployment

Paste the Web App URL into a browser address bar and visit it directly
(a plain GET, no student data involved). You should see:

> This endpoint only accepts POST requests from the practice apps.

If you see that, the deployment itself is live and correctly wired to
the script. If you see a Google error page instead, something's wrong
with the deployment step above — recheck the "Execute as" / "Who has
access" settings.

That check doesn't confirm the actual POST flow works yet — the real
test is clicking "Download My Work" on the live site once the URL is
wired in and confirming a row shows up on the "Attempts" tab.

## If you edit `Code.gs` later

Saving the script editor is not enough to update a URL that's already
deployed — deployed Web Apps are pinned to a specific version. After
editing, go to **Deploy → Manage deployments**, click the pencil icon on
the existing deployment, and choose **New version** before saving. The
URL stays the same either way.

## What lands in the sheet

A tab named **Attempts** gets created automatically on first use, with
one row per attempt (not per exercise) — one "Download My Work" click can
produce many rows if a student has attempted several exercises:

| Column | Meaning |
|---|---|
| Received At | when the Apps Script processed this batch (not when the student attempted it) |
| Student | free-text name from the student's own browser — not a verified identity |
| Track | `python` or `webdev` |
| Unit | unit id |
| Exercise | exercise id |
| Attempt Timestamp | when that specific attempt happened, from the student's browser |
| Passed | whether that specific attempt passed |
| Test Results | JSON array, one entry per test (`{passed, hadError}`) — the raw data the error-reading metric needs |
| Submission | JSON — `{code}` for Python, `{html, css, js}` for Web Dev. Full code per attempt, not just pass/fail, so a suspicious growth score stays auditable by hand |

Nothing here computes `relative_performance`/`week_score`/growth yet —
this is only the raw ingest. The calc script that reads this sheet is a
separate, not-yet-written piece.

A second tab, **ErrorLog**, also gets created automatically the first
time a request gets rejected or fails — one row per problem: `Timestamp`,
`Message` (what went wrong), `Context` (the relevant raw value or error
detail). This exists instead of relying on Apps Script's own Executions
view: that view doesn't reliably show logged output (`console.error()` or
`Logger.log()`, tried both) for real Web App-triggered requests, only for
functions run manually from the editor — writing to a sheet tab sidesteps
that gap entirely, using the same `SpreadsheetApp` mechanism already
proven reliable for "Attempts." If a student's submission silently didn't
show up in "Attempts," check ErrorLog first.
