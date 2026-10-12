/* =========================================================
   BLOOM — SCENE CONTROLLER
   ========================================================= */


/* =========================================================
   BLOOM MUSIC ENGINE
   ========================================================= */

const bloomMusic =
    document.getElementById("bloomMusic");

let musicFadeTimer = null;

function setupBloomMusic() {

    if (!bloomMusic) {
        return;
    }

    if (
        !BLOOM_BIRTHDAY.music ||
        !BLOOM_BIRTHDAY.music.enabled
    ) {
        return;
    }

    bloomMusic.src =
        BLOOM_BIRTHDAY.music.source;

    bloomMusic.preload = "auto";

    bloomMusic.volume = 0;

    bloomMusic.loop = false;
}


function fadeMusicIn() {

    if (!bloomMusic) {
        return;
    }

    const duration =
        (BLOOM_BIRTHDAY.music.fadeIn || 2.5) * 1000;

    clearInterval(musicFadeTimer);

    bloomMusic.volume = 0;

    const steps = 50;
    const stepTime = duration / steps;
    let step = 0;

    musicFadeTimer = setInterval(() => {

        step++;

        bloomMusic.volume =
            Math.min(step / steps, 1);

        if (step >= steps) {

            clearInterval(musicFadeTimer);
            musicFadeTimer = null;

        }

    }, stepTime);
}


function startBloomMusic() {

    if (!bloomMusic) {
        return;
    }

    if (
        !BLOOM_BIRTHDAY.music ||
        !BLOOM_BIRTHDAY.music.enabled
    ) {
        return;
    }

    clearInterval(musicFadeTimer);

    bloomMusic.pause();

    bloomMusic.currentTime =
        BLOOM_BIRTHDAY.music.startAt || 0;

    bloomMusic.volume = 0;

    const playback =
        bloomMusic.play();

    if (playback) {

        playback
            .then(() => {

                fadeMusicIn();

            })
            .catch(error => {

                console.warn(
                    "BLOOM music could not start:",
                    error
                );

            });

    }
}


function fadeMusicOut() {

    if (!bloomMusic) {
        return;
    }

    const duration =
        (BLOOM_BIRTHDAY.music.fadeOut || 4) * 1000;

    clearInterval(musicFadeTimer);

    const startingVolume =
        bloomMusic.volume;

    const steps = 50;
    const stepTime = duration / steps;
    let step = 0;

    musicFadeTimer = setInterval(() => {

        step++;

        bloomMusic.volume =
            Math.max(
                startingVolume * (1 - step / steps),
                0
            );

        if (step >= steps) {

            clearInterval(musicFadeTimer);
            musicFadeTimer = null;

            bloomMusic.pause();

        }

    }, stepTime);
}


setupBloomMusic();


/* =========================================================
   BLOOM — MASTER MUSIC CLOCK
   ========================================================= */

/*
 * BLOOM time is measured from the configured
 * music.startAt position.
 *
 * The music is the master clock.
 *
 * IMPORTANT:
 * These are EXPERIENCE timestamps, not audio-file
 * timestamps.
 */

let bloomAutomationStarted = false;

let bloomAutomationFrame = null;

const BLOOM_TIMELINE = {

    note: 3.0,

    cake: 12.0,

    memories: 21.0,

    heart: 38.0,

    ending: 76.0,

    musicEnd: 84.0

};


const bloomAutomationState = {

    note: false,

    cake: false,

    memories: false,

    heart: false,

    ending: false,

    musicEnd: false

};


/*
 * Returns the number of seconds elapsed since
 * BLOOM began playing its configured music section.
 */
function getBloomSongTime() {

    if (!bloomMusic) {
        return 0;
    }

    return Math.max(
        0,
        bloomMusic.currentTime -
        (BLOOM_BIRTHDAY.music.startAt || 0)
    );

}


/*
 * Start the master animation clock.
 *
 * This is intentionally started only after the
 * user presses Begin, because the browser allows
 * audio playback from that user gesture.
 */
function startBloomAutomation() {

    if (bloomAutomationStarted) {
        return;
    }

    bloomAutomationStarted = true;

    bloomAutomationFrame =
        requestAnimationFrame(
            updateBloomAutomation
        );

}


/*
 * Master automation loop.
 *
 * Nothing here advances according to arbitrary
 * setTimeout chains. The current audio position
 * decides what BLOOM should be doing.
 */
function updateBloomAutomation() {

    if (!bloomAutomationStarted || !bloomMusic) {
        return;
    }

    // BLOOM time starts from 0 at the configured music startAt.
    const songTime = getBloomSongTime();


    // NOTE
    if (
        !bloomAutomationState.note &&
        songTime >= BLOOM_TIMELINE.note
    ) {

        bloomAutomationState.note = true;

        openEnvelope();
    }


    // CAKE
    if (
        !bloomAutomationState.cake &&
        songTime >= BLOOM_TIMELINE.cake
    ) {

        bloomAutomationState.cake = true;

        renderCake();
    }


    // MEMORIES
    if (
        !bloomAutomationState.memories &&
        songTime >= BLOOM_TIMELINE.memories
    ) {

        bloomAutomationState.memories = true;

        startMemorySequence(
            getAvailableMemories()
        );
    }


    // HEART
    if (
        !bloomAutomationState.heart &&
        songTime >= BLOOM_TIMELINE.heart
    ) {

        bloomAutomationState.heart = true;

        beginMemoryHeartMorph();
    }


    // ENDING
    if (
        !bloomAutomationState.ending &&
        songTime >= BLOOM_TIMELINE.ending
    ) {

        bloomAutomationState.ending = true;

        beginBloomEnding();
    }


    // MUSIC END / FADE
    if (
        !bloomAutomationState.musicEnd &&
        songTime >= BLOOM_TIMELINE.musicEnd
    ) {

        bloomAutomationState.musicEnd = true;

        fadeMusicOut();
    }


    bloomAutomationFrame =
        requestAnimationFrame(
            updateBloomAutomation
        );

}


