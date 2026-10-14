/* KACPER POPEK — PORTFOLIO */


/* GLOBAL ELEMENTS */

const root = document.documentElement;
const header = document.querySelector('header');



/* 
   HEADER HEIGHT
   Keeps section offsets synced with the sticky header. */

function updateHeaderHeight() {

    if (!header) return;

    const height = header.getBoundingClientRect().height;

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


if ('ResizeObserver' in window && header) {

    const headerObserver = new ResizeObserver(
        updateHeaderHeight
    );

    headerObserver.observe(header);
}


updateHeaderHeight();



/* 
   PROJECT FILTERS
   Used on projects.html */

const projectCards = [
    ...document.querySelectorAll(
        '#project-list > .project-item'
    )
];

const projectFilters =
    document.querySelector('.project-filters');

const filterButtons = [
    ...document.querySelectorAll(
        '.filter-button'
    )
];

const projectStatus =
    document.querySelector('#project-status');


function filterProjects(filter) {

    let visibleProjects = 0;


    projectCards.forEach(card => {

        const category =
            card.dataset.category;

        const shouldHide =
            filter !== 'all' &&
            category !== filter;

        card.hidden = shouldHide;


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
   ROBOT
   Only runs on index.html when #robot-container exists. */

let robotView = null;
let robotBusy = false;


async function initRobot() {

    const container =
        document.querySelector('#robot-container');


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


        /*  SCENE  */

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



        /*  CANVAS  */

        const canvas =
            renderer.domElement;


        canvas.setAttribute(
            'role',
            'img'
        );


        canvas.setAttribute(
            'aria-label',
            'Interactive 3D robotic arm'
        );


        container.appendChild(canvas);



        /*  LIGHTS  */

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



        /*  LOAD MODEL  */

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


        model.updateMatrixWorld(true);



        /*  CENTER MODEL  */

        const bounds =
            new THREE.Box3()
                .setFromObject(model);


        const center =
            bounds.getCenter(
                new THREE.Vector3()
            );


        const size =
            bounds.getSize(
                new THREE.Vector3()
            );


        model.position.sub(center);


        scene.add(model);



        /*  RENDER  */

        function render() {

            renderer.render(
                scene,
                camera
            );

        }



        /*  RESPONSIVE CANVAS  */

        function resizeRobot() {

            const width =
                container.clientWidth;

            const height =
                container.clientHeight;


            if (!width || !height) {
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



        /*  SAVE ROBOT REFERENCES  */

        robotView = {

            THREE,

            camera,

            container,

            model,

            render,

            joints: {

                base:
                    model.getObjectByName(
                        'J0_Base'
                    ),

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
            'Could not load the robotic arm:',
            error
        );

    }

}


initRobot();



/* ROBOT POSES */

function getRobotPose() {

    const {
        model,
        joints
    } = robotView;


    return {

        x:
            model.position.x,

        y:
            model.position.y,

        turn:
            model.rotation.y,

        shoulder:
            joints.shoulder.rotation.z,

        support:
            joints.support.rotation.z,

        wrist:
            joints.wrist.rotation.z,

        lowerJaw:
            joints.lowerJaw.rotation.z,

        upperJaw:
            joints.upperJaw.rotation.z

    };

}



function applyRobotPose(pose) {

    const {
        model,
        joints
    } = robotView;


    model.position.x =
        pose.x;

    model.position.y =
        pose.y;

    model.rotation.y =
        pose.turn;


    joints.shoulder.rotation.z =
        pose.shoulder;

    joints.support.rotation.z =
        pose.support;

    joints.wrist.rotation.z =
        pose.wrist;

    joints.lowerJaw.rotation.z =
        pose.lowerJaw;

    joints.upperJaw.rotation.z =
        pose.upperJaw;


    model.updateMatrixWorld(true);

}



/* ROBOT ANIMATION */

function animateRobotPose(
    target,
    duration = 700
) {

    const start =
        getRobotPose();


    const startedAt =
        performance.now();


    return new Promise(resolve => {


        function frame(now) {

            const progress =
                Math.min(

                    (now - startedAt) /
                    duration,

                    1

                );


            /*
                Smoothstep easing.

                Similar idea to interpolation:
                start → middle → target
            */

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


            applyRobotPose(pose);

            robotView.render();


            if (progress < 1) {

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



/* FIND PAPER CONTACT POSITION */

function getRobotContactPose(
    restingPose,
    paper
) {

    const {

        THREE,
        model,
        camera,
        container,
        joints

    } = robotView;



    /*
        Start with a pose that moves
        the arm toward the paper.
    */

    const target = {

        ...restingPose,

        turn:
            restingPose.turn - 0.3,

        shoulder:
            restingPose.shoulder + 0.12,

        support:
            restingPose.support - 0.2,

        wrist:
            restingPose.wrist + 0.35

    };



    /*
        Temporarily position the robot
        so we can measure the gripper.
    */

    applyRobotPose(target);

    camera.updateMatrixWorld(true);



    /*
        Approximate center point
        between the gripper pads.
    */

    const gripPoint =
        joints.wrist.localToWorld(

            new THREE.Vector3(
                -1.24,
                0,
                0
            )

        );



    const projectedGrip =
        gripPoint
            .clone()
            .project(camera);


    const canvasRect =
        container.getBoundingClientRect();


    const paperRect =
        paper.getBoundingClientRect();



    /*
        Target the CENTER of the
        TOP edge of the paper.
    */

    const screenX =
        paperRect.left +
        paperRect.width / 2;


    const screenY =
        paperRect.top;



    /*
        Convert browser screen
        coordinates into Three.js
        world coordinates.
    */

    const targetPoint =
        new THREE.Vector3(

            (
                (
                    screenX -
                    canvasRect.left
                ) /

                canvasRect.width

            ) * 2 - 1,


            -(

                (
                    screenY -
                    canvasRect.top
                ) /

                canvasRect.height

            ) * 2 + 1,


            projectedGrip.z

        )
        .unproject(camera);



    target.x +=
        targetPoint.x -
        gripPoint.x;


    target.y +=
        targetPoint.y -
        gripPoint.y;



    /*
        Restore the robot before
        returning the calculated pose.
    */

    applyRobotPose(
        restingPose
    );


    return target;

}



/* ABOUT ME — PAPER GRAB */

const aboutButton =
    document.querySelector(
        '#about-button'
    );


aboutButton?.addEventListener(

    'click',

    async event => {


        /*
            If Three.js is unavailable,
            let the normal link work.
        */

        if (!robotView) {
            return;
        }


        /*
            Reduced motion users use
            normal navigation.
        */

        if (
            window.matchMedia(
                '(prefers-reduced-motion: reduce)'
            ).matches
        ) {

            return;

        }


        const {
            container,
            joints
        } = robotView;


        /*
            Make sure the GLB contains
            every joint we need.
        */

        if (
            Object
                .values(joints)
                .some(
                    joint => !joint
                )
        ) {

            return;

        }


        /*
            From this point forward,
            we control navigation.
        */

        event.preventDefault();


        if (robotBusy) {
            return;
        }


        robotBusy = true;


        const destination =
            aboutButton.href;



        /*
            Create the paper only
            when the interaction starts.
        */

        let paper =
            container.querySelector(
                '.robot-grab-edge'
            );


        if (!paper) {

            paper =
                document.createElement(
                    'div'
                );


            paper.className =
                'robot-grab-edge';


            paper.setAttribute(
                'aria-hidden',
                'true'
            );


            container.appendChild(
                paper
            );

        }



        const restingPose =
            getRobotPose();



        try {

            /*
                Calculate exact position
                of the paper edge.
            */

            const contactPose =
                getRobotContactPose(
                    restingPose,
                    paper
                );



            /*
                Position used when the
                robot pulls upward.
            */

            const pulledPose = {

                ...contactPose,

                y:
                    contactPose.y +
                    0.45,

                shoulder:
                    contactPose.shoulder -
                    0.08,

                wrist:
                    contactPose.wrist -
                    0.08

            };



            /*  REACH PAPER  */

            await animateRobotPose(
                contactPose,
                850
            );



            /*  CLOSE GRIPPER  */

            await animateRobotPose(
                {

                    ...contactPose,

                    lowerJaw:
                        restingPose.lowerJaw +
                        0.1,

                    upperJaw:
                        restingPose.upperJaw -
                        0.1

                },

                300
            );



            paper.classList.add(
                'is-gripped'
            );



            /*  SMALL HOLD  */

            await new Promise(
                resolve =>
                    setTimeout(
                        resolve,
                        250
                    )
            );



            /*  PULL PAPER */

            paper.classList.add(
                'is-pulled'
            );


            await animateRobotPose(
                pulledPose,
                600
            );



            /*
                Temporary behavior:

                after the pull animation,
                open the About page.

                Later this is where we will
                replace the normal navigation
                with the full paper reveal.
            */

            window.location.href =
                destination;

        }


        finally {

            /*
                Cleanup if navigation
                doesn't happen for some reason.
            */

            applyRobotPose(
                restingPose
            );


            robotView.render();


            paper.classList.remove(
                'is-pulled'
            );


            paper.classList.remove(
                'is-gripped'
            );


            robotBusy = false;

        }

    }

);



/* 
   PROJECTS HOME BUTTON */

/*
    Projects currently uses normal navigation.

    Later we will add the second robot
    grab animation here.
*/

const projectsButton =
    document.querySelector(
        '#projects-button'
    );


projectsButton?.addEventListener(
    'click',
    () => {

        /*
            Intentionally empty for now.

            The href in HTML handles
            normal navigation.
        */

    }
);