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
            THREE,
            camera,
            container,
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

// Robot grab preview
let robotBusy = false;

function getRobotPose() {
    const { model, joints } = robotView;

    return {
        x: model.position.x,
        y: model.position.y,
        turn: model.rotation.y,
        shoulder: joints.shoulder.rotation.z,
        support: joints.support.rotation.z,
        wrist: joints.wrist.rotation.z,
        lowerJaw: joints.lowerJaw.rotation.z,
        upperJaw: joints.upperJaw.rotation.z
    };
}

function applyRobotPose(pose) {
    const { model, joints } = robotView;

    model.position.x = pose.x;
    model.position.y = pose.y;
    model.rotation.y = pose.turn;
    joints.shoulder.rotation.z = pose.shoulder;
    joints.support.rotation.z = pose.support;
    joints.wrist.rotation.z = pose.wrist;
    joints.lowerJaw.rotation.z = pose.lowerJaw;
    joints.upperJaw.rotation.z = pose.upperJaw;
    model.updateMatrixWorld(true);
}

function animateRobotPose(target, duration = 700) {
    const start = getRobotPose();
    const startedAt = performance.now();

    return new Promise(resolve => {
        function frame(now) {
            const progress = Math.min((now - startedAt) / duration, 1);
            const eased = progress * progress * (3 - 2 * progress);
            const pose = {};

            for (const key of Object.keys(start)) {
                pose[key] = start[key] + (target[key] - start[key]) * eased;
            }

            applyRobotPose(pose);
            robotView.render();

            if (progress < 1) {
                requestAnimationFrame(frame);
            } else {
                resolve();
            }
        }

        requestAnimationFrame(frame);
    });
}

function getRobotContactPose(restingPose, edge) {
    const { THREE, model, camera, container, joints } = robotView;

    const target = {
        ...restingPose,
        turn: restingPose.turn - 0.3,
        shoulder: restingPose.shoulder + 0.12,
        support: restingPose.support - 0.2,
        wrist: restingPose.wrist + 0.35
    };

    // Temporarily apply the target angles to measure the gripper.
    applyRobotPose(target);
    camera.updateMatrixWorld(true);

    // Midpoint between the grip pads in this model.
    const gripPoint = joints.wrist.localToWorld(
        new THREE.Vector3(-1.24, 0, 0)
    );

    const projectedGrip = gripPoint.clone().project(camera);
    const canvasRect = container.getBoundingClientRect();
    const edgeRect = edge.getBoundingClientRect();

    const screenX = edgeRect.left + edgeRect.width / 2;
    const screenY = edgeRect.top;

    // Convert the edge position from screen pixels into the 3D scene.
    const targetPoint = new THREE.Vector3(
        ((screenX - canvasRect.left) / canvasRect.width) * 2 - 1,
        -((screenY - canvasRect.top) / canvasRect.height) * 2 + 1,
        projectedGrip.z
    ).unproject(camera);

    target.x += targetPoint.x - gripPoint.x;
    target.y += targetPoint.y - gripPoint.y;

    applyRobotPose(restingPose);
    return target;
}

document.querySelector('#about-button')?.addEventListener(
    'click',
    async event => {
        if (!robotView) return;

        const { container, joints } = robotView;
        if (Object.values(joints).some(joint => !joint)) return;

        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }

        event.preventDefault();
        if (robotBusy) return;
        robotBusy = true;

        let edge = container.querySelector('.robot-grab-edge');

        if (!edge) {
            edge = document.createElement('div');
            edge.className = 'robot-grab-edge';
            edge.setAttribute('aria-hidden', 'true');
            container.appendChild(edge);
        }

        const restingPose = getRobotPose();

        try {
            const contactPose = getRobotContactPose(restingPose, edge);

            const pulledPose = {
            ...contactPose,
            y: contactPose.y + 0.45,
            shoulder: contactPose.shoulder - 0.08,
            wrist: contactPose.wrist - 0.08
            };

            // Reach the measured edge before closing the fingers.
            await animateRobotPose(contactPose, 850);

            // A smaller angle keeps the grip pads from crossing.
            await animateRobotPose({
                ...contactPose,
                lowerJaw: restingPose.lowerJaw + 0.1,
                upperJaw: restingPose.upperJaw - 0.1
            }, 300);
            edge.classList.add('is-gripped');

            // Briefly hold the grip so the contact is visible.
            await new Promise(resolve => setTimeout(resolve, 250));

            edge.classList.add('is-pulled');

            await animateRobotPose(pulledPose, 600);

            // Release first, then return.
            edge.classList.remove('is-pulled');

            await animateRobotPose(contactPose, 250);

            edge.classList.remove('is-gripped');

            await animateRobotPose(restingPose, 750);

            } finally {
                applyRobotPose(restingPose);
                robotView.render();

                edge.classList.remove('is-pulled');
                edge.classList.remove('is-gripped');

                robotBusy = false;
            }
 
    }
);