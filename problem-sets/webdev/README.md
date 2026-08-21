# Web Dev Practice (track)

Real HTML, CSS, and JavaScript, checked live in the browser — no server,
no account, no login for students.

See the repo root [`README.md`](../../README.md) for overall architecture
and GitHub Pages hosting steps — this file covers just what's specific to
this track. It's structurally the same as the
[Python track's README](../python/README.md) (same manifest + per-unit-JSON
pattern, same localStorage-backed drafts/history/reflections) — the real
difference is *how exercises get checked*, covered below.

## Files
```
webdev/
├── index.html          ← page structure: three-pane editor + live preview + console
├── style.css             ← visual design (same dark theme as the rest of the site)
├── app.js                  ← loads unit data, renders the live preview, runs DOM/CSS checks
└── units/
    ├── manifest.json          ← ordered list of unit ids — controls lesson order
    ├── 01-html-basics.json
    └── ...one numbered file per unit, as many as you like
```

Same manifest + numbered-filename convention as the Python track — see
that track's README for the full "Reordering lessons" / "Linking directly
to a unit" mechanics, which apply here unchanged (`id` never changes on
reorder, only the filename's number prefix does; `#<unit-id>` deep-links
work the same way).

## How exercises are checked (the part that's actually different)

Python's practice app runs student code for real (via Pyodide) and diffs
real stdout against an expected string — one clean signal to compare.
HTML/CSS/JS doesn't have an equivalent single signal: "correct" means some
property of the *rendered result* holds, not a line of text you can diff.

So instead: the student's HTML, CSS, and JS (one per editor pane) get
combined into a single document and rendered into a sandboxed `<iframe>`
via `srcdoc`. Each test then inspects that *real, browser-rendered* result
using ordinary DOM APIs — `querySelector`, `getComputedStyle`, `textContent`,
`getAttribute`. This means CSS cascade, specificity, layout — all of it —
gets resolved correctly for free, because an actual browser is doing it,
not a simplified model of it.

**Two iframes, two jobs:**
- `#preview-frame` — visible, updates live as the student types (debounced).
  This is what the student sees and can click around in.
- `#test-frame` — hidden, reloaded from scratch for *every single test*
  when "Run Tests" is clicked. Never shared with the visible preview, so a
  student clicking around in their own preview can never affect a test
  result, and one test's `actions` (see below) can never leak into the next.

**Sandbox**: `sandbox="allow-scripts allow-same-origin"` on both iframes —
`allow-scripts` so student JS actually runs, `allow-same-origin` so this
page can read `contentDocument`/`getComputedStyle` afterward. This is
same-origin `srcdoc` content on a static site with no backend and no other
students' data reachable from it — there's nothing of value beyond the
student's own tab for a script to reach.

## Adding a new unit

1. Create `units/<NN>-<your-unit-id>.json` (see the Python README's
   "Reordering lessons" section for what `<NN>` means). Shape:
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
         "description": ["<p>One line of HTML per array entry.</p>"],
         "starter": {
           "html": ["<!-- starter HTML -->"],
           "css": ["/* starter CSS */"],
           "js": ["// starter JS"]
         },
         "tests": [
           { "description": "What this checks", "selector": "nav", "check": "count", "expected": 1 }
         ]
       }
     ]
   }
   ```
2. Add `"your-unit-id"` to `units/manifest.json` wherever it should appear
   in lesson order.

**`starter` is an object of three line-arrays**, one per editor pane —
`description`/`starter` arrays still work exactly like Python's: one line
per array entry, joined with `\n` automatically. A pane an exercise
doesn't need (e.g. a pure-CSS exercise needs no JS) can just be `[]`,
which renders an empty editor for that pane.

### `tests[]` — check types

Every test needs a `description` (shown directly as that row's label in
the console — there's no separate "input"/"expected" pair to derive it
from the way Python's tests have) and a `check` type:

- `exists` — `selector` matches at least one element.
  ```json
  { "description": "The button exists", "selector": "#count-btn", "check": "exists" }
  ```
- `count` — `selector` matches exactly `expected` elements.
  ```json
  { "description": "Exactly 3 links", "selector": "nav a", "check": "count", "expected": 3 }
  ```
- `text` — the matched element's trimmed `textContent` equals `expected`.
  ```json
  { "description": "Heading says Welcome", "selector": "h1", "check": "text", "expected": "Welcome" }
  ```
- `style` — `getComputedStyle(element)[property]` equals `expected`.
  ```json
  { "description": "Uses flexbox", "selector": ".card", "check": "style", "property": "display", "expected": "flex" }
  ```
- `attribute` — `element.getAttribute(attribute)` equals `expected`.
  ```json
  { "description": "Links to example.com", "selector": "a", "check": "attribute", "attribute": "href", "expected": "https://example.com" }
  ```

**`actions` (optional)** — simulate interaction *before* the check runs,
for testing JS event handlers:
```json
{
  "description": "Clicking the button changes the heading",
  "actions": [{ "type": "click", "selector": "#btn" }],
  "selector": "h1", "check": "text", "expected": "Clicked!"
}
```
`actions` run in order, each against the same fresh render this test's
`check` will also run against. Only `"click"` exists today (`el.click()`);
extending to e.g. `"type"` for filling in an input is a matter of adding a
new case to `runAction()` in `app.js`, not changing this shape.

Field notes carried over unchanged from Python's README: `description` is
still raw HTML per line; `reflection_prompt` (top-level, optional) still
shows a one-time reflection modal the first time every exercise in a unit
is solved, stored the same way; `source_unit` is still documentation-only.

## Nudging students on a failing run

Same principle as the Python track — a short message shown above the raw
test results on a failing run, worded differently depending on what
actually happened. Python branches on whether the program crashed vs. ran
but gave the wrong output; there's no real equivalent to "crashed" for
markup (browsers parse malformed HTML forgivingly rather than throwing), so
this track branches on whether a check's selector **matched nothing at
all** (likely a missing element or typo'd selector) vs. **matched, but the
checked property was wrong** (present but styled/labeled/behaving
incorrectly).

## Student names and the "Download My Work" button

Identical mechanism to the Python track, including the browser-storage
name (`student-name`) being shared across both tracks — set your name
once, it's already correct on either page. The exported Markdown groups
by calendar day the same way; each attempt shows one fenced code block
per non-empty pane (```` ```html ````/```` ```css ````/```` ```js ````)
instead of Python's single ```` ```python ```` block.

## Limitations to know about

- **Work only exists in the student's own browser until they download it**
  — same `localStorage`-only caveat as the Python track.
- **No protection against infinite loops in the JS pane.** A stray
  `while(true){}` can freeze that iframe's execution — the same category
  of risk the Python track's README already documents and accepts for a
  stray `while True:` freezing Pyodide's tab. Not a new problem this track
  introduces; worth the same heads-up to students.
- **Selectors and computed-style values must match exactly** what the
  browser reports — e.g. `getComputedStyle` normalizes colors to `rgb(...)`
  form even if a student wrote a hex code, and shorthand properties don't
  automatically resolve to their longhand equivalents. Worth checking a
  new test's expected value against what the browser actually reports
  before assuming a check is wrong.
