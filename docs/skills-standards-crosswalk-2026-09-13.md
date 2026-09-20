# Mini-Certs ↔ State Standards Crosswalk — Session Summary

Context: this maps `mini-certs/*.html` (8 self-authored certificate pages)
against `mini-certs/web-development-standards-skills.docx` (MA CTE
"Programming & Web Development" frameworks, July 2025, 11 standards). Scope
confirmed with the user: **in scope** — Standards 3, 4, 5, 6, 7, 8, 9, 11.
**Out of scope** — Standard 1 (Safety, handled by OSHA-10) and Standard 10
(Employability, handled without a cert). **Deferred** — Standard 2
(workplace/community/digital-equity content — more research-essay than
skill-demonstration; not named by the user in either direction, flagged
here rather than silently included or dropped).

Conventions for this doc: **CONFIDENT** = wording overlap strong enough not
to need discussion. **FLAG** = plausible but partial/indirect — usually
because a mini-cert describes a *role* ("Define the Business Analyst role")
rather than having the student *practice* the standard's actual skill. **NO
MATCH** = nothing in any of the 8 files covers this; a Phase B candidate
(either new proficiency in an existing file, or new mini-cert content for
Standards 3/9/11, which have no existing file at all).

**How to use the `Change` column**: every row defaults to `OK`, meaning
"fine as-is, proceed as written." To disagree, replace `OK` in that row with
what you want instead (a different match, "drop this," "merge with row X,"
a different new-cert placement, etc.) — I'll read the whole doc for edited
cells before Phase B and follow whatever you wrote there instead of my
default.

## To-Do: Phase B (not started — pick up here in a future session)

Before starting: re-read this whole doc for any `Change` column cells no
longer set to `OK`, and follow those instead of the defaults below.

1. **Add standards references to all 12 pages** — subsumed into the
   expanded to-do #3 below (the standards-ref tag is now a required part
   of every atomic skill line, not a separate later pass).
2. **Fix the 5 confirmed bugs** listed in "Bugs & inconsistencies found"
   above (invalid div nesting in `Basic_HTML.html`; the copy-pasted wrong
   demo-set in `Intermediate_HTML.html`; `Basic_CSS.html`'s off-by-one
   prerequisites and non-functional `disabled` checkboxes). The 5th bug
   (dangling Mini-Cert range references) is already fixed. The other 4
   are all in files this to-do's rebuild will touch anyway — fold the fix
   into that pass rather than doing it separately first.
3. **Rebuild every cert page as an atomic, ordered, standards-tagged
   checklist — expanded spec, confirmed 2026-09-13, supersedes the
   original "strip to statements + move demo content" draft above.**
   Full requirements:
   - **Atomic**: every checklist item is the smallest distinct fact or
     rule a student learns — the grain from the individual-skill recount
     above (`Basic_HTML.html`'s 30 items), not the coarser "competency
     area" grain most files currently use.
   - **Build order**: when atomic skills combine into a higher-level
     ability (knowing `<table>`/`<tr>`/`<th>`/`<td>` individually enables
     "build a table"), the atomic skills are listed *before* the skill
     that depends on them — reading top to bottom mirrors real learning
     order.
   - **Composite skills get their own checklist line** — confirmed
     2026-09-13. Correctly combining atomic skills is itself a distinct,
     separately-checkable ability (a student can know what `<table>`,
     `<tr>`, `<th>`, `<td>` each do individually and still not assemble
     them correctly) — not something that's automatically proven once the
     atomic pieces are checked off.
   - **Standards-ref tag on every item** — `<span class="standard-
     ref">Standard N, Skill M</span>` (or equivalent), so every checklist
     line is traceable to its DESE standard. One skill can map to more
     than one standard row and vice versa — tag accordingly, don't force
     1:1.
   - **Readability is the actual design goal** — the whole point of this
     rebuild is that a student can read the page and immediately
     understand what they need to learn and in what order. Every
     structural and CSS decision serves that.
   - **One shared CSS across all 12 files**, confirmed 2026-09-13 — not
     per-file bespoke styling. Each file gets its own accent/base color
     (via CSS custom properties) so a student can tell at a glance which
     certificate they're looking at, but the checklist layout, typography,
     and readability rules are identical everywhere.
   - **"Template to a tracking system" framing**: each atomic skill should
     read as a stable, addressable unit — this doc's own DESE coverage
     metric and the eventual Google Sheet alignment (Part 4) both depend
     on being able to point at one specific skill reliably. Real stable
     IDs are Part 4's job, not this pass's — but keep skill wording
     specific and stable-ish (avoid vague catch-all phrasing) so Part 4
     isn't fighting churn later.
   - **Bottom section, for both students and teachers** — supersedes the
     original "Possible Ways to Assess" / teacher-only framing. Same
     mechanics (demonstration-method content moves out of next to each
     skill, consolidated once per file at the bottom), but written to be
     useful to a student figuring out what's expected of them, not just a
     teacher grading it.
   - **Scope: all 12 files**, not just the original 8. The 5 files built
     this session (`Basic_SDLC`, `Basic_ITFundamentals`, `UX_Usability_
     Accessibility`, `Software_Engineering`, `Project_Management`) are
     currently at "competency area" grain, not atomic — bringing them to
     this spec is genuinely new content authoring, not a reformat, since
     they were never decomposed this finely in the first place.
   - **Process for the 5 new files' atomic decomposition, proposed by
     Claude, confirmed 2026-09-13**: a first-pass decomposition doc, same
     review workflow as this whole crosswalk doc (a table per competency
     area, `Change` column defaulting to `OK`) — not live edits to the
     HTML files until reviewed and approved. *Done for the 5 new files
     (rebuilt in commit `63b4aa7`, per-item standards tags added
     2026-09-20).*
   - **Still to do, added 2026-09-20 — decompose the 4 older certs that
     are still in "skill heading + 4 demonstration checkboxes" format**
     (`Basic_JavaScript`, `Intermediate_JavaScript`, `Basic_Python`,
     `Intermediate_Python`, ~430 demonstration checkboxes) into atomic
     skill statements, then rebuild the HTML and add per-item standards
     tags (`Standard 7, Skill N`) like the other certs. Working doc, with
     5 calibration slices drafted and awaiting your review:
     `docs/atomic-skill-decomposition-js-python-2026-09-20.md`. Decisions
     needed before scaling: reword style (drop counts, move them to the
     bottom assessment section), whether to add the missing Python
     functions/lists/dicts/try-except bridging cert in the same pass, and
     one-file-at-a-time vs. all four. Also still open, separate from
     this: per-cert accent colors and the bottom student/teacher
     assessment section on every page.
4. **Resolve the conceptual-overlap redundancy candidates** per whatever
   the `Change` column says (merge, differentiate scope, or leave as-is).
5. **Add every remaining "no match" in-scope standards skill** as a new
   proficiency in its matched file. *Superseded by the DESE coverage
   metric above* — that table's 36 NOT COVERED rows (24 genuine gaps + 12
   deliberate exclusions) are the current, accurate version of this list;
   the original text here (version control, the Python functions→try/
   except bridge) is stale — both of those are already done. Still open:
   the two Standard 7 "Finding" rows (Python functions→lists→dicts→
   try/except→scope bridge unit, JS/Python polymorphism) — neither is
   touched by the restructuring.
