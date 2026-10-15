const root = document.documentElement;
const header = document.querySelector('header');

let robotView = null;
let robotBusy = false;


/*
    Keeps the CSS header height
    matched with the real header.
*/

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

    const observer =
        new ResizeObserver(
            updateHeaderHeight
        );

    observer.observe(
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



/*
    Loads the robotic arm
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



        /*
            Adds lights
            to the scene.
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
            Loads the robot model.
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
            Renders the robot.
        */

        function render() {

            renderer.render(
                scene,
                camera
            );

        }



        /*
            Keeps the robot fitted
            inside the container.
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


        const resizeObserver =
            new ResizeObserver(
                resizeRobot
            );


        resizeObserver.observe(
            container
        );


        robotView = {

            THREE,

            camera,

            container,

            model,

            render,

            joints: {

                shoulder:
                    model.getObjectByName(
                        'J3_Shoulder'
                    ),

                support:
                    model.getObjectByName(
                        'J4_Tool_support'
                    ),

                wrist:
                    model.getObjectByName(
                        'J5_Camera'
                    ),

                lowerJaw:
                    model.getObjectByName(
                        'Lower_jaw'
                    ),

                upperJaw:
                    model.getObjectByName(
                        'Upper_jaw'
                    )

            }

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



/*
    Reads all arm joints
    used by the animation.
*/

function getArmPose() {

    const { joints } =
        robotView;


    return {

        shoulderY:
            joints.shoulder.rotation.y,

        shoulderZ:
            joints.shoulder.rotation.z,

        supportY:
            joints.support.rotation.y,

        supportZ:
            joints.support.rotation.z,

        wristY:
            joints.wrist.rotation.y,

        wristZ:
            joints.wrist.rotation.z,

        lowerJaw:
            joints.lowerJaw.rotation.z,

        upperJaw:
            joints.upperJaw.rotation.z

    };

}



/*
    Applies a position
    to the robot arm.

    The robot base
    never moves.
*/

function applyArmPose(pose) {

    const {
        model,
        joints
    } = robotView;


    joints.shoulder.rotation.y =
        pose.shoulderY;


    joints.shoulder.rotation.z =
        pose.shoulderZ;


    joints.support.rotation.y =
        pose.supportY;


    joints.support.rotation.z =
        pose.supportZ;


    joints.wrist.rotation.y =
        pose.wristY;


    joints.wrist.rotation.z =
        pose.wristZ;


    joints.lowerJaw.rotation.z =
        pose.lowerJaw;


    joints.upperJaw.rotation.z =
        pose.upperJaw;


    model.updateMatrixWorld(
        true
    );

}



/*
    Smoothly moves the arm
    between two positions.
*/

function animateArmPose(
    target,
    duration = 700,
    onFrame = null
) {

    const start =
        getArmPose();


    const startTime =
        performance.now();


    return new Promise(resolve => {


        function frame(now) {

            const progress =
                Math.min(
                    (now - startTime) /
                    duration,
                    1
                );


            const eased =
                progress *
                progress *
                (
                    3 -
                    2 * progress
                );


            const pose = {};


            for (
                const key
                of Object.keys(start)
            ) {

                pose[key] =
                    start[key] +

                    (
                        target[key] -
                        start[key]
                    ) *

                    eased;

            }


            applyArmPose(
                pose
            );


            if (onFrame) {

                onFrame(
                    eased
                );

            }


            robotView.render();


            if (
                progress < 1
            ) {

                requestAnimationFrame(
                    frame
                );

            }

            else {

                resolve();

            }

        }


        requestAnimationFrame(
            frame
        );

    });

}



/*
    Creates the arm position
    for the selected corner.

    Shoulder stays fixed.
*/

function createReachPose(
    restingPose,
    side
) {

    if (
        side === 'left'
    ) {

        return {

            ...restingPose,

            shoulderY:
                restingPose.shoulderY,

            shoulderZ:
                restingPose.shoulderZ,

            supportY:
                restingPose.supportY -
                0.95,

            supportZ:
                restingPose.supportZ +
                0.18,

            wristY:
                restingPose.wristY +
                0.7,

            wristZ:
                restingPose.wristZ -
                0.16

        };

    }


    return {

        ...restingPose,

        shoulderY:
            restingPose.shoulderY,

        shoulderZ:
            restingPose.shoulderZ,

        supportY:
            restingPose.supportY +
            0.95,

        supportZ:
            restingPose.supportZ +
            0.18,

        wristY:
            restingPose.wristY -
            0.7,

        wristZ:
            restingPose.wristZ -
            0.16

    };

}



/*
    Closes the gripper
    around the page.
*/

function createGrabPose(pose) {

    return {

        ...pose,

        lowerJaw:
            pose.lowerJaw +
            0.1,

        upperJaw:
            pose.upperJaw -
            0.1

    };

}



/*
    Pulls the arm back
    toward the center.

    Gripper remains closed.
*/

function createPullPose(
    restingPose,
    grabPose,
    side
) {

    if (
        side === 'left'
    ) {

        return {

            ...restingPose,

            shoulderY:
                restingPose.shoulderY,

            shoulderZ:
                restingPose.shoulderZ,

            supportY:
                restingPose.supportY -
                0.22,

            supportZ:
                restingPose.supportZ +
                0.05,

            wristY:
                restingPose.wristY +
                0.15,

            wristZ:
                restingPose.wristZ -
                0.04,

            lowerJaw:
                grabPose.lowerJaw,

            upperJaw:
                grabPose.upperJaw

        };

    }


    return {

        ...restingPose,

        shoulderY:
            restingPose.shoulderY,

        shoulderZ:
            restingPose.shoulderZ,

        supportY:
            restingPose.supportY +
            0.22,

        supportZ:
            restingPose.supportZ +
            0.05,

        wristY:
            restingPose.wristY -
            0.15,

        wristZ:
            restingPose.wristZ -
            0.04,

        lowerJaw:
            grabPose.lowerJaw,

        upperJaw:
            grabPose.upperJaw

    };

}



/*
    Opens the gripper
    after the pull.
*/

function createReleasePose(
    pose,
    restingPose
) {

    return {

        ...pose,

        lowerJaw:
            restingPose.lowerJaw,

        upperJaw:
            restingPose.upperJaw

    };

}



/*
    Keeps the selected
    corner visible.
*/

function lockCorner(edge) {

    edge.classList.add(
        'is-open'
    );


    edge.style.transition =
        'none';


    edge.style.transform =
        'translate(0, 0)';


    edge.style.zIndex =
        '6000';

}



/*
    Pulls the page inward
    together with the arm.
*/

function pullPageWithArm(
    edge,
    pullPose
) {

    const startWidth =
        edge.getBoundingClientRect().width;


    const targetWidth =
        window.innerWidth *
        0.55;


    return animateArmPose(
        pullPose,
        850,
        progress => {

            const width =
                startWidth +

                (
                    targetWidth -
                    startWidth
                ) *

                progress;


            edge.style.width =
                `${width}px`;

        }
    );

}



/*
    Fades the corner label
    before the page opens.
*/

function fadeCornerLabel(edge) {

    edge
        .querySelectorAll('span')
        .forEach(element => {

            element.animate(
                [
                    {
                        opacity: 1
                    },

                    {
                        opacity: 0
                    }
                ],
                {
                    duration: 180,
                    fill: 'forwards'
                }
            );

        });

}



/*
    Expands the selected page
    over the entire screen.
*/

function openFullPage(
    edge,
    restingPose
) {

    fadeCornerLabel(
        edge
    );


    edge.style.zIndex =
        '6000';


    const rect =
        edge.getBoundingClientRect();


    const pageAnimation =
        edge.animate(
            [
                {
                    width:
                        `${rect.width}px`,

                    height:
                        `${rect.height}px`
                },

                {
                    width:
                        '100vw',

                    height:
                        '100vh'
                }
            ],
            {
                duration: 600,

                easing:
                    'cubic-bezier(0.76, 0, 0.24, 1)',

                fill:
                    'forwards'
            }
        );


    const robotAnimation =
        animateArmPose(
            restingPose,
            500
        );


    return Promise.all([

        pageAnimation.finished,

        robotAnimation

    ]);

}



/*
    Runs the corner
    page transition.
*/

function setupCornerGrab(
    edge,
    side
) {

    edge?.addEventListener(
        'click',
        async event => {


            if (!robotView) {
                return;
            }


            if (
                window.matchMedia(
                    '(prefers-reduced-motion: reduce)'
                ).matches
            ) {
                return;
            }


            event.preventDefault();


            if (robotBusy) {
                return;
            }


            const { joints } =
                robotView;


            if (
                Object
                    .values(joints)
                    .some(
                        joint => !joint
                    )
            ) {
                return;
            }


            robotBusy =
                true;


            const destination =
                edge.href;


            const restingPose =
                getArmPose();


            try {

                lockCorner(
                    edge
                );


                robotView.container.style.zIndex =
                    '5000';



                /*
                    Arm reaches toward
                    the selected corner.
                */

                const reachPose =
                    createReachPose(
                        restingPose,
                        side
                    );


                await animateArmPose(
                    reachPose,
                    650
                );



                /*
                    Gripper closes
                    around the page.
                */

                const grabPose =
                    createGrabPose(
                        reachPose
                    );


                await animateArmPose(
                    grabPose,
                    170
                );
                edge.style.zIndex =
                '6000';


                /*
                    Arm retracts while
                    dragging the page.
                */

                const pullPose =
                    createPullPose(
                        restingPose,
                        grabPose,
                        side
                    );


                await pullPageWithArm(
                    edge,
                    pullPose
                );



                /*
                    Gripper releases
                    the page.
                */

                const releasePose =
                    createReleasePose(
                        pullPose,
                        restingPose
                    );


                await animateArmPose(
                    releasePose,
                    160
                );



                /*
                    Page covers
                    the viewport.
                */

                await openFullPage(
                    edge,
                    restingPose
                );


                window.location.href =
                    destination;

            }


            catch (error) {

                console.error(
                    'Could not run page transition:',
                    error
                );


                robotBusy =
                    false;


                window.location.href =
                    destination;

            }

        }

    );

}


const projectsEdge =
    document.querySelector(
        '#projects-edge'
    );


const aboutEdge =
    document.querySelector(
        '#about-edge'
    );


setupCornerGrab(
    projectsEdge,
    'left'
);


setupCornerGrab(
    aboutEdge,
    'right'
);