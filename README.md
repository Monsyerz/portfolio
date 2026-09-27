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

Included: `robotic-arm/assembly.jpg`, `robotic-arm/component.jpg`, `glass-enclosures/residential-3.jpg` and `glass-enclosures/bathtub-3.jpg`. The CAD images show connection/hardware details and generic product references. This review does not establish third-party ownership or contractual publication rights.

Omitted from Git, previews and galleries because of privacy uncertainty:

| Supplied path under assets/projects/ | Reason |
| --- | --- |
| `glass-enclosures/residential-1.jpg` | Project-specific layout and exact dimensions |
| `glass-enclosures/residential-2.jpg` | Project-specific layout and exact dimensions |
| `glass-enclosures/bathtub-1.jpg` | Full room plan, dimensions and coordination annotation |
| `glass-enclosures/bathtub-2.jpg` | Detailed room elevations and dimensions |
| `metal-baffles/panels-1.jpg` | Production geometry, exact dimensions and part identifiers |
| `robotic-arm/technical-views.jpg` | Remaining author/date title block; attribution not confidently verified |

The omissions are precautionary, not a claim of confirmed client identities. The metal baffle case study provides a text description. Source PDFs and native CAD files were not supplied or added. The ZIP's claim of prior anonymization was not treated as publication approval.

## Checks

Run `node --check script.js` and `git diff --check`. The existing GitHub Actions workflow runs a Jekyll container build for pull requests to `main`. There is no package manifest or existing local test suite.
