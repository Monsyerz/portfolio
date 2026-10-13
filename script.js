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

// Robot home preview
let robotView = null;

async function initRobot() {
    const container = document.querySelector('#robot-container');
    if (!container) return;

    const placeholder = container.querySelector('.robot-placeholder');

    if (placeholder) {
        placeholder.textContent = 'Loading robotic arm...';
        placeholder.setAttribute('role', 'status');
    }

    let renderer;

    try {
        const [THREE, { GLTFLoader }] = await Promise.all([
            import('three'),
            import('three/addons/loaders/GLTFLoader.js')
        ]);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);

        renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true
        });

        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(0x000000, 0);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.2;

        const canvas = renderer.domElement;
        canvas.setAttribute('role', 'img');
        canvas.setAttribute('aria-label', '3D robotic arm');
        container.appendChild(canvas);

        // Soft light and green accent.
        scene.add(new THREE.HemisphereLight(0xffffff, 0x26352c, 2));

        const keyLight = new THREE.DirectionalLight(0xffffff, 3);
        keyLight.position.set(3, 5, 6);
        scene.add(keyLight);

        const accentLight = new THREE.DirectionalLight(0x72d68a, 2);
        accentLight.position.set(-4, 1, -3);
        scene.add(accentLight);

        const loader = new GLTFLoader();
        const gltf = await loader.loadAsync('assets/projects/robotic-arm.glb');

        const model = gltf.scene;

        // Slight angle to show the depth of the arm.
        model.rotation.y = Math.PI/2;
        model.updateMatrixWorld(true);

        // Center the model without changing its individual joints.
        const bounds = new THREE.Box3().setFromObject(model);
        const center = bounds.getCenter(new THREE.Vector3());
        const size = bounds.getSize(new THREE.Vector3());

        model.position.sub(center);
        scene.add(model);

        function render() {
            renderer.render(scene, camera);
        }

        function resize() {
            const width = container.clientWidth;
            const height = container.clientHeight;
            if (!width || !height) return;

            camera.aspect = width / height;

            const verticalFov = THREE.MathUtils.degToRad(camera.fov);
            const horizontalFov = 2 * Math.atan(
                Math.tan(verticalFov / 2) * camera.aspect
            );

            const distance = Math.max(
                size.y / (2 * Math.tan(verticalFov / 2)),
                size.x / (2 * Math.tan(horizontalFov / 2))
            ) * 1.2 + size.z / 2;

            camera.position.set(0, 0, distance);
            camera.far = Math.max(100, distance + size.length() * 4);
            camera.lookAt(0, 0, 0);
            camera.updateProjectionMatrix();

            renderer.setSize(width, height);
            render();
        }

        const resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(container);

        // Keep the model and joints available for the next commit.
        robotView = {
            model,
            render,
            joints: {
                base: model.getObjectByName('J0_Base'),
                shoulder: model.getObjectByName('J3_Shoulder'),
                support: model.getObjectByName('J4_Tool_support'),
                wrist: model.getObjectByName('J5_Camera'),
                lowerJaw: model.getObjectByName('Lower_jaw'),
                upperJaw: model.getObjectByName('Upper_jaw')
            }
        };

        resize();
        placeholder?.remove();
    } catch (error) {
        renderer?.domElement.remove();
        renderer?.dispose();

        if (placeholder) {
            placeholder.textContent = 'Robot preview unavailable.';
        }

        console.error('Could not load the robotic arm:', error);
    }
}

initRobot();