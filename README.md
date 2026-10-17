# Kacper Popek — Software & Engineering Portfolio

My personal portfolio, built with HTML, CSS, vanilla JavaScript and Three.js.

The website presents my software projects and engineering background through a minimal layout and an interactive robotic arm.

## Features

- Interactive 3D robotic arm loaded from a GLB model
- Paper corners that reveal Projects and About Me on hover or keyboard focus
- Animated navigation with the robot gripping and pulling a page into view
- Robot punch-through transition when returning Home
- Software and Engineering project filters
- Engineering case studies and drawing galleries
- Responsive layouts and reduced-motion support
- Standard navigation links available without animation

## Projects

### Software

- **CutFlow** — material cutting optimizer built with Python, Flask and JavaScript
- **Household Budget Tracker** — budgeting application built with Python, Flask and JSON storage
- **ShopFlow** — Python command-line project tracking prototype
- **Blackjack Game** — course-based Python exercise focused on game logic

### Engineering

- Robotic Arm
- Architectural Glass Enclosures
- Metal Baffle Fabrication

## Technologies

- HTML
- CSS
- JavaScript
- Three.js
- GLTFLoader

## Run Locally

Serve the project with VS Code Live Server, or run:

```bash
python -m http.server 8000
```

Then open:

http://localhost:8000/

Use a local server so the browser can load the GLB model and fetch page content for the transitions.

Three.js is loaded from a CDN and requires an internet connection.

## Project Structure

```text
index.html
aboutme.html
projects.html
style.css
script.js
projects/
assets/
```

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

Visual checks should cover both paper corners, page transitions, project filters, keyboard navigation and mobile layouts.

## About

I'm Kacper Popek, a Software Engineering student based in New York City with a background in mechatronics and technical engineering work.