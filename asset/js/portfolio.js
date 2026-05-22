history.scrollRestoration = "manual";

window.addEventListener("load", () => {
    window.scrollTo(0, 0);

    const canvas = document.querySelector("#loader-canvas");
    const counter = document.querySelector(".loader-counter");
    const loader = document.querySelector(".loader");
    const hero = document.querySelector(".hero");

    const flatText = document.createElement("div");
    flatText.className = "flat-loader-text";

    flatText.innerHTML = `
    <div class="flat-main">
        <span class="flat-word word-my">MY</span>
        <span class="flat-word word-design">DESIGN</span>
        <span class="flat-word word-leaves">LEAVES</span>
        <span class="flat-word word-people">PEOPLE</span>
        <span class="flat-word word-memories">MEMORIES</span>
    </div>

    <span class="flat-sub">
        GRAPHIC DESIGN · UX/UI DESIGN · WEB DESIGN · VISUAL DESIGN
    </span>
    `;

    loader.appendChild(flatText);

    Object.assign(flatText.style, {
        position: "absolute",
        left: "50%",
        top: "47%",
        transform: "translate(-50%, -50%)",
        opacity: "0",
        visibility: "hidden",
        textAlign: "center",
        whiteSpace: "nowrap",
        pointerEvents: "none",
        zIndex: "30",
    });

    Object.assign(flatText.querySelector(".flat-main").style, {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "18px",
        fontSize: "54px",
        fontWeight: "900",
        letterSpacing: "0em",
        lineHeight: "1",
        whiteSpace: "nowrap",
    });

    document.querySelectorAll(".flat-word").forEach((word) => {
        Object.assign(word.style, {
            display: "inline-block",
            position: "relative",
            fontSize: "54px",
            fontWeight: "900",
            letterSpacing: "-0.07em",
            lineHeight: "1",
            whiteSpace: "nowrap",
        });
    });

    Object.assign(flatText.querySelector(".flat-sub").style, {
        display: "block",
        marginTop: "12px",
        fontSize: "15px",
        fontWeight: "500",
        letterSpacing: "0.02em",
    });

    /* THREE */
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#fff");

    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);

    camera.position.set(0, -0.08, 7.7);

    const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    function createTextTexture(lines) {
        const textureCanvas = document.createElement("canvas");

        textureCanvas.width = 2048;
        textureCanvas.height = 1024;

        const ctx = textureCanvas.getContext("2d");

        ctx.clearRect(0, 0, 2048, 1024);

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#000";

        lines.forEach((line) => {
            ctx.font = line.font;

            const repeatedText = line.text.repeat(8);

            ctx.fillText(repeatedText, textureCanvas.width / 2, textureCanvas.height / 2 + line.y);
        });

        const texture = new THREE.CanvasTexture(textureCanvas);

        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;

        texture.repeat.x = 1;

        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;

        texture.generateMipmaps = false;

        texture.offset.x = 0.14;
        texture.needsUpdate = true;

        return texture;
    }

    const cylinderTexture = createTextTexture([
        {
            text: " MY DESIGN LEAVES PEOPLE MEMORIES ",
            font: "700 92px Pretendard",
            y: -55,
        },
        {
            text: " GRAPHIC DESIGN · UX/UI DESIGN · WEB DESIGN · VISUAL DESIGN ",
            font: "500 28px Pretendard",
            y: 45,
        },
    ]);

    const cylinderMaterial = new THREE.MeshBasicMaterial({
        map: cylinderTexture,
        transparent: true,
        opacity: 1,
        side: THREE.DoubleSide,
        depthWrite: false,
    });

    const radius = 1.7;
    const height = Math.PI * radius;

    const cylinderGeometry = new THREE.CylinderGeometry(radius, radius, height, 180, 1, true);

    const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);

    const group = new THREE.Group();

    group.add(cylinder);

    group.rotation.x = 0.08;
    group.rotation.z = 0.11;

    group.position.y = -0.01;

    scene.add(group);

    let isSpreading = false;

    function animate() {
        requestAnimationFrame(animate);

        if (!isSpreading) {
            cylinder.rotation.y -= 0.005;

            const t = performance.now() * 0.001;

            group.rotation.x = 0.08 + Math.sin(t * 0.45) * 0.002;

            group.rotation.z = 0.11 + Math.cos(t * 0.4) * 0.002;

            group.position.y = -0.01 + Math.sin(t * 0.55) * 0.002;
        }

        renderer.render(scene, camera);
    }

    animate();

    function fixWordsInPlace() {
        const words = Array.from(document.querySelectorAll(".flat-word"));

        const positions = words.map((word) => {
            const rect = word.getBoundingClientRect();

            return {
                el: word,
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2,
            };
        });

        positions.forEach(({ el, x, y }) => {
            hero.appendChild(el);

            gsap.set(el, {
                position: "absolute",
                left: x,
                top: y,

                xPercent: -50,
                yPercent: -50,

                margin: 0,
                zIndex: 100000,

                opacity: 1,

                fontSize: 54,
                fontWeight: 700,
                letterSpacing: "-0.07em",

                lineHeight: 1,
                whiteSpace: "nowrap",
            });
        });
    }

    const tl = gsap.timeline();

    tl.to(
        { value: 0 },
        {
            value: 100,
            duration: 4,
            ease: "power3.out",

            onUpdate() {
                counter.textContent = `${Math.round(this.targets()[0].value)}%`;
            },
        },
    );

    tl.to(counter, {
        opacity: 0,
        duration: 0.35,
        ease: "power2.out",
    });

    tl.call(() => {
        isSpreading = true;
    });

    tl.to(cylinder.rotation, {
        y: 0,
        duration: 0.8,
        ease: "power4.inOut",
    });

    tl.to(
        group.rotation,
        {
            x: 0,
            y: 0,
            z: 0,
            duration: 0.8,
            ease: "power4.inOut",
        },
        "<",
    );

    tl.to(
        group.position,
        {
            y: 0,
            duration: 0.8,
            ease: "power4.inOut",
        },
        "<",
    );

    tl.to(
        camera.position,
        {
            z: 6.8,
            duration: 0.8,
            ease: "power4.inOut",
        },
        "<",
    );

    tl.call(() => {
        gsap.set(hero, {
            opacity: 1,
            pointerEvents: "none",
        });

        flatText.style.visibility = "visible";
        flatText.style.opacity = "0";

        fixWordsInPlace();

        canvas.style.opacity = "0";
        loader.style.pointerEvents = "none";
        fluidReady = true;

        // fluidCanvas.style.opacity = "1";
        // fluidCanvas.style.visibility = "visible";
    });

    tl.to(".word-my", {
        left: "3.4vw",
        top: "37.4vh",

        xPercent: 0,
        yPercent: 0,

        fontSize: "145px",
        letterSpacing: "0em",

        duration: 1.6,
        ease: "power4.inOut",
    });

    tl.to(
        ".word-design",
        {
            left: "67.1vw",
            top: "37.4vh",

            xPercent: 0,
            yPercent: 0,

            fontSize: "145px",
            letterSpacing: "0em",

            duration: 1.6,
            ease: "power4.inOut",
        },
        "-=1.6",
    );

    tl.to(
        ".word-leaves",
        {
            left: "19.3vw",
            top: "56.6vh",

            xPercent: 0,
            yPercent: 0,

            fontSize: "145px",
            letterSpacing: "0em",

            duration: 1.6,
            ease: "power4.inOut",
        },
        "-=1.6",
    );

    tl.to(
        ".word-people",
        {
            left: "51.2vw",
            top: "56.6vh",

            xPercent: 0,
            yPercent: 0,

            fontSize: "145px",
            letterSpacing: "0em",

            duration: 1.6,
            ease: "power4.inOut",
        },
        "-=1.6",
    );

    tl.to(
        ".word-memories",
        {
            left: "57.6vw",
            top: "75.7vh",

            xPercent: 0,
            yPercent: 0,

            fontSize: "145px",
            letterSpacing: "0em",

            duration: 1.6,
            ease: "power4.inOut",
        },
        "-=1.6",
    );

    tl.to(
        hero,
        {
            pointerEvents: "auto",
            duration: 0.6,
        },
        "-=1.2",
    );

    tl.to(
        ".header",
        {
            opacity: 1,
            pointerEvents: "auto",
            duration: 0.6,
            ease: "power3.out",
        },
        "<",
    );

    tl.to(
        ".intro-text, .bottom-text",
        {
            opacity: 1,
            y: 0,
            duration: 1,
            stagger: 0.12,
            ease: "power3.out",
        },
        "-=0.6",
    );

    tl.set(document.body, {
        overflowX: "hidden",
        overflowY: "auto",
    });

    window.addEventListener("resize", () => {
        camera.aspect = window.innerWidth / window.innerHeight;

        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);

        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });
});

