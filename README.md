# Kacper Popek — Engineering & Software Portfolio

A personal learning project built with HTML, CSS and vanilla JavaScript. The original black and green palette, KP logo, software projects and scroll background are retained.

## Run locally

Open `index.html` in a browser, or serve this directory with `python -m http.server 8000` and visit `http://localhost:8000/`.

## Features

- Engineering and Software filters with keyboard controls and result announcements
- Case studies for a robotic arm, glass enclosures and metal baffle fabrication
- Reviewed Inventor screenshots and CAD detail galleries with full-size links
- Responsive layouts and reduced-motion support

`index.html`, `style.css` and `script.js` power the home page. `projects/` contains the case studies; `assets/projects/` contains only the selected images.

## Image privacy review

All ten supplied JPEGs were visually reviewed along with filenames, image metadata and source text. No client names, addresses, contact details or credentials were found in the included material. JPEG metadata contains only basic JFIF information; no EXIF was present. The existing owner's public contact information and original logo are retained.

Eight images are included: three residential enclosure drawings, one bathtub hardware detail, one metal fabrication sheet and three robotic arm images. The owner explicitly approved the seven reattached residential, metal and robotic arm images for inclusion, including their visible dimensions, part identifiers and the technical-view author/date title block. The previously reviewed bathtub hardware detail is retained. The images are reproduced without alteration.

Still omitted from Git, previews and galleries because of privacy uncertainty:

| Supplied path under assets/projects/ | Reason |
| --- | --- |
| `glass-enclosures/bathtub-1.jpg` | Full room plan, dimensions and coordination annotation; not included in the owner's subsequent approval |
| `glass-enclosures/bathtub-2.jpg` | Detailed room elevations and dimensions; not included in the owner's subsequent approval |

These omissions are precautionary, not a claim of confirmed client identities. Source PDFs and native CAD files were not supplied or added. The ZIP's anonymization note was treated as source material; publication selection reflects the review and the owner's explicit follow-up approval.

## Checks

Run `node --check script.js` and `git diff --check`. The existing GitHub Actions workflow runs a Jekyll container build for pull requests to `main`. There is no package manifest or existing local test suite.
