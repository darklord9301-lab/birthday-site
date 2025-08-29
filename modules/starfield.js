import * as THREE from '/birthday-site/libs/three.module.js';


export function initStarfield(scene, camera) {
    const STAR_COUNT = 4000;
    const WARP_SPEED = 2.5;

    const starsGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(STAR_COUNT * 3);
    const velocities = new Float32Array(STAR_COUNT);
    const sizes = new Float32Array(STAR_COUNT);
    const colors = new Float32Array(STAR_COUNT * 3);

    const color = new THREE.Color();

    for (let i = 0; i < STAR_COUNT; i++) {
        const radius = Math.random() * 100 + 50; // radial distance
        const angle = Math.random() * 2 * Math.PI;
        const y = (Math.random() - 0.5) * 50; // vertical spread

        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;

        velocities[i] = Math.random() * 0.5 + 0.2;

        sizes[i] = Math.random() < 0.02 ? 6 : Math.random() * 1.5 + 0.5; // hero stars bigger

        // White to blue-white color range
        color.setHSL(0.6 + Math.random() * 0.1, 0.7, 0.9 + Math.random() * 0.1);
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
    }

    starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starsGeometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 1));
    starsGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    starsGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const starsMaterial = new THREE.PointsMaterial({
        vertexColors: true,
        size: 1.2,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true
    });

    const starPoints = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(starPoints);

    function animateStars() {
        const pos = starsGeometry.attributes.position.array;
        const vel = starsGeometry.attributes.velocity.array;
        const size = starsGeometry.attributes.size.array;

        for (let i = 0; i < STAR_COUNT; i++) {
            pos[i * 3 + 2] += vel[i] * WARP_SPEED;

            if (pos[i * 3 + 2] > 50) {
                const radius = Math.random() * 100 + 50;
                const angle = Math.random() * 2 * Math.PI;
                const y = (Math.random() - 0.5) * 50;

                pos[i * 3] = Math.cos(angle) * radius;
                pos[i * 3 + 1] = y;
                pos[i * 3 + 2] = -100;
            }
        }

        starsGeometry.attributes.position.needsUpdate = true;
    }

    // Hook into your main animation loop
    function animate() {
        animateStars();
    }

    return { animate };
}