/* =========================================================
   DOM
   ========================================================= */

const scene =
    document.getElementById("scene");

const visual =
    document.getElementById("visual");

const text =
    document.getElementById("text");

const action =
    document.getElementById("action");


const mascot =
    document.getElementById("mascot");

const mascotBubble =
    document.getElementById("mascotBubble");


let mascotMessageTimer = null;


function showMascotMessage(
    message,
    duration = 3200
) {

    if (!mascotBubble) {
        return;
    }

    clearTimeout(
        mascotMessageTimer
    );

    mascotBubble.textContent =
        message;

    mascotBubble.classList.remove(
        "is-visible"
    );

    requestAnimationFrame(() => {

        mascotBubble.classList.add(
            "is-visible"
        );

    });

    if (duration > 0) {

        mascotMessageTimer =
            setTimeout(() => {

                hideMascotMessage();

            }, duration);

    }

}


function hideMascotMessage() {

    if (!mascotBubble) {
        return;
    }

    clearTimeout(
        mascotMessageTimer
    );

    mascotBubble.classList.remove(
        "is-visible"
    );

}


/* =========================================================
   STATES
   ========================================================= */

const STATES = {

    INTRO: "intro",

    ENVELOPE: "envelope",

    NOTE: "note",

    CAKE: "cake",

    MEMORIES: "memories",

    HEART: "heart",

    ENDING: "ending"

};


let currentState =
    STATES.INTRO;


let isTransitioning = false;

let envelopeOpened = false;


/* =========================================================
   CAKE / MEMORY CONTROL
   ========================================================= */

let cakePetalInterval = null;

let memoryTimers = [];

let memoryCards = [];

let memoryOpenedCount = 0;

let memoryTotal = 0;


/* =========================================================
   ORIGINAL BLOOM PETALS
   ========================================================= */

function createPetals(
    count = 12,
    transition = false
) {

    const petals =
        document.createElement("div");


    petals.className =
        transition
            ? "petals petals--transition"
            : "petals";


    for (
        let i = 0;
        i < count;
        i++
    ) {

        const petal =
            document.createElement("span");


        petal.className =
            "petal";


        petal.style.setProperty(
            "--petal-x",
            `${Math.random() * 100}%`
        );


        petal.style.setProperty(
            "--petal-size",
            `${7 + Math.random() * 10}px`
        );


        petal.style.setProperty(
            "--petal-duration",
            `${6 + Math.random() * 7}s`
        );


        petal.style.setProperty(
            "--petal-delay",
            `${Math.random() * -10}s`
        );


        petal.style.setProperty(
            "--petal-drift",
            `${-35 + Math.random() * 70}px`
        );


        petal.style.setProperty(
            "--petal-rotate",
            `${Math.random() * 360}deg`
        );


        petals.appendChild(
            petal
        );

    }


    return petals;

}


/* =========================================================
   ACTION BUTTON
   ========================================================= */

function setAction(
    label,
    callback
) {

    action.textContent =
        label;

    action.onclick =
        callback;


    /*
     * Once BLOOM automation has started,
     * the music clock controls the experience.
     *
     * Begin remains visible because it is the
     * required browser user gesture.
     */
    if (
        bloomAutomationStarted &&
        currentState !== STATES.INTRO
    ) {

        action.hidden =
            true;

        action.disabled =
            true;

        return;

    }


    action.hidden =
        false;

    action.disabled =
        false;

}


/* =========================================================
   STOP MEMORY SYSTEM
   ========================================================= */

function stopMemorySystem() {

    if (
        cakePetalInterval
    ) {

        clearInterval(
            cakePetalInterval
        );

        cakePetalInterval =
            null;

    }


    memoryTimers.forEach(
        timer => clearTimeout(timer)
    );


    memoryTimers = [];


    memoryCards = [];

    memoryOpenedCount = 0;

}


/* =========================================================
   INTRO
   ========================================================= */

function renderIntro() {

    showMascotMessage(
        "Alright… let's start."
    );

    stopMemorySystem();


    currentState =
        STATES.INTRO;


    envelopeOpened =
        false;


    scene.className =
        "scene scene--intro";


    visual.innerHTML = `

        <div class="intro-stars"></div>

        <div class="intro-petal-layer"></div>

        <div class="intro-flower-wrap">

            <div class="intro-flower-glow"></div>

            <img
                class="intro-flower"
                src="assets/images/bloom-flower.png"
                alt=""
            >

        </div>

    `;


    const petalLayer =
        visual.querySelector(
            ".intro-petal-layer"
        );


    petalLayer.appendChild(
        createPetals(18)
    );


    text.innerHTML = `
        <p>
            A little something is waiting to bloom.
        </p>
    `;


    setAction(
    "Begin",
    () => {

        startBloomMusic();

        startBloomAutomation();

        renderEnvelope();

    }
    );

}


