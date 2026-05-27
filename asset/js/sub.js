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
let fluidReady = true;
let fluidInitialized = false;
let fluidVisible = false;
let fluidBurstRunning = false;
let fluidScrollTicking = false;

const fluidCanvas = document.getElementById("fluid-canvas");

fluidCanvas.width = window.innerWidth;
fluidCanvas.height = window.innerHeight;

let lastMouseX = window.innerWidth / 2;
let lastMouseY = window.innerHeight / 2;

function saveMousePosition(e) {
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
}

window.addEventListener("mousemove", saveMousePosition, { passive: true });
window.addEventListener("wheel", saveMousePosition, { passive: true });

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

        SPLAT_RADIUS: 0.5,
        SPLAT_FORCE: 3500,

        SHADING: true,
        COLORFUL: true,
        COLOR_UPDATE_SPEED: 3,

        BACK_COLOR: { r: 0, g: 0, b: 0 },
        TRANSPARENT: true,

        BLOOM: false,
        SUNRAYS: false,
    });

    fluidInitialized = true;
}

initFluid();

function setFluidVisible(show) {
    if (fluidVisible === show) return;

    fluidVisible = show;

    if (show) {
        fluidCanvas.style.visibility = "visible";

        gsap.to(fluidCanvas, {
            opacity: 1,
            duration: 0.35,
            ease: "power2.out",
            overwrite: true,
        });
    } else {
        gsap.to(fluidCanvas, {
            opacity: 0,
            duration: 0.45,
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

function getFluidTarget(x, y) {
    const targets = document.querySelectorAll(".fluid-target");

    const matched = Array.from(targets)
        .map((el) => {
            const rect = el.getBoundingClientRect();
            const padding = 300;

            const inArea =
                x >= rect.left - padding &&
                x <= rect.right + padding &&
                y >= rect.top - padding &&
                y <= rect.bottom + padding;

            if (!inArea) return null;

            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const distance = Math.hypot(x - centerX, y - centerY);

            return { el, distance };
        })
        .filter(Boolean)
        .sort((a, b) => a.distance - b.distance);

    return matched[0]?.el || null;
}

function applyFluidClip(target) {
    const clipType = target.dataset.fluidClip;

    if (clipType === "target") {
        const rect = target.getBoundingClientRect();
        const safe = 80;

        fluidCanvas.style.clipPath = `
            inset(
            ${Math.max(rect.top - safe, 0)}px
            ${Math.max(window.innerWidth - rect.right - safe, 0)}px
            ${Math.max(window.innerHeight - rect.bottom - safe, 0)}px
            ${Math.max(rect.left - safe, 0)}px
            )
        `;

        return;
    }

    fluidCanvas.style.clipPath = "none";
}

function fireFluidBurst(x, y) {
    if (fluidBurstRunning) return;

    fluidBurstRunning = true;

    let burst = 0;

    function fire() {
        burst++;

        const moveEvent = new MouseEvent("mousemove", {
            clientX: x + burst * 3,
            clientY: y + burst * 4,
            movementX: 8,
            movementY: 12,
            buttons: 0,
            bubbles: true,
            cancelable: true,
        });

        fluidCanvas.style.pointerEvents = "auto";
        fluidCanvas.dispatchEvent(moveEvent);
        fluidCanvas.style.pointerEvents = "none";

        if (burst < 3) {
            requestAnimationFrame(fire);
        } else {
            fluidBurstRunning = false;
        }
    }

    fire();
}

function updateFluidByPosition() {
    const target = getFluidTarget(lastMouseX, lastMouseY);

    if (!fluidReady || !fluidInitialized || !target) {
        setFluidVisible(false);
        return;
    }

    applyFluidClip(target);
    setFluidVisible(true);
    fireFluidBurst(lastMouseX, lastMouseY);
}

window.addEventListener("mousemove", updateFluidByPosition);

window.addEventListener("scroll", () => {
    if (fluidScrollTicking) return;

    fluidScrollTicking = true;

    requestAnimationFrame(() => {
        updateFluidByPosition();
        fluidScrollTicking = false;
    });
});

window.addEventListener("resize", () => {
    fluidCanvas.width = window.innerWidth;
    fluidCanvas.height = window.innerHeight;
});

// sub_tab
const tabBtns = document.querySelectorAll(".sub_tab a[data-tab]");
const visualTabs = document.querySelectorAll(".tab-visual[data-content]");
const workTabs = document.querySelectorAll(".tab-work[data-content]");

function showSubTab(tabName) {
    tabBtns.forEach((btn) => {
        btn.classList.toggle("is-active", btn.dataset.tab === tabName);
    });

    visualTabs.forEach((visual) => {
        const isWorkTitle = tabName === "work" && visual.dataset.content === "work";
        const isCommonTitle = tabName !== "work" && visual.dataset.content === "common";

        visual.classList.toggle("is-show", isWorkTitle || isCommonTitle);
    });

    workTabs.forEach((work) => {
        work.classList.toggle("is-show", work.dataset.content === tabName);
    });
}

tabBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
        e.preventDefault();

        const tabName = btn.dataset.tab;
        showSubTab(tabName);

        history.replaceState(null, "", `?tab=${tabName}`);
    });
});

// 메인페이지에서 ?tab=promotion / ?tab=motion 등으로 넘어온 경우
const params = new URLSearchParams(window.location.search);
const urlTab = params.get("tab");

// 기본값은 work
showSubTab(urlTab || "work");

document.body.classList.remove("is-tab-loading");

if (urlTab) {
    setTimeout(() => {
        document.querySelector("#work")?.scrollIntoView({
            behavior: "auto",
            block: "start",
        });
    }, 0);
}

