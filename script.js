const root = document.documentElement;
const header = document.querySelector('header');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

let robotView = null;
let transitioning = false;
let returnEffect = null;
let importsReady;

function loadRobotModules() {
  if (!importsReady) {
    if (!document.querySelector('script[type="importmap"]')) {
      const map = document.createElement('script');

      map.type = 'importmap';

      map.textContent = JSON.stringify({
        imports: {
          three: 'https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js',
          'three/addons/': 'https://cdn.jsdelivr.net/npm/three@0.160.1/examples/jsm/'
        }
      });

      document.head.appendChild(map);
    }

    importsReady = Promise.all([
      import('three'),
      import('three/addons/loaders/GLTFLoader.js')
    ]);
  }

  return importsReady;
}

function updateHeaderHeight() {
  if (!header) return;

  root.style.setProperty(
    '--header-height',
    `${header.getBoundingClientRect().height}px`
  );
}

updateHeaderHeight();

window.addEventListener('resize', updateHeaderHeight);

if (header && 'ResizeObserver' in window) {
  new ResizeObserver(updateHeaderHeight).observe(header);
}

const projectCards = [
  ...document.querySelectorAll('#project-list > .project-item')
];

const projectFilters = document.querySelector('.project-filters');

const filterButtons = [
  ...document.querySelectorAll('.filter-button')
];

const projectStatus = document.querySelector('#project-status');

function filterProjects(filter) {
  let visible = 0;

  for (const card of projectCards) {
    card.hidden =
      filter !== 'all' &&
      card.dataset.category !== filter;

    if (!card.hidden) visible++;
  }

  for (const button of filterButtons) {
    const active = button.dataset.filter === filter;

    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  }

  if (projectStatus) {
    projectStatus.textContent = `${visible} projects shown`;
  }
}

if (projectCards.length && projectFilters) {
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      filterProjects(button.dataset.filter);
    });
  });

  filterProjects('all');
  projectFilters.hidden = false;
}

const ease = t => t * t * (3 - 2 * t);

const mix = (a, b, t) => a + (b - a) * t;

function animate(duration, update) {
  return new Promise(resolve => {
    let start;

    function frame(now) {
      start ??= now;

      const t = Math.min((now - start) / duration, 1);

      update(ease(t));

      if (t < 1) {
        requestAnimationFrame(frame);
      } else {
        resolve();
      }
    }

    requestAnimationFrame(frame);
  });
}

function notifyHomeReady() {
  if (window.parent !== window) {
    window.parent.postMessage(
      { type: 'portfolio:home-ready' },
      location.origin
    );
  }
}