/* =========================================================
   ENVELOPE
   ========================================================= */

function renderEnvelope() {

    showMascotMessage(
        "Something special is waiting for you…"
    );

    stopMemorySystem();


    currentState =
        STATES.ENVELOPE;


    scene.className =
        "scene scene--envelope";


    const note =
        BLOOM_BIRTHDAY.note;


    const words =
        note.message
            .join(" ")
            .split(/\s+/);


    const lines = [];


    for (
        let i = 0;
        i < words.length;
        i += 4
    ) {

        lines.push(
            words
                .slice(i, i + 4)
                .join(" ")
        );

    }


    const writingLines =
        lines
            .map(
                (
                    line,
                    index
                ) => `

                    <span
                        class="writing-line"
                        style="--line-index:${index};"
                    >

                        <span
                            class="writing-scribble"
                        ></span>

                        <span
                            class="writing-text"
                        >
                            ${line}
                        </span>

                    </span>

                `
            )
            .join("");


    visual.innerHTML = `

        <div
            class="envelope-transition-petals"
        ></div>


        <div class="envelope-wrap">

            <div class="envelope-glow"></div>


            <div class="envelope">

                <div
                    class="envelope__back"
                ></div>


                <div
                    class="envelope__note"
                >

                    <div
                        class="note__content"
                    >

                        <div
                            class="note__title"
                        >
                            ${note.title}
                        </div>


                        <div
                            class="note__writing"
                        >

                            ${writingLines}

                        </div>

                    </div>

                </div>


                <div
                    class="envelope__front"
                ></div>


                <div
                    class="envelope__flap"
                ></div>


                <div
                    class="envelope__seal"
                >

                    <span>♥</span>

                </div>

            </div>

        </div>

    `;


    const petalLayer =
        visual.querySelector(
            ".envelope-transition-petals"
        );


    petalLayer.appendChild(
        createPetals(
            16,
            true
        )
    );


    text.innerHTML = `
        <p>
            Something special was made for you.
        </p>
    `;


    /*
     * Open is intentionally hidden after
     * automation begins.
     */
    setAction(
        "Open",
        openEnvelope
    );


    requestAnimationFrame(
        () => {

            requestAnimationFrame(
                () => {

                    scene.classList.add(
                        "is-visible"
                    );

                }
            );

        }
    );

}

/* =========================================================
   PART 2/4
   ENVELOPE → NOTE → BIRTHDAY CAKE
   ========================================================= */


/* =========================================================
   OPEN ENVELOPE
   ========================================================= */

function openEnvelope() {

    if (envelopeOpened) {
        return;
    }

    if (currentState !== STATES.ENVELOPE) {
        return;
    }

    envelopeOpened = true;

    if (action) {
        action.disabled = true;
        action.hidden = true;
    }

    scene.classList.add(
        "is-envelope-opening"
    );

    setTimeout(() => {

        if (currentState !== STATES.ENVELOPE) {
            return;
        }

        scene.classList.add(
            "is-postcard-visible"
        );

    }, 550);

    setTimeout(() => {

        if (currentState !== STATES.ENVELOPE) {
            return;
        }

        scene.classList.add(
            "is-writing-visible"
        );

        startNoteWriting();

    }, 1450);
}


/* =========================================================
   AUTOMATIC NOTE WRITING
   ========================================================= */

function startNoteWriting() {

    showMascotMessage(
        "Shall we continue?",
        0
    );

    const lines = [
        ...visual.querySelectorAll(
            ".note__writing .writing-line"
        )
    ];

    if (!lines.length) {

        finishNoteWriting();
        return;

    }

    lines.forEach((line, index) => {

        setTimeout(() => {

            if (
                currentState !== STATES.ENVELOPE
            ) {
                return;
            }

            line.classList.add(
                "is-writing"
            );

        }, index * 250);

    });

    const lastLine =
        lines.length - 1;

    const totalTime =
        lastLine * 250 + 900;

    setTimeout(() => {

        if (
            currentState === STATES.ENVELOPE
        ) {
            finishNoteWriting();
        }

    }, totalTime);

}


/* =========================================================
   NOTE FINISHED
   ========================================================= */

function finishNoteWriting() {

    hideMascotMessage();

    /*
     * In automated mode, the note remains
     * visible until the music clock reaches
     * the cake timestamp.
     */

    if (bloomAutomationStarted) {

        action.hidden = true;
        action.disabled = true;

        return;
    }

    action.disabled = false;

    setAction(
        "Continue",
        () => {

            hideMascotMessage();

            transitionTo(
                STATES.CAKE
            );

        }
    );

}


/* =========================================================
   AVAILABLE MEMORIES
   ========================================================= */

function getAvailableMemories() {

    return (
        BLOOM_BIRTHDAY.photos || []
    )

        .map((src, index) => ({

            src,

            index,

            mystery: index >= 5

        }))

        .filter(item =>

            typeof item.src === "string" &&
            item.src.trim() !== ""

        );

}


/* =========================================================
   CAKE PETAL SYSTEM
   ========================================================= */

/*
 * Pink and amber petals remain alive.
 * Blue memory flakes appear separately
 * during the memory sequence.
 */