6. ~~**Author new mini-cert content for the three previously-uncovered
   standards**~~ **SUPERSEDED 2026-09-13** by the "Restructuring plan v2"
   section above — done differently and much further than this original
   plan described:
   - Standard 3 → **done**, `mini-certs/Basic_ITFundamentals.html` built,
     3 merged competency areas (not 5 separate mini-certs).
   - Standard 9 → **done**, folded into new `mini-certs/Project_
     Management.html` (not appended to `Basic_SDLC.html` — that file was
     narrowed, not grown).
   - Standard 11 → **still open, deferred** — see "Standard 11" in the
     Restructuring plan v2 section for the parked options.
   - Not originally planned here, also now **done**: `Basic_SDLC.html`
     narrowed and restructured; `mini-certs/UX_Usability_Accessibility.
     html` and `mini-certs/Software_Engineering.html` built; `Intermediate_
     Python.html` extended with 4 new competencies. See the Restructuring
     plan v2 section for the full account.
7. **Map finalized cert skills to problem-sets** in a new second doc,
   `docs/problem-set-skill-coverage-<today's date>.md` — per cert skill:
   *covered* (name the exact unit/exercise), *partially covered*, or *no
   problem-set exists*; plus an explicit "not codeable as a problem-set"
   list for Standard 3/9/11-type skills (research/presentation/role-play
   tasks per the docx's own Sample Performance Tasks) so that boundary is
   visible, not silently dropped.
8. **Prioritize the missing-and-codeable problem sets**, same doc: cheapest
   first — a Python OOP unit and a file-I/O unit slot straight into the
   existing `units/manifest.json` pattern with zero new grading-engine
   work (and directly close the confirmed `Intermediate_Python.html` gap);
   new webdev units for CSS box-model/selectors/responsive-design reuse the
   existing three-pane engine as-is; anything needing new grading
   infrastructure (server-side/API/database skills from Standard 8) gets
   called out separately as "needs new infrastructure, not just new
   content" and deprioritized.
9. **Verify**: reload all 12 pages in a browser after the to-do #3 rebuild
   — no visual breakage, nothing silently dropped from the atomic
   checklists, the shared CSS renders consistently across all 12 with
   each file's own accent color showing correctly. For every "covered"
   claim in the coverage doc, open the exact unit JSON and confirm it
   actually teaches the claimed skill.

## To-Do: Part 4 — align the student-progress Google Sheet (depends on an Excel export)

The user tracks per-student progress toward each certificate in a Google
Sheet: skills across the top, student names down the side. Some sheets
exist but have no header row filled in yet. Three tasks, assessed for
feasibility against an **Excel export of the Sheet with student names
removed**, which the user will provide:

- **Feasible — no blocker**: reading the export needs no new dependencies.
  `.xlsx` is a zip of XML files, same as `.docx` (which this doc's source
  material already came from via macOS `textutil`) — parseable directly
  with Python's built-in `zipfile`/`xml` modules.
- **No confirmed write access to the live Google Sheet.** This session has
  one Google integration, an unauthenticated Drive MCP tool (file access),
  not a Sheets-editing API — even once authenticated, it's very unlikely
  to support writing individual cells into a live Sheet. That caps what
  "adding headers" can mean here: a corrected file or an exact list to
  paste in, not a direct push to the live Sheet.

Tasks, once the Excel file is provided:

1. **Audit header completeness**: for each certificate's sheet/tab, diff
   its header row against that certificate's finalized skill list (post
   Phase B) and report any missing or extra columns. *Depends on*: the
   Excel file, and on Phase B being done first — auditing against a
   pre-Phase-B skill list would mean re-doing this once the skill list
   changes.
2. **Fill in headers for the blank sheets**: for any sheet/tab with no
   header row yet, produce the correct header row (in the finalized skill
   order) as a corrected `.xlsx` file, or as a plain list to paste in —
   whichever the user prefers. *Not fully automatable*: applying it back
   into the live Google Sheet is on the user (paste, or re-upload as a new
   tab), since this session has no confirmed Sheets-write capability.

(The certificate-pages simplification the user described alongside these
two — skill statement + standards-ref tag + one shared "taught/assessed
multiple ways, see the tracking sheet" sentence, no demonstration-method
content on the page at all — has no dependency on the Excel file; it's
folded into Phase B step 3 above.)

Data-completeness note: matching below is at full skill-statement (`<h4>`/
`<h3>`) fidelity for `Basic_CSS`, `Basic_HTML`, `Intermediate_HTML`,
`Basic_JavaScript`, `Intermediate_JavaScript`, `Basic_Python`,
`Intermediate_Python`, and at Learning-Target fidelity for all 23
`Basic_SDLC` certs (pulled directly for this doc). SDLC's `Proof` bullets
(the actual demonstration tasks) were only spot-checked for certs 1-8, not
exhaustively re-verified for certs 9-23 — worth a quick re-check during
Phase B when editing that file directly.

---

## Restructuring plan v2 (2026-09-13) — built from your `Change`-column edits, EXECUTED

**Status: built.** All open questions got resolved (Standard 9 folded
into Project Management, Standard 11 deferred, Mini-Cert 22 merged into
Software Engineering with no separate identity, filenames confirmed), and
every file below now exists/is updated in `mini-certs/`. This section is
kept as the record of what was built and why — the original per-standard
tables further down are left as-is too, as historical record of the
first-pass analysis and your literal `Change`-column edits.

Files touched: `Basic_SDLC.html` (rewritten/narrowed), `Basic_
ITFundamentals.html` (new), `UX_Usability_Accessibility.html` (new),
`Software_Engineering.html` (new), `Project_Management.html` (new),
`Intermediate_Python.html` (extended, existing structure kept). The 7
other existing files were not touched.