// header
const header = document.querySelector(".header");

let lastScroll = 0;

window.addEventListener("scroll", () => {
    const currentScroll = window.pageYOffset;

    // 최상단에서는 항상 보이기
    if (currentScroll <= 0) {
        header.classList.remove("hide");
        return;
    }

    // 아래로 스크롤 → 숨김
    if (currentScroll > lastScroll) {
        header.classList.add("hide");
    }

    // 위로 스크롤 → 나타남
    else {
        header.classList.remove("hide");
    }

    lastScroll = currentScroll;
});

// fluid
const fluidCanvas = document.getElementById("fluid-canvas");

fluidCanvas.width = window.innerWidth;
fluidCanvas.height = window.innerHeight;

let eventQueue = [];

function queueEvent(e) {
    eventQueue.push({
        type: e.type,
        clientX: e.clientX,
        clientY: e.clientY,
        movementX: e.movementX || 0,
        movementY: e.movementY || 0,
        buttons: e.buttons,
        button: e.button,
    });
}

window.addEventListener("mousemove", queueEvent, {
    passive: true,
});

window.addEventListener("mousedown", queueEvent, {
    passive: true,
});

window.addEventListener("mouseup", queueEvent, {
    passive: true,
});

function initFluid() {
    if (typeof WebGLFluid === "undefined") {
        setTimeout(initFluid, 50);
        return;
    }

    WebGLFluid(fluidCanvas, {
        IMMEDIATE: false,
        TRIGGER: "hover",

        SIM_RESOLUTION: 128,
        DYE_RESOLUTION: 512,

        DENSITY_DISSIPATION: 0.99,
        VELOCITY_DISSIPATION: 0.995,

        PRESSURE: 0.2,
        CURL: 3,

        SPLAT_RADIUS: 0.55,
        SPLAT_FORCE: 3500,

        SHADING: true,
        COLORFUL: true,
        COLOR_UPDATE_SPEED: 3,

        BACK_COLOR: { r: 0, g: 0, b: 0 },
        TRANSPARENT: true,

        BLOOM: false,
        SUNRAYS: false,
    });

    function relayEvent(data) {
        fluidCanvas.style.pointerEvents = "auto";

        fluidCanvas.dispatchEvent(
            new MouseEvent(data.type, {
                bubbles: false,
                cancelable: false,

                clientX: data.clientX,
                clientY: data.clientY,

                movementX: data.movementX,
                movementY: data.movementY,

                buttons: data.buttons,
                button: data.button,
            }),
        );

        fluidCanvas.style.pointerEvents = "none";
    }

    setTimeout(() => {
        eventQueue.forEach(relayEvent);

        eventQueue = [];
    }, 100);

    window.removeEventListener("mousemove", queueEvent);
    window.removeEventListener("mousedown", queueEvent);
    window.removeEventListener("mouseup", queueEvent);

    function liveRelay(e) {
        relayEvent(e);
    }

    window.addEventListener("mousemove", liveRelay, {
        passive: true,
    });

    window.addEventListener("mousedown", liveRelay, {
        passive: true,
    });

    window.addEventListener("mouseup", liveRelay, {
        passive: true,
    });

    window.addEventListener("resize", () => {
        fluidCanvas.width = window.innerWidth;
        fluidCanvas.height = window.innerHeight;
    });
}