async function initRobot() {
  const container = document.querySelector('#robot-container');

  if (!container) return;

  const placeholder = container.querySelector('.robot-placeholder');

  let renderer;

  try {
    const [THREE, { GLTFLoader }] = await loadRobotModules();

    const scene = new THREE.Scene();

    const camera = new THREE.OrthographicCamera(
      -1,
      1,
      1,
      -1,
      .1,
      2000
    );

    camera.position.set(0, 0, 1000);

    renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true
    });

    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio || 1, 2)
    );

    renderer.setClearColor(0, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    renderer.domElement.setAttribute('aria-hidden', 'true');

    container.appendChild(renderer.domElement);

    scene.add(
      new THREE.HemisphereLight(
        0xffffff,
        0x555e50,
        2.4
      )
    );

    const key = new THREE.DirectionalLight(0xffffff, 3);
    key.position.set(400, 600, 800);

    const fill = new THREE.DirectionalLight(0xbbd7b9, 1.8);
    fill.position.set(-500, 200, -300);

    scene.add(key, fill);

    const gltf = await new GLTFLoader().loadAsync(
      'assets/projects/robotic-arm-v2.glb'
    );

    const model = gltf.scene;
    const wrapper = new THREE.Group();

    wrapper.add(model);
    scene.add(wrapper);

    const jointNames = {
      shoulder: 'J1_Shoulder',
      elbow: 'J2_Elbow',
      wrist: 'J3_Wrist',
      wristRoll: 'J4_WristRoll',
      gripper: 'Gripper',
      jawLeft: 'Jaw_Left',
      jawRight: 'Jaw_Right'
    };

    const joints = Object.fromEntries(
      Object.entries(jointNames).map(([key, name]) => [
        key,
        model.getObjectByName(name)
      ])
    );

    if (Object.values(joints).some(joint => !joint)) {
      throw new Error('Expected robot joints are missing.');
    }

    joints.shoulder.rotation.x = THREE.MathUtils.degToRad(15);

    joints.elbow.rotation.set(
      THREE.MathUtils.degToRad(45),
      0,
      THREE.MathUtils.degToRad(35)
    );

    joints.wrist.rotation.z = THREE.MathUtils.degToRad(-35);

    const movingJoints = ['shoulder', 'elbow', 'wrist'];

    const rest = movingJoints.map(name => {
      return joints[name].quaternion.clone();
    });

    const jawRest = [
      joints.jawLeft.position.x,
      joints.jawRight.position.x
    ];

    const tip = new THREE.Object3D();

    tip.position.set(0, .60, 0);
    joints.gripper.add(tip);

    const view = {
      THREE,
      scene,
      camera,
      renderer,
      container,
      model,
      wrapper,
      joints,
      rest,
      tip,

      activeRest: rest,
      width: 0,
      height: 0,
      scale: 1,
      baseY: 0,
      frontRenderer: null,
      gripLayer: null,

      render() {
        camera.layers.set(0);
        renderer.render(scene, camera);

        if (this.frontRenderer) {
          camera.layers.set(1);
          this.frontRenderer.render(scene, camera);
          camera.layers.set(0);
        }
      },

      beginGripLayer() {
        joints.gripper.traverse(node => {
          node.layers.enable(1);
        });

        scene.traverse(node => {
          if (node.isLight) node.layers.enable(1);
        });

        this.frontRenderer = new THREE.WebGLRenderer({
          alpha: true,
          antialias: true
        });

        this.frontRenderer.setPixelRatio(
          Math.min(window.devicePixelRatio || 1, 2)
        );

        this.frontRenderer.setClearColor(0, 0);
        this.frontRenderer.outputColorSpace = renderer.outputColorSpace;
        this.frontRenderer.toneMapping = renderer.toneMapping;
        this.frontRenderer.toneMappingExposure = renderer.toneMappingExposure;

        this.frontRenderer.setSize(this.width, this.height);

        this.gripLayer = document.createElement('div');
        this.gripLayer.className = 'robot-grip-layer';
        this.gripLayer.setAttribute('aria-hidden', 'true');

        this.gripLayer.appendChild(
          this.frontRenderer.domElement
        );

        document.body.appendChild(this.gripLayer);

        this.render();
      },

      async prepareSide(side) {
        const initial = movingJoints.map(name => {
          return joints[name].quaternion.clone();
        });

        this.activeRest = rest.map(q => {
          if (side === 'right') {
            return new THREE.Quaternion(
              q.x,
              -q.y,
              -q.z,
              q.w
            );
          }

          return q.clone();
        });

        await animate(220, t => {
          movingJoints.forEach((name, index) => {
            joints[name].quaternion
              .copy(initial[index])
              .slerp(this.activeRest[index], t);
          });

          this.render();
        });
      },

      screenToWorld(x, y) {
        const rect = container.getBoundingClientRect();

        return new THREE.Vector2(
          x - rect.left - rect.width / 2,
          rect.height / 2 - (y - rect.top)
        );
      },

      tipOnScreen() {
        wrapper.updateMatrixWorld(true);

        const point = tip
          .getWorldPosition(new THREE.Vector3())
          .project(camera);

        const rect = container.getBoundingClientRect();

        return {
          x: rect.left + (point.x + 1) * rect.width / 2,
          y: rect.top + (1 - point.y) * rect.height / 2
        };
      },

      setGrip(amount) {
        joints.jawLeft.position.x =
          jawRest[0] + amount * .065;

        joints.jawRight.position.x =
          jawRest[1] - amount * .065;
      },

      follow(x, y, side, blend = 1) {
        const target = this.screenToWorld(x, y);
        const scale = this.scale;

        let baseX = target.x - THREE.MathUtils.clamp(
          target.x,
          -1.7 * scale,
          1.7 * scale
        );

        let baseY = this.baseY;

        const phi = Math.atan2(
          target.y - baseY,
          target.x - baseX
        );

        const toolLength =
          joints.wristRoll.position.y +
          joints.gripper.position.y +
          tip.position.y;

        let wx =
          (target.x - baseX) / scale -
          toolLength * Math.cos(phi);

        let wy =
          (target.y - baseY) / scale -
          toolLength * Math.sin(phi);

        const upper = joints.elbow.position.y;
        const lower = joints.wrist.position.y;

        const reach = upper + lower - .015;
        const distance = Math.hypot(wx, wy);

        if (distance > reach) {
          const extra = distance - reach;

          baseX += wx / distance * extra * scale;
          baseY += wy / distance * extra * scale;

          wx *= reach / distance;
          wy *= reach / distance;
        }

        const minimum = Math.abs(upper - lower) + .015;

        if (distance < minimum) {
          const ux = distance > .00001
            ? wx / distance
            : -Math.cos(phi);

          const uy = distance > .00001
            ? wy / distance
            : -Math.sin(phi);

          baseX -= ux * (minimum - distance) * scale;
          baseY -= uy * (minimum - distance) * scale;

          wx = ux * minimum;
          wy = uy * minimum;
        }

        const cosine = THREE.MathUtils.clamp(
          (
            wx * wx +
            wy * wy -
            upper * upper -
            lower * lower
          ) / (2 * upper * lower),
          -1,
          1
        );

        const elbow =
          Math.acos(cosine) *
          (side === 'left' ? 1 : -1);

        const shoulder =
          Math.atan2(wy, wx) -
          Math.atan2(
            lower * Math.sin(elbow),
            upper + lower * Math.cos(elbow)
          );

        const wrist = phi - shoulder - elbow;

        const angles = [
          shoulder - Math.PI / 2,
          elbow,
          wrist
        ];

        movingJoints.forEach((name, index) => {
          const targetRotation = new THREE.Quaternion()
            .setFromEuler(
              new THREE.Euler(0, 0, angles[index])
            );

          joints[name].quaternion
            .copy(this.activeRest[index])
            .slerp(targetRotation, blend);
        });

        wrapper.position.set(
          baseX * blend,
          mix(this.baseY, baseY, blend),
          0
        );

        this.render();
      },

      reset() {
        this.activeRest = rest;

        this.frontRenderer?.dispose();
        this.gripLayer?.remove();

        this.frontRenderer = null;
        this.gripLayer = null;

        movingJoints.forEach((name, index) => {
          joints[name].quaternion.copy(rest[index]);
        });

        wrapper.position.set(0, this.baseY, 0);

        this.setGrip(0);
        this.render();
      }
    };

    function resizeRobot() {
      const width = container.clientWidth;
      const height = container.clientHeight;

      if (!width || !height || transitioning) return;

      view.width = width;
      view.height = height;

      view.scale = Math.min(
        height * .155,
        width * .24,
        138
      );

      view.baseY = -height * .21;

      wrapper.scale.setScalar(view.scale);
      wrapper.position.set(0, view.baseY, 0);

      camera.left = -width / 2;
      camera.right = width / 2;
      camera.top = height / 2;
      camera.bottom = -height / 2;

      camera.updateProjectionMatrix();

      renderer.setSize(width, height);

      view.render();
    }

    new ResizeObserver(resizeRobot).observe(container);

    robotView = view;

    resizeRobot();

    placeholder?.remove();

    notifyHomeReady();
  } catch (error) {
    renderer?.domElement.remove();
    renderer?.dispose();

    if (placeholder) {
      placeholder.textContent =
        'Use a corner to explore the portfolio.';
    }

    console.error('Could not load robotic arm:', error);

    notifyHomeReady();
  }
}

