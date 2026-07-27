# Coding Practice Site

A self-hosted, free-forever set of browser-based coding exercises for the
classroom — no accounts, no per-student cost, no third party that can change
the deal later. Currently one live track (Python), with a second (HTML/CSS/JS)
scaffolded and ready to build.

## Repository layout

```
/
├── index.html          ← landing page, links to each track
├── python/              ← Python Practice (Pyodide-based, live)
│   ├── index.html
│   ├── style.css
│   ├── exercises.js      (lesson content + UNIT_ORDER — see python/README.md)
│   └── app.js
└── webdev/               ← HTML/CSS/JS Practice (placeholder for now)
    └── index.html
```

**Why separate folders instead of one combined app:** Python exercises are
graded by comparing program output (stdout) to an expected string. HTML/CSS/JS
exercises need a completely different check — rendering markup in an iframe
and inspecting the resulting DOM/styles, or running JS and checking what it
produces. Keeping each track in its own folder with its own `app.js` means the
grading logic for one can be changed or rebuilt without any risk of breaking
the other, while still living in one repo with one GitHub Pages deployment and
one link to maintain.

**Shared conventions across tracks**, so switching between them feels familiar
once inside either folder:
- A dark IDE-style visual theme
- Content and lesson order controlled by an `exercises.js` file per track
- A `UNIT_ORDER` list at the bottom of that file — reorder lessons by editing
  that one list, without touching the exercise content itself
- Progress saved per-student in their own browser (`localStorage`), no login

## Hosting this on GitHub Pages (one-time setup)

1. Push this whole folder structure to a **public** GitHub repository.
2. In the repo, go to **Settings → Pages**.
3. Under "Build and deployment," set **Source** to "Deploy from a branch," pick
   `main` and `/ (root)`, then **Save**.
4. GitHub gives you a live URL after a minute or two, e.g.
   `https://<your-username>.github.io/<repo-name>/`
5. Share that root URL in Google Classroom — it's the landing page, and links
   from there into whichever track a student needs (`/python/`, later
   `/webdev/`).

## Adding a new track later

Copy the `python/` folder as a starting point for structure and visual style,
swap in a grading approach appropriate to the new subject, and add a card for
it on the root `index.html`. Each track's `exercises.js`/`UNIT_ORDER` pattern
can be reused as-is.

## Track-specific docs
- [`python/README.md`](python/README.md) — Python track details and limitations