initFluid();

// fluid hover target
function isMouseOnFluidText(x, y) {
    const targets = document.querySelectorAll(".flat-word, .fluid-target");

    return Array.from(targets).some((target) => {
        const rect = target.getBoundingClientRect();

        return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
    });
}

let fluidVisible = false;

function setFluidVisible(show) {
    if (fluidVisible === show) return;

    fluidVisible = show;

    if (show) {
        fluidCanvas.style.visibility = "visible";

        gsap.to(fluidCanvas, {
            opacity: 1,
            duration: 0.45,
            ease: "power2.out",
            overwrite: true,
        });
    } else {
        gsap.to(fluidCanvas, {
            opacity: 0,
            duration: 0.5,
            ease: "power2.out",
            overwrite: true,
            onComplete: () => {
                if (!fluidVisible) {
                    fluidCanvas.style.visibility = "hidden";
                }
            },
        });
    }
}

window.addEventListener("mousemove", (e) => {
    const targets = document.querySelectorAll(".flat-word, .fluid-target");

    const target = Array.from(targets).find((el) => {
        const rect = el.getBoundingClientRect();

        return e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;
    });

    if (!fluidReady || !target) {
        setFluidVisible(false);
        return;
    }

    const clipType = target.dataset.fluidClip;

    if (clipType === "target-bottom") {
        const rect = target.getBoundingClientRect();

        fluidCanvas.style.clipPath = `inset(0px 0px ${window.innerHeight - rect.bottom - 8}px 0px)`;
    } else if (clipType === "section") {
        const section = target.closest("[data-fluid-section]");
        const sectionRect = section.getBoundingClientRect();

        fluidCanvas.style.clipPath = `inset(${sectionRect.top}px 0px ${window.innerHeight - sectionRect.bottom}px 0px)`;
    } else {
        fluidCanvas.style.clipPath = "none";
    }

    setFluidVisible(true);
});

