# Coding Puzzles Project — Session Summary

Context: this extends the existing Pyodide-based Python practice site
(`manifest.json` + one JSON file per unit, `app.js`/`index.html`/`style.css`,
"Fix the Bug" exercises already present in several units). That site's
current interaction model — write code, run tests, retry until green — was
the starting point for everything below.

## Conventions

- **Session summary filenames carry a date suffix**, `YYYY-MM-DD`, reflecting
  the date of the file's most recent update — e.g.
  `puzzle-design-session-summary-2026-08-10.md`. Agreed going forward for
  this and any future summary docs from this project, so multiple versions
  can be told apart at a glance without opening each one.

## Audience

Students are **14–18 years old, in Boston**. Roughly **1 in 3 is a
non-native English speaker**. This shapes voice/copy decisions throughout
the project (see "Tone and scenario framing" under Session 2 below) and
should be treated as a standing constraint on any new puzzle content, not
just something considered once.

## Where this started

Prompted by the "staircase" HTML/CSS exercise (table cells with only
top/right borders to fake a staircase), we brainstormed puzzle types beyond
straight "write code that passes tests," across HTML, CSS, Python, and
computational thinking generally.

## Round 1 — initial puzzle ideas (by language)

- **HTML**: staircase/pyramid/checkerboard/maze via table borders, nested-list
  "Russian dolls" + CSS-counter outlines, semantic-detective (div-soup →
  semantic tags, same rendering), rowspan/colspan reverse-engineering,
  broken-form scavenger hunt.
- **CSS**: specificity duels (predict the winner before running), box-model
  overflow puzzles, flexbox "match this layout with minimal properties,"
  CSS-only interactivity (checkbox-hack accordion), pure-CSS shapes
  (triangles, hearts), specificity golf.
- **Python**: off-by-one gallery, mutation surprises (aliasing, mutable
  default args), truthy/falsy trivia, string-vs-list twin operations,
  recursion trace puzzles, "what does this print" chains.
- **Computational thinking**: human sorting algorithms (index cards, bubble
  vs. selection), rubber-duck bug hunts, algorithm races (linear vs. binary
  search, count comparisons), state-machine board games, decomposition
  scavenger hunts.

## Round 2 — generalized/cross-cutting design patterns

Preferred over round 1. Eight reusable "lenses" for generating puzzles,
several explicitly cross-language:

1. **Invert the direction** — show output, have students reconstruct code
   (or match rules to rendered results), rather than always code → output.
2. **Cross-domain isomorphism** — same abstract idea in different syntax:
   cascading/inheritance (CSS specificity ≈ Python scope ≈ HTML nesting),
   state machines (`:hover`/`:checked` ≈ `if/elif` ≈ `<details>`),
   truthy/falsy (`if x:` ≈ `display:none` vs `visibility:hidden` ≈ HTML
   boolean attributes).
3. **Constraint injection** — take a solved problem, add/remove a rule:
   capped-not-minimized code golf, banned-keyword mode (reverse a string
   without slicing; center a div without flex/grid — direct generalization
   of the staircase idea), one-property CSS layout.
4. **Same problem, competing paradigms** — loop vs. comprehension, float vs.
   flex vs. grid, semantic nav vs. div-soup nav — argue tradeoffs, not just
   produce output.
5. **Explain the alien code** — given real working code (CSS reset,
   `zip()`/`enumerate()`, `data-*` attributes), infer intent from behavior.
