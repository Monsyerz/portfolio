const projects = [
  {
    name: "Robotic Arm",
    category: "engineering",
    language: "Mechanical design · Autodesk Inventor",
    description: "An academic mechanical design project with modeled components, an assembly and technical drawings.",
    image: "assets/projects/robotic-arm/assembly.jpg",
    link: "projects/robotic-arm.html",
    linkText: "Read case study"
  },
  {
    name: "Architectural Glass Enclosures",
    category: "engineering",
    language: "Professional drafting · AutoCAD",
    description: "Shop drawings and revisions for custom glass enclosures, including elevations, hardware and installation details.",
    image: "assets/projects/glass-enclosures/residential-3.jpg",
    link: "projects/glass-enclosures.html",
    linkText: "Read case study"
  },
  {
    name: "Metal Baffle Fabrication",
    category: "engineering",
    language: "Fabrication documentation · AutoCAD",
    description: "Dimensioned panel drawings with hole locations, cutouts and part identifiers for manufacturing coordination.",
    link: "projects/metal-baffles.html",
    linkText: "Read case study"
  },
  {
    name: "Budget Application",
    category: "software",
    language: "Python · Flask",
    description: "A web application for tracking household spending.",
    link: "https://github.com/Monsyerz/tracking_household_app",
    linkText: "View code"
  },
  {
    name: "Expense Tracker",
    category: "software",
    language: "Python",
    description: "A Python project for recording expenses.",
    link: "https://github.com/Monsyerz/ShopTracker",
    linkText: "View code"
  },
  {
    name: "Blackjack Game",
    category: "software",
    language: "Python",
    description: "A card game project exploring game logic and program structure.",
    link: "https://github.com/Monsyerz/blackjack_game",
    linkText: "View code"
  }
];

const projectList = document.querySelector("#project-list");
const filterButtons = document.querySelectorAll(".filter-button");

function renderProjects(filter = "all") {
  if (!projectList) return;
  projectList.replaceChildren();
  projects.filter(project => filter === "all" || project.category === filter).forEach(project => {
    const item = document.createElement("li");
    item.className = "project-item";
    const heading = document.createElement("h3");
    heading.textContent = project.name;
    if (project.image) {
      const preview = document.createElement("img");
      preview.className = "project-preview";
      preview.src = project.image;
      preview.alt = `${project.name} drawing preview`;
      preview.loading = "lazy";
      item.append(preview);
    }
    const category = document.createElement("p");
    category.className = "project-category";
    category.textContent = project.category;
    const language = document.createElement("p");
    language.className = "project-language";
    language.textContent = project.language;
    const description = document.createElement("p");
    description.className = "project-description";
    description.textContent = project.description;
    const link = document.createElement("a");
    link.className = "project-link";
    link.textContent = project.linkText + " →";
    link.href = project.link;
    if (project.link.startsWith("https://")) {
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    }
    item.append(heading, category, language, description, link);
    projectList.append(item);
  });
  const status = document.querySelector("#project-status");
  if (status) status.textContent = `${projectList.children.length} projects shown`;
}

filterButtons.forEach(button => button.addEventListener("click", () => {
  filterButtons.forEach(other => {
    const active = other === button;
    other.classList.toggle("active", active);
    other.setAttribute("aria-pressed", String(active));
  });
  renderProjects(button.dataset.filter);
}));
renderProjects();

const header = document.querySelector("header");
let scheduled = false;
function updateScroll() {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const progress = maxScroll > 0 ? Math.min(window.scrollY / maxScroll, 1) : 0;
  const color = `rgb(5, ${Math.floor(5 + progress * 26)}, 20)`;
  document.body.style.backgroundColor = color;
  header.style.backgroundColor = color;
  scheduled = false;
}
window.addEventListener("scroll", () => {
  if (!scheduled) {
    window.requestAnimationFrame(updateScroll);
    scheduled = true;
  }
}, { passive: true });
updateScroll();