// work 영역
const workSection = document.querySelector(".work-grid-section");
const titleArea = document.querySelector(".work-title-area");
const firstCard = document.querySelector(".work-card.first");
const gridCards = document.querySelectorAll(".work-grid .work-card");
const allCards = [firstCard, ...gridCards];

const containerW = 1660;
const firstSize = 500;
const cardSize = 228;
const gapX = 130;
const gapY = 60;

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function getGridPositions() {
    const totalGridW = cardSize * 5 + gapX * 4;
    const totalGridH = cardSize * 3 + gapY * 2;

    const startX = (containerW - totalGridW) / 2;
    const startY = (window.innerHeight - totalGridH) / 2;

    const positions = [];

    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 5; col++) {
            positions.push({
                x: startX + col * (cardSize + gapX),
                y: startY + row * (cardSize + gapY),
            });
        }
    }

    return positions;
}

function updateWorkGrid() {
    const rect = workSection.getBoundingClientRect();

    const titleAreaH = titleArea.offsetHeight;
    const stickyScroll = -rect.top - titleAreaH;

    const progress = clamp(stickyScroll / (window.innerHeight * 0.75), 0, 1);

    const firstStartX = containerW / 2 - firstSize / 2;
    const firstStartY = window.innerHeight / 2 - firstSize / 2;

    const gridPositions = getGridPositions();
    const centerPos = gridPositions[7];

    const firstEndX = centerPos.x;
    const firstEndY = centerPos.y;

    const currentX = firstStartX + (firstEndX - firstStartX) * progress;
    const currentY = firstStartY + (firstEndY - firstStartY) * progress;
    const currentSize = firstSize + (cardSize - firstSize) * progress;

    firstCard.style.left = `${currentX}px`;
    firstCard.style.top = `${currentY}px`;
    firstCard.style.width = `${currentSize}px`;
    firstCard.style.height = `${currentSize}px`;
    firstCard.style.transform = "none";
    firstCard.style.opacity = "1";

    gridCards.forEach((card, index) => {
        const posIndex = index >= 7 ? index + 1 : index;
        const pos = gridPositions[posIndex];

        const startX = firstStartX + firstSize / 2 - cardSize / 2;
        const startY = firstStartY + firstSize / 2 - cardSize / 2;

        const x = startX + (pos.x - startX) * progress;
        const y = startY + (pos.y - startY) * progress;

        card.style.left = `${x}px`;
        card.style.top = `${y}px`;
        card.style.opacity = progress;

        const col = posIndex % 5;

        let startScale = 0.35;

        // 1열, 5열 제일 작게
        if (col === 0 || col === 4) {
            startScale = 0.08;
        }

        // 2열, 4열 중간
        if (col === 1 || col === 3) {
            startScale = 0.18;
        }

        // 3열 가장 크게
        if (col === 2) {
            startScale = 0.5;
        }

        const scale = startScale + (1 - startScale) * progress;

        card.style.transform = `scale(${scale})`;
    });

    // 카드 펼쳐졌을 때 클릭
    const isOpen = progress > 0.92;

    allCards.forEach((card) => {
        if (isOpen) {
            card.style.pointerEvents = "auto";
            card.style.cursor = "pointer";
        } else {
            card.style.pointerEvents = "none";
            card.style.cursor = "default";
        }
    });
}

