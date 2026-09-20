# Atomic Skill Decomposition — JS & Python Certs (calibration draft)

Context: this is the working doc for rebuilding the four certs still in the
older "skill heading + 4 demonstration checkboxes" format —
`Basic_JavaScript.html` (8 areas), `Intermediate_JavaScript.html` (7),
`Basic_Python.html` (10), `Intermediate_Python.html` (11) — into the same
atomic, build-ordered, standards-tagged checklist the other certs now use.
Companion to `docs/atomic-skill-decomposition-2026-09-13.md`, same process:
one small calibration slice first, you confirm the style, then I scale to
the rest. **No HTML has been edited for this.** Nothing gets built until
you confirm this doc.

**How to use the `Change` column**: same convention as the other docs —
every row defaults to `OK`. Edit a row to change its wording, mark `drop`
to remove it, or add a row for something missing.

**Rules carried over, confirmed 2026-09-13** (see the earlier doc):
1. Atomic = one unit; split conjunctive lists.
2. Coverage over exhaustiveness — HTML, CSS, JS and Python get the deepest
   decomposition because they get the most instructional time.
3. "Pick one" for long example lists.
4. "Differentiate X/Y/Z" splits into one atomic definition per item plus a
   comparison composite only when each item has standalone depth.

**What's different about these four files**: their current checkboxes are
*demonstration tasks* ("Use `let` and `const` correctly in at least 5
different scenarios"), not skill statements. So this decomposition does two
things the earlier one didn't have to:
- Pulls the **skill** out of each demonstration ("use `let`/`const`
  correctly") and drops the quantity/method wording ("at least 5
  scenarios") — per to-do #3 in the crosswalk doc, that wording moves to
  the bottom "how this is assessed" section instead of sitting next to the
  skill.
- Drops the closing "Overall Competency" block in every area (a summary of
  the items above it, not a skill) and the "Other: ____" filler, same as
  the rebuilt certs.

**Standards refs**: numbered from the DESE `.docx`'s own Skills list.
Standard 7 (Fundamental Concepts of Programming) has 35 skills; the ones
used below are 6 (debugger), 9 (compound conditions), 10 (conditional
branching), 11 (iterative loops), 13 (comments/formatting/naming), 16
(variable type declarations and casting).

---

## Calibration slice 1: `Basic_Python.html` → "Branching (if, elif, else)"

Current: 4 demonstration checkboxes (Simple if, Chained elif, Nested
Conditions, Input Validation).

| # | Type | Skill statement (as it would read on the page) | Standard 7 ref | Change |
|---|---|---|---|---|
| 1 | Atomic | Write an `if` statement that runs code only when its condition is true | Skill 10 (split 1/4) | OK |
| 2 | Atomic | Add an `else` branch that runs when the condition is false | Skill 10 (split 2/4) | OK |
| 3 | Atomic | Add `elif` branches to choose between three or more outcomes | Skill 10 (split 3/4) | OK |
| 4 | Atomic | Explain that Python checks conditions from top to bottom and runs only the first branch that is true | *(new — the rule students most often get wrong)* | OK |
| 5 | Atomic | Nest one `if` inside another and explain how indentation shows which block a line belongs to | Skill 10 (split 4/4) | OK |
| 6 | **Composite** | Categorize data with `if`/`elif`/`else` (e.g. numeric score → letter grade) — combines rows 1–4 | Skill 10 | OK |
| 7 | **Composite** | Build a 2-level decision tree (e.g. "Is adult? → Has license?") — combines rows 1–2, 5 | Skill 10 | OK |
| 8 | **Composite** | Prompt for input and use `if` to reject invalid values (e.g. negative numbers) — combines rows 1–2 | Skill 10 | OK |

Net: 5 atomic + 3 composite = 8 items, up from 4.

Notes:
- Comparison operators (`==`, `<`, `>=`) and `and`/`or`/`not` aren't
  re-listed here — `Booleans & Truthiness` already teaches them and comes
  first in the file. Flag if you want them repeated.
- The "Validation" idea overlaps `While Loops` → "Validation Loop"; row 8
  is the single-check version, that one is the keep-asking version, so
  they stay separate.

## Calibration slice 2: `Basic_Python.html` → "For Loops"

Current: 4 demonstration checkboxes (Loop Over List, Loop Over String,
range() Proficiency, Loop with enumerate()).

| # | Type | Skill statement | Standard 7 ref | Change |
|---|---|---|---|---|
| 1 | Atomic | Write a `for` loop that runs its body once for each item in a list | Skill 11 | OK |
| 2 | Atomic | Explain what the loop variable holds on each pass through the loop | *(new — foundation for the rows below)* | OK |
| 3 | Atomic | Write a `for` loop that goes through the characters of a string | Skill 11 | OK |
| 4 | Atomic | Use `range(stop)` to repeat something a set number of times | Skill 11 (split 1/3) | OK |
| 5 | Atomic | Use `range(start, stop)` to loop over a chosen span of numbers | Skill 11 (split 2/3) | OK |
| 6 | Atomic | Use `range(start, stop, step)` to skip numbers (e.g. even numbers 0–20) | Skill 11 (split 3/3) | OK |
| 7 | Atomic | Use `enumerate()` to get both the index and the value while looping | Skill 11 | OK |
| 8 | **Composite** | Count the vowels in a word — combines rows 3 and the `if` items from Branching | Skill 11 | OK |

Net: 7 atomic + 1 composite = 8 items, up from 4.

Judgment call, rows 4–6: `range()` has 3 forms. Split into 3 because
Python gets deep decomposition under rule 2 and each form is a different
thing to learn — say so if you'd rather have one row.

## Calibration slice 3: `Basic_JavaScript.html` → "Variables & Data Storage"

Current: 4 sub-areas × 4 demonstration checkboxes = 16 + 4 "Other" + 4
"Overall Competency" lines. This is the richest of the three slices —
it mixes real skills with demonstration methods and one item that belongs
in a different area.

| # | Type | Skill statement | Standard 7 ref | Change |
|---|---|---|---|---|
| 1 | Atomic | Declare a variable with `let` and reassign its value | Skill 16 (split 1/3) | OK |
| 2 | Atomic | Declare a constant with `const` and explain why it can't be reassigned | Skill 16 (split 2/3) | OK |
| 3 | Atomic | Describe what `var` does and why modern code avoids it | Skill 16 (split 3/3) | OK |
| 4 | Atomic | Convert legacy `var` declarations to `let` or `const` | Skill 16 | OK |
| 5 | Atomic | Choose between `let` and `const`: use `const` by default, `let` only when the value changes | Skill 16 *(merges the "Best Practices" item)* | OK |
| 6 | Atomic | Store a simple value (number, string, boolean) in a variable and explain what the variable now holds | Skill 16 *(replaces "demonstrate memory assignment")* | OK |
| 7 | Atomic | Name variables in camelCase with meaningful names | Skill 13 | OK |
| 8 | Atomic | Comment a variable to explain its purpose | Skill 13 | OK |
| 9 | Atomic | Declare variables at the top of their scope | Skill 13 | OK |
| 10 | Atomic | Define block scope and show it with `let` and `const` inside nested blocks | *(existing — no DESE skill number)* | OK |
| 11 | Atomic | Diagram the scope boundaries of a multi-level function | *(existing)* | OK |
| 12 | Atomic | Explain hoisting and why it is a reason to avoid `var` | *(existing)* | OK |
| 13 | Atomic | Explain why declaring variables in the global scope causes problems, and how to avoid it | *(existing, "avoid global pollution")* | OK |
| 14 | Atomic | Use `console.log()` to follow a variable's value as a program runs | Skill 6 *(closest match — console.log isn't literally a debugger)* | OK |
| 15 | Atomic | Identify and fix a "variable is not defined" error | Skill 6 | OK |
| 16 | **Composite** | Find and fix scope-related bugs in provided code — combines rows 10–13, 15 | *(existing)* | OK |

**Moved out, not dropped:**
- *"Explain why two variables might reference the same object"* → belongs
  in `Complex Data Types` → "Mutability & References", where it already
  has a sibling. I'll place it there when that area is decomposed.
- *"Peer-review another student's variable usage"* → a demonstration
  method, not a skill. Goes to the bottom assessment section.

Net: 15 atomic + 1 composite = 16 items, up from 16 demonstrations —
same count, but every line is now a skill instead of a task, and one is
relocated.

## Calibration slice 4: `Basic_Python.html` → "The Zen of Python & Code Philosophy"

Current: 4 checkboxes that are all *ways to prove competency* (recite,
explain 8, write code for each of 8, refactor with 5) — rewritten here as
the skills those tasks were meant to prove. The Zen has no DESE skill
number (the crosswalk's reverse check already logged it as locally added
enrichment), so no standards tag on these rows.

| # | Type | Skill statement | Standard 7 ref | Change |
|---|---|---|---|---|
| 1 | Atomic | Run `import this` in the Python interpreter and describe what it prints (the Zen of Python: guiding principles for writing Python code) | *(local enrichment — no DESE skill)* | OK |
| 2 | Atomic (pick-one) | Choose **one** Zen principle (e.g. "Simple is better than complex") and explain in your own words what it means for code | *(same)* | OK |
| 3 | Atomic | Write a short piece of code that follows your chosen principle | *(same)* | OK |
| 4 | Atomic | Write a short piece of code that breaks the same principle, and explain what makes it worse | *(same)* | OK |
| 5 | **Composite** | Refactor a poorly written script to follow the Zen principles it breaks, noting which principle each change applies — combines rows 2–4 | *(same)* | OK |

Net: 4 atomic + 1 composite = 5 items, up from 4.

Notes:
- **Dropped: "transcribe all 19 principles accurately."** Copying out
  text from `import this` is memorization, not a skill; row 1 keeps the
  useful part (knowing what `import this` is and where the principles
  live).
- **Judgment call, row 2:** the old version had students explain 8
  principles with 8 code pairs. Under rule 3 (pick one) and rule 2 (the
  Zen is enrichment, not a heavily-practiced subject), I collapsed that to
  one principle. Alternative: name 2–3 specific principles as their own
  rows ("Simple is better than complex," "Readability counts," "Explicit
  is better than implicit") — say so if you want that instead.
- **Tension to check, row 5:** the refactor now says "the principles it
  breaks" rather than "at least 5," so a student who learned one principle
  isn't asked to apply five they never studied. If you want a minimum
  number, that goes in the bottom assessment section.

## Calibration slice 5: `Basic_Python.html` → "Variables & Dynamic Typing"

Current: 4 checkboxes that are all *proof tasks* (declare & reassign, type
inspection lab, naming practice, dynamic behavior demo). This is Python's
version of Standard 7, Skill 16 (variable type declarations) plus Skill 13
(naming conventions).

| # | Type | Skill statement | Standard 7 ref | Change |
|---|---|---|---|---|
| 1 | Atomic | Create a variable by assigning a value to a name (Python needs no type declaration) | Skill 16 (split 1/5) | OK |
| 2 | Atomic | Reassign a variable to a value of a different type (e.g. int → str → list → bool) | Skill 16 (split 2/5) | OK |
| 3 | Atomic | Explain why Python allows this: the type belongs to the value, not the variable (dynamic typing) | Skill 16 (split 3/5) | OK |
| 4 | Atomic | Use `type()` to find the type of a value or variable | Skill 16 (split 4/5) | OK |
| 5 | Atomic | Use `isinstance()` to check whether a value is of a given type | Skill 16 (split 5/5) | OK |
| 6 | Atomic | Name variables in `snake_case` | Skill 13 (split 1/2) | OK |
| 7 | Atomic | State the rules for a valid variable name (letters, digits, underscores; can't start with a digit; can't be a Python keyword) and spot invalid names such as `class` or `1var` | Skill 13 (split 2/2) | OK |
| 8 | **Composite** | Write a function that accepts a value of any type and reports its type — combines rows 3–5 | Skill 16 | OK |

Net: 7 atomic + 1 composite = 8 items, up from 4.

Notes:
- Row 3 is split from row 2 on purpose: *doing* a reassignment and
  *explaining why it's allowed* are two separately checkable abilities
  (same pattern as define-vs-demonstrate elsewhere in the other doc).
- Row 7 bundles the naming rules into one item as a rule-1 judgment call:
  they're facets of one thing (what makes a name legal), not separately
  practiced skills, the same reasoning used for UX personas and project
  stakeholders. Say so if you'd rather split them.
- Type *casting* (`int()`, `float()`, `str()`) is deliberately left out
  here — it lives in `Integers & Floats` → "Number Method Proficiency,"
  which comes later in the same file.
- **Dropped from the old text:** counts ("10+ scenarios," "10 variables")
  and the "proving dynamic typing in action" framing — both are
  demonstration wording that moves to the bottom assessment section.

---

## Questions for you before I scale to the rest

1. **Is the rewording style right?** Skill statements now state the
   ability ("Use `range(start, stop)` to…") and drop counts like "8+
   examples" — those go to the bottom assessment section. This is the one
   change that alters what students read on every line.
2. **Known content gap, not addressed here**: `Basic_Python` stops before
   functions, lists, dicts, try/except and scope — despite
   `problem-sets/python/` teaching them. The crosswalk logged a bridging
   cert as `OK` but it was never built. Add it as part of this pass, or
   keep this pass to rebuilding what exists?
3. **Mixed-in demonstration methods**: items like "Record a peer
   explanation" or "Reflect in a journal" (Basic JS's Learning &
   Communication sub-area) aren't skills. I'd move them all to the bottom
   section. OK?
4. **Order of work** once this is confirmed: Basic_Python → Intermediate_
   Python → Basic_JavaScript → Intermediate_JavaScript, one file at a time
   with a doc section each for your review — or all four at once?
