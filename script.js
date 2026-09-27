// HTML is the source of truth: projects remain readable if this script fails to load.
const root = document.documentElement;
const header = document.querySelector('header');
const cards = [...document.querySelectorAll('#project-list > .project-item')];
const filters = document.querySelector('.project-filters');
const buttons = [...document.querySelectorAll('.filter-button')];
const status = document.querySelector('#project-status');
let scheduled = false;

function updateTheme() {
  const maxScroll = root.scrollHeight - window.innerHeight;
  const progress = maxScroll > 0 ? Math.max(0, Math.min(window.scrollY / maxScroll, 1)) : 0;
  // One scroll position drives both surfaces and the contrasting KP mark.
  root.style.setProperty('--page-bg', `rgb(5, ${5 + progress * 26}, 20)`);
  root.style.setProperty('--logo-color', `rgb(${114 + progress * 66}, ${214 + progress * 29}, ${138 + progress * 52})`);
  scheduled = false;
}

function scheduleTheme() {
  if (scheduled) return;
  scheduled = true;
  window.requestAnimationFrame(updateTheme);
}

function filterProjects(filter) {
  let count = 0;
  cards.forEach(card => {
    card.hidden = filter !== 'all' && card.dataset.category !== filter;
    if (!card.hidden) count += 1;
  });
  buttons.forEach(button => {
    const active = button.dataset.filter === filter;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  if (status) status.textContent = `${count} projects shown`;
  scheduleTheme();
}

if (cards.length && filters) {
  buttons.forEach(button => button.addEventListener('click', () => filterProjects(button.dataset.filter)));
  filterProjects('all');
  filters.hidden = false;
}

function updateHeaderHeight() {
  if (header) root.style.setProperty('--header-height', `${header.getBoundingClientRect().height}px`);
  scheduleTheme();
}
window.addEventListener('scroll', scheduleTheme, { passive: true });
window.addEventListener('resize', updateHeaderHeight);
window.addEventListener('load', updateHeaderHeight);
if ('ResizeObserver' in window) {
  const observer = new ResizeObserver(updateHeaderHeight);
  if (header) observer.observe(header);
  observer.observe(document.body);
}
updateHeaderHeight();
updateTheme();