window.addEventListener("scroll", updateWorkGrid);
window.addEventListener("resize", updateWorkGrid);

updateWorkGrid();

// about dot image - image based turtle style
const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d");
const sourceImg = document.getElementById("source");

const VIEW_W = 506;
const VIEW_H = 678;

const DATA_W = 253;
const DATA_H = 339;

function setupCanvas() {
    const dpr = window.devicePixelRatio || 1;

    canvas.width = VIEW_W * dpr;
    canvas.height = VIEW_H * dpr;

    canvas.style.width = `${VIEW_W}px`;
    canvas.style.height = `${VIEW_H}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function makeCirclesFromImage(img) {
    const temp = document.createElement("canvas");
    const tctx = temp.getContext("2d");

    temp.width = DATA_W;
    temp.height = DATA_H;

    tctx.fillStyle = "#fff";
    tctx.fillRect(0, 0, DATA_W, DATA_H);

    tctx.drawImage(img, 0, 0, DATA_W, DATA_H);

    const data = tctx.getImageData(0, 0, DATA_W, DATA_H).data;
    const circles = [];

    function getBrightness(x, y) {
        const px = Math.max(0, Math.min(DATA_W - 1, Math.floor(x)));
        const py = Math.max(0, Math.min(DATA_H - 1, Math.floor(y)));

        const i = (py * DATA_W + px) * 4;
        return (data[i] + data[i + 1] + data[i + 2]) / 3;
    }

    function analyze(x, y, w, h) {
        let sum = 0;
        let count = 0;
        let min = 255;
        let max = 0;

        const stepX = Math.max(1, Math.floor(w / 4));
        const stepY = Math.max(1, Math.floor(h / 4));

        for (let yy = y; yy < y + h; yy += stepY) {
            for (let xx = x; xx < x + w; xx += stepX) {
                const b = getBrightness(xx, yy);

                sum += b;
                count++;

                min = Math.min(min, b);
                max = Math.max(max, b);
            }
        }

        return {
            avg: sum / count,
            contrast: max - min,
        };
    }

    function split(x, y, w, h) {
        const info = analyze(x, y, w, h);

        if (w > 2 && h > 2 && info.contrast > 9) {
            const hw = w / 2;
            const hh = h / 2;

            split(x, y, hw, hh);
            split(x + hw, y, hw, hh);
            split(x, y + hh, hw, hh);
            split(x + hw, y + hh, hw, hh);

            return;
        }

        const darkness = 1 - info.avg / 255;

        if (darkness < 0.0004) return;

        const cx = x + w / 2 - DATA_W / 2;
        const cy = y + h / 2 - DATA_H / 2;

        const baseSize = Math.min(w, h);
        const radius = baseSize * 0.43 * Math.pow(darkness, 1.08);

        const maxRadius = 14;
        const finalRadius = Math.min(radius, maxRadius);

        if (finalRadius < 0.06) return;

        circles.push({
            cx,
            cy,
            r: finalRadius,
        });
    }

    split(0, 0, DATA_W, DATA_H);

    circles.sort((a, b) => {
        const da = a.cx * a.cx + a.cy * a.cy;
        const db = b.cx * b.cx + b.cy * b.cy;

        return a.r * da - b.r * db;
    });

    return circles;
}

function circlePoly(cx, cy, r) {
    if (r <= 0) return;

    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = "#222222";
    ctx.lineWidth = 0.35;
    ctx.stroke();
}

function drawAboutDotImage() {
    setupCanvas();

    ctx.clearRect(0, 0, VIEW_W, VIEW_H);
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);

    const circles = makeCirclesFromImage(sourceImg);

    ctx.save();
    ctx.translate(VIEW_W / 2, VIEW_H / 2);
    ctx.scale(VIEW_W / DATA_W, VIEW_H / DATA_H);

    let id = 0;

    function animate() {
        for (let i = 0; i < 60; i++) {
            if (id >= circles.length) {
                ctx.restore();
                return;
            }

            const c = circles[id++];

            circlePoly(c.cx, c.cy, c.r);
            circlePoly(c.cx, c.cy, c.r - 0.15);
        }

        requestAnimationFrame(animate);
    }

    animate();
}

const aboutSection = document.querySelector(".about");
const aboutContent = document.querySelector(".about-content");

const aboutObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                setupCanvas();

                ctx.clearRect(0, 0, VIEW_W, VIEW_H);

                if (sourceImg.complete && sourceImg.naturalWidth > 0) {
                    drawAboutDotImage();
                } else {
                    sourceImg.addEventListener("load", drawAboutDotImage, { once: true });
                }

                aboutContent?.classList.add("is-show");
            } else {
                aboutContent?.classList.remove("is-show");
            }
        });
    },
    {
        threshold: 0.35,
    },
);

aboutObserver.observe(aboutSection);

// about right content scroll motion
const aboutContentObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                aboutContent.classList.add("is-show");
                aboutContentObserver.unobserve(entry.target);
            }
        });
    },
    {
        threshold: 0.45,
    },
);

aboutContentObserver.observe(aboutContent);

// archive intro scroll motion
const archiveIntro = document.querySelector(".archive-intro");

const archiveIntroObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                archiveIntro.classList.add("is-show");
                archiveIntroObserver.unobserve(entry.target);
            }
        });
    },
    {
        threshold: 0.35,
    },
);

archiveIntroObserver.observe(archiveIntro);

// archive-project scroll motion
const archiveProject = document.querySelector(".archive-project");
const archiveProjectTitle = document.querySelector(".archive-project-title");
const archiveThumbList = document.querySelector(".archive-thumb-list");
const archiveWorkText = document.querySelector(".archive-work-text");

if (archiveProject) {
    const archiveProjectObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    archiveProjectTitle?.classList.add("is-show");

                    setTimeout(() => {
                        archiveThumbList?.classList.add("is-show");
                    }, 350);

                    setTimeout(() => {
                        archiveWorkText?.classList.add("is-show");
                    }, 550);
                } else {
                    archiveProjectTitle?.classList.remove("is-show");
                    archiveThumbList?.classList.remove("is-show");
                    archiveWorkText?.classList.remove("is-show");
                }
            });
        },
        {
            threshold: 0.25,
        },
    );

    archiveProjectObserver.observe(archiveProject);
}

// contact
// contact scroll motion
const contactSection = document.querySelector(".contact-section");
const contactTitle = document.querySelector(".contact-title");
const contactText = document.querySelector(".contact-left p");
const contactRight = document.querySelector(".contact-right");

if (contactSection) {
    const contactObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    contactTitle?.classList.add("is-show");

                    setTimeout(() => {
                        contactTitle?.classList.add("is-shadow-show");
                    }, 350);

                    setTimeout(() => {
                        contactText?.classList.add("is-show");
                    }, 500);

                    setTimeout(() => {
                        contactRight?.classList.add("is-show");
                    }, 700);
                } else {
                    contactTitle?.classList.remove("is-show");
                    contactTitle?.classList.remove("is-shadow-show");
                    contactText?.classList.remove("is-show");
                    contactRight?.classList.remove("is-show");
                }
            });
        },
        {
            threshold: 0.25,
        },
    );

    contactObserver.observe(contactSection);
}