// promotion scroll motion
const promotionItems = document.querySelectorAll(".promotion-item");

if (promotionItems.length > 0) {
    const promotionObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-show");

                    promotionObserver.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.2,
        },
    );

    promotionItems.forEach((item) => {
        promotionObserver.observe(item);
    });
}

// motion scroll motion
const motionItems = document.querySelectorAll(".motion-item");

if (motionItems.length > 0) {
    const motionObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-show");

                    motionObserver.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.2,
        },
    );

    motionItems.forEach((item) => {
        motionObserver.observe(item);
    });
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

// modal
const modalThumbs = document.querySelectorAll(".modal-thumb");
const projectModal = document.querySelector(".project-modal");
const projectModalContent = document.querySelector(".project-modal-content");
const projectModalClose = document.querySelector(".project-modal-close");

let zoomScale = 1;
let zoomX = 0;
let zoomY = 0;
let isDragging = false;
let startX = 0;
let startY = 0;

function updateZoomImage() {
    const zoomImg = document.querySelector(".zoom-img");
    if (!zoomImg) return;

    zoomImg.style.transform = `translate(${zoomX}px, ${zoomY}px) scale(${zoomScale})`;
}

function resetZoom() {
    zoomScale = 1;
    zoomX = 0;
    zoomY = 0;
    updateZoomImage();
}

modalThumbs.forEach((thumb) => {
    thumb.addEventListener("click", (e) => {
        e.preventDefault();

        projectModalContent.innerHTML = "";
        projectModalContent.className = "project-modal-content";
        resetZoom();

        if (thumb.dataset.images) {
            const images = thumb.dataset.images.split(",").map((src) => src.trim());

            projectModalContent.classList.add("is-grid");

            if (thumb.classList.contains("modal-four")) {
                projectModalContent.classList.add("is-four");
            }

            projectModalContent.innerHTML = images.map((src) => `<img src="${src}" alt="">`).join("");
        }

        if (thumb.dataset.image) {
            projectModalContent.classList.add("is-single");

            if (thumb.dataset.modal === "large") {
                projectModalContent.classList.add("is-zoom");

                projectModalContent.innerHTML = `
            <div class="zoom-wrap">
                <img class="zoom-img modal-large" src="${thumb.dataset.image}" alt="">
            </div>
        `;
            } else {
                projectModalContent.innerHTML = `
            <img src="${thumb.dataset.image}" alt="">
        `;
            }
        }

        if (thumb.dataset.video) {
            projectModalContent.classList.add("is-video");

            projectModalContent.innerHTML = `
        <video src="${thumb.dataset.video}" controls autoplay></video>
    `;
        }

        if (thumb.dataset.drive) {
            projectModalContent.classList.add("is-video");

            projectModalContent.innerHTML = `
        <iframe
            src="${thumb.dataset.drive}?autoplay=1"
            allow="autoplay"
            allowfullscreen
        ></iframe>
    `;
        }

        projectModal.classList.add("is-show");
        document.body.style.overflow = "hidden";
    });
});

projectModalContent.addEventListener(
    "wheel",
    (e) => {
        const zoomImg = document.querySelector(".zoom-img");
        if (!zoomImg || !projectModal.classList.contains("is-show")) return;

        e.preventDefault();

        const zoomSpeed = 0.0015;
        zoomScale += e.deltaY * -zoomSpeed;
        zoomScale = Math.min(Math.max(1, zoomScale), 4);

        updateZoomImage();
    },
    { passive: false },
);

projectModalContent.addEventListener("mousedown", (e) => {
    const zoomImg = document.querySelector(".zoom-img");
    if (!zoomImg) return;

    isDragging = true;
    startY = e.clientY - zoomY;

    projectModalContent.classList.add("is-dragging");
});

window.addEventListener("mousemove", (e) => {
    if (!isDragging) return;

    zoomX = 0;
    zoomY = e.clientY - startY;

    updateZoomImage();
});

window.addEventListener("mouseup", () => {
    isDragging = false;
    projectModalContent.classList.remove("is-dragging");
});

projectModalContent.addEventListener("dblclick", () => {
    resetZoom();
});

function closeProjectModal() {
    projectModal.classList.remove("is-show");
    projectModalContent.innerHTML = "";
    projectModalContent.className = "project-modal-content";
    document.body.style.overflow = "";
    resetZoom();
}

projectModalClose.addEventListener("click", closeProjectModal);

projectModal.addEventListener("click", (e) => {
    if (e.target === projectModal) {
        closeProjectModal();
    }
});

// 서브페이지 헤더에서 메인으로 이동할 때 메인 로딩 스킵
const mainNavLinks = document.querySelectorAll(".header .logo, .header .gnb a");

mainNavLinks.forEach((link) => {
    link.addEventListener("click", () => {
        sessionStorage.setItem("skipMainLoading", "true");
    });
});

// 서브페이지에 들어온 순간,
// 나중에 뒤로가기로 메인에 돌아가면 로딩을 스킵하게 표시
sessionStorage.setItem("skipMainLoading", "true");

// work scroll motion
const workCards = document.querySelectorAll(".sub-work-card");

if (workCards.length > 0) {
    const workObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-show");

                    workObserver.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.2,
        },
    );

    workCards.forEach((card) => {
        workObserver.observe(card);
    });
}

// web scroll motion
const webWorkItems = document.querySelectorAll(".web-work-item");

if (webWorkItems.length > 0) {
    const webObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("show");

                    webObserver.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.2,
        },
    );

    webWorkItems.forEach((item) => {
        webObserver.observe(item);
    });
}
