# Atomic Skill Decomposition — Working Doc

Context: this is the working doc for decomposing the 5 new certs
(`Basic_SDLC.html`, `Basic_ITFundamentals.html`,
`UX_Usability_Accessibility.html`, `Software_Engineering.html`,
`Project_Management.html`) from "competency area" grain down to the
atomic, build-ordered, standards-tagged checklist grain that to-do #3 in
`docs/skills-standards-crosswalk-2026-09-13.md` now requires. See that
doc's to-do #3 for the full spec, and the plan at
`/Users/151814/.claude/plans/prancy-stirring-shamir.md` for the process
this doc follows: one small calibration area first, confirm the style,
then scale to the rest.

**How to use the `Change` column**: same convention as the crosswalk doc
— every row defaults to `OK`. Edit a row to change its wording, mark
`drop` to remove it, or add a new row for something missing.

**Source for standards-ref numbers**: `mini-certs/web-development-
standards-skills.docx`'s own numbered "Skills:" list per standard — not
this doc's own earlier summarized "skill group" table, which collapsed
multiple official skills into one row. Standard 3 has 26 skills in the
source document; this decomposition uses their exact wording (lightly
trimmed for a student-facing checklist), not a paraphrase, and numbers
them 1–26 in the order the source document lists them.

## General rules, confirmed by the user during calibration — apply to all future decomposition

1. **Atomic means one unit.** Wherever a source skill statement lists two
   or more distinct things (identification/authentication/authorization;
   cryptography/cryptanalysis), each gets its own row — don't bundle a
   conjunctive list into one checklist item.
2. **Coverage over exhaustiveness.** ~1000 instructional hours across 4
   years of high school means this can't be maximally granular
   everywhere — some subjects get much deeper decomposition than others
   because they get much more instructional time and hands-on practice
   (HTML, CSS, Python). A survey-level area (like IT Fundamentals) should
   go deep enough to be genuinely checkable, not as deep as a subject
   students spend a whole course on.
3. **"Pick one" is a third valid pattern, distinct from splitting or
   bundling.** For a long example-heavy list where full coverage of every
   example isn't the point (e.g. 8 named server-side networking
   components), the right move is neither 8 separate rows nor one vague
   bundled line — it's one row that explicitly says "pick **one** of the
   following" (worded that way on the page, not just implied by using
   the article "a"). Rule 1 (atomic = one unit) still holds: the "one
   unit" here is "pick and know one example," not "know all N."

Rules 1 and 2 can pull in different directions on a given list (a
2–3-item list almost always splits under rule 1; an 8-item list is where
rule 2's time-budget concern kicks in and rule 3's pick-one pattern is
usually the answer) — when genuinely unsure which applies, ask rather
than guess, the way row 21 below got resolved.

---

## Step 1 (calibration): `Basic_ITFundamentals.html` → "Cybersecurity & Networking"

**Revision 3**, incorporating your round-2 edits. What changed and why:
- **Access control (old Skill 6) split into 3** — identification,
  authentication, authorization each get their own line instead of one
  bundled parenthetical.