function createCakePetals(count = 64) {

    const layer =
        document.createElement("div");

    layer.className =
        "cake-transition-petals";

    Object.assign(layer.style, {

        position: "absolute",

        inset: "0",

        overflow: "hidden",

        zIndex: "20",

        pointerEvents: "none"

    });


    function spawnPetal(
        forceAmber = false
    ) {

        const petal =
            document.createElement("span");

        const size =
            10 + Math.random() * 14;

        const startX =
            Math.random() * 100;

        const drift =
            -70 + Math.random() * 140;

        const rotation =
            Math.random() * 360;

        const amber =
            forceAmber ||
            Math.random() < 0.34;

        Object.assign(petal.style, {

            position: "absolute",

            left: `${startX}%`,

            top: "-30px",

            width: `${size}px`,

            height: `${size * 0.68}px`,

            borderRadius:
                "100% 0 100% 0",

            pointerEvents: "none",

            zIndex:
                amber ? "22" : "21"

        });


        const duration =
            6500 + Math.random() * 3500;


        const pinkGradient = `
            linear-gradient(
                135deg,
                rgba(255,194,228,.95),
                rgba(219,113,181,.72)
            )
        `;

        const amberGradient = `
            linear-gradient(
                135deg,
                rgba(255,211,145,.98),
                rgba(194,122,44,.85)
            )
        `;


        const keyframes = amber

            ? [

                {
                    opacity: 0,

                    transform: `
                        translate3d(0,-30px,0)
                        rotate(${rotation}deg)
                        scale(.75)
                    `,

                    background:
                        pinkGradient
                },

                {
                    opacity: .9,

                    transform: `
                        translate3d(
                            ${drift * .25}px,
                            22vh,
                            0
                        )
                        rotate(${rotation + 100}deg)
                        scale(1)
                    `,

                    background:
                        pinkGradient
                },

                {
                    opacity: .85,

                    transform: `
                        translate3d(
                            ${drift}px,
                            48vh,
                            0
                        )
                        rotate(${rotation + 210}deg)
                        scale(.98)
                    `,

                    background:
                        pinkGradient
                },

                {
                    opacity: .72,

                    transform: `
                        translate3d(
                            ${drift * -.65}px,
                            76vh,
                            0
                        )
                        rotate(${rotation + 320}deg)
                        scale(.9)
                    `,

                    background:
                        amberGradient,

                    boxShadow:
                        "0 0 13px rgba(255,184,75,.45)"
                },

                {
                    opacity: 0,

                    transform: `
                        translate3d(
                            ${drift * .4}px,
                            115vh,
                            0
                        )
                        rotate(${rotation + 440}deg)
                        scale(.7)
                    `,

                    background:
                        amberGradient
                }

            ]

            : [

                {
                    opacity: 0,

                    transform: `
                        translate3d(0,-30px,0)
                        rotate(${rotation}deg)
                        scale(.75)
                    `
                },

                {
                    opacity: .9,

                    transform: `
                        translate3d(
                            ${drift * .25}px,
                            25vh,
                            0
                        )
                        rotate(${rotation + 110}deg)
                        scale(1)
                    `
                },

                {
                    opacity: .72,

                    transform: `
                        translate3d(
                            ${drift}px,
                            55vh,
                            0
                        )
                        rotate(${rotation + 220}deg)
                        scale(.94)
                    `
                },

                {
                    opacity: .5,

                    transform: `
                        translate3d(
                            ${drift * -.7}px,
                            84vh,
                            0
                        )
                        rotate(${rotation + 330}deg)
                        scale(.86)
                    `
                },

                {
                    opacity: 0,

                    transform: `
                        translate3d(
                            ${drift * .4}px,
                            115vh,
                            0
                        )
                        rotate(${rotation + 440}deg)
                        scale(.7)
                    `
                }

            ];


        const animation =
            petal.animate(
                keyframes,
                {

                    duration,

                    easing:
                        "ease-in-out",

                    fill:
                        "forwards"

                }
            );


        animation.onfinish =
            () => petal.remove();


        layer.appendChild(
            petal
        );

    }


    /*
     * Initial petals.
     */

    for (
        let i = 0;
        i < count;
        i++
    ) {

        spawnPetal();

    }


    /*
     * Continuous petals during the
     * birthday and memory scenes.
     */

    let amberPressure = 0;

    cakePetalInterval =
        setInterval(() => {

            amberPressure += .035;

            const forceAmber =
                Math.random() <
                Math.min(
                    .55,
                    .20 + amberPressure
                );

            spawnPetal(
                forceAmber
            );

            if (
                Math.random() > .35
            ) {

                spawnPetal(
                    forceAmber &&
                    Math.random() > .45
                );

            }

        }, 310);


    return layer;

}


/* =========================================================
   BIRTHDAY CAKE
   ========================================================= */

