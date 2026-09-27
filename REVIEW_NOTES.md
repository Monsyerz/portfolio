# Review notes

## Content evidence

- Household Budget Tracker: README, Flask routes, calculator and storage at `Monsyerz/tracking_household_app` commit `5d0cc0f3cf580f6c661baedcbeb190628e94ec08`. Monthly income estimates, expenses, savings, JSON persistence and category charts are implemented. No SQL backend is claimed for this project.
- ShopFlow: README and `main.py` at `Monsyerz/ShopTracker` commit `312bb30f5bec00f40e603a29022f31ddc920530e`. The previous Expense Tracker label was incorrect. Current code creates, validates and displays a project record. JSON/SQL persistence and task management are roadmap items, not presented as completed features.
- Blackjack: README and code at commit `b28ab95ca40cf55a7846d8271ac93d3cd1ee2b90`. Described as a course-based Python exercise, not an original commercial product. The repository is private; the public card does not link visitors to an inaccessible repository. No source files or private repository examples were copied into this portfolio.
- Engineering roles come from the supplied case studies. Decision descriptions refer to the visible documentation structure; results are the displayed artifacts. There are no invented metrics, manufacturing results or expanded responsibilities.

## Materials and decisions still needed

- Household Budget Tracker: a real dashboard screenshot with non-sensitive demonstration data.
- ShopFlow: a real terminal screenshot showing validation and the project summary with neutral sample data.
- Blackjack: a real terminal screenshot; decide whether to make its repository public or provide another public project link. Repository visibility was not changed.
- No suitable software screenshots were found in the portfolio or the three inspected software repositories. None were fabricated. The address-like example in the ShopFlow README was not copied.
- Optional engineering context: the exact assignment constraints, ownership of specific design choices, and any confirmed review/manufacture/installation outcome. Current copy only claims the supplied roles and visible deliverables.

## CAD privacy selection

The eight included image files are unchanged from the reviewed selection. Names, visible annotations, title blocks and JPEG metadata were checked. No client names, addresses, contact details or secrets were identified in the included files. Basic JFIF metadata only; no EXIF. Dimensions and part identifiers are retained under the owner's explicit follow-up approval. That approval also covered the remaining author/date block in `robotic-arm/technical-views.jpg`.

Still withheld for the owner's decision:

- `glass-enclosures/bathtub-1.jpg`: full room plan, dimensions and coordination note.
- `glass-enclosures/bathtub-2.jpg`: detailed room elevations and dimensions.

These files were not part of the subsequent approval and are absent from this branch. Review cannot establish contractual publication rights.

## Behavior and validation

- All six cards are authored in HTML. Filters are initially hidden and enabled only after handlers are installed. Both disabled JavaScript and a blocked script request leave all six cards and public links visible.
- The original PNG has an opaque black background and becomes too small to read at navigation size. An inline SVG follows its recognizable KP outline, with a readable adjacent name. The PNG is retained as the original asset.
- One normalized scroll progress sets both `--page-bg` (original `rgb(5, 5..31, 20)` range) and `--logo-color` (green to pale green). Body/header use the same variable and transition; the SVG uses currentColor without an opaque background. No JavaScript uses the accessible initial palette. Reduced motion removes transitions.
- Resize, image loading and project filtering refresh scroll geometry. Header height determines anchor clearance.
- Passed: JavaScript syntax, diff whitespace, local HTML links/anchors, unique IDs and landmarks; Chromium at 1440, 390 and 320 px; filters and keyboard activation; navigation clearance; image loading; no horizontal overflow or JS errors; disabled/blocked JavaScript; reduced motion.
- Body/header background equality and logo contrast sampled at top, 25%, 50%, 75% and bottom on all four pages. Minimum computed foreground/background contrast: 11.27:1 (not a claim about individual antialiased edge pixels).
- Public source links for ShopFlow and Household Budget Tracker were verified against repository visibility. Private Blackjack source is clearly labeled instead of linked.
