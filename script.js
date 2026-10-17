const root = document.documentElement;
const header = document.querySelector('header');

let robotView = null;



// HEADER

function updateHeaderHeight() {
    if (!header) {
        return;
    }

    root.style.setProperty(
        '--header-height',
        `${header.getBoundingClientRect().height}px`
    );
}


window.addEventListener(
    'resize',
    updateHeaderHeight
);


window.addEventListener(
    'load',
    updateHeaderHeight
);


if (
    'ResizeObserver' in window &&
    header
) {
    const headerObserver =
        new ResizeObserver(
            updateHeaderHeight
        );

    headerObserver.observe(
        header
    );
}


updateHeaderHeight();



// PROJECT FILTERS

const projectCards = [
    ...document.querySelectorAll(
        '#project-list > .project-item'
    )
];


const projectFilters =
    document.querySelector(
        '.project-filters'
    );


const filterButtons = [
    ...document.querySelectorAll(
        '.filter-button'
    )
];


const projectStatus =
    document.querySelector(
        '#project-status'
    );


function filterProjects(filter) {
    let visibleProjects = 0;

    projectCards.forEach(card => {
        const shouldHide =
            filter !== 'all' &&
            card.dataset.category !== filter;

        card.hidden =
            shouldHide;

        if (!shouldHide) {
            visibleProjects += 1;
        }
    });


    filterButtons.forEach(button => {
        const active =
            button.dataset.filter === filter;

        button.classList.toggle(
            'active',
            active
        );

        button.setAttribute(
            'aria-pressed',
            String(active)
        );
    });


    if (projectStatus) {
        projectStatus.textContent =
            `${visibleProjects} projects shown`;
    }
}


if (
    projectCards.length > 0 &&
    projectFilters
) {
    filterButtons.forEach(button => {
        button.addEventListener(
            'click',
            () => {
                filterProjects(
                    button.dataset.filter
                );
            }
        );
    });

    filterProjects('all');

    projectFilters.hidden = false;
}



// ROBOT

async function initRobot() {
    const container =
        document.querySelector(
            '#robot-container'
        );

    if (!container) {
        return;
    }


    const placeholder =
        container.querySelector(
            '.robot-placeholder'
        );


    let renderer;


    try {
        const [
            THREE,
            { GLTFLoader }
        ] = await Promise.all([
            import('three'),

            import(
                'three/addons/loaders/GLTFLoader.js'
            )
        ]);


        const scene =
            new THREE.Scene();


        const camera =
            new THREE.PerspectiveCamera(
                35,
                1,
                0.1,
                100
            );


        renderer =
            new THREE.WebGLRenderer({
                alpha: true,
                antialias: true
            });


        renderer.setPixelRatio(
            Math.min(
                window.devicePixelRatio,
                2
            )
        );


        renderer.setClearColor(
            0x000000,
            0
        );


        renderer.outputColorSpace =
            THREE.SRGBColorSpace;


        renderer.toneMapping =
            THREE.ACESFilmicToneMapping;


        renderer.toneMappingExposure =
            1.2;


        const canvas =
            renderer.domElement;


        canvas.setAttribute(
            'role',
            'img'
        );


        canvas.setAttribute(
            'aria-label',
            'Interactive robotic arm'
        );


        container.appendChild(
            canvas
        );



        // LIGHTS

        const hemisphereLight =
            new THREE.HemisphereLight(
                0xffffff,
                0x26352c,
                2
            );


        const keyLight =
            new THREE.DirectionalLight(
                0xffffff,
                3
            );


        keyLight.position.set(
            3,
            5,
            6
        );


        const accentLight =
            new THREE.DirectionalLight(
                0x72d68a,
                2
            );


        accentLight.position.set(
            -4,
            1,
            -3
        );


        scene.add(
            hemisphereLight,
            keyLight,
            accentLight
        );



        // MODEL

        const loader =
            new GLTFLoader();


        const gltf =
            await loader.loadAsync(
                'assets/projects/robotic-arm-v2.glb'
            );


        const model =
            gltf.scene;


        const robotWrapper =
            new THREE.Group();


        robotWrapper.add(
            model
        );


        robotWrapper.rotation.set(
            0,
            0,
            0
        );


        robotWrapper.updateMatrixWorld(
            true
        );



        // CENTER MODEL

        const initialBounds =
            new THREE.Box3()
                .setFromObject(
                    robotWrapper
                );


        const initialCenter =
            initialBounds.getCenter(
                new THREE.Vector3()
            );


        robotWrapper.position.sub(
            initialCenter
        );


        scene.add(
            robotWrapper
        );



        // JOINTS

        const joints = {
            baseYaw:
                model.getObjectByName(
                    'J0_BaseYaw'
                ),

            shoulder:
                model.getObjectByName(
                    'J1_Shoulder'
                ),

            elbow:
                model.getObjectByName(
                    'J2_Elbow'
                ),

            wrist:
                model.getObjectByName(
                    'J3_Wrist'
                ),

            wristRoll:
                model.getObjectByName(
                    'J4_WristRoll'
                ),

            gripper:
                model.getObjectByName(
                    'Gripper'
                ),

            jawLeft:
                model.getObjectByName(
                    'Jaw_Left'
                ),

            jawRight:
                model.getObjectByName(
                    'Jaw_Right'
                )
        };


        
        // STARTING POSE

        joints.shoulder.rotation.x =
            THREE.MathUtils.degToRad(15);

        joints.elbow.rotation.x =
            THREE.MathUtils.degToRad(45);

        joints.elbow.rotation.z =
            THREE.MathUtils.degToRad(35);

        joints.wrist.rotation.z =
            THREE.MathUtils.degToRad(-35);


        // RENDER

        function render() {
            renderer.render(
                scene,
                camera
            );
        }



        // RESIZE

        function resizeRobot() {
            const width =
                container.clientWidth;

            const height =
                container.clientHeight;


            if (
                !width ||
                !height
            ) {
                return;
            }


            camera.aspect =
                width / height;


            const bounds =
                new THREE.Box3()
                    .setFromObject(
                        robotWrapper
                    );


            const size =
                bounds.getSize(
                    new THREE.Vector3()
                );


            const verticalFov =
                THREE.MathUtils.degToRad(
                    camera.fov
                );


            const horizontalFov =
                2 *
                Math.atan(
                    Math.tan(
                        verticalFov / 2
                    ) *
                    camera.aspect
                );


            const distance =
                Math.max(
                    size.y /
                    (
                        2 *
                        Math.tan(
                            verticalFov / 2
                        )
                    ),

                    size.x /
                    (
                        2 *
                        Math.tan(
                            horizontalFov / 2
                        )
                    )
                ) *
                1.2 +
                size.z / 2;


            camera.position.set(
                0,
                0,
                distance
            );


            camera.far =
                Math.max(
                    100,
                    distance +
                    size.length() * 4
                );


            camera.lookAt(
                0,
                0,
                0
            );


            camera.updateProjectionMatrix();


            renderer.setSize(
                width,
                height
            );


            render();
        }



        const robotObserver =
            new ResizeObserver(
                resizeRobot
            );


        robotObserver.observe(
            container
        );



        // ROBOT STATE

        robotView = {
            THREE,
            scene,
            camera,
            renderer,
            container,
            model,
            wrapper:
                robotWrapper,
            joints,
            render
        };


        resizeRobot();


        placeholder?.remove();
    }

    catch (error) {
        renderer?.domElement.remove();

        renderer?.dispose();


        if (placeholder) {
            placeholder.textContent =
                'Robot preview unavailable.';
        }


        console.error(
            'Could not load robotic arm:',
            error
        );
    }
}


initRobot();