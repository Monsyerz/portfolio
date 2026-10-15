const root = document.documentElement;
const header = document.querySelector('header');


/*
    Keeps the CSS header height
    matched with the real header.
*/

function updateHeaderHeight() {

    if (!header) {
        return;
    }

    const height =
        header.getBoundingClientRect().height;

    root.style.setProperty(
        '--header-height',
        `${height}px`
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



/*
    Filters projects by category
    on projects.html.
*/

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

        const category =
            card.dataset.category;


        const shouldHide =
            filter !== 'all' &&
            category !== filter;


        card.hidden =
            shouldHide;


        if (!shouldHide) {

            visibleProjects += 1;

        }

    });


    filterButtons.forEach(button => {

        const active =
            button.dataset.filter ===
            filter;


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

    projectFilters.hidden =
        false;

}



/*
    Loads and displays the robotic arm
    only on the home page.
*/

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


    if (placeholder) {

        placeholder.textContent =
            'Loading robotic arm...';


        placeholder.setAttribute(
            'role',
            'status'
        );

    }


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



        /*
            Creates the transparent
            Three.js canvas.
        */

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



        /*
            Adds lighting to the model.
        */

        const hemisphereLight =
            new THREE.HemisphereLight(
                0xffffff,
                0x26352c,
                2
            );


        scene.add(
            hemisphereLight
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


        scene.add(
            keyLight
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
            accentLight
        );



        /*
            Loads the robotic arm model.
        */

        const loader =
            new GLTFLoader();


        const gltf =
            await loader.loadAsync(
                'assets/projects/robotic-arm.glb'
            );


        const model =
            gltf.scene;


        model.rotation.y =
            Math.PI / 2;


        model.updateMatrixWorld(
            true
        );



        /*
            Centers the model inside
            the Three.js scene.
        */

        const bounds =
            new THREE.Box3()
                .setFromObject(
                    model
                );


        const center =
            bounds.getCenter(
                new THREE.Vector3()
            );


        const size =
            bounds.getSize(
                new THREE.Vector3()
            );


        model.position.sub(
            center
        );


        scene.add(
            model
        );



        /*
            Renders the current
            robot scene.
        */

        function render() {

            renderer.render(
                scene,
                camera
            );

        }



        /*
            Keeps the robot fitted
            inside its container.
        */

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


        const robotResizeObserver =
            new ResizeObserver(
                resizeRobot
            );


        robotResizeObserver.observe(
            container
        );


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
            'Could not load the robotic arm:',
            error
        );

    }

}


initRobot();