async function buildSheet(link) {
  const response = await fetch(link.href, {
    signal: AbortSignal.timeout(4000)
  });

  if (!response.ok) {
    throw new Error(`Page returned ${response.status}`);
  }

  const doc = new DOMParser().parseFromString(
    await response.text(),
    'text/html'
  );

  const main = doc.querySelector('main');

  if (!main) {
    throw new Error('The destination page has no main content.');
  }

  const sheet = document.createElement('div');

  sheet.className = 'incoming-sheet';
  sheet.setAttribute('aria-hidden', 'true');
  sheet.inert = true;

  const preview = document.createElement('div');

  preview.className = `sheet-preview ${doc.body.className}`;

  for (const element of [doc.querySelector('header'), main]) {
    if (!element) continue;

    const clone = element.cloneNode(true);

    clone.querySelectorAll('script').forEach(script => {
      script.remove();
    });

    if (clone.id) clone.removeAttribute('id');

    clone.querySelectorAll('[id]').forEach(node => {
      node.removeAttribute('id');
    });

    preview.appendChild(clone);
  }

  sheet.appendChild(preview);

  return sheet;
}

async function openPaper(event, link) {
  if (
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  ) {
    return;
  }

  if (transitioning) {
    event.preventDefault();
    return;
  }

  if (!robotView || reducedMotion.matches) return;

  event.preventDefault();

  transitioning = true;

  document.body.classList.add('is-transitioning');
  link.classList.add('is-selected');

  const status = document.querySelector('#transition-status');

  if (status) {
    status.textContent = `Opening ${
      link.id === 'projects-edge' ? 'Projects' : 'About Me'
    }.`;
  }

  const side = link.classList.contains('page-peek-left')
    ? 'left'
    : 'right';

  const view = robotView;

  const navigate = () => {
    window.location.assign(link.href);
  };

  const resizeDuringTransition = () => navigate();

  window.addEventListener(
    'resize',
    resizeDuringTransition,
    { once: true }
  );

  const watchdog = setTimeout(navigate, 7500);

  try {
    const sheetPromise = buildSheet(link).then(
      value => ({ value }),
      error => ({ error })
    );

    await view.prepareSide(side);

    const start = view.tipOnScreen();

    const cornerSize = link.getBoundingClientRect().width;

    const grip = {
      x: side === 'left'
        ? cornerSize * .65
        : innerWidth - cornerSize * .65,

      y: innerHeight - cornerSize * .58
    };

    await animate(1050, t => {
      const x = mix(start.x, grip.x, t);

      const y =
        mix(start.y, grip.y, t) -
        Math.sin(t * Math.PI) * 55;

      view.follow(
        x,
        y,
        side,
        Math.min(t * 2, 1)
      );
    });

    await animate(200, t => {
      view.setGrip(t);
      view.render();
    });

    const result = await sheetPromise;

    if (result.error) throw result.error;

    const sheet = result.value;

    const width = innerWidth;
    const height = innerHeight;

    const finalWidth = width * .76;
    const finalHeight = height * .80;

    const startX = side === 'left'
      ? grip.x - finalWidth
      : grip.x;

    const startY = grip.y;

    const endX = (width - finalWidth) / 2;
    const endY = (height - finalHeight) / 2;

    const preview = sheet.firstElementChild;

    function place(x, y, w, h, unfold = 1) {
      sheet.style.width = `${w}px`;
      sheet.style.height = `${h}px`;

      sheet.style.transform = `translate(${x}px, ${y}px)`;

      sheet.style.borderRadius = `${(1 - unfold) * 9}px`;

      preview.style.transform = `scale(${w / width})`;
    }

    place(
      startX,
      startY,
      finalWidth,
      finalHeight,
      0
    );

    document.body.appendChild(sheet);

    view.beginGripLayer();

    link.style.visibility = 'hidden';

    await animate(1050, t => {
      const x = mix(startX, endX, t);

      const y =
        mix(startY, endY, t) -
        Math.sin(Math.PI * t) * 35;

      place(
        x,
        y,
        finalWidth,
        finalHeight,
        t
      );

      view.follow(
        side === 'left' ? x + finalWidth : x,
        y,
        side
      );
    });

    await animate(140, t => {
      view.setGrip(1 - t);
      view.render();
    });

    await animate(440, t => {
      place(
        mix(endX, 0, t),
        mix(endY, 0, t),
        mix(finalWidth, width, t),
        mix(finalHeight, height, t)
      );

      view.renderer.domElement.style.opacity = String(1 - t);
      view.gripLayer.style.opacity = String(1 - t);

      sheet.style.boxShadow =
        `0 16px 90px rgb(32 37 30 / ${.19 * (1 - t)})`;
    });

    navigate();
  } catch (error) {
    console.error('Paper transition unavailable:', error);
    navigate();
  } finally {
    clearTimeout(watchdog);

    window.removeEventListener(
      'resize',
      resizeDuringTransition
    );
  }
}