6. **Self-similar/recursive structures across languages** — Python recursive
   fractal print, CSS nested pseudo-elements faking recursion (and *why*
   CSS can't really recurse), HTML nested `<details>` as a natural bridge to
   recursion.
7. **Broken-telephone translation** — port the same logic across
   languages/tools (Python elif chain → nested `<details>`) to separate
   "what" from "how."
8. **Meta: students write the puzzle** — students introduce one bug into
   working code for a partner to find; authoring a convincing bug requires
   deeper understanding than spotting one.

**Chosen focus from round 2: #2, cascading/inheritance and "insideness,"**
pushed further into a full hierarchy in round 3.

## Round 3 — "Insideness" hierarchy (chosen direction)

Motivated by real student difficulty: reading nested HTML structure, reading
Python indentation, list-of-lists / multi-dimensional data, nested loops,
and eventually objects/linked lists/classes — all framed as one idea
(containment) wearing different notation. Built as a six-level ladder, each
level priming the next:

- **Level 0 — insideness with no code**: nesting-doll sorting by hand,
  physical open/close-tag strip ordering (can't cross), address puzzles
  (`Room 4, Shelf 2, Box 1, Item 3` → nested brackets) as the direct
  ancestor of list-of-lists indexing.
- **Level 1 — HTML nesting made visible**: indent-the-unindented, depth
  coloring via `data-depth`, "what's my parent vs. all ancestors" quiz,
  break-the-nesting-on-purpose (misplaced closing tag).
- **Level 2 — Python indentation as invisible containment**: translate a
  Level-1 HTML tree into nested `if` blocks (same tree, new notation), ghost
  brackets (add `{ }` before re-indenting), "which block am I in" (list all
  true conditions for a marked line — Python analogue of the ancestor quiz),
  off-by-indent bugs (wrong indentation, no error, silently wrong behavior),
  scope-as-nesting tying back into the existing `globals.json` unit.
- **Level 3 — data nesting (lists of lists, dicts of dicts)**: grid
  coordinates as nested indexing (address puzzle made real), the
  row/column transpose trap, shallow-copy nesting bug (`.copy()` doesn't
  copy inner lists — foreshadows Level 5), flatten-and-rebuild, and using
  the project's own unit `.json` files as a "how deep is this nested?"
  artifact.
- **Level 4 — nested loops as insideness in time**: predict total print
  count before running, trace-the-indices table (fill every `(i, j)` pair in
  order — this exact mechanic became the prototype below), swap-the-loop-
  order (what changes vs. what stays the same), building a nested list via
  nested loops (bridges Level 3 and 4), triangle-vs-rectangle loops
  (`range(i)` inner bound) tied explicitly back to the original
  staircase/HTML-table shape.
- **Level 5 — pointer-based insideness (objects, classes, linked lists)**:
  box-and-arrow diagrams before class syntax, "is it really inside?" for
  circular references (Student ↔ Course — a graph, not a tree), shallow-copy
  bug revisited with objects (the Level-3 bug's real explanation), drawing
  the call stack as literal nested boxes for recursive traversal, and
  building the same hierarchical data first as nested lists/dicts then as a
  `Node`/`children` class to make the representation-choice tradeoff
  explicit.
- **Capstone**: one real hierarchy (file system, org chart, bracket)
  represented four ways — indented HTML, indented Python, nested
  list/dict, linked `Node` class — then compare which representation is
  easiest to extend/search/print-in-order.

## Presentation/harness discussion (the pivot before prototyping)

Key realization: the existing "code → run tests → retry until green" loop is
well-suited to *produce correct code from a spec*, but wrong for several of
the puzzle types above:

- Predict-then-check puzzles (nested loop trace, ancestor lists)
- Diagnose-only puzzles (spot the bug without necessarily fixing it)
- Arrange/match puzzles (nesting dolls, tag/selector matching)
- Compare/argue puzzles (loop vs. comprehension) — not machine-checkable
- Reflection/capstone puzzles — also not machine-checkable

Decision: **match interaction mode to what's being trained**, not one
harness for everything. Candidate modes discussed: commit-then-reveal,
click-to-diagnose, drag/arrange, the existing test-harness (kept for
genuine code-production puzzles), and open reflection (no auto-check).

### The "commit-then-reveal" problem

Concern raised: plain "type an answer, click reveal" invites students to
type anything and reveal immediately — no real cost to guessing. Persistence
and delayed gratification (not simple one-and-done reveal) were stated as
explicit goals.

Fixes discussed, in the order presented:

1. **Structured prediction, not free-text final answer** — e.g., a full
   iteration-by-iteration trace table instead of one "final output" box;
   correct completion requires actually tracing, not guessing.
2. **Confidence-gated reveal** — must select low/medium/high before reveal
   unlocks; discourages careless guessing without heavy machinery.
3. **Step-locked incremental reveal** — reveal in stages rather than all at
   once.
4. **Scarcity** — limited "peek" tokens or a short mandatory delay before
   reveal is clickable.
5. **Isomorphic retry to mastery** — after any reveal, immediately serve a
   structurally identical puzzle with different numbers; require N
   (e.g. 3) fully-correct attempts in a row before marking "mastered."
   Identified as the most important lever for persistence, since one reveal
   no longer ends the puzzle.
6. **Aggregate/social reveal** — show the distribution of other students'
   guesses before the correct answer (peer-instruction style).
7. **Mandatory one-line "why"** — ungraded free-text justification required
   before reveal unlocks, to convert guesses into articulated (even if
   wrong) reasoning.

**Recommended combination (agreed direction):** #1 (structured trace) + #5
(isomorphic retry to mastery) as the backbone, with #2 (confidence) as a
light anti-guessing gate. #4, #6, #7 noted as good later additions, not
needed for a first build.

> **Revisited in Session 3:** after actually building and testing #5
> (isomorphic retry to mastery), it was reversed for puzzles specifically —
> see "Session 3 — Repetition model: puzzles vs. practice app" below. #1 and
> #2 still stand.

## Prototype built this session

File: `trace-it-prototype.jsx` (React artifact) — implements the agreed
harness for the Level 4 "trace-the-indices" nested-loop puzzle.

Mechanics implemented:
- Puzzle: `for i in range(a): for j in range(b): print(i, j)` with random
  `a` (2–4) and `b` (2–3) each round.
- Trace table with columns `i`, `j`, `output`; rows unlock one at a time —
  a row must be fully filled before the next row appears (literal gradual
  reveal, no skipping ahead).
- Once all rows are filled, a confidence selector (low/medium/high) must be
  set before "Check my trace" activates.
- Checking reveals per-row correctness (✓/✗) and, for wrong rows, the
  expected values — all at once, only after full submission (no per-cell
  live feedback to game).
- "Trace another" generates a new isomorphic puzzle (different `a`/`b`,
  same structure) rather than allowing in-place correction.
- Mastery streak: 3 dots at the top track consecutive fully-correct traces;
  any wrong row resets the streak to zero; reaching 3 shows a "Mastered"
  banner but doesn't lock the student out of continued practice.
  **(Removed in Session 3 — see below.)**
- State is in-memory only (React `useState`) — nothing persists across a
  page reload in this prototype.

## Session 2 — Tone and scenario framing

### Bakery mockup

Built `trace-it-bakery-mockup.jsx`: a reskin of the Level 4 trace-it
prototype with a bakery narrative (trays/cupcakes standing in for the
loop's `i`/`j`, "health inspector arrives in 5 minutes" framing). Mechanics
were left completely unchanged from the original prototype — only the
scenario copy, variable naming, and streak iconography (🧁) changed.
Visual identity (dark navy + amber) was kept consistent with the existing
site rather than introducing a separate playful palette, since this puzzle
type is meant to eventually live inside that same app.

**Feedback:** lands "somewhere between funny and practical/real world" —
engaging, but not quite the right default tone for regular puzzle content.

### Decision: real-world framing by default

Going forward, **instructor-authored puzzles use grounded, real-world
scenarios by default** — no silly narrative wrapper. The one exception is
**Round 1 idea #8, "students write the puzzle"**: when a student is
inventing their own bug for a partner to find, humor is low-risk and can be
left to the student's own voice. The distinction is who's authoring the
joke — a student's own silly bug for a classmate carries none of the
comprehension risk that an instructor's joke does for a student parsing it
under test pressure.

### Language rule, driven by the audience

Given that 1 in 3 students isn't a native English speaker, the rule is
broader than "no puns":

- **No puns or double meanings** — any word doing double duty (technical +
  casual sense) adds ambiguity that's invisible to a native speaker but
  real friction for others.
- **No idioms** ("before the rush," "cutting corners," "in the weeds," etc.)
  — these require recognizing non-literal language before the puzzle itself
  can even be attempted.
- **No culturally-specific or hyper-local references** — even Boston-local
  flavor (MBTA lines, local sports teams, regional chains) is a coin flip:
  fun local color for some students, one more thing to decode for others.
  Default to generic, concrete scenarios over local ones unless local flavor
  is specifically wanted and the tradeoff is accepted.
- **Prefer concrete, literal, physically-groundable scenarios** — things
  with a real physical layout (a parking garage's levels and spots, a
  classroom's rows and seats, a warehouse's aisles and bins) map cleanly
  onto nested structure without needing translation of tone, the same way
  "tray and cupcake" did structurally, just without the joke layer on top.

### Candidate real-world reskins for the trace-it puzzle

Discussed, not yet built:

- **Parking garage** (level / spot) — concrete, no idiom needed, physically
  visualizable as levels stacking with numbered spots per level.
- **Classroom seating chart** (row / seat) — most directly relatable to a
  14–18 audience, no regional dependency, maps to `i`/`j` without the
  renaming feeling forced.
- **Warehouse shelving** (aisle / bin) — neutral, workplace-adjacent, and
  extends naturally into a later dictionaries exercise (aisle/bin → item),
  but slightly less immediately relatable to a teenager than seating or
  lockers.

Not yet decided which one becomes the actual replacement for the bakery
version.

## Open decisions from the prototype — resolved in Session 3

1. **Row re-editability** — **resolved: stays editable.** Once a row is
   unlocked it keeps its original behavior — a student can revise an
   earlier row even after later ones are filled. No change made.
2. **Partial-correct recovery** — **resolved: build "fix the wrong rows."**
   On check, correct rows lock in (green); wrong rows stay editable with a
   "should be" hint shown beneath them; a "Recheck" button re-validates only
   the still-wrong rows. See Session 3 for how this interacts with (3).
3. **Persistence** — **resolved: nothing about puzzle attempts persists.**
   The reasoning that got here is the core of Session 3, immediately below —
   short version: repetition/mastery tracking doesn't belong in puzzles at
   all, so there's nothing tied to persistence to persist anymore.

## Session 3 — Repetition model: puzzles vs. practice app

### What got built and tested

Continuing from the seating-chart mockup, the "fix the wrong rows" flow
from item 2 above was built, plus a companion mechanic for item 3: reaching
3 consecutive fully-correct-on-first-try traces set a persisted **"Qualified
in ⟨Skill⟩"** badge (via the artifact's key-value storage in this mockup —
would be `localStorage` in the real site, matching how the practice app
already persists solved exercises and reflections). The badge was
deliberately decoupled from the live streak, so that once earned it never
disappeared, even if the streak later reset from a subsequent mistake.

This was a direct application of the "Recommended combination" call from
the harness discussion above (#1 structured trace + #5 isomorphic retry to
mastery), reframed as a low-stakes incentive rather than an assessment —
consistent with the earlier decision to keep these puzzles ungraded given
how easy they'd be to fake with AI assistance if they counted for anything.

### Feedback after actually using it

Forcing three clean passes — even for a student who clearly already
understands the material — made the puzzle "feel less like a puzzle and
more like the practice app." The parts that felt right were the progressive
row-by-row feedback and the chance to fix what's wrong; forced repetition
to earn credit was a different thing entirely, and bolting it on made the
puzzle experience worse rather than better.

### Decision: puzzles are one-and-done; repetition lives in the practice app

**Streak and the qualification badge are removed entirely** — no live
streak counter, no persisted "qualified" state, no `localStorage`/storage
calls at all for this puzzle. Puzzles (this harness, and anything else
built on the same pattern going forward) now follow one shape:

> Rows unlock one at a time → confidence gate before the first reveal →
> check (correct rows lock in, wrong rows get a hint and stay editable) →
> recheck as many times as needed until it's fully correct → optionally
> start a new isomorphic instance if the student wants more practice,
> entirely by choice, not because anything requires it.

If a puzzle type genuinely benefits from reinforcement over time, that
reinforcement comes from **composition, not repetition**: build a later,
more complex puzzle that *requires* the earlier skill as one part of its
solution, rather than asking a student to repeat the same puzzle. For
example, nested loops (Level 4) don't get reinforced by replaying the
seating-chart trace — they get reinforced sometime down the line by a
harder puzzle (e.g. the ladder's own "building a nested list via nested
loops" idea, or the Level 5 capstone) where writing or tracing a nested
loop is one step among several, not the whole exercise. This keeps
retention practice meaningful — a skill gets exercised in a new, harder
context — instead of rote: the same puzzle, over and over, until a streak
is hit.

Repetition of an isolated, single skill still has a home — that's exactly
what the **existing Pyodide practice site** already does well, with its own
retry-until-green loop, full attempt history, and (as of the
reflection-prompt work) unit completion tracking. The clean split going
forward:

- **Puzzles** teach or diagnose one specific insight, once, with generous
  in-place help getting to a correct answer.
- **The practice app** is where repetition and fluency-building for a
  single isolated skill already live.
- **Later, more complex puzzles** are where earlier skills get reinforced
  over time — by requiring them again as a sub-component of something
  harder, not by repeating the original puzzle.

This reverses the "Recommended combination" call from the harness
discussion above. #1 (structured trace) stands as designed; #5 (isomorphic
retry to mastery) is retired **for puzzles specifically** — not deleted
from the toolbox altogether, since it may still be the right call inside
the practice app someday, just not here.

### Also fixed along the way: two puzzle-integrity leaks

Separate from the repetition question, two things in the seating-chart
build were quietly telling students the answer to "does a nested loop run
outer × inner times" before they'd ever traced anything themselves:

- A caption that computed and displayed the total ("2 × 3 = 6 desks
  total") before any tracing happened.
- Rendering one locked ("Finish the row above first") placeholder per
  remaining row — letting a student count placeholders to back into the
  total row count without tracing at all.

Both removed. The round's given values (`ROWS`, `SEATS_PER_ROW`) are still
shown, since those come straight from the code itself, but the *computed*
total is never shown up front, and only a single "next" placeholder ever
renders regardless of how many rows are actually still locked. Worth a
general check on future puzzle types: any UI chrome that reveals the
answer to the concept being tested — not just the specific trace values —
is a leak, even if it feels like a harmless convenience label.

## Session 4 — App architecture

### Site context

The puzzle work (working name: `problem_sets`) lives inside an existing
GitHub Pages site that also hosts simulations and a Jeopardy-style review
game, nested a bit deeper in the folder structure than the top level.
**Google Classroom is the actual entry point/portal** — links to specific
practice units and specific puzzles get posted there directly — so the
site's own top-level landing page is not a priority to develop further.

### Decision: puzzles stay a separate app from the practice app

Sibling folder within the same site/domain, not a separate host — this was
already the plan independent of the Session 3 UX-separation discussion.
Being same-origin sidesteps the `localStorage` partitioning problem
entirely: browsers partition storage by origin, not by path, so a sibling
folder on the same domain already shares storage scope with the practice
app if that's ever wanted, with no cross-origin workaround needed.

### Decision: styles are shared, not duplicated

A top-level `styles/` folder holds one base stylesheet (the existing dark
navy/amber design tokens) plus per-app/page stylesheets for anything that
needs to diverge — DRY without forcing every app on the site into identical
UI.

### Decision: one puzzle app, not one mini-app per puzzle type

Within the puzzle app itself, different puzzle types (trace, diagnose,
arrange, compare, etc.) dispatch through a `harness_type`-keyed registry
object mapping a type string to its component — e.g.
`{ trace: TraceHarness, diagnose: DiagnoseHarness, arrange: ArrangeHarness }`
— rather than a growing `switch`/case statement, and rather than splitting
each type into its own separate mini-app. Each harness type still lives in
its own file; the registry itself stays a few lines regardless of how many
types get added.

Reasoning: the parts that are genuinely shared across every puzzle type —
the confidence gate, the check → hint → fix-in-place → recheck rhythm, page
chrome, and the (still-unresolved) related-unit citation below — only stay
actually shared, instead of duplicated, if there's one app housing all
types. Separate mini-apps per type would mean either copy-pasting that
shared behavior into each one or building a shared component library
between them anyway, without buying real isolation, since the *content* was
the only genuinely per-type thing to begin with — the harness behavior
around it wasn't. A registry is also more cleanly extensible than a case
statement: a new puzzle type is one new component file plus one new
registry line, without needing to touch or even re-read any existing type's
code, which is a structural guarantee rather than a matter of discipline.

This was decided for puzzle-*type* separation specifically. It does not
change the earlier decision that the puzzle app as a whole stays separate
from the practice app — those are two different questions with two
different answers (separate from practice app; unified across puzzle
types).

**Correction to an earlier framing:** an initial draft of "Natural next
steps" treated data-driven vs. bespoke puzzle content as an open fork still
to decide. It isn't — it's a direct consequence of the registry above. The
registry is keyed by *type*, not by individual puzzle, so one component
(e.g. `TraceHarness`) has to serve every puzzle of that type. The only way
a seating chart and a parking garage both run through the same
`TraceHarness` is if everything that varies between them — scenario text,
variable names, bounds per level, output format — is passed in as
data/config, not hand-coded per puzzle. What's actually still open is
narrower: the specific JSON shape for each harness type (see next steps),
not whether puzzles are data-driven at all.

### Decision: schema composition — shared envelope, independent per-type payload

Puzzle JSON schemas compose two pieces, not one shared shape:

- **A small, fixed envelope**, the same across every puzzle regardless of
  type: `id`, `harness_type` (the registry key), `title`, `scenario` (the
  real-world framing text — per the Session 2 decision, every type needs
  this, not just trace), and `related_units` (optional, per the
  still-open linking discussion below).
- **A fully independent, type-specific payload** — whatever shape that
  particular harness type actually needs, with no attempt to keep it DRY
  or structurally similar across types. Trace's payload (variable names
  per nesting level, a bounds range per level, an output format string)
  has nothing in common with a future diagnose payload (a buggy code
  snippet, the correct line number, an explanation string) — and that's
  fine. Forcing shared structure onto genuinely different content would
  either leave unused fields sitting around per type, or flatten payloads
  into something too generic to describe any one puzzle well.

One caveat carried forward from the harness discussion, not really a
schema concern but worth keeping in view: not every type uses the full
checkable-harness shell (confidence gate → check → hint → recheck).
Compare/argue and reflection/capstone puzzle types were explicitly flagged
back then as not machine-checkable, so their harness components skip that
shell rather than force-fit into it — the registry already accommodates
this, since each harness component decides internally whether it renders a
check step at all.

### Still open: linking puzzle content to practice-unit content

Two distinct problems live under this one heading:

1. **Student-facing verbiage staying consistent** — mostly already solved
   by discipline rather than tooling: internal design language from the
   Round 3 ladder (e.g. "insideness") is a design taxonomy for organizing
   the puzzle progression, and never needs to reach a student. A puzzle's
   own text should just reuse whatever word the matching practice unit
   already uses (e.g. "nested loop"). A shared glossary doc is a cheap
   fallback if this ever drifts, but not worth building preemptively while
   one person is authoring both sides.
2. **Structural cross-referencing** — genuinely unresolved. The core
   constraint: it has to be optional and many-to-many, not a required
   one-to-one mapping, since some puzzles won't have a matching unit at
   all, and per the reinforcement-via-composition decision (Session 3),
   some puzzles will deliberately span *several* units at once. Leaning
   toward an optional `related_units` field per puzzle (and a mirrored
   `related_puzzles` field per unit, surfaced at the same moment the
   existing reflection-prompt modal already fires) — but this is only a
   clean one-line schema addition if puzzles end up JSON/data-driven like
   the practice app. If puzzle types stay bespoke, hand-authored components
   instead, there's no single natural place to declare that metadata, and
   it would need its own small hand-maintained index file. Given Google
   Classroom is the real sequencing mechanism, this in-app link only needs
   to be a lightweight "see also" citation for self-directed review, not
   something carrying real instructional sequencing weight.

## Natural next steps (not yet started)

- Design the `trace` harness's type-specific payload (variable names per
  nesting level, a bounds range per level, output format string) — the
  first concrete instance of the shared-envelope + independent-payload
  composition model above. Trace is currently a sample size of one, so
  treat this as designing trace's own payload, not a general puzzle
  schema to be reused by other types.
- Decide whether the `trace` harness needs to support variable nesting
  depth (a future 3-level-deep trace puzzle) or stays scoped to exactly 2
  levels, matching every trace example built so far.
- When designing later, more complex puzzles, deliberately require
  earlier-taught skills as a sub-component (per the reinforcement-via-
  composition decision above) — e.g., a future puzzle should require
  writing or tracing a nested loop as one step, not the whole task, to
  reinforce Level 4 without repeating the seating-chart puzzle itself.
- Apply the structured-trace + confidence-gate + fix-in-place pattern
  (no streak, per Session 3) to other puzzle types from the ladder — most
  directly, the HTML ancestor-tracing quiz (Level 1) and the
  shallow-copy/box-and-arrow pointer puzzles (Level 5), which were both
  explicitly flagged as candidates.
- Decide interaction modes (click-to-diagnose, drag/arrange) for the puzzle
  types that don't fit the trace-table pattern at all (spot-the-bug,
  nesting-doll sorting, specificity duels) and prototype one of each.
- Set up the actual `styles/` folder (base stylesheet + per-app
  stylesheets) and the puzzle app's sibling-folder scaffold, per the
  Session 4 architecture decisions above.

## Session 5 — puzzles app shipped; two more integrity leaks found

The `styles/` extraction and the puzzle app scaffold from Session 4's next
steps were built for real: `styles/base.css` now holds the shared tokens,
and `puzzles/` shipped with two harness types through the `harness_type`
registry — the nested-loop `trace` harness (generalized to any number of
levels, not fixed at 2, resolving that open question from Session 4) and a
new `ancestor-trace` harness for the Level 1 HTML ancestor-tracing quiz
flagged above.

### More instances of the puzzle-integrity leak

While hardening `ancestor-trace`, the same category of bug from Session 3's
"two puzzle-integrity leaks" turned up again, twice, in new forms:

Each unlockable row was originally labeled with its own position — "parent"
for the first row, then "2 levels up," "3 levels up," and so on. That label
was itself a hint: reading down the list of labels told a student exactly
how many ancestors the chain contained before they had traced a single one
of them — the answer to "how deep is this nesting?" handed over by the row
labels, the same shape of leak as Session 3's computed total and
placeholder-per-remaining-row, just for a different concept (chain depth
instead of loop row count). **Fix:** every row's label was flattened to the
same text, "next level up," regardless of position, so the label carries no
information about how many rows remain.

A second, related leak was fixed at the same time: the HTML tree display was
originally indented by nesting depth, the same way real HTML is normally
formatted. But indentation depth *is* a visual proxy for nesting depth — the
exact thing the puzzle is supposed to make the student work out from the tag
structure itself, not read off the whitespace. **Fix:** the tree now renders
flush-left, no indentation, for every line.

Both confirm the general rule from Session 3 holds beyond the puzzle it was
first written for: **any UI chrome that reveals the answer to the concept
being tested — not just the specific trace values — is a leak, even if it
feels like a harmless convenience label or formatting choice.** Worth
re-checking against this rule specifically whenever a new harness type is
built, since each new content shape (numeric ranges, tree depth, whatever
comes next) tends to introduce its own not-obviously-a-hint scaffolding
before it's caught.

## Session 6 — `descend-trace`: root-to-target, and a click-vs-type correction

Not one of the ladder's planned puzzles — this one came from a direct
request to mirror `ancestor-trace` in the opposite direction: given a
destination, trace *down* from the root instead of up from a target.

### Why it's not just `ancestor-trace` reversed

Going up, a node has exactly one parent, so the path is unique and there's
nothing to disambiguate. Going down, a node can have several children, so
the exercise is genuine branch disambiguation — "which of these leads to
the target?" — not the same chain read backwards. That needed two things
`ancestor-trace`'s content didn't: trees with real decoy siblings at forks,
and a `class` field on tree nodes (rendered as `<tag class="...">`, used
only where two siblings share a tag and need disambiguating, e.g.
`section.sidebar` vs `section.content`).

One mechanic decision carried over unchanged from `ancestor-trace`'s
design: each row's correct answer is always drawn from the *true* path,
never from wherever the student's own (possibly wrong) answer would
actually lead. Letting a wrong answer cascade could dead-end on a childless
node with nothing further to ask about — which would silently tell the
student they were wrong before they ever hit Check, a worse leak than
either of the two from Session 5.

### First build, and why it didn't work

The first version showed each fork's children as clickable buttons —
multiple choice. Live-tested and rejected: with only one correct path,
clicking among a handful of visible options is recognition, not recall.
**"The reason I don't like this one is it is overly scaffolded: they just
have to pick the right one (multiple choice versus open response)."**
Reworked to free text, matching `trace` and `ancestor-trace`'s mechanic
exactly — type the tag (or `tag.class` when disambiguation is needed) for
each step down. The `class` field didn't need to change; it works exactly
as well as a typed answer format as it did as a button label. The
now-unused button CSS was deleted rather than left dead.

### Two more corrections from live testing

- **Indentation, again.** The tree display was originally indented by
  nesting depth, same as real HTML — same leak as Session 5's, just
  rediscovered in a new harness: indentation is a visual proxy for the
  structure the puzzle is supposed to make the student work out. Removed,
  flush-left now, confirming the "don't hint via indentation" rule isn't
  specific to `ancestor-trace` — it applies to any harness that displays a
  tree.
- **Ambiguous starting point.** *"I failed on first try because I started
  at body. The directions are ambiguous."* The root is deliberately never
  one of the answer rows — typing it would just be copying the tree's own
  first visible line, not a decision — but nothing told the student that
  was the rule. Fixed at the UI level, not just in the scenario copy: a
  "Start at: `<tag>`" caption computed live from the actual tree data (so
  it's correct for any future instance regardless of its root tag, not a
  hardcoded string), plus the root's own line in the tree display gets the
  same highlight color as the destination.

### Puzzle navigation: explicitly deferred

Discussed whether a student should be able to reach other puzzles from the
one they're on. Considered a header dropdown (matching the practice app's
`.unit-select`) and a fuller index page (matching `problem-sets/index.html`'s
track picker) — **decided to defer both.** Google Classroom remains the
primary entry point per Session 4, and with only three puzzles shipped it's
too early to know what shape navigation should take once there are many
more. Revisit once puzzle volume actually makes the current hash-only
addressing (`#<puzzle-id>`) feel limiting.