function renderCake() {

    /*
     * Avoid rebuilding the cake scene
     * if it is already active.
     */

    if (
        currentState === STATES.CAKE
    ) {
        return;
    }


    showMascotMessage(
        "Okay… now look closely.",
        3500
    );


    stopMemorySystem();


    currentState =
        STATES.CAKE;


    scene.className =
        "scene scene--cake";


    const memories =
        getAvailableMemories();


    memoryTotal =
        memories.length;


    memoryOpenedCount = 0;

    memoryCards = [];


    visual.innerHTML = `

        <div class="cake-transition">

            <!-- HAPPY BIRTHDAY -->

            <div
                class="birthday-neon"
                aria-hidden="true"
            >

                <svg
                    class="birthday-neon__svg"
                    viewBox="0 0 1000 360"
                    preserveAspectRatio="xMidYMid meet"
                >

                    <g
                        class="birthday-neon__glow"
                    >

                        <text
                            x="500"
                            y="145"
                            text-anchor="middle"
                            class="birthday-neon__text"
                        >
                            Happy
                        </text>

                        <text
                            x="500"
                            y="285"
                            text-anchor="middle"
                            class="birthday-neon__text"
                        >
                            Birthday
                        </text>

                    </g>


                    <g
                        class="birthday-neon__tube"
                    >

                        <text
                            x="500"
                            y="145"
                            text-anchor="middle"
                            class="
                                birthday-neon__text
                                birthday-neon__draw
                                birthday-neon__happy
                            "
                        >
                            Happy
                        </text>


                        <text
                            x="500"
                            y="285"
                            text-anchor="middle"
                            class="
                                birthday-neon__text
                                birthday-neon__draw
                                birthday-neon__birthday
                            "
                        >
                            Birthday
                        </text>

                    </g>

                </svg>

            </div>


            <!-- ORIGINAL PETAL FIELD -->

            <div
                class="cake-transition-petals"
            ></div>


            <!-- BLUE MEMORY FLAKES -->

            <div
                class="memory-flake-layer"
            ></div>


            <!-- CAKE -->

            <div
                class="cake-darkness"
            ></div>


            <div
                class="cake-stage"
            >

                <div
                    class="cake-plate"
                ></div>


                <div
                    class="cake"
                >

                    <div
                        class="cake-top"
                    >

                        <div
                            class="cake-frosting"
                        ></div>


                        <div
                            class="
                                cake-sprinkle
                                sprinkle-1
                            "
                        ></div>


                        <div
                            class="
                                cake-sprinkle
                                sprinkle-2
                            "
                        ></div>


                        <div
                            class="
                                cake-sprinkle
                                sprinkle-3
                            "
                        ></div>


                        <div
                            class="
                                cake-sprinkle
                                sprinkle-4
                            "
                        ></div>


                        <div
                            class="
                                cake-sprinkle
                                sprinkle-5
                            "
                        ></div>

                    </div>


                    <div
                        class="cake-middle"
                    ></div>


                    <div
                        class="cake-bottom"
                    ></div>

                </div>

            </div>


            <!-- CANDLES -->

            <div
                class="candle-stage"
            >

                <div
                    class="
                        candle
                        candle--one
                    "
                >

                    <div
                        class="candle-flame"
                    ></div>

                </div>


                <div
                    class="
                        candle
                        candle--two
                    "
                >

                    <div
                        class="candle-flame"
                    ></div>

                </div>


                <div
                    class="
                        candle
                        candle--three
                    "
                >

                    <div
                        class="candle-flame"
                    ></div>

                </div>

            </div>


            <!-- MEMORY CARDS -->

            <div
                class="memory-card-layer"
            ></div>


            <!-- PAPER HEART -->

            <div
                class="memory-heart-layer"
            ></div>

        </div>

    `;


    text.innerHTML = "";

    action.hidden = true;


    /*
     * Start the original pink and
     * amber petal animation.
     */

    const petalLayer =
        visual.querySelector(
            ".cake-transition-petals"
        );


    if (petalLayer) {

        petalLayer.replaceWith(
            createCakePetals(30)
        );

    }


    /*
     * Reveal the birthday cake.
     */

    requestAnimationFrame(() => {

        requestAnimationFrame(() => {

            if (
                currentState === STATES.CAKE
            ) {

                scene.classList.add(
                    "is-cake-visible"
                );

            }

        });

    });


    /*
     * IMPORTANT:
     *
     * The music clock will trigger
     * startMemorySequence().
     *
     * Do not start it here as well,
     * otherwise memories appear twice.
     */

    if (
        memories.length &&
        !bloomAutomationStarted
    ) {

        startMemorySequence(
            memories
        );

    }

}

/* =========================================================
   PART 3/4
   MEMORY SYSTEM → POLAROIDS → HEART
   ========================================================= */


/* =========================================================
   MEMORY POSITIONS
   ========================================================= */

const MEMORY_POSITIONS = [

    {
        x: 19,
        y: 24
    },

    {
        x: 78,
        y: 22
    },

    {
        x: 50,
        y: 39
    },

    {
        x: 17,
        y: 57
    },

    {
        x: 80,
        y: 57
    },

    {
        x: 29,
        y: 73
    },

    {
        x: 70,
        y: 74
    },

    {
        x: 50,
        y: 68
    }

];


/* =========================================================
   MEMORY SEQUENCE
   ========================================================= */

function startMemorySequence(
    memories
) {

    if (
        !memories ||
        !memories.length
    ) {
        return;
    }


    /*
     * Make sure we are actually inside
     * the cake scene.
     */

    if (
        currentState !== STATES.CAKE
    ) {
        return;
    }


    scene.classList.add(
        "is-memory-focus"
    );


    /*
     * Six memories are currently supported
     * by the heart formation.
     *
     * They appear sequentially.
     *
     * The music clock decides when this
     * sequence begins. These internal delays
     * only control the spacing between cards.
     */

    memories.forEach(
        (
            memory,
            index
        ) => {

            addMemoryTimer(
                () => {

                    if (
                        currentState !== STATES.CAKE
                    ) {
                        return;
                    }

                    createMemoryFlake(
                        memory,
                        index
                    );

                },

                index * 1550

            );

        }
    );

}