async function createHomePortal(url) {
  const effect = document.createElement('div');

  effect.className = 'home-return-effect';
  effect.setAttribute('aria-hidden', 'true');
  effect.inert = true;

  const opening = document.createElement('div');
  opening.className = 'portal-opening';

  const frame = document.createElement('iframe');

  frame.title = 'Home preview';
  frame.tabIndex = -1;

  opening.appendChild(frame);

  const cut = document.createElement('div');

  cut.className = 'portal-cut';

  cut.innerHTML = `
    <svg viewBox="0 0 112 112">
      <circle
        cx="56"
        cy="56"
        r="48"
        pathLength="100"
      />
    </svg>
  `;

  const disc = document.createElement('div');
  disc.className = 'portal-disc';

  const impact = document.createElement('div');

  impact.className = 'portal-impact';

  impact.innerHTML = `
    <svg viewBox="0 0 200 200">
      <path d="
        M94 88L78 61 74 44
        M113 91L140 70 157 69
        M117 107L144 125 150 144
        M94 116L79 147 63 155
        M84 102L55 105 39 95
        M104 83L111 53 103 32
      "/>
    </svg>
  `;

  const hand = document.createElement('div');
  hand.className = 'portal-gripper';

  effect.append(
    opening,
    cut,
    disc,
    impact,
    hand
  );

  document.body.appendChild(effect);

  let timer;
  let ready;
  let onMessage;
  let renderer;
  let source;

  const loaded = new Promise(resolve => {
    ready = resolve;

    onMessage = event => {
      if (
        event.origin === location.origin &&
        event.source === frame.contentWindow &&
        event.data?.type === 'portfolio:home-ready'
      ) {
        resolve();
      }
    };

    window.addEventListener('message', onMessage);

    timer = setTimeout(resolve, 4500);
  }).finally(() => {
    clearTimeout(timer);

    window.removeEventListener(
      'message',
      onMessage
    );
  });

  frame.src = url.href;

  const dispose = () => {
    clearTimeout(timer);

    window.removeEventListener(
      'message',
      onMessage
    );

    ready?.();

    renderer?.dispose();

    const geometries = new Set();
    const materials = new Set();

    source?.traverse(node => {
      if (node.geometry) {
        geometries.add(node.geometry);
      }

      if (node.material) {
        const items = Array.isArray(node.material)
          ? node.material
          : [node.material];

        items.forEach(material => {
          materials.add(material);
        });
      }
    });

    geometries.forEach(geometry => {
      geometry.dispose();
    });

    materials.forEach(material => {
      material.dispose();
    });

    effect.remove();
  };

  returnEffect = { dispose };

  const [THREE, { GLTFLoader }] = await loadRobotModules();

  const modelUrl = new URL(
    'assets/projects/robotic-arm-v2.glb',
    url
  );

  const gltf = await new GLTFLoader().loadAsync(
    modelUrl.href
  );

  source = gltf.scene;

  const original = source.getObjectByName('Gripper');

  if (!original) {
    throw new Error('Gripper missing from the model.');
  }

  const gripper = original.clone(true);

  gripper.position.set(0, 0, 0);
  gripper.rotation.set(.65, 0, 0);

  const left = gripper.getObjectByName('Jaw_Left');
  const right = gripper.getObjectByName('Jaw_Right');

  if (left && right) {
    left.position.x += .055;
    right.position.x -= .055;
  }

  const rig = new THREE.Group();

  rig.add(gripper);

  const bounds = new THREE.Box3().setFromObject(gripper);

  gripper.position.sub(
    bounds.getCenter(new THREE.Vector3())
  );

  const size = bounds.getSize(new THREE.Vector3());

  rig.scale.setScalar(
    1.45 / Math.max(size.x, size.y, size.z)
  );

  const scene = new THREE.Scene();

  scene.add(
    rig,
    new THREE.HemisphereLight(
      0xffffff,
      0x555e50,
      2.4
    )
  );

  const light = new THREE.DirectionalLight(
    0xffffff,
    3
  );

  light.position.set(3, 4, 6);
  scene.add(light);

  const camera = new THREE.PerspectiveCamera(
    36,
    1,
    .1,
    100
  );

  camera.position.z = 6;

  renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true
  });

  renderer.setPixelRatio(
    Math.min(window.devicePixelRatio || 1, 2)
  );

  renderer.setSize(220, 220);
  renderer.setClearColor(0, 0);

  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  hand.appendChild(renderer.domElement);

  const circle = cut.querySelector('circle');

  await loaded;

  return {
    dispose,
    effect,
    hand,
    disc,
    cut,
    impact,
    rig,

    render() {
      renderer.render(scene, camera);
    },

    reveal(radius) {
  const edges = [
    1, .83, .96, .88,
    1.04, .86, .98, .81,
    1.02, .89, .95, .84,
    1.03, .87, .97, .82,
    1.01, .88, .96, .85,
    1.04, .83, .99, .87
  ];

  const points = edges.map((edge, index) => {
    const angle =
      index / edges.length * Math.PI * 2;

    const x =
      innerWidth / 2 +
      Math.cos(angle) * radius * edge;

    const y =
      innerHeight / 2 +
      Math.sin(angle) * radius * edge;

    return `${x}px ${y}px`;
  });

  opening.style.clipPath =
    `polygon(${points.join(',')})`;
},

    cutProgress(progress) {
      circle.style.strokeDashoffset =
        String(100 * (1 - progress));
    }
  };
}

