import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

const videoCanvas = document.querySelector('.video-canvas');
const videoWrap = document.querySelector('.video-canvas-wrap');
const videoSection = document.querySelector('.video-section');

if (videoCanvas && videoWrap && videoSection) {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#101010');

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 100);

    const START_CAMERA = { x: 0, y: 0.85, z: 2.15 };
    const END_CAMERA = { x: 0, y: 0, z: 1.15 };

    const START_LOOK = { x: 0, y: -0.1, z: 0 };
    const END_LOOK = { x: 0, y: 0, z: 0 };

    camera.position.set(END_CAMERA.x, END_CAMERA.y, END_CAMERA.z);
    camera.lookAt(END_LOOK.x, END_LOOK.y, END_LOOK.z);

    const renderer = new THREE.WebGLRenderer({
        canvas: videoCanvas,
        antialias: true,
        powerPreference: 'high-performance',
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.92;

    scene.add(new THREE.AmbientLight(0xffffff, 1.2));

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.4);
    directionalLight.position.set(0, 2, 2);
    scene.add(directionalLight);

    const gltfLoader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();

    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
    gltfLoader.setDRACOLoader(dracoLoader);

    gltfLoader.load('asset/models/final-scene_wall-updated-fixed.glb', (gltf) => {
        const model = gltf.scene;

        model.position.set(0, -0.25, 0);
        model.rotation.set(0, 0, 0);
        model.scale.set(1, 1, 1);

        model.traverse((child) => {
            if (!child.isMesh) return;

            const oldMat = child.material;
            const map = oldMat?.map || null;

            if (map) {
                map.colorSpace = THREE.SRGBColorSpace;
                map.flipY = false;
            }

            child.material = new THREE.MeshStandardMaterial({
                map,
                color: map ? '#ffffff' : '#bfbfbf',
                emissiveMap: map,
                emissive: new THREE.Color(0xffffff),
                emissiveIntensity: map ? 1.0 : 0.15,
                roughness: 1.0,
                metalness: 0.0,
            });

            child.material.needsUpdate = true;
        });

        scene.add(model);
    });

    const mouse = { x: 0, y: 0 };
    let scrollProgress = 1;
    let currentProgress = 1;

    window.addEventListener('mousemove', (e) => {
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    function clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    function updateScrollProgress() {
        const rect = videoSection.getBoundingClientRect();

        const start = window.innerHeight;
        const end = -videoSection.offsetHeight + window.innerHeight;

        let rawProgress = (start - rect.top) / (start - end);
        rawProgress = clamp(rawProgress, 0, 1);

        if (rawProgress < 0.3) {
            scrollProgress = rawProgress / 0.3;
        } else {
            scrollProgress = 1;
        }
    }

    function animate() {
        requestAnimationFrame(animate);

        updateScrollProgress();

        currentProgress += (scrollProgress - currentProgress) * 0.08;

        const camX = THREE.MathUtils.lerp(START_CAMERA.x, END_CAMERA.x, currentProgress);
        const camY = THREE.MathUtils.lerp(START_CAMERA.y, END_CAMERA.y, currentProgress);
        const camZ = THREE.MathUtils.lerp(START_CAMERA.z, END_CAMERA.z, currentProgress);

        const lookX = THREE.MathUtils.lerp(START_LOOK.x, END_LOOK.x, currentProgress);
        const lookY = THREE.MathUtils.lerp(START_LOOK.y, END_LOOK.y, currentProgress);
        const lookZ = THREE.MathUtils.lerp(START_LOOK.z, END_LOOK.z, currentProgress);

        camera.position.x += (camX + mouse.x * 0.1 - camera.position.x) * 0.06;
        camera.position.y += (camY + mouse.y * 0.06 - camera.position.y) * 0.06;
        camera.position.z += (camZ - camera.position.z) * 0.06;

        camera.lookAt(lookX, lookY, lookZ);

        renderer.render(scene, camera);
    }

    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });
}
