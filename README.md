# MP-CPWD.github.io

## Conventions

- **Group same-type asset files into a subdirectory once there are two or
  more of them.** If an app's folder ends up with 2+ `.js` files, 2+
  `.css` files, or 2+ image files, move them into a same-named
  subdirectory (`js/`, `css/`, `images/`) rather than leaving them loose
  at the app's root. One file of a given type is fine at the root; the
  rule kicks in at two. Goal: keep each app's top-level folder scannable
  at a glance — e.g. `puzzles/` holds `index.html`, `list.html`,
  `style.css`, `data/`, and `js/` (holding `app.js` + `list.js`), not five
  loose files plus a data folder. Applies repo-wide, to any current or
  future app on this site, not just one.