async function returnHome(event, link) {
  if (
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  ) {
    return;
  }

  if (reducedMotion.matches) return;

  if (transitioning) {
    event.preventDefault();
    return;
  }

  event.preventDefault();

  transitioning = true;

  document.body.classList.add('is-returning');

  const url = new URL(link.href);

  const navigate = () => {
    location.assign(url.href);
  };

  const watchdog = setTimeout(navigate, 10000);

  window.addEventListener(
    'resize',
    navigate,
    { once: true }
  );

  try {
    const portal = await createHomePortal(url);

    portal.cut.remove();
    portal.disc.remove();

    await animate(240, t => {
      portal.hand.style.opacity = String(t);

      portal.rig.position.set(
        0,
        0,
        mix(-4, -1.4, t)
      );

      portal.render();
    });

    await animate(140, t => {
      portal.rig.position.z =
        mix(-1.4, 1.5, t);

      portal.render();
    });

    document.body.classList.add('is-impacting');

    portal.impact.style.opacity = '1';

    await animate(150, t => {
      portal.reveal(mix(0, 65, t));

      portal.rig.position.z =
        mix(1.5, 1.15, t);

      portal.render();
    });

    const maximum =
      Math.hypot(innerWidth, innerHeight) / 2 * 1.3;

    await animate(680, t => {
      portal.reveal(
        mix(65, maximum, t)
      );

      portal.rig.position.set(
        0,
        -t * .12,
        mix(1.15, -4, t)
      );

      portal.hand.style.opacity =
        String(Math.max(0, 1 - t * 1.8));

      portal.impact.style.opacity =
        String(Math.max(0, 1 - t * 2.5));

      portal.render();
    });

    navigate();
  } catch (error) {
    console.error(
      'Home transition unavailable:',
      error
    );

    navigate();
  } finally {
    clearTimeout(watchdog);

    window.removeEventListener(
      'resize',
      navigate
    );
  }
}

document.querySelectorAll('.page-peek').forEach(link => {
  link.addEventListener('click', event => {
    openPaper(event, link);
  });
});

document.querySelectorAll('a[href]').forEach(link => {
  if (document.body.classList.contains('home-page')) return;

  const url = new URL(link.href);

  if (
    url.origin === location.origin &&
    url.pathname.endsWith('/index.html')
  ) {
    link.addEventListener('click', event => {
      returnHome(event, link);
    });
  }
});

window.addEventListener('pageshow', event => {
  if (!event.persisted) return;

  transitioning = false;

  document.body.classList.remove(
    'is-transitioning',
    'is-returning',
    'is-impacting'
  );

  returnEffect?.dispose();
  returnEffect = null;

  document.querySelectorAll('.incoming-sheet').forEach(sheet => {
    sheet.remove();
  });

  document.querySelectorAll('.page-peek').forEach(link => {
    link.classList.remove('is-selected');
    link.style.visibility = '';
  });

  if (robotView) {
    robotView.renderer.domElement.style.opacity = '';
    robotView.reset();
  }
});

initRobot();