/* =========================================================
   MEMORY TIMER
   ========================================================= */

function addMemoryTimer(
    callback,
    delay
) {

    const timer =
        setTimeout(
            callback,
            delay
        );


    memoryTimers.push(
        timer
    );

}


/* =========================================================
   CREATE BLUE MEMORY FLAKE
   ========================================================= */

function createMemoryFlake(
    memory,
    index
) {

    const layer =
        visual.querySelector(
            ".memory-flake-layer"
        );


    if (
        !layer
    ) {
        return;
    }


    const flake =
        document.createElement(
            "span"
        );


    flake.className =
        "memory-flake";


    const target =
        MEMORY_POSITIONS[
            index %
            MEMORY_POSITIONS.length
        ];


    const size =
        11 +
        Math.random() * 6;


    const rotation =
        Math.random() * 360;


    flake.style.left =
        `${Math.random() * 100}%`;

    flake.style.top =
        "-35px";

    flake.style.width =
        `${size}px`;

    flake.style.height =
        `${size * .68}px`;


    layer.appendChild(
        flake
    );


    const drift =
        -35 +
        Math.random() * 70;


    const fall =
        flake.animate(
            [

                {
                    opacity: 0,

                    transform: `
                        translate3d(
                            0,
                            -30px,
                            0
                        )
                        rotate(${rotation}deg)
                        scale(.72)
                    `,

                    background: `
                        linear-gradient(
                            135deg,
                            rgba(255,194,228,.98),
                            rgba(219,113,181,.78)
                        )
                    `,

                    boxShadow:
                        "0 0 9px rgba(255,145,213,.25)"
                },


                {
                    opacity: .95,

                    transform: `
                        translate3d(
                            ${drift}px,
                            22vh,
                            0
                        )
                        rotate(${rotation + 120}deg)
                        scale(1)
                    `,

                    background: `
                        linear-gradient(
                            135deg,
                            rgba(255,194,228,.98),
                            rgba(219,113,181,.78)
                        )
                    `
                },


                {
                    opacity: .92,

                    transform: `
                        translate3d(
                            ${drift * -.5}px,
                            43vh,
                            0
                        )
                        rotate(${rotation + 230}deg)
                        scale(.98)
                    `,

                    background: `
                        linear-gradient(
                            135deg,
                            rgba(255,211,145,.98),
                            rgba(194,122,44,.86)
                        )
                    `,

                    boxShadow:
                        "0 0 14px rgba(255,184,75,.42)"
                },


                {
                    opacity: 1,

                    transform: `
                        translate3d(
                            ${drift}px,
                            60vh,
                            0
                        )
                        rotate(${rotation + 310}deg)
                        scale(1.02)
                    `,

                    background: `
                        linear-gradient(
                            135deg,
                            rgba(191,239,255,1),
                            rgba(74,177,219,.96)
                        )
                    `,

                    boxShadow:
                        "0 0 15px rgba(106,211,255,.55)"
                },


                {
                    opacity: 1,

                    transform: `
                        translate3d(
                            0,
                            0,
                            0
                        )
                        rotate(${rotation + 380}deg)
                        scale(1.08)
                    `,

                    background: `
                        linear-gradient(
                            135deg,
                            rgba(191,239,255,1),
                            rgba(74,177,219,.96)
                        )
                    `,

                    boxShadow: `
                        0 0 18px
                        rgba(106,211,255,.72),

                        0 0 32px
                        rgba(106,211,255,.18)
                    `
                }

            ],

            {

                duration:
                    3400,

                easing:
                    "cubic-bezier(.2,.7,.2,1)",

                fill:
                    "forwards"

            }
        );


    fall.onfinish =
        () => {

            /*
             * Lock the flake into its
             * final memory position.
             */

            flake.style.left =
                `${target.x}%`;

            flake.style.top =
                `${target.y}%`;

            flake.style.transform = `
                translate3d(
                    -50%,
                    -50%,
                    0
                )
                scale(1.08)
            `;


            flake.classList.add(
                "memory-flake--resting"
            );


            /*
             * Turn the flake into its
             * Polaroid after it settles.
             */

            addMemoryTimer(
                () => {

                    if (
                        currentState !== STATES.CAKE
                    ) {
                        return;
                    }

                    openMemoryFromFlake(
                        flake,
                        memory,
                        index
                    );

                },

                700
            );

        };

}


/* =========================================================
   FLAKE → POLAROID
   ========================================================= */