**Structural principle, confirmed 2026-09-13: no "Mini-Certificate N"
subdivisions inside any certificate — too granular.** Every cert is one
cohesive subject-level page, organized into sub-sections/competencies,
not a sequence of separately-numbered mini-certs. Applied fully to
everything touched in this pass (narrowed SDLC, IT Fundamentals, UX/
Usability/Accessibility, Software Engineering, Project Management). The
existing **7 untouched files** (`Basic_HTML`, `Basic_CSS`,
`Basic_JavaScript`, `Basic_Python`, `Intermediate_HTML`,
`Intermediate_JavaScript`, `Intermediate_Python` — the last one only gets
new competencies *added*, its existing structure isn't rebuilt) still use
the old "Mini-Certificate N" format. That's a real inconsistency this
creates, but rebuilding 7 stable, already-in-use files' internal
structure is its own separate, much larger undertaking — **logged as a
new to-do below, not done as a side effect of this pass.**

### New file structure

**How to use the `Change` column**: same convention as the rest of this
doc — every row defaults to `OK`, meaning "built correctly as described."
To flag something, replace `OK` with what you want changed instead. These
files are already built, so an edit here means a follow-up change to the
actual HTML, not a redirect before building.

| File | Status | Contents | Change                                                                                                                                                    |
|---|---|---|-----------------------------------------------------------------------------------------------------------------------------------------------------------|
| `Basic_SDLC.html` | **Narrowed, restructured** | One certificate covering SDLC overview/goals + Agile + Waterfall + Iterative Models methodologies, plus **all 12** job-role competencies (Business Owner/Sponsor, Business Analyst, Usability Tester, UX/UI Designer, Technical Architect, Front End Developer, Back End Developer, Full Stack Developer, Database Developer, Mobile Developer, QA/Automation Tester, DevOps Engineer). No more "Mini-Certificate N" headers. Every role competency's proof section gets rewritten around **which SDLC phase(s) that role works in most + the main artifacts they produce**, replacing the current generic "Role Definition / Responsibility Mapping / Decision Authority / Stakeholder Analysis" shape. Usability Tester and UX/UI Designer stay here as role-entries (phase + artifacts only, matching every other role) — the actual skill practice for both lives in `UX_Usability_Accessibility.html`, same split as Front End Developer's role staying here while HTML/CSS/JS skill practice lives in `Basic_HTML`/`Basic_CSS`/`Basic_JavaScript`. | **Done** |
| `Basic_ITFundamentals.html` | **New** (Standard 3) | One certificate, 3 competency areas: **(1) Cybersecurity & Networking** (merged), **(2) Hardware & Operating Systems** (merged), **(3) Data Management & Databases** (+ NoSQL added). | OK                                                                                                                                                        |
| `UX_Usability_Accessibility.html` | **New** | One certificate, 3 competency areas: Usability Testing + UX/UI Design (pulled from SDLC's old Mini-Certs 11–12) + a **new** Accessibility area — color contrast, coding for screen readers, WCAG definition, accessibility testing tools (Buddy, etc.), ARIA roles. | OK                                                                                                                                                        |
| `Software_Engineering.html` | **New** | One certificate. Competency areas: multi-tiered design (Monolithic / Tiered / Microservices, pulled from SDLC's old Mini-Certs 5–7), **Design Patterns** (new — MVC, MVVM, component-based), Cross-Cutting Concerns (old Mini-Cert 8), Programming Languages & Stacks (old Mini-Certs 21–23 **merged into one competency area** — 22 loses its separate identity entirely and folds into the same languages/paradigms/stacks competency as 21 and 23, per your call), plus **new** competency areas: CI/CD and Version Control (both resolved in your favor over the conflicting Standard 5 edits below). | **Done** |
| `Project_Management.html` | **New** | One certificate. The 9 Standard 5 items you routed here, **plus Standard 9's 5 skills, confirmed folded in** — same topic, one file. | OK                                                                                                                                                        |
| `Intermediate_Python.html` | **Extended** | + pseudocode algorithms (Standard 5) + sorting algorithms + searching algorithms (Standard 7) + separation of concerns (not a literally-named standard skill, but reinforces Standard 7's "Design patterns (MVC)" and general software-design maturity — included since you asked for it). Existing structure/format unchanged, new competencies just added to it. | OK                                                                                                                                                        |

### Competencies per file — recounted at the actual individual-skill level (2026-09-13)

**Supersedes the table originally in this spot**, which counted the
mid-level "Certificate N: Topic" grouping, not actual individual skills —
too coarse. Also caught and fixed a real bug while redoing this: the
original `Basic_HTML.html` count (21) was wrong regardless of grain —
undercounted by a broken regex that missed any `<h4>` heading containing
a nested `<strong>` tag, or nested inside a `<div class="nested-list">`
wrapper. Recounted properly this time with an actual HTML parser
(Python's `html.parser`, not regex), reading every file's true heading
structure directly.

"Individual skill" = the deepest **named, distinct fact or rule** a
student is meant to learn — for `Basic_HTML.html`, the level your example
list was written at: "the definition of a self-closing tag," "the rule of
1 `<h1>` tag per page," etc. Each is one `<h4>` (HTML/CSS files) or `<h3>`
(JS files) heading, **excluding** generic non-skill headers like "Overall
Competency"/"Overall X Mastery" (a closing summary, not a skill) or
"Integration Notes" (a teaching note, not a skill).

**Confirmed against your example list**: every item you listed for HTML
basics already exists in `Basic_HTML.html` — I'd simply undercounted
them. "Indenting HTML" → `<h4>Structure of HTML/Correct indentation</h4>`.
"Definition, form and attributes of css link tags" →
`<h4>Links - for css</h4>`. "href and target attributes" →
`<h4>href, target, rel</h4>`. Nothing here is new content to build —
it was already there, just miscounted.

| File | Individual skills | Grain |
|---|---|---|
| `Basic_HTML.html` | **30** | `<h4>` skill statements (Parsing HTML, indentation, HTML5 skeleton, tag concept, tag anatomy, opening/closing/self-closing tags, attributes, content, h1–h6, one-h1-rule, `<a>` w/ href/target/rel, `<p>`, `<br>`, `<img>`, `<hr>`, `<div>`, `<span>`, ul, ol, list type/value/start, table structure, rowspan, colspan, both spans, CSS `<link>`, HTML links, href/target/rel attrs, img src/alt) |
| `Basic_CSS.html` | **23** | `<h4>` skill statements (29 total `<h4>`s minus 6 "Overall X Mastery/Proficiency" closing summaries, which aren't skills) |
| `Basic_JavaScript.html` | **32** | `<h3>` skill statements (40 total minus 8 "Overall Competency" closings, one per certificate) |
| `Intermediate_HTML.html` | **22** | `<h4>` skill statements — no non-skill headers to exclude here |
| `Intermediate_JavaScript.html` | **28** | `<h3>` skill statements (35 total minus 7 "Overall Competency" closings) |
| **Subtotal, genuinely atomic-decomposed files** | **135** | — |
| `Basic_Python.html` | 10 | **Not broken down to the same grain.** `<h3>` topic headings only (e.g. "Branching (if, elif, else)" bundles 3 concepts into one heading, unlike HTML's one-fact-per-heading style). Marking per your instruction rather than forcing a false-precision atomic count. |
| `Intermediate_Python.html` | 11 | Same caveat — topic-level `<h3>`s, not atomic facts. |
| `Basic_SDLC.html` | 16 | Same caveat — each is a competency *area* (e.g. "Front End Developer") containing 2–3 proof items, not one atomic fact. Updated from 14: Usability Tester and UX/UI Designer added back as role-entries. |
| `Basic_ITFundamentals.html` | 3 | Same caveat. |
| `UX_Usability_Accessibility.html` | 3 | Same caveat. |
| `Software_Engineering.html` | 6 | Same caveat. Updated from 5: Design Patterns competency added. |
| `Project_Management.html` | 5 | Same caveat. |
| **Subtotal, competency-area grain (not directly comparable to the 135 above)** | **54** | — |

No single "grand total" given — 135 and 51 are measured at genuinely
different grains, and adding them would imply a false precision. If you
want the 7 single-certificate files (Python × 2, and everything built
this pass) broken down to the same one-fact-per-item grain as
`Basic_HTML.html`, that's real additional authoring work, not a recount —
say the word and I'll scope it.

**Standard 11 (Entrepreneurship): deferred, explicitly.** Not folded into
any of the above, not given a new file, not dropped from tracking either
— parked as open/unbuilt until you decide where it goes. See its own
section below.

### Standard 3 — unchanged conclusion, fewer containers

Still 100% NO MATCH → still becomes CONFIDENT once built. Only change:
3 mini-certs instead of 5, per your merges.

### Standard 4 — fully unaffected

"Research/identify major roles within a project team" stays CONFIDENT —
still matches the SDLC role certs, and the count stays at **all 12** role
competencies (Usability Tester and UX/UI Designer confirmed staying as
role-entries in `Basic_SDLC.html`, per your later edit — only the deep
skill practice moved to the UX cert, not the role itself). No change from
the original analysis at all.

### Standard 5 — 9 items relocate, 2 upgrade via your CI/CD & version-control call, 9 stay deliberately uncovered

| Item | Was | Becomes | Change |
|---|---|---|---|
| Collaborate with users on requirements | FLAG (role-description proxy) | Relocates to `Project_Management.html` — CONFIDENT once built for real, not a proxy anymore | OK |
| Research appropriate technologies | FLAG | → `Project_Management.html`, CONFIDENT | OK |
| Create a technical design document | FLAG | → `Project_Management.html`, CONFIDENT | OK |
| Identify testing techniques | FLAG | → `Project_Management.html`, CONFIDENT | OK |
| Produce a prioritized feature list | NO MATCH | → `Project_Management.html`, CONFIDENT | OK |
| Evaluate project resources, time/cost analysis | NO MATCH | → `Project_Management.html`, CONFIDENT | OK |
| Define/structure project scope of work | NO MATCH | → `Project_Management.html`, CONFIDENT | OK |
| Create/implement a test plan | NO MATCH | → `Project_Management.html`, CONFIDENT | OK |
| Document lessons learned | NO MATCH | → `Project_Management.html`, CONFIDENT | OK |
| Describe CI/CD purpose | FLAG (DevOps role proxy) | Your line-202 edit said "don't include in any cert" (specifically as a Project Management item) — your line-229 resolution puts real CI/CD content in `Software_Engineering.html` instead. **Not** added to Project Management; **is** added to Software Engineering. NO MATCH → CONFIDENT there. | OK |
| Demonstrate version control methods | NO MATCH (standout gap) | Same shape: your line-215 note ("students use Git/GitHub via Portfolio, don't add to any") stays true for *not* duplicating it as a Project Management or SDLC item — but your line-229 resolution adds real version-control content to `Software_Engineering.html`. NO MATCH → CONFIDENT there. | OK |
| Devise pseudocode algorithms | NO MATCH | → `Intermediate_Python.html`, CONFIDENT | OK |
| **9 deliberately-uncovered items** (below) | NO MATCH | **Stays NO MATCH — intentional, not a gap** | OK |

The 9 deliberate non-matches, so they don't get mistaken for oversights
later: demonstrate team collaboration during dev; implement design as
coded solution (Capstone territory); demonstrate coded solution to
customer (Capstone); create user software documentation; document how
the end user runs the software; describe source-code-management purpose;
describe release-management purpose; describe dev/staging/production
environments; publish the software solution.

### Standard 6 — UX items relocate, Accessibility upgrades, 3 items stay open

The 6 already-matched items (user research methodologies, personas,
prototypes, document user goals, UX models, simplified interface layout,
storyboard) keep their exact match status — same content, new file
(`UX_Usability_Accessibility.html` instead of `Basic_SDLC.html`).

The 2 accessibility NO MATCH items — "Research/identify accessibility
rationale" and "...implementation methods" — become CONFIDENT once the
new Accessibility mini-cert (color contrast, screen readers, WCAG, Buddy/
testing tools, ARIA roles) is built.

**3 items still open, not requested to be added — flagging so they don't
silently vanish**: "Define feedback for defaults/status/error/
validation," "Describe design considerations per display form factor,"
"Define different UI modalities." All 3 would fit naturally in the new
UX/Usability/Accessibility cert if you want them later; not building them
now since nothing you wrote asked for it.

### Standard 7 — 2 items relocate, 2 items upgrade, rest stay open

"Differentiate programming paradigms" and "Compilers vs. interpreters"
relocate from SDLC Mini-Cert 21 to `Software_Engineering.html` — still
CONFIDENT, new home. "Sorting algorithms" and "Searching algorithms" go
from NO MATCH to CONFIDENT once added to `Intermediate_Python.html`.

Still open, not addressed by any edit: the four parts of computational
thinking, memory-management concepts, design patterns (MVC), composition
via UML, overloading — plus the two "Finding" rows (the Python
functions→try/except bridge unit, and JS/Python polymorphism). None of
these are touched by this restructuring.

### Standard 8 — one note, otherwise unaffected

"Front-end/back-end boundary" (FLAG, via SDLC's Front/Back End Developer
role descriptions) stays exactly as weak a match as before — Mini-Certs
14–15 stay in the narrowed SDLC file, just reworded toward phase/artifact
framing per the line-229 change. That reframing doesn't obviously
strengthen or weaken this particular match; worth a real look once
`Software_Engineering.html`'s content (which is closer to this standard's
actual concern) exists.

### Standard 9 — confirmed: folded into the new Project Management cert

Original recommendation was "Mini-Certificate 24: Project Planning &
Management, appended to `Basic_SDLC.html`." **Confirmed 2026-09-13**:
folds into `Project_Management.html` instead — same topic, one file,
alongside the 9 Standard 5 items already routed there. As a competency
area within that cert, not a separately-numbered mini-cert (per the
structural principle above).

### Standard 11 — confirmed deferred

Original recommendation was "Mini-Certificate 25: Entrepreneurship in
Software Development, appended to `Basic_SDLC.html`." With SDLC narrowed,
this had nowhere left to go. **Confirmed 2026-09-13: deferred** — not
built into any file this pass. Its 3 skills (roles/responsibilities in a
successful software company; value proposition of a software dev
professional; self-employment vs. W-2 employment) stay logged as NO MATCH
in the original Standard 11 table below, unchanged, until you decide
where — or whether — this gets built.

### Mini-Cert 22 — confirmed: folded into Software Engineering, no separate identity

**Confirmed 2026-09-13**: drops its own "Mini-Cert 22 / General Purpose
Languages" framing entirely — its content (major GP languages, their
characteristics, use-case matching, SQL/DSLs) merges into the same
Programming Languages & Stacks competency area as old Mini-Certs 21 and
23 inside `Software_Engineering.html`, per the "no mini-cert
subdivisions" principle — all three were headed toward one cohesive
"languages and stacks" competency anyway.

### DESE standards coverage metric (2026-09-13)

Every in-scope standard skill (Standards 3, 4, 5, 6, 7, 8, 9, 11 — same
scope as the whole doc) from the original per-standard tables below,
re-tallied against what the restructuring actually built. **Per your
instruction: every deliberate "don't add"/"don't include"/"deferred"
decision counts as NOT COVERED here** — this is a coverage metric, not a
decision log, so a conscious choice not to build something still shows up
as a gap, not as neutral.

Three tiers: **CONFIDENT** (real skill match), **FLAG** (partial/indirect
— pre-existing FLAG matches that the restructuring didn't touch, so they
stay FLAG), **NOT COVERED** (true gaps + every deliberate exclusion).

| Standard | CONFIDENT | FLAG | NOT COVERED | Total |
|---|---|---|---|---|
| 3 — IT Fundamentals | 5 | 0 | 0 | 5 |
| 4 — SDLC Fundamentals | 3 | 0 | 0 | 3 |
| 5 — Concepts of Software Development | 12 | 0 | 9 | 21 |
| 6 — UX/UI Design | 5 | 4 | 3 | 12 |
| 7 — Programming Concepts | 18 | 0 | 4 | 22 |
| 8 — Web Design & Development | 7 | 4 | 17 | 28 |
| 9 — Project Management | 5 | 0 | 0 | 5 |
| 11 — Entrepreneurship | 0 | 0 | 3 | 3 |
| **Total** | **55** | **8** | **36** | **99** |

**Coverage: 55.6% strict (CONFIDENT only), 63.6% inclusive (CONFIDENT +
FLAG).** Updated from 54.5%/62.6% — Design Patterns (MVC/MVVM/component)
is now actually built into `Software_Engineering.html`, so it moved from
NOT COVERED to CONFIDENT in Standard 7. No single number is "the"
answer — strict is the honest one if FLAG matches don't count as real
coverage in your view; inclusive credits partial/indirect matches too.

**The 36 NOT COVERED, split by why:**

*12 are deliberate exclusions — your calls, now counted against
coverage per your instruction, not given a pass for being intentional:*
- Standard 5 (9): demonstrate team collaboration during dev; implement
  design as coded solution (Capstone territory); demonstrate coded
  solution to customer (Capstone); create user software documentation;
  document how the end user runs the software; describe
  source-code-management purpose; describe release-management purpose;
  describe dev/staging/production environments; publish the software
  solution.
- Standard 11 (3): all deferred — roles/responsibilities in a software
  company, value proposition of a dev professional, self-employment vs.
  W-2.

*24 are gaps nobody has addressed either way — not requested, not
deferred, just never came up:*
- Standard 6 (3): feedback for defaults/status/error/validation, design
  considerations per display form factor, different UI modalities.
- Standard 7 (4): four parts of computational thinking, memory-management
  concepts, composition via UML, overloading. (Design patterns (MVC) is
  no longer in this list — built into `Software_Engineering.html`, now
  CONFIDENT.)
- Standard 8 (17): front-end toolkit implementation, box model
  manipulation, CSS `position` property, page-loading-efficiency best
  practices, cookies, SEO trends, plus all 11 back-end/deployment skills
  (HTTP methods, server-side processing, server-side scripting, DB
  read/write, CRUD, auth, e-commerce APIs, hosting comparison,
  deployment, CMS, back-end frameworks) — the known, accepted "entire
  back half of Standard 8 has zero presence" finding from the original
  analysis, unchanged by this restructuring.

Not counted in the 99 at all, so not affecting this percentage either
way: the 2 Standard 7 "Finding" rows (Python functions→try/except bridge
unit, JS/Python polymorphism) — those are asymmetry observations, not
literal skill statements from the standards document itself.

### Resolved before the build, and what's still genuinely open

1. **Filenames**: confirmed as-is — `Basic_ITFundamentals.html`,
   `UX_Usability_Accessibility.html`, `Software_Engineering.html`,
   `Project_Management.html`.
2. **Renumbering/restructuring fallout**: checked directly after the
   build — grepped all 5 touched files for any remaining "Mini-Cert"
   references. None found except `Intermediate_Python.html`'s own page
   title ("Intermediate Python Mini-Certificate"), which is the file's
   name for itself, not a numbered subdivision reference — fine as-is.
3. Both stale housekeeping rows fixed directly in their original tables
   below (Bugs table #5, redundancy candidate #5, reverse-check row 2) —
   marked resolved/superseded with what actually happened.
4. **New to-do surfaced by the "no mini-certs" principle, still open**:
   the 7 untouched existing files (`Basic_HTML`, `Basic_CSS`, `Basic_
   JavaScript`, `Basic_Python`, `Intermediate_HTML`, `Intermediate_
   JavaScript` — `Intermediate_Python` only got new competencies added,
   its existing format wasn't touched) still use the old Mini-
   Certificate-N format. Not part of this pass. Needs its own scoping and
   confirmation in a future session — a rebuild of 7 already-shipped
   files is materially bigger than today's work.
5. **Standard 11 (Entrepreneurship)**: still deferred, still homeless,
   per your explicit call. Nothing built for it.
6. **Two follow-up edits from your post-build review, both now done**:
   Usability Tester and UX/UI Designer added back into `Basic_SDLC.html`
   as role-entries (phase + artifacts, matching all other roles — skill
   practice stays in the UX cert); Design Patterns (MVC/MVVM/component)
   added to `Software_Engineering.html`. Both verified for tag balance.
   All counts and the coverage metric above are updated to reflect these.

All 6 `mini-certs/*.html` files (5 new/rewritten, 1 extended) are built.
Verified: every file's HTML tags balance (`<div>`/`<h1>`–`<h3>`/`<ul>`/
`<li>` open/close counts match), and no dangling numbered-cert references
remain in any of them.

---

## Standard 3: Fundamental Skills for IT Careers — 100% NO MATCH (new file)

None of the 8 files touch hardware, networking, OS/CLI, cybersecurity, or
databases. All 26 skills need new content, grouped here for a proposed new
file, `mini-certs/Basic_ITFundamentals.html` (Family B / SDLC template).

| Skill group | Covers | Match | Change                                                        |
|---|---|---|---------------------------------------------------------------|
| Cybersecurity Fundamentals | cybersecurity topics; security principles/vulnerabilities/threats (software + network); threat-map analysis; CIA triad; access control; cryptography + cryptology/cryptanalysis; ethical-hacking/pen-testing; network-storage security risks | NO MATCH — new mini-cert | Add Network and Cybersecurity together in one mini cert       |
| Hardware Fundamentals | classify hardware components/functions/relationships; program a physical computing device | NO MATCH — new mini-cert | Combine Hardwire and Operating Systems together into one cert |
| Networking Fundamentals | networking concepts; network purpose + hardware; cloud computing + topologies/protocols; server-side networking components (firewalls, DNS, VPN, proxy, DHCP, FTP, DC, AD) | NO MATCH — new mini-cert | See above-with cybersecurity                                  |
| Operating Systems & CLI | OS purpose; desktop/server/mobile OS; CLI vs. GUI; file-system navigation at CLI; file-type ID; compression-algorithm comparison | NO MATCH — new mini-cert | See above-combine with Hardware                               |
| Data Management & Databases | data management concepts/purpose; relational DB planning/design/creation; table relationships; purpose of data analysis; DB queries + reports/visualization | NO MATCH — new mini-cert | Add No-sql databases and make one mini cert                   |

---

## Standard 4: SDLC Fundamentals — well covered, one big 1-to-many

| Standard skill | Match | Mini-cert | Change |
|---|---|---|---|
| Explain the life cycle of software development | CONFIDENT | `Basic_SDLC` Mini-Cert 1 (SDLC) | OK |
| List/describe/classify development methodologies | CONFIDENT | Mini-Certs 2 (Agile), 3 (Waterfall), 4 (Iterative Models) | OK |
| Research/identify major roles within a project team | CONFIDENT | Mini-Certs 9-20 (all 12 role certs) | OK |

Note: Mini-Certs 5-8 (Monolithic/Tiered/Microservices/Cross-Cutting
architecture) go well beyond this standard's literal 3 skills — closer to
Standard 8's front-end/back-end boundary territory. Not a gap, just the
SDLC file over-delivering here.

---

## Standard 5: Concepts of Software Development — mostly NO MATCH (real gap cluster)

This is the standard I expected `Basic_SDLC.html` to cover well, and it
mostly doesn't: the file *describes* roles ("Define the Business Analyst
role," "Explain requirements gathering techniques" — as something a BA
does) rather than having the student *practice* the actual SDLC deliverable.

| Standard skill | Match | Mini-cert / Notes | Change                                                        |
|---|---|---|---------------------------------------------------------------|
| Collaborate with users on requirements | FLAG | Mini-Cert 10 BA (role-description proxy) | Add to new Project Management Cert                            |
| Research appropriate technologies | FLAG | Mini-Cert 13 Technical Architect (role-description proxy) | Add to new Project Management Cert                            |
| Create a technical design document | FLAG | Mini-Cert 13 (role-description proxy) | Add to new Project Management Cert                            |
| Identify testing techniques | FLAG | Mini-Cert 19 QA (role-description proxy) | Add to new Project Management Cert                            |
| Describe CI/CD purpose | FLAG | Mini-Cert 20 DevOps (role-description proxy) | Don't include in any cert                                     |
| Produce a prioritized feature list | NO MATCH | — | Add to new Project Management Cert                            |
| Evaluate project resources, time/cost analysis | NO MATCH | — | Add to new Project Management Cert                            |
| Define/structure project scope of work | NO MATCH | — | Add to new Project Management Cert                            |
| Demonstrate team collaboration during dev | NO MATCH | — | Don't put in any cert                                         |
| Devise pseudocode algorithms | NO MATCH | — | Add to Intermediate Python Cert                               |
| Implement design as coded solution | NO MATCH | (covered generally by problem-sets, not a mini-cert) | Don't add to any cert-is Capstone requirement                 |
| Create/implement a test plan | NO MATCH | — | Add to new Project Management Cert                            |
| Demonstrate coded solution to customer | NO MATCH | — | Don't add, part of Capstone                                   |
| Document lessons learned | NO MATCH | — | Add to new Project Management Cert                            |
| Create user software documentation | NO MATCH | — | Don't add to any                                              |
| Document how the end user runs the software | NO MATCH | — | Don't add to any                                              |
| Describe source-code-management purpose | NO MATCH | — | Don't add to any                                              |
| **Demonstrate version control methods** | **NO MATCH** | absent from all 8 files — standout gap | Student's use Git and Github with Portfolio. Don't add to any |
| Describe release-management purpose | NO MATCH | — | Don't add to any                                              |
| Describe dev/staging/production environments | NO MATCH | — | Don't add to any                                              |
| Publish the software solution | NO MATCH | — | Don't add to any                                              |

---

## Standard 6: Fundamentals of UX and UI Design — partial

Compared against `Basic_SDLC` Mini-Cert 11 (Usability Tester) and Mini-Cert
12 (UX/UI Designer).

| Standard skill | Match | Mini-cert | Change                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
|---|---|---|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| User research methodologies (usability tests, interviews, contextual inquiry, observation) | CONFIDENT | Mini-Cert 11 "usability testing methods," "user-centered evaluation techniques" | Change the SDLC Certificate as follows: it should cover general SDLC reasons and goals, Agile, Waterfall, the listed Job Roles, the SDLC Phase(s) they work in most, and the main artifacts they create as part of the project. Pull out a separate UX, Usability and Accessibility Cert. Pull out a separate software engineering cert that contains multi-tiered design/layers, CI/CD, cross-cutting concerns, frameworks and stacks, version control, . Add sorting, searching algorithms and separation of concerns to Intermediate Python. Move different programming paradigms and compilers vs. interpreters to software engineering cert.  |
| Develop personas, research demographics | CONFIDENT | Mini-Cert 12 "persona development" | OK                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| Create a prototype from a layout/storyboard | CONFIDENT | Mini-Cert 12 "wireframing and prototyping" | OK                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| Document user goals/needs/behaviors/preferences | FLAG | Mini-Cert 12 "user research" (LT-level only) | OK                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| Develop UX models for different audiences | FLAG | Mini-Cert 12, indirect | OK                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| Create simplified interface layout w/ a graphic tool | FLAG | Mini-Cert 12 "wireframing" | OK                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| Build a storyboard of the UI | FLAG | Mini-Cert 12 "wireframing and prototyping" | OK                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| Research/identify accessibility rationale | NO MATCH | `Basic_HTML`'s teacher-facing rubric mentions accessibility as a grading criterion, not a taught skill | OK                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| Research/identify accessibility implementation methods | NO MATCH | — | OK                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| Define feedback for defaults/status/error/validation | NO MATCH | — | OK                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| Describe design considerations per display form factor | NO MATCH | adjacent to Standard 8's responsive-design skill and SDLC Mini-Cert 18's "device-specific constraints" | OK                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| Define different UI modalities | NO MATCH | — | OK                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |

---

## Standard 7: Fundamental Concepts of Programming — large, language-agnostic; big Python gap found

Matched against both JS files (Certs 1-15) and both Python files, since the
standard doesn't require a specific language.

| Standard skill | Match | Mini-cert | Change |
|---|---|---|---|
| Utilize IDEs | CONFIDENT | JS Cert 1 | OK |
| Arithmetic operators | CONFIDENT | JS Cert 3; Python "Integers & Floats" | OK |
| Logical/relational operators | CONFIDENT | JS Cert 8 | OK |
| Conditional branching | CONFIDENT | JS Cert 9; Python "Branching" | OK |
| Iterative loops | CONFIDENT | JS Cert 10; Python "For/While Loops" | OK |
| User-defined functions | CONFIDENT | JS Cert 11 (no Python analog — see gap note) | OK |
| Comments/formatting/naming conventions | CONFIDENT | Python "Comments & PEP 8"; JS Cert 1 | OK |
| Variable type declarations/casting | CONFIDENT | JS Cert 2/3; Python "Variables & Dynamic Typing" | OK |
| Fixed-length data structures (arrays) | CONFIDENT | JS Cert 4 "Arrays" (no Python analog) | OK |
| User-defined class w/ attributes/constructors/methods | CONFIDENT | `Intermediate_Python` "Classes & `__init__`"; JS Cert 12 | OK |
| Inheritance | CONFIDENT | `Intermediate_Python` "Inheritance & `super()`"; JS Cert 12 | OK |
| Encapsulation | CONFIDENT | JS Cert 12 only (no Python analog) | OK |
| Differentiate programming paradigms | CONFIDENT | **cross-file**: `Basic_SDLC` Mini-Cert 21, not the JS/Python files | OK |
| Compilers vs. interpreters | CONFIDENT | `Basic_SDLC` Mini-Cert 21 | OK |
| File input/output | CONFIDENT | `Intermediate_Python` "Basic File I/O" | OK |
| Four parts of computational thinking (decomposition/abstraction/pattern recognition/algorithm design) | NO MATCH | explicitly named in the standard, absent from every file | OK |
| Sorting algorithms | NO MATCH | — | OK |
| Searching algorithms | NO MATCH | — | OK |
| Memory-management concepts | NO MATCH | — | OK |
| Design patterns (MVC) | NO MATCH | — | OK |
| Composition via UML | NO MATCH | — | OK |
| Overloading | NO MATCH | — | OK |

**Confirmed asymmetry — `Basic_Python.html` stops early**: its 10 topics
(Zen, Variables, Comments, Strings, Int/Float, Booleans, None, Branching,
For Loops, While Loops) end *before* functions. So, entirely within the
mini-cert content itself: no Python proficiency exists for **functions**,
**lists/arrays**, **try/except**, or **using a debugger** — despite
`problem-sets/python/` already having full graded units for exactly these
(Unit 16 Functions, Unit 12 Lists, Unit 17 Try/Except). `Intermediate_
Python.html` then picks back up at Lambda/comprehensions/file-I/O/classes,
leaving a real hole between "While Loops" and "Lambda": no mini-cert for
functions, lists, dicts, strings-in-depth, sets, tuples, try/except, or
scope/globals, even though `problem-sets/python/` teaches all of them
(Units 11-19). Separately, JS's OOP cert (Cert 12) has no polymorphism
skill either (Python has none), and "overriding" only appears indirectly
under Inheritance, not as its own named skill.

| Finding | Change |
|---|---|
| Add a Python mini-cert bridging "While Loops" → "Lambda" (functions, lists, dicts, strings, sets, tuples, try/except, scope) to close the confirmed gap against `problem-sets/python/` Units 11-19 | OK |
| Add a "Polymorphism" skill to `Intermediate_JavaScript` Cert 12 (or a Python equivalent) | OK |

---

## Standard 8: Fundamental Concepts of Web Design and Development — front-end strong, back-end absent

**Front-end:**

| Standard skill (paraphrased) | Match | Mini-cert | Change |
|---|---|---|---|
| Static page w/ current HTML standard | CONFIDENT | `Basic_HTML` (Foundation & Structure, Tag Mastery) | OK |
| CSS selectors (id/class/descendant/sibling/combining) | CONFIDENT | `Basic_CSS` Cert 4 (6 selector-type sub-skills) | OK |
| Forms creation + client-side validation | CONFIDENT | `Intermediate_HTML` "Form Builder Pro" | OK |
| Web media objects | CONFIDENT | `Intermediate_HTML` "Multimedia Integration Expert" | OK |
| DOM manipulation via scripting | CONFIDENT | `Basic_JavaScript` Cert 5 (DOM) | OK |
| Scripting events/handlers | CONFIDENT | `Basic_JavaScript` Cert 6 (Events) | OK |
| Sync/async scripting calls | CONFIDENT | `Intermediate_JavaScript` Cert 13 (Fetch & Async) | OK |
| Front-end toolkit implementation | NO MATCH | — | OK |
| Pseudo-selectors specifically | FLAG | `Basic_CSS` Cert 4 titles don't explicitly name pseudo-selectors — recheck full text in Phase B | OK |
| **Box model manipulation** | **NO MATCH** | not in any `Basic_CSS` cert title — a core CSS topic, missing | OK |
| CSS `position` property | NO MATCH | — | OK |
| Responsive design + media queries | FLAG | `Basic_CSS` "Advanced Layout Techniques" — plausible but not explicit | OK |
| Page-loading-efficiency best practices | NO MATCH | — | OK |
| Cookies (privacy/security) | NO MATCH | — | OK |
| SEO trends | NO MATCH | — | OK |
| JSON data interchange | FLAG | loosely under `Intermediate_JavaScript` "Real-World APIs," not named explicitly | OK |

**Back-end/deployment — essentially all NO MATCH:**

| Standard skill | Match | Mini-cert | Change |
|---|---|---|---|
| Front-end/back-end boundary | FLAG | only via SDLC's Front/Back End Developer *role* descriptions | OK |
| HTTP request methods | NO MATCH | — | OK |
| Server-side form processing | NO MATCH | — | OK |
| Server-side scripting language website | NO MATCH | — | OK |
| Read/write a database from a web page | NO MATCH | — | OK |
| CRUD actions | NO MATCH | — | OK |
| Authentication/authorization | NO MATCH | — | OK |
| E-commerce APIs comparison | NO MATCH | — | OK |
| Website hosting comparison | NO MATCH | — | OK |
| Deploy a website to a server | NO MATCH | — | OK |
| CMS comparison/use | NO MATCH | — | OK |
| Back-end framework comparison/use | NO MATCH | — | OK |

None of this back-end gap is surprising for a front-end-focused high-school
curriculum, but it's worth being explicit that the entire back half of
Standard 8 has zero mini-cert presence today.

---

## Standard 9: Concepts of Project Management — 100% NO MATCH

Recommend a new **Mini-Certificate 24: Project Planning & Management**,
appended to `Basic_SDLC.html`'s existing numbered sequence.

| Standard skill | Match | Notes | Change |
|---|---|---|---|
| Determine project objectives, compose a vision statement | NO MATCH | loosely adjacent to Mini-Cert 9's "influence on project direction" | OK |
| Identify stakeholders and explain their roles | NO MATCH | the 12 role certs describe roles generically, not stakeholder-identification as a practiced skill | OK |
| Consider priorities, estimate solution timeframes | NO MATCH | — | OK |
| Identify/document required technical skills for a project | NO MATCH | — | OK |
| Identify/document required personnel and technology | NO MATCH | — | OK |

## Standard 11: Entrepreneurship — 100% NO MATCH

Recommend a new **Mini-Certificate 25: Entrepreneurship in Software
Development**, appended the same way.

| Standard skill | Match | Notes | Change |
|---|---|---|---|
| Describe roles/responsibilities in a successful software company | NO MATCH | loosely adjacent to the 12 role certs collectively | OK |
| State the value proposition of a software dev professional | NO MATCH | — | OK |
| Compare self-employment vs. W-2 employment | NO MATCH | — | OK |

---

## Bugs & inconsistencies found (confirm before fixing in Phase B)

| # | File | Issue | Change |
|---|---|---|---|
| 1 | `Basic_HTML.html` | Certificate `<div>`s invalidly nested inside each other's closing tags (masked by commented-out CSS) | OK |
| 2 | `Intermediate_HTML.html` | "Key-value vs unary/boolean attributes" reuses the wrong (Basic-level) demo-method checklist instead of its own multimedia-specific one — copy-paste error | OK |
| 3 | `Basic_CSS.html` | Prerequisite numbering off by one in places (e.g. Certificate 2 lists itself as its own prerequisite) | OK |
| 4 | `Basic_CSS.html` | "Choose 3 of N" checkboxes are `disabled` — a student can't check them in-browser. Confirm intentional (e.g. meant to be printed) before changing | OK |
| 5 | `Basic_SDLC.html` / `Intermediate_Python.html` | ~~Reference numbered mini-cert ranges ("Mini-Certificates 1–19," "Teach After: Mini-Cert 17–20") that don't correspond to any real file/section in this repo~~ **FIXED 2026-09-13** as part of the restructuring pass — both dangling references reworded to plain descriptions with no cert numbers | Done |

## Conceptual-overlap redundancy candidates (your call — not auto-merging)

| # | File | Overlap | Change |
|---|---|---|---|
| 1 | `Basic_CSS.html` | "Sibling Relationships" (Cert 3, DOM structure) vs. "Sibling Selectors" (Cert 4, `+`/`~` syntax) — related but arguably distinct | OK |
| 2 | `Basic_JavaScript.html` | "Truthiness" (Cert 8) vs. "Booleans & Logic" (Cert 3) both test falsy-value knowledge | OK |
| 3 | `Intermediate_JavaScript.html` | "Encapsulation" vs. "Classes" (both Cert 12) overlap on class-definition competency | OK |
| 4 | `Intermediate_JavaScript.html` | "Error Handling" vs. "Fetch & Async" (both Cert 13) overlap on network-error handling | OK |
| 5 | `Basic_SDLC.html` | ~~All 12 role certs (9-20) open with an identical "Role Definition" demo item~~ **RESOLVED 2026-09-13** — the restructuring pass dropped the identical "Role Definition" opener entirely; the 10 remaining role competencies now each open with a Phase/Artifacts line and a "Phase Placement" proof item specific to that role instead | Done |

## Reverse check — mini-cert content with no standards-doc analog

| # | Content | Recommendation | Change |
|---|---|---|---|
| 1 | `Basic_Python`'s "Zen of Python & Code Philosophy" | Locally-added enrichment, no standards equivalent — keep as-is | OK |
| 2 | ~~`Basic_SDLC` Mini-Certs 21-23 (Programming Languages / General Purpose Languages / Technology Stacks)~~ **SUPERSEDED 2026-09-13** | No longer in `Basic_SDLC.html` — moved into `Software_Engineering.html`'s "Programming Languages & Technology Stacks" competency (21+22+23 merged into one), where they now do map to Standard 7 (paradigms, compilers vs. interpreters) instead of having no standards analog | Done |
