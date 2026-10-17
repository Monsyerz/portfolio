# Kacper Popek — Software & Engineering Portfolio

My personal portfolio, built with HTML, CSS, vanilla JavaScript and Three.js.

The website presents my software projects and engineering background through a minimal layout, an interactive robotic arm and animated page transitions.

## Features

- Interactive 3D robotic arm loaded from a GLB model
- Paper corners that reveal Projects and About Me on hover or keyboard focus
- Full robotic arm interaction exclusive to the Home paper corners
- Gripper-driven paper transitions between pages through the header navigation
- Robot punch-through transition when returning Home
- Vortex transition when entering Contact
- Software and Engineering project filters
- Architectural glass enclosure case study with a drawing gallery
- Contact page with a cyberpunk-inspired layout and GitHub link
- Responsive layouts and reduced-motion support
- Standard links remain available when JavaScript is disabled

## Navigation

The Home page provides two ways to explore the portfolio:

- **Paper corners:** the robotic arm reaches for a corner, grips it and pulls the selected page into view.
- **Header navigation:** a separate gripper pulls a page across the screen.

Header navigation also provides paper transitions between About Me and Projects, and from Contact to either page.

Returning Home uses a punch-through effect. Entering Contact triggers a vortex animation.

Reduced-motion preferences disable animated transitions. If a transition encounters a loading error, navigation falls back to a standard page load.

## Projects

### Software

- **CutFlow** — material cutting optimizer built with Python, Flask and JavaScript
- **Household Budget Tracker** — budgeting application built with Python, Flask and JSON storage
- **ShopFlow** — Python command-line project tracking prototype
- **Blackjack Game** — course-based Python exercise focused on game logic

### Engineering

- **Architectural Glass Enclosures** — professional drafting case study featuring plans, elevations and connection details

The robotic arm remains an interactive element on Home; it is no longer listed as a separate project.

## Contact Page

The Contact page includes name, email and message fields, plus links to GitHub and LinkedIn.

**Message submission is not connected yet.** The Send Message button remains disabled.

## Technologies

- HTML
- CSS
- Vanilla JavaScript
- Three.js
- GLTFLoader
- Web Animations API

## Run Locally

Serve the project with VS Code Live Server, or run:

```bash
python -m http.server 8000
```

Then open:

http://localhost:8000/

Use a local server so the browser can load the GLB model and fetch page content for transitions. Opening the files directly through `file://` is not supported.

Three.js is loaded from a CDN and requires an internet connection.

## Project Structure

```text
index.html
aboutme.html
projects.html
contact.html
style.css
script.js
projects/
  glass-enclosures.html
assets/
  projects/
    robotic-arm-v2.glb
    glass-enclosures/
      residential-1.jpg
      residential-2.jpg
      residential-3.jpg
```

All pages share `style.css` and `script.js`.

The robotic arm model is loaded from:

```text
assets/projects/robotic-arm-v2.glb
```

## Development Checks

Check JavaScript syntax:

```bash
node --check script.js
```

Check Git diff whitespace:

```bash
git diff --check
```

Manual browser checks should cover:

- Both Home paper corners
- Header navigation from Home, About Me, Projects and Contact
- Returning Home through the navigation and logo
- The Contact vortex transition
- Project filters: All, Software and Engineering
- Browser Back navigation after transitions
- Keyboard navigation and visible focus indicators
- Reduced-motion preferences
- Mobile layouts
- Drawing previews and full-size image links

Syntax checks do not verify the appearance or timing of animations.

## About

I'm Kacper Popek, a Software Engineering student based in New York City with a background in mechatronics and technical engineering work.