function openMemoryFromFlake(
    flake,
    memory,
    index
) {

    const layer =
        visual.querySelector(
            ".memory-card-layer"
        );


    if (
        !layer
    ) {
        return;
    }


    const card =
        document.createElement(
            "div"
        );


    card.className = `
        memory-card
        memory-card--${index + 1}
    `;


    card.style.left =
        flake.style.left;


    card.style.top =
        flake.style.top;


    /*
     * Mystery Polaroids use the existing
     * mystery-card treatment.
     */

    if (
        memory.mystery
    ) {

        card.classList.add(
            "memory-card--mystery"
        );


        card.innerHTML = `

            <img
                class="memory-card__mystery-image"
                src="${memory.src}"
                alt=""
            >

        `;

    }


    /*
     * Normal memory Polaroid.
     */

    else {

        card.innerHTML = `

            <div
                class="memory-card__tape"
            ></div>


            <div
                class="memory-card__photo-wrap"
            >

                <img
                    class="memory-card__photo"
                    src="${memory.src}"
                    alt=""
                >

            </div>

        `;

    }


    layer.appendChild(
        card
    );


    memoryCards.push(
        card
    );


    /*
     * First memory gets the mascot reaction.
     */

    if (
        index === 0
    ) {

        showMascotMessage(
            "Oh… there are memories here.",
            3500
        );

    }


    flake.classList.add(
        "memory-flake--opening"
    );


    requestAnimationFrame(
        () => {

            card.classList.add(
                "memory-card--opening"
            );

        }
    );


    /*
     * Allow the Polaroid to finish opening.
     */

    addMemoryTimer(
        () => {

            if (
                !card.isConnected
            ) {
                return;
            }


            flake.remove();


            card.classList.remove(
                "memory-card--opening"
            );


            card.classList.add(
                "memory-card--open"
            );


            memoryOpenedCount++;


            /*
             * Do NOT automatically trigger the
             * heart here.
             *
             * The music clock is responsible for
             * the exact heart timestamp.
             */

        },

        760
    );

}


/* =========================================================
   POLAROIDS → PAPER HEART
   ========================================================= */

function beginMemoryHeartMorph() {

    const memoryCardLayer =
        visual.querySelector(
            ".memory-card-layer"
        );


    if (
        !memoryCardLayer
    ) {

        return false;

    }


    const cards = [
        ...memoryCardLayer.querySelectorAll(
            ".memory-card"
        )
    ];


    /*
     * The heart requires six cards.
     */

    if (
        cards.length < 6
    ) {

        return false;

    }


    /*
     * Prevent duplicate triggers.
     */

    if (
        scene.classList.contains(
            "is-memory-morphing"
        )
    ) {

        return true;

    }


    scene.classList.add(
        "is-memory-morphing"
    );


    /* =====================================================
       PERSON NAME
       ===================================================== */

    const personName =
        BLOOM_BIRTHDAY.person.name;


    const existingName =
        scene.querySelector(
            ".memory-name"
        );


    if (
        !existingName
    ) {

        const name =
            document.createElement(
                "div"
            );


        name.className =
            "memory-name";


        name.innerHTML = `

            <svg
                class="memory-name__svg"
                viewBox="0 0 700 190"
                aria-hidden="true"
            >

                <defs>

                    <filter
                        id=spectreGlow"
                        x="-60%"
                        y="-60%"
                        width="220%"
                        height="220%"
                    >

                        <feGaussianBlur
                            stdDeviation="5"
                            result="blur1"
                        />

                        <feGaussianBlur
                            in="SourceGraphic"
                            stdDeviation="1.2"
                            result="blur2"
                        />

                        <feMerge>

                            <feMergeNode
                                in="blur1"
                            />

                            <feMergeNode
                                in="blur2"
                            />

                            <feMergeNode
                                in="SourceGraphic"
                            />

                        </feMerge>

                    </filter>

                </defs>


                <text
                    class="memory-name__glow"
                    x="350"
                    y="128"
                    text-anchor="middle"
                >
                    ${personName}
                </text>


                <text
                    class="memory-name__stroke"
                    x="350"
                    y="128"
                    text-anchor="middle"
                >
                    ${personName}
                </text>

            </svg>

        `;


        scene.appendChild(
            name
        );


        requestAnimationFrame(() => {

            name.classList.add(
                "is-visible"
            );

        });

    }


    /* =====================================================
       HEART POSITIONS
       ===================================================== */

    const heartPositions = [

        {
            x: -82,
            y: -48,
            r: -10
        },

        {
            x: 82,
            y: -48,
            r: 10
        },

        {
            x: -92,
            y: 18,
            r: -7
        },

        {
            x: 0,
            y: 5,
            r: 0
        },

        {
            x: 92,
            y: 18,
            r: 7
        },

        {
            x: 0,
            y: 92,
            r: 0
        }

    ];


    const centerX =
        window.innerWidth / 2;


    const centerY =
        window.innerHeight / 2;


    /*
     * Only the first six cards participate
     * in the heart.
     */

    cards
        .slice(0, 6)
        .forEach(
            (
                card,
                index
            ) => {

                const target =
                    heartPositions[index];


                const rect =
                    card.getBoundingClientRect();


                const currentX =
                    rect.left +
                    rect.width / 2;


                const currentY =
                    rect.top +
                    rect.height / 2;


                const targetX =
                    centerX +
                    target.x;


                const targetY =
                    centerY +
                    target.y;


                const moveX =
                    targetX -
                    currentX;


                const moveY =
                    targetY -
                    currentY;


                card.classList.remove(
                    "memory-card--heart-form"
                );


                card.style.animation =
                    "none";


                card.style.opacity =
                    "1";


                card.animate(
                    [

                        {
                            transform: `
                                translate3d(
                                    -50%,
                                    -50%,
                                    0
                                )
                                rotate(
                                    var(--card-rotation)
                                )
                                scale(1)
                            `,

                            opacity: 1
                        },


                        {
                            transform: `
                                translate3d(
                                    calc(
                                        -50% +
                                        ${moveX * .45}px
                                    ),
                                    calc(
                                        -50% +
                                        ${moveY * .45}px
                                    ),
                                    0
                                )
                                rotate(
                                    ${target.r * .5}deg
                                )
                                scale(.78)
                            `,

                            opacity: 1
                        },


                        {
                            transform: `
                                translate3d(
                                    calc(
                                        -50% +
                                        ${moveX * .78}px
                                    ),
                                    calc(
                                        -50% +
                                        ${moveY * .78}px
                                    ),
                                    0
                                )
                                rotate(
                                    ${target.r}deg
                                )
                                scale(.60)
                            `,

                            opacity: 1
                        },


                        {
                            transform: `
                                translate3d(
                                    calc(
                                        -50% +
                                        ${moveX}px
                                    ),
                                    calc(
                                        -50% +
                                        ${moveY}px
                                    ),
                                    0
                                )
                                rotate(
                                    ${target.r}deg
                                )
                                scale(.52)
                            `,

                            opacity: 1
                        }

                    ],

                    {

                        duration:
                            3000,

                        delay:
                            index * 120,

                        easing:
                            "cubic-bezier(.18,.78,.22,1)",

                        fill:
                            "forwards"

                    }
                );

            }
        );


    /*
     * The completed heart gets its final
     * visual state after the movement.
     */

    setTimeout(
        () => {

            if (
                currentState !== STATES.CAKE
            ) {
                return;
            }

            scene.classList.add(
                "is-memory-heart-formed"
            );

        },

        3400
    );


    showMascotMessage(
        "Aww… look at that.",
        3500
    );


    /*
     * IMPORTANT:
     *
     * There is NO automatic setTimeout
     * that starts the ending here.
     *
     * The music master clock handles
     * the ending at BLOOM_TIMELINE.ending.
     */

    return true;

}