- **Cryptography definitions corrected and split into 2, not 3** —
  confirmed your understanding is accurate: cryptology is the umbrella
  field, cryptography is building codes/ciphers, cryptanalysis is
  breaking them without the key. Dropped "cryptology" as its own item
  (it's the umbrella term, not a separately practiced skill) — kept
  cryptography and cryptanalysis as the two real, distinct abilities.
- **Penetration testing reworded singular** — "a penetration testing
  method," not "methods" (plural scope softened to one concrete thing).
- **3 new items added for LAN/MAN/WAN**, each with "and where it's
  typically found" per your note — and this one isn't invented: the
  source docx's own Standard 3 sample performance tasks literally list
  "explain the different network classifications and terms such as LAN,
  MAN, WAN, and clouds," so this was already implied by the source
  material, just not surfaced in the original skill-group summary.
- **Server-side networking component reworded singular** — "a
  server-side networking component," matching the same singular-framing
  preference as the pen-testing edit. Flagging my interpretation
  explicitly: I read this as a wording change only, not a request to
  split the 8 listed components (firewalls, DNS, VPN, proxy, DHCP, FTP,
  DC, AD) into 8 separate rows the way access control got split into 3 —
  say so if you actually want that split too.

Net: 20 atomic + 2 composite = 22 items, vs. revision 2's 16 — growth is
real, not padding: 2 splits (access control ×3, crypto ×2) and 3 new
LAN/MAN/WAN items account for all of it.

| # | Type | Skill statement (as it would read on the page) | Standard 3 ref | Change |
|---|---|---|---|---|
| — | *(section lead-in, not a checklist row)* | *"Research and identify cybersecurity topics."* | Skill 1 | OK |
| 1 | Atomic | Identify application-level security vulnerabilities and threats | Skill 2 (expanded) | OK |
| 2 | Atomic | Identify server-level security vulnerabilities and threats | Skill 3 (expanded) | OK |
| 3 | Atomic | Identify OS-level security vulnerabilities and threats | Skill 2+3 (expanded) | OK |
| 4 | Atomic | Explain the CIA triad (Confidentiality, Integrity, Availability) | Skill 5 | OK |
| 5 | Atomic | Identify the components of a threat map and what it shows | *(new precedent)* | OK |
| 6 | Atomic | Create a simple threat map for a given scenario | *(new precedent)* | OK |
| 7 | Atomic | Analyze a threat map to identify cyberattack targets and origins | Skill 4 | OK |
| 8 | Atomic | Define identification as a component of access control | Skill 6 (split 1/3) | OK |
| 9 | Atomic | Define authentication as a component of access control | Skill 6 (split 2/3) | OK |
| 10 | Atomic | Define authorization as a component of access control | Skill 6 (split 3/3) | OK |
| 11 | Atomic | Demonstrate a basic cryptography task, such as encrypting and decrypting a message | Skill 7 (split 1/3) | OK |
| 12 | Atomic | Define cryptography as the methods used to encode and protect information | Skill 7 (split 2/3) | OK |
| 13 | Atomic | Define cryptanalysis as the methods used to decode information without the key | Skill 7 (split 3/3) | OK |
| 14 | Atomic | Research and describe a penetration testing method in the context of ethical hacking | Skill 8 (reworded) | OK |
| 15 | **Composite** | Create a presentation outlining common network vulnerabilities (cyberattacks, identity theft, privacy) and their associated responses — combines rows 1–14 | *(sample performance task, Standard 3)* | OK |
| — | *(section lead-in, not a checklist row)* | *"Explain concepts fundamental to networking."* | Skill 11 | OK |
| 16 | Atomic | Describe the purpose of a network and the functions of its hardware components | Skill 12 | OK |
| 17 | Atomic | Describe a Local Area Network (LAN) and where it's typically found | *(new, grounded in a Standard 3 sample task)* | OK |
| 18 | Atomic | Describe a Metropolitan Area Network (MAN) and where it's typically found | *(new, same source)* | OK |
| 19 | Atomic | Describe a Wide Area Network (WAN) and where it's typically found | *(new, same source)* | OK |
| 20 | Atomic | Explain cloud computing, and how network topologies and protocols let users, devices, and systems communicate | Skill 13 | OK |
| 21 | Atomic (pick-one) | Research and identify **one** server-side networking component of your choice (e.g. firewall, DNS, VPN, proxy, DHCP, FTP, DC, or AD) and explain its purpose | Skill 14 (reworded) | OK |
| 22 | **Composite** | Create a presentation outlining the issues (latency, bandwidth, firewalls, server capability) that impact network functionality — combines rows 16–21 | *(sample performance task, Standard 3)* | OK |

**Build-order note**: rows 17–19 (LAN/MAN/WAN) placed right after row 16
(network purpose + hardware) and before row 20 (cloud computing) — network
classifications before the cloud-specific case, same "concrete before
abstract" logic as elsewhere. Still open from revision 2: whether rows
1–3 (vulnerability levels) should come before or after row 4 (CIA
triad) — no steer from you yet, left as-is.

---

## Step 2 (style-check on a different file): `Software_Engineering.html` → "CI/CD"

Deliberately a different kind of test case than Step 1: Standard 5 gives
this area exactly **one** numbered skill — "Describe the purpose of
Continuous Integration and Continuous Deployment (CI/CD)" — versus
Cybersecurity & Networking's 13. So this checks whether the rules hold up
when the source is *thin* and I have to responsibly expand it, not just
reorganize an already-rich list.

**Applying rule 1 immediately**: that one source sentence is itself a
2-item list — "Continuous Integration **and** Continuous Deployment" —
same shape as the CIA-triad/access-control pattern from Step 1. Splits
into 2 atomic items.

**Applying rule 2**: this is a conceptual/survey area (Software
Engineering isn't a dedicated hands-on practice course the way HTML/CSS/
Python are), so I'm not inventing a deep multi-step CI/CD curriculum —
just the 2 atomic definitions plus 2 composite items that already existed
in the file's current (pre-decomposition) proof list, which turn out to
naturally fit the composite slot: they both require understanding *both*
CI and CD to actually do.

| # | Type | Skill statement (as it would read on the page) | Standard 5 ref | Change |
|---|---|---|---|---|
| 1 | Atomic | Define Continuous Integration (CI) and explain why teams automate it | Skill 19 (split 1/2) | OK |
| 2 | Atomic | Define Continuous Deployment (CD) and explain why teams automate it | Skill 19 (split 2/2) | OK |
| 3 | **Composite** | Diagram a CI/CD pipeline showing code commit → build → automated test → deployment — combines rows 1–2 | *(already in the file's current proof list)* | OK |
| 4 | **Composite** | Explain what should happen to a deployment when an automated test in the pipeline fails, and why that matters — combines rows 1–3 | *(already in the file's current proof list)* | OK |

Net: 2 atomic + 2 composite = 4 items, up from the file's current 3
bundled items — a small, proportionate growth, consistent with rule 2
(this shouldn't balloon the way a richer area like Cybersecurity &
Networking did).

**Style confirmed ("perfect") — proceeding to Step 3: scaling.** Starting
with finishing the file already in progress before moving to the next
one, per the plan's "file by file" batching.

---

## Step 3: scaling — `Basic_ITFundamentals.html`, remaining 2 areas

Two new judgment-call patterns surfaced in this batch that Steps 1–2
didn't test — flagged inline and summarized at the end, since they'll
recur across the rest of the work and are worth confirming now rather
than repeating an unconfirmed guess ~30 more times.

### "Hardware & Operating Systems" (Standard 3, Skills 9–10 + 16–21)

**Revision 2**: CLI vs. GUI now gets the same 3-row treatment as desktop/
server/mobile OS, per your confirmed rule — split whenever each item has
enough standalone depth to teach separately, and you judged CLI/GUI does.

| # | Type | Skill statement | Standard 3 ref | Change |
|---|---|---|---|---|
| 1 | Atomic | Classify hardware components by function (CPU, RAM, storage, I/O devices, etc.) | Skill 9 (split 1/2) | OK |
| 2 | Atomic | Explain how hardware components relate to each other in a computer system | Skill 9 (split 2/2) | OK |
| 3 | **Composite (pick-one)** | Research and present the hardware requirements for **one** specific software application area of your choice (e.g. AI, Big Data, Cybersecurity, Game Development, Cloud Technology, Robotics, IoT, Blockchain, or Extended Reality) — combines rows 1–2 | *(Standard 3 sample task; also uses the pick-one pattern)* | OK |
| 4 | Atomic | Demonstrate programming a physical computing device (e.g. a microcontroller) | Skill 10 | OK |
| 5 | Atomic | Describe the purpose of an operating system | Skill 16 | OK |
| 6 | Atomic | Describe what a desktop operating system is, with a typical example | Skill 17 (split 1/3) | OK |
| 7 | Atomic | Describe what a server operating system is, with a typical example | Skill 17 (split 2/3) | OK |
| 8 | Atomic | Describe what a mobile device operating system is, with a typical example | Skill 17 (split 3/3) | OK |
| 9 | **Composite** | Differentiate between desktop, server, and mobile operating systems — combines rows 6–8 | Skill 17 | OK |
| 10 | Atomic | Describe what a Command Line Interface (CLI) is | Skill 18 (split 1/3) | OK |
| 11 | Atomic | Describe what a Graphical User Interface (GUI) is | Skill 18 (split 2/3) | OK |
| 12 | **Composite** | Differentiate between a Command Line Interface and a Graphical User Interface — combines rows 10–11 | Skill 18 (split 3/3) | OK |
| 13 | Atomic | Navigate a file system at the Command Line Interface | Skill 19 | OK |
| 14 | Atomic | Identify the content associated with different file types, and why different file types exist | Skill 20 | OK |
| 15 | Atomic (pick-one) | Research and describe **one** lossy compression algorithm of your choice (e.g. JPEG, MP3) and how it works | Skill 21 (split 1/3) | OK |
| 16 | Atomic (pick-one) | Research and describe **one** lossless compression algorithm of your choice (e.g. ZIP, PNG) and how it works | Skill 21 (split 2/3) | OK |
| 17 | **Composite** | Compare your chosen lossy and lossless algorithms, explaining which contexts each is better suited for — combines rows 15–16 | Skill 21 (split 3/3) | OK |

**Rule confirmed, now general**: "differentiate between X/Y/Z" splits
into one atomic definition per item plus a comparison composite **only
when each item has real standalone depth to teach separately** — not
automatically at 3+ items. Desktop/server/mobile OS and CLI/GUI both
qualify (confirmed by you). Applies going forward without re-asking
each time, unless a specific case seems genuinely borderline.

### "Data Management & Databases" (Standard 3, Skills 22–26 + NoSQL)

| # | Type | Skill statement | Standard 3 ref | Change |
|---|---|---|---|---|
| 1 | Atomic | Research and identify data management concepts, and explain the purpose of data management systems | Skill 22 | OK |
| 2 | Atomic | Plan a relational database for a given scenario | Skill 23 (split 1/3) | OK |
| 3 | Atomic | Design a relational database (create an ER diagram with tables, keys, and relationships) | Skill 23 (split 2/3) | OK |
| 4 | Atomic | Explain how a relational database's schema is implemented from its design (e.g. using SQL) | Skill 23 (split 3/3, reworded conceptual) | OK |
| 5 | Atomic | Describe a one-to-one table relationship | Skill 24 (split 1/2) | OK |
| 6 | Atomic | Describe a one-to-many table relationship | Skill 24 (split 2/2) | OK |
| 7 | Atomic | Explain the purpose of data analysis | Skill 25 | OK |
| 8 | Atomic | Create database queries | Skill 26 (split 1/3) | OK |
| 9 | Atomic | Generate a data report from a database | Skill 26 (split 2/3) | OK |
| 10 | Atomic | Create a data visualization from a database | Skill 26 (split 3/3) | OK |
| 11 | **Composite** | Explain how planning, design, and implementation come together to produce a working relational database — combines rows 2–4 | Skill 23 | OK |
| 12 | Atomic | Explain what a NoSQL database is and how it differs from a relational database | *(new — your "add NoSQL" call)* | OK |
| 13 | **Composite** | Compare when you'd choose a relational vs. a NoSQL database for a given scenario — combines rows 2–4, 12 | *(new)* | OK |

**Revision 2**: rows 4 and 11 reworded from "demonstrate/create" to
"explain/describe" — confirmed this cert stays conceptual for databases,
no hands-on build requirement. Row 11's composite dropped "and use" from
its scope entirely (not "how would this be demonstrated" — "use" isn't a
requirement here at all).

**One thing I inferred rather than confirmed**: rows 8–10 (queries,
reports, visualization) are still worded as hands-on ("create,"
"generate") — I left them that way since they're a separate DESE skill
(26, not 23) and reading a query/report *can* work against a pre-built
sample database without requiring the student to have built one
themselves. Flag if the conceptual-only call should extend to these too.

**Row 5–6 scope note**: Skill 24 says "relationships such as one-to-one
and one-to-many" — "such as" signals examples, not an exhaustive list.
I split the 2 named types (rows 5–6) but didn't add "many-to-many" even
though it's the natural third type, per rule 2 (don't pad beyond what the
source names) — flag if you want it added anyway.

Net for this file: 17 + 13 = 30 items across these 2 areas, plus the 22
from Cybersecurity & Networking = **52 items total for
`Basic_ITFundamentals.html`**, up from its current 3 bundled competency
areas (20 checkbox elements today, including the 3 "Other: ___" filler
lines — 17 real bundled skill items).

---

## Step 3 continued: `UX_Usability_Accessibility.html`, all 3 areas

Standard 6's actual "Skills:" list has 12 numbered items (pulled directly
from the docx, not the earlier skill-group summary). Mapped: Skill 7 →
Usability Testing; Skills 1–2 → Accessibility; the rest → UX/UI Design.

### "Usability Testing" (Standard 6, Skill 7)

**Revision 2**: dropped user observation and heuristic evaluation, swapped
user interview for card sort — narrower list of 3 methodologies now
(usability test, card sort, contextual inquiry).

| # | Type | Skill statement | Standard 6 ref | Change |
|---|---|---|---|---|
| 1 | Atomic | Describe what a usability test is | Skill 7 | OK |
| 2 | Atomic | Describe what a card sort is (users organize content into categories to reveal how they mentally group it) | *(replaces "user interview" — not literally in Skill 7's "such as" list, but that list isn't exhaustive)* | OK |
| 3 | Atomic | Describe what a contextual inquiry is | Skill 7 | OK |
| 4 | **Composite** | Conduct a simple usability test on a real page and write a report identifying the issues found — combines rows 1–3 | *(existing file content)* | OK |

### "UX/UI Design" (Standard 6, Skills 3–6, 8–12)

The largest of the 3 areas — Standard 6 bundles a lot into few lines
here. Two judgment calls flagged below rather than silently resolved.

**Revision 2**: dropped the UX-models row entirely; consolidated the
5-way feedback split (rows 5–9) into one reasoning-style item per your
wording; dropped the "feedback as design principle" row since the new
consolidated item already covers it — resolves the overlap flagged
below the original table.

| # | Type | Skill statement | Standard 6 ref | Change |
|---|---|---|---|---|
| 1 | Atomic | Explain the difference between UX (user experience) and UI (user interface) design | *(existing, foundational vocabulary, not DESE-numbered)* | OK |
| 2 | Atomic | Document a target user's goals, needs, behaviors, and preferences | Skill 3 (kept bundled — see note) | OK |
| 3 | Atomic | Create a user persona based on demographic research and an identified user type | Skill 4 (kept bundled — see note) | OK |
| 4 | Atomic | Give three reasons why user feedback displayed in a GUI/application makes the application more usable | Skill 6 (consolidated, replaces the old 5-way split) | OK |
| 5 | Atomic (pick-one) | Describe design considerations for **one** display form factor of your choice (e.g. desktop, tablet, mobile) | Skill 8 | OK |
| 6 | Atomic (pick-one) | Define **one** user interface modality of your choice (e.g. graphical, voice, touch, gesture) and give an example | Skill 9 | OK |
| 7 | Atomic | Define **consistency** as a design principle | *(existing)* | OK |
| 8 | Atomic | Define **visual hierarchy** as a design principle | *(existing)* | OK |
| 9 | **Composite** | Apply consistency and hierarchy principles to improve a poorly designed interface — combines rows 7–8 | *(existing, "feedback" removed from scope — now covered by row 4)* | OK |
| 10 | Atomic | Create a simplified interface layout (a wireframe) for part of a software application using a graphic design tool | Skill 10 | OK |
| 11 | Atomic | Build a storyboard of the user interface for a software application | Skill 11 | OK |
| 12 | **Composite** | Create a prototype from your interface layout and storyboard — combines rows 10–11 | Skill 12 | OK |

**Judgment call, rows 2–3, still open**: Skills 3 ("goals, needs,
behaviors, and preferences") and 4 ("personas, demographics, and user
types") are each conjunctive lists like the ones rule 1 usually splits —
kept bundled as one item each since they read as facets of one
research-documentation act, not separately practiced skills. Not
addressed in your edits this round, so still flagging in case you want
them split for consistency with how the old feedback rows were handled.

### "Accessibility" (Standard 6, Skills 1–2 + existing file content)

Skill 2 ("research and identify methods for implementing software
accessibility") reads the same way Skills 1/11 did in Standard 3 — a
section-header sentence, not a standalone atomic skill, since the actual
"methods" *are* rows 2–6 below. Treated as a lead-in, not a checklist
row, same as that precedent.

| # | Type | Skill statement | Standard 6 ref | Change |
|---|---|---|---|---|
| 1 | Atomic | Research and identify at least 2 reasons why making software accessible matters | Skill 1 | OK |
| — | *(section lead-in, not a checklist row)* | *"Research and identify methods for implementing software accessibility."* | Skill 2 | OK |
| 2 | Atomic | Define WCAG (Web Content Accessibility Guidelines) and its levels (A, AA, AAA) | *(existing)* | OK |
| 3 | Atomic | Check the color contrast ratio of a page using a contrast checker, and fix a failing text/background pair | *(existing)* | OK |
| 4 | Atomic | Write HTML that a screen reader can navigate meaningfully (semantic tags, alt text, labeled form fields) | *(existing)* | OK |
| 5 | Atomic | Define what an ARIA role is | *(existing, split 1/2)* | OK |
| 6 | Atomic | Add an appropriate ARIA attribute to a page and explain what it communicates to assistive technology | *(existing, split 2/2)* | OK |
| 7 | **Composite** | Run an accessibility checker (e.g. Buddy or WAVE) on a real page and document what it flagged and how you'd fix it — combines rows 2–6 | *(existing)* | OK |

Net for this file: 4 (Usability Testing) + 12 (UX/UI Design) + 7
(Accessibility) = **23 items total for `UX_Usability_Accessibility.html`**,
up from its current 3 bundled competency areas (15 checkbox elements
today, including 3 "Other: ___" lines — 12 real bundled skill items).

---

## Step 3 continued: `Software_Engineering.html`, remaining 5 areas

(CI/CD already done in Step 2, 4 items.) Standard 7's relevant numbered
skills for this file: Skill 14 (paradigms), Skill 15 (compiled vs.
interpreted), Skill 25 (design patterns "such as MVC"), Skill 29
(composition via UML). Standard 5's Skill 17 covers version control.
Multi-Tiered Design, Cross-Cutting Concerns, and most of the language/
stack content aren't tied to specific DESE skill numbers — same
"enrichment beyond the literal standard" status the original crosswalk
already flagged for this content.

### "Multi-Tiered & Distributed Design" (enrichment, no DESE skill numbers)

| # | Type | Skill statement | Ref | Change |
|---|---|---|---|---|
| 1 | Atomic | Define monolithic architecture and give 2 real-world examples | *(existing)* | OK |
| 2 | Atomic | Define 3-tier architecture (presentation, business logic, data access) and diagram it | *(existing, split 1/2)* | OK |
| 3 | Atomic | Explain how 3-tier architecture extends to N-tier | *(existing, split 2/2)* | OK |
| 4 | Atomic | Define microservices architecture and diagram independent services communicating via APIs | *(existing, split 1/2)* | OK |
| 5 | Atomic | Explain how microservices leverage cloud infrastructure for scalability | *(existing, split 2/2)* | OK |
| 6 | **Composite** | Compare monolithic, tiered, and microservices architectures across scalability, complexity, and deployment, and recommend one for a given scenario — combines rows 1–5 | *(existing)* | OK |

### "Design Patterns" (Standard 7, Skill 25 + Skill 29 added)

Adding row 5 (UML composition) closes a real gap — "Composition via UML"
was still NOT COVERED in the DESE coverage metric before this. It fits
here thematically (both are about describing software structure).

| # | Type | Skill statement | Standard 7 ref | Change |
|---|---|---|---|---|
| 1 | Atomic | Define Model-View-Controller (MVC) and diagram how it separates data, display, and logic | Skill 25 | OK |
| 2 | Atomic | Define Model-View-ViewModel (MVVM) and explain how it differs from MVC | Skill 25 ("such as" extension) | OK |
| 3 | Atomic | Define the component-based design pattern (self-contained, reusable pieces) | Skill 25 ("such as" extension) | OK |
| 4 | **Composite** | Find three common frameworks and identify what design patterns they use — combines rows 1–3 | *(existing, reworded per your request — reframed from abstract comparison to identifying patterns in real frameworks)* | OK |
| 5 | Atomic | Draw a simple UML diagram showing how one class is composed of others | Skill 29 (**new — closes a previously open DESE gap**) | OK |

### "Cross-Cutting Concerns" (enrichment, no DESE skill number)

**Revision 2**: reduced from 6 to 3 concerns (proportionality), and
dropped the composite — kept as 3 atomic items only.

| # | Type | Skill statement | Ref | Change |
|---|---|---|---|---|
| 1 | Atomic | List and define at least 3 cross-cutting concerns (security, logging, error handling, etc.) | *(existing, reduced from 6)* | OK |
| 2 | Atomic | Explain how a cross-cutting concern affects multiple parts of a system rather than living in one place | *(existing)* | OK |
| 3 | Atomic | Research and explain 2 approaches to handling cross-cutting concerns (middleware, service layers, aspect-oriented patterns) | *(existing)* | OK |

### "Programming Languages & Technology Stacks" (Standard 7, Skills 14–15 + enrichment)

**Revision 2**: dropped the compiled-vs-interpreted composite entirely —
you're right that the binary gets blurry with modern languages (JIT
compilation, bytecode-then-interpreted languages like Java/Python don't
cleanly sort into either bucket), so a "compare and explain performance
implications" task oversimplifies. Kept the 2 definitions as standalone
atomics without forcing a comparison. Also reduced general-purpose
language count from 5 to 3, and the earlier reduction from "at least 7"
to that number stands (now 3, not 5).

| # | Type | Skill statement | Standard 7 ref | Change |
|---|---|---|---|---|
| 1 | Atomic | Define procedural programming, with a code example | Skill 14 (split 1/4) | OK |
| 2 | Atomic | Define object-oriented programming (OOP), with a code example | Skill 14 (split 2/4) | OK |
| 3 | Atomic | Define functional programming, with a code example | Skill 14 (split 3/4) | OK |
| 4 | Atomic | Define declarative programming, with a code example | Skill 14 (split 4/4) | OK |
| 5 | **Composite** | Identify a hybrid language that combines multiple paradigms, and explain which ones — combines rows 1–4 | Skill 14 | OK |
| 6 | Atomic | Define a compiled language, with 2 examples | Skill 15 (split 1/2) | OK |
| 7 | Atomic | Define an interpreted language, with 2 examples | Skill 15 (split 2/2) | OK |
| 8 | Atomic | Identify at least 3 general-purpose programming languages and their typical use cases | *(existing, reduced from 7 → 5 → 3)* | OK |
| 9 | Atomic | Explain SQL as an example of a domain-specific language (DSL) | *(existing, split out of the language-landscape item)* | OK |
| 10 | Atomic (pick-one) | Explain the components of **one** named technology stack of your choice (e.g. LAMP, MEAN/MERN, a Java/Spring or .NET stack) | *(existing, reduced from "at least 3" — see note)* | OK |

### "Version Control" (Standard 5, Skill 17)

Same shape as the CI/CD calibration — one thin DESE skill, responsibly
expanded rather than left as 3 bundled items.

| # | Type | Skill statement | Standard 5 ref | Change |
|---|---|---|---|---|
| 1 | Atomic | Explain what problems version control solves for a team (history, collaboration, recovery) vs. working without it | Skill 17 | OK |
| 2 | Atomic | Demonstrate making a commit to a repository | Skill 17 (split 1/3) | OK |
| 3 | Atomic | Demonstrate creating and using a branch | Skill 17 (split 2/3) | OK |
| 4 | Atomic | Demonstrate merging a branch | Skill 17 (split 3/3) | OK |
| 5 | **Composite** | Demonstrate a full commit → branch → merge workflow on a real repository — combines rows 2–4 | *(existing)* | OK |
| 6 | Atomic | Resolve a merge conflict between two branches and explain what caused it | *(existing)* | OK |

Net for this batch: 6 + 5 + 3 + 10 + 6 = 30 items, plus CI/CD's 4 from
Step 2 = **34 items total for `Software_Engineering.html`**, up from its
current 6 bundled competency areas (27 checkbox elements today, including
6 "Other: ___" lines — 21 real bundled skill items).

---

## Step 3 continued: `Project_Management.html`, all 5 areas

Standard 5's Skills 1–5, 7, 10, 11, 13 (the 9 items you routed here) plus
Standard 9's Skills 1–5 (folded in per your confirmed decision) — all 14
numbered skills this file is built from.

### "Project Vision & Stakeholders" (Standard 9, Skills 1–2)

| # | Type | Skill statement | Standard 9 ref | Change |
|---|---|---|---|---|
| 1 | Atomic | Determine a project's objectives from a given scenario | Skill 1 (split 1/2) | OK |
| 2 | Atomic | Write a vision statement for a project based on its objectives | Skill 1 (split 2/2) | OK |
| 3 | Atomic | Identify a project's stakeholders and explain each one's role | Skill 2 (kept bundled — same reasoning as UX/UI Design's goals/needs/behaviors item: identifying *who* and explaining *their role* is one act, not two separately practiced skills) | OK |

### "Requirements & Scope" (Standard 5, Skills 1, 5, 2)

| # | Type | Skill statement | Standard 5 ref | Change |
|---|---|---|---|---|
| 1 | Atomic | Interview or survey real users about a problem, and turn their answers into written requirements | Skill 1 | OK |
| 2 | Atomic | Define and structure a project's scope of work — what's in, what's explicitly out, and why | Skill 5 | OK |
| 3 | **Composite** | Produce a prioritized feature list (e.g. must-have/should-have/nice-to-have) based on the requirements and scope above — combines rows 1–2 | Skill 2 | OK |

### "Planning & Estimation" (Standard 5, Skill 4 + Standard 9, Skills 3–5)

Split "Skills & Personnel Plan" (the file's current bundled item) into 2 —
technical skills and personnel/technology are two separately-numbered
Standard 9 skills, not one.

| # | Type | Skill statement | Ref | Change |
|---|---|---|---|---|
| 1 | Atomic | Evaluate a project's resources and create a time-and-cost analysis for its scope | Standard 5, Skill 4 | OK |
| 2 | Atomic | Given more requested features than time allows, decide and justify what gets cut or deferred | Standard 9, Skill 3 | OK |
| 3 | Atomic | Identify and document the technical skills a project needs | Standard 9, Skill 4 | OK |
| 4 | Atomic | Identify and document the personnel and technology a project needs | Standard 9, Skill 5 | OK |

### "Technical Planning & Quality" (Standard 5, Skills 3, 7, 10, 11)

| # | Type | Skill statement | Standard 5 ref | Change |
|---|---|---|---|---|
| 1 | Atomic | Research and justify at least 2 technology choices for a project against its requirements and constraints | Skill 3 | OK |
| 2 | Atomic | Write a technical design document for a small feature, describing how it will be built | Skill 7 | OK |
| 3 | Atomic | Identify at least 3 testing techniques and explain what each one catches | Skill 10 | OK |
| 4 | **Composite** | Create and implement a test plan for a project — what gets tested (using the techniques above) and how success is measured — combines rows 1–3 | Skill 11 | OK |

### "Retrospective" (Standard 5, Skill 13)

Same shape as the CI/CD and Version Control calibrations — one thin
skill, responsibly expanded.

| # | Type | Skill statement | Standard 5 ref | Change |
|---|---|---|---|---|
| 1 | Atomic | After completing a project, identify at least 3 things that went well | Skill 13 (split 1/2) | OK |
| 2 | Atomic | After completing a project, identify at least 3 things you'd do differently | Skill 13 (split 2/2) | OK |
| 3 | **Composite** | Write a lessons-learned document combining what went well and what you'd change, with reasoning for each — combines rows 1–2 | Skill 13 | OK |

Net: 3 + 3 + 4 + 4 + 3 = **17 items total for `Project_Management.html`**,
up from its current 5 bundled competency areas (18 checkbox elements
today, including 5 "Other: ___" lines — 13 real bundled skill items).

---

## Step 3 continued: `Basic_SDLC.html` — approach confirmed via Plan Mode

Standard 4 has only 3 skills total, one covering Agile+Waterfall+
Iterative collectively and one covering all 12 roles collectively — see
`/Users/151814/.claude/plans/prancy-stirring-shamir.md` for the full
reasoning. Confirmed corrections from that discussion:
- **Iterative SDLC Models dropped entirely** — "too complicated for
  student first use." Methodologies are now SDLC, Agile, Waterfall only.
- **SDLC's own content simplified** to just 2 items: a basic definition,
  and understanding that methodology choice is organizational/contextual,
  not because one is inherently better than another.
- **The 12 roles stay at 2 items each, no composite** — producing each
  role's real artifact is practiced in the file where that skill actually
  lives, so a third item here would duplicate that. The artifact item
  becomes a **list**, not a creation task, matching Standard 4's own
  describe/identify-level wording ("research and identify," not
  "demonstrate").

### Batch 1: Methodologies (SDLC, Agile, Waterfall)

**Revision 2**: reworded row 2 to be more direct, and moved the
Agile-vs-traditional composite (old row 8) to *after* Waterfall — good
build-order catch: it references "a traditional method" (i.e. Waterfall)
by implication, which hadn't been taught yet at that point in the
sequence. Now it comes last, explicitly naming Waterfall, once both
methodologies are actually on the table.

| # | Type | Skill statement | Standard 4 ref | Change |
|---|---|---|---|---|
| 1 | Atomic | Define SDLC (Software Development Life Cycle) in your own words | Skill 1 | OK |
| 2 | Atomic | Explain why an organization would pick a specific SDLC methodology | Skill 2 (reworded) | OK |
| 3 | Atomic | Define Agile in your own words and explain its iterative nature | *(existing)* | OK |
| 4 | Atomic | Explain the Agile value "individuals and interactions over processes and tools" | *(existing, split 1/4)* | OK |
| 5 | Atomic | Explain the Agile value "working software over comprehensive documentation" | *(existing, split 2/4)* | OK |
| 6 | Atomic | Explain the Agile value "customer collaboration over contract negotiation" | *(existing, split 3/4)* | OK |
| 7 | Atomic | Explain the Agile value "responding to change over following a plan" | *(existing, split 4/4)* | OK |
| 8 | Atomic | Define the Waterfall model and explain its linear, sequential nature | *(existing)* | OK |
| 9 | Atomic | Diagram the Waterfall flow: Requirements → Design → Implementation → Verification → Maintenance | *(existing)* | OK |
| 10 | **Composite** | Analyze a real-world project and explain when Waterfall would be appropriate vs. when it would be problematic — combines rows 8–9 | *(existing)* | OK |
| 11 | **Composite** | Analyze a software project scenario and explain how Agile (applying the 4 values above) would approach it differently than Waterfall — combines rows 4–7, 8–9 | *(existing, moved here — now names Waterfall explicitly since it's already taught by this point)* | OK |

Net: 11 items across 3 areas (down from 4 areas today, since Iterative
Models is dropped rather than decomposed).

### Batch 2: The 12 job roles

Same 2-item shape for every role: Phase Placement (kept close to the
file's current wording) + an artifact **list** (reworded from "draft
one" to "list them and explain what each is for").

| Role | # | Type | Skill statement | Change |
|---|---|---|---|---|
| Business Owner/Sponsor | 1 | Atomic | Explain why the business owner/sponsor is most active at the very start of a project, and what happens if that role is skipped | OK |
| | 2 | Atomic | List the artifacts a business owner/sponsor produces (vision statement, budget approval, prioritization decisions) and briefly explain what each is for | OK |
| Business Analyst | 3 | Atomic | Explain how the business analyst bridges the business owner's goals and the technical team's implementation | OK |
| | 4 | Atomic | List the artifacts a business analyst produces (requirements document, user stories) and briefly explain what each is for | OK |
| Usability Tester | 5 | Atomic | Explain why usability testing happens throughout design and again before launch, not just once at the very end | OK |
| | 6 | Atomic | List the artifacts a usability tester produces (usability test reports, heuristic evaluation findings) and briefly explain what each is for | OK |
| UX/UI Designer | 7 | Atomic | Explain what a UX/UI designer needs from the business analyst's requirements before design work can start | OK |
| | 8 | Atomic | List the artifacts a UX/UI designer produces (wireframes, personas, prototypes) and briefly explain what each is for | OK |
| Technical Architect | 9 | Atomic | Explain why architectural decisions happen before implementation begins, and what it costs to change them later | OK |
| | 10 | Atomic | List the artifacts a technical architect produces (architecture diagram, technical design document, technology choices) and briefly explain what each is for | OK |
| Front End Developer | 11 | Atomic | Explain what a front end developer needs from the design phase before implementation can start | OK |
| | 12 | Atomic | List the artifacts a front end developer produces (HTML/CSS/JS code, UI components) and briefly explain what each is for | OK |
| Back End Developer | 13 | Atomic | Explain what a back end developer needs from the architecture phase before implementation can start | OK |
| | 14 | Atomic | List the artifacts a back end developer produces (APIs, server logic, database integration) and briefly explain what each is for | OK |
| Full Stack Developer | 15 | Atomic | Explain why a full stack developer's work spans both the front-end and back-end phases of implementation | OK |
| | 16 | Atomic | List the artifacts a full stack developer produces (complete features spanning client and server) and briefly explain what that means | OK |
| Database Developer | 17 | Atomic | Explain why data modeling typically happens alongside architectural design, before most implementation starts | OK |
| | 18 | Atomic | List the artifacts a database developer produces (ER diagrams, schema, queries) and briefly explain what each is for | OK |
| Mobile Developer | 19 | Atomic | Explain how platform choice (native vs. cross-platform) is a design decision that shapes the whole implementation phase | OK |
| | 20 | Atomic | List the artifacts a mobile developer produces (platform-specific app builds) and briefly explain what that means | OK |
| QA / Automation Tester | 21 | Atomic | Explain why testing happens continuously alongside implementation rather than only at the very end | OK |
| | 22 | Atomic | List the artifacts a QA tester produces (test cases, bug reports, automated test suites) and briefly explain what each is for | OK |
| DevOps Engineer | 23 | Atomic | Explain why DevOps work spans the boundary between "finished implementation" and "running in production" | OK |
| | 24 | Atomic | List the artifacts a DevOps engineer produces (deployment pipeline, monitoring/logging setup) and briefly explain what each is for | OK |

Net: 24 items across 12 roles (2 each, no change in count from today —
only the artifact item's wording changed from "create" to "list").

**File total: 11 + 24 = 35 items for `Basic_SDLC.html`**, down slightly
from today's 36 real bundled items (52 checkbox elements including 16
"Other: ___" lines — 4 methodology areas × 3 items each + 12 roles × 2
items each) despite the atomic pass — because Iterative Models (a whole
area, 3 items) was cut rather than decomposed.

---

## All 5 files now decomposed

| File | Items |
|---|---|
| `Basic_ITFundamentals.html` | 52 |
| `UX_Usability_Accessibility.html` | 23 |
| `Software_Engineering.html` | 34 |
| `Project_Management.html` | 17 |
| `Basic_SDLC.html` | 35 |
| **Total** | **161** |

Once this batch is confirmed, the doc is ready for the actual HTML
rebuild pass (to-do #3's shared CSS + per-cert accent colors, per-item
standards-ref tags, and the "Possible Ways to Assess" bottom section) —
a separate, later implementation step.