/* =========================================================
   CLOSING FLAKE STORM
   ========================================================= */

/*
 * Disabled intentionally.
 *
 * The ending now stays clean and cinematic instead of
 * accumulating another layer of falling memories.
 */

function startClosingFlakeStorm() {
    return;
}


/* =========================================================
   STATE TRANSITIONS
   ========================================================= */

function transitionTo(nextState) {

    if (!scene) {
        return;
    }

    if (currentState === nextState) {
        return;
    }

    isTransitioning = true;

    /*
     * Change the scene immediately.
     * Do NOT wait for the CSS transition
     * before rendering the next scene.
     */

    currentState = nextState;

    switch (nextState) {

        case STATES.INTRO:

            renderIntro();

            break;


        case STATES.ENVELOPE:

            renderEnvelope();

            break;


        case STATES.NOTE:

            startNoteWriting();

            break;


        case STATES.CAKE:

            renderCake();

            break;


        case STATES.MEMORIES:

            startMemorySequence(
                getAvailableMemories()
            );

            break;


        case STATES.HEART:

            beginMemoryHeartMorph();

            break;


        case STATES.ENDING:

            beginBloomEnding();

            break;

    }


    /*
     * Let the CSS transition finish,
     * but don't block the scene change.
     */

}


/* =========================================================
   FINAL BLOOM
   ========================================================= */

function beginBloomEnding() {

    if (currentState !== STATES.CAKE) {
        return;
    }

    currentState = STATES.ENDING;

    clearAllTimers();

    if (action) {
        action.hidden = true;
        action.onclick = null;
    }

    hideMascotMessage();

    /*
     * Let the memory heart remain visible briefly,
     * then dissolve into the final BLOOM.
     */

    scene.classList.add("is-bloom-ending");

    setTimeout(() => {

        if (currentState !== STATES.ENDING) {
            return;
        }

        const bloom = document.createElement("div");

        bloom.className = "bloom-ending";

        bloom.innerHTML = `
            <div class="bloom-ending__glow"></div>

            <div class="bloom-ending__flower">

                <span class="bloom-ending__petal bloom-ending__petal--1"></span>
                <span class="bloom-ending__petal bloom-ending__petal--2"></span>
                <span class="bloom-ending__petal bloom-ending__petal--3"></span>
                <span class="bloom-ending__petal bloom-ending__petal--4"></span>
                <span class="bloom-ending__petal bloom-ending__petal--5"></span>
                <span class="bloom-ending__petal bloom-ending__petal--6"></span>

                <span class="bloom-ending__center"></span>

            </div>

            <div class="bloom-ending__word">
                BLOOM
            </div>
        `;

        visual.innerHTML = "";
        visual.appendChild(bloom);

        requestAnimationFrame(() => {
            bloom.classList.add("is-visible");
        });

    }, 2100);
}


/* =========================================================
   MASTER TIMELINE END CORRECTION
   ========================================================= */

/*
 * The requested music passage is approximately 0:00–1:25.
 *
 * fadeOut is part of that 85-second window, so the fade
 * must BEGIN before 85 seconds rather than at 84 seconds
 * and continue beyond the selected passage.
 */

BLOOM_TIMELINE.musicEnd = Math.max(
    BLOOM_TIMELINE.ending + 4,
    85 - (BLOOM_BIRTHDAY.music.fadeOut || 4)
);


/* =========================================================
   START
   ========================================================= */

renderIntro();