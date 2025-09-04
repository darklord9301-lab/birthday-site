// /modules/scene2_background.js
// Mechanical space-inspired background for Scene 2 using Three.js

import * as THREE from '../libs/three.module.js';

let scene = null;
let camera = null;
let renderer = null;
let container = null;
let animationId = null;
let isInitialized = false;

// Animation state
let time = 0;
let scrollFactor = 0;
let mouseX = 0;
let mouseY = 0;

// Dimensions
let width = 0;
let height = 0;

// Scene objects
const mechanicalParts = [];
const nebulaClouds = [];
const starField = null;
let lightSources = [];

// Materials (reused for performance)
let gearMaterial = null;
let nebulaUniforms = {};
let starMaterial = null;

// Seeded random for consistency
class SeededRandom {
    constructor(seed = 12345) {
        this.seed = seed;
    }
    
    next() {
        this.seed = (this.seed * 9301 + 49297) % 233280;
        return this.seed / 233280;
    }
}

const random = new SeededRandom(42);

// Custom shaders for nebula effect
const nebulaVertexShader = `
    varying vec2 vUv;
    varying vec3 vPosition;
    
    void main() {
        vUv = uv;
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const nebulaFragmentShader = `
    uniform float time;
    uniform float scrollFactor;
    uniform vec3 color1;
    uniform vec3 color2;
    uniform float intensity;
    
    varying vec2 vUv;
    varying vec3 vPosition;
    
    // Simple noise function
    float noise(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }
    
    float fbm(vec2 p) {
        float value = 0.0;
        float amplitude = 0.5;
        float frequency = 1.0;
        
        for (int i = 0; i < 4; i++) {
            value += amplitude * noise(p * frequency);
            frequency *= 2.0;
            amplitude *= 0.5;
        }
        return value;
    }
    
    void main() {
        vec2 uv = vUv;
        uv += time * 0.00005;
        
        float n1 = fbm(uv * 3.0 + time * 0.0001);
        float n2 = fbm(uv * 1.5 + time * 0.00008);
        
        float dist = length(vUv - 0.5);
        float falloff = 1.0 - smoothstep(0.2, 0.8, dist);
        
        float mixFactor = n1 * 0.7 + n2 * 0.3;
        vec3 color = mix(color1, color2, mixFactor);
        
        float alpha = falloff * intensity * (0.7 + scrollFactor * 0.3) * (0.8 + mixFactor * 0.2);
        
        gl_FragColor = vec4(color, alpha);
    }
`;

// Star field vertex shader
const starVertexShader = `
    attribute float size;
    attribute float twinkle;
    
    uniform float time;
    uniform float scrollFactor;
    
    varying float vTwinkle;
    
    void main() {
        vTwinkle = sin(time * 0.001 + twinkle * 6.28) * 0.5 + 0.5;
        
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * (300.0 / -mvPosition.z) * (0.8 + scrollFactor * 0.2);
        gl_Position = projectionMatrix * mvPosition;
    }
`;

const starFragmentShader = `
    uniform vec3 color;
    
    varying float vTwinkle;
    
    void main() {
        float dist = length(gl_PointCoord - 0.5);
        if (dist > 0.5) discard;
        
        float alpha = (1.0 - dist * 2.0) * vTwinkle * 0.8;
        gl_FragColor = vec4(color, alpha);
    }
`;

// Initialize materials
function initMaterials() {
    // Gear material with metallic look
    gearMaterial = new THREE.MeshStandardMaterial({
        color: 0x4a5a6a,
        metalness: 0.8,
        roughness: 0.3,
        transparent: true,
        opacity: 0.6
    });
    
    // Nebula material with custom shader
    nebulaUniforms = {
        time: { value: 0 },
        scrollFactor: { value: 0 },
        color1: { value: new THREE.Color(0x1a1a3a) },
        color2: { value: new THREE.Color(0x2a4a5a) },
        intensity: { value: 0.4 }
    };
    
    // Star material with custom shader
    starMaterial = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 },
            scrollFactor: { value: 0 },
            color: { value: new THREE.Color(0xaaccff) }
        },
        vertexShader: starVertexShader,
        fragmentShader: starFragmentShader,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });
}

// Create gear geometry
function createGearGeometry(radius, teeth, thickness = 0.1) {
    const shape = new THREE.Shape();
    const innerRadius = radius * 0.7;
    const outerRadius = radius;
    
    // Create gear tooth profile
    for (let i = 0; i < teeth; i++) {
        const angle = (i / teeth) * Math.PI * 2;
        const nextAngle = ((i + 1) / teeth) * Math.PI * 2;
        
        const toothWidth = 0.3 / teeth;
        
        if (i === 0) {
            shape.moveTo(
                Math.cos(angle - toothWidth) * innerRadius,
                Math.sin(angle - toothWidth) * innerRadius
            );
        }
        
        // Inner arc
        shape.lineTo(
            Math.cos(angle + toothWidth) * innerRadius,
            Math.sin(angle + toothWidth) * innerRadius
        );
        
        // Tooth sides
        shape.lineTo(
            Math.cos(angle + toothWidth) * outerRadius,
            Math.sin(angle + toothWidth) * outerRadius
        );
        shape.lineTo(
            Math.cos(nextAngle - toothWidth) * outerRadius,
            Math.sin(nextAngle - toothWidth) * outerRadius
        );
        shape.lineTo(
            Math.cos(nextAngle - toothWidth) * innerRadius,
            Math.sin(nextAngle - toothWidth) * innerRadius
        );
    }
    
    const extrudeSettings = {
        depth: thickness,
        bevelEnabled: false
    };
    
    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
}

// Create ring geometry
function createRingGeometry(innerRadius, outerRadius, segments, gapRatio = 0.3) {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const indices = [];
    
    for (let i = 0; i < segments; i++) {
        const startAngle = (i / segments) * Math.PI * 2;
        const endAngle = startAngle + (Math.PI * 2 / segments) * (1 - gapRatio);
        const steps = 8;
        
        for (let j = 0; j <= steps; j++) {
            const angle = startAngle + (endAngle - startAngle) * (j / steps);
            
            // Inner vertex
            vertices.push(
                Math.cos(angle) * innerRadius,
                Math.sin(angle) * innerRadius,
                0
            );
            
            // Outer vertex
            vertices.push(
                Math.cos(angle) * outerRadius,
                Math.sin(angle) * outerRadius,
                0
            );
            
            if (j < steps) {
                const baseIndex = (i * (steps + 1) + j) * 2;
                
                // Two triangles per segment
                indices.push(
                    baseIndex, baseIndex + 1, baseIndex + 2,
                    baseIndex + 1, baseIndex + 3, baseIndex + 2
                );
            }
        }
    }
    
    geometry.setFromPoints(vertices.map(v => new THREE.Vector3(v[0], v[1], v[2] || 0)));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    
    return geometry;
}

// Create mechanical components
function createMechanicalParts() {
    // Create gears
    for (let i = 0; i < 6; i++) {
        const radius = 2 + random.next() * 4;
        const teeth = 8 + Math.floor(random.next() * 12);
        const geometry = createGearGeometry(radius, teeth);
        const gear = new THREE.Mesh(geometry, gearMaterial.clone());
        
        gear.position.set(
            (random.next() - 0.5) * 30,
            (random.next() - 0.5) * 20,
            -15 - random.next() * 10
        );
        
        gear.rotation.z = random.next() * Math.PI * 2;
        
        gear.userData = {
            type: 'gear',
            rotationSpeed: (random.next() - 0.5) * 0.01,
            layer: random.next(),
            originalOpacity: 0.3 + random.next() * 0.3
        };
        
        gear.material.opacity = gear.userData.originalOpacity;
        
        mechanicalParts.push(gear);
        scene.add(gear);
    }
    
    // Create rings
    for (let i = 0; i < 4; i++) {
        const innerRadius = 1 + random.next() * 2;
        const outerRadius = innerRadius + 0.5 + random.next() * 1.5;
        const segments = 6 + Math.floor(random.next() * 6);
        
        const geometry = createRingGeometry(innerRadius, outerRadius, segments);
        const ring = new THREE.Mesh(geometry, gearMaterial.clone());
        
        ring.position.set(
            (random.next() - 0.5) * 25,
            (random.next() - 0.5) * 15,
            -10 - random.next() * 15
        );
        
        ring.userData = {
            type: 'ring',
            rotationSpeed: (random.next() - 0.5) * 0.008,
            layer: random.next(),
            originalOpacity: 0.2 + random.next() * 0.2
        };
        
        ring.material.opacity = ring.userData.originalOpacity;
        
        mechanicalParts.push(ring);
        scene.add(ring);
    }
    
    // Create pistons (using cylinder geometry)
    for (let i = 0; i < 3; i++) {
        const cylinderGeometry = new THREE.CylinderGeometry(0.2, 0.2, 4, 8);
        const rodGeometry = new THREE.CylinderGeometry(0.1, 0.1, 6, 6);
        
        const cylinder = new THREE.Mesh(cylinderGeometry, gearMaterial.clone());
        const rod = new THREE.Mesh(rodGeometry, gearMaterial.clone());
        
        const pistonGroup = new THREE.Group();
        pistonGroup.add(cylinder);
        pistonGroup.add(rod);
        
        rod.position.x = 3;
        
        pistonGroup.position.set(
            (random.next() - 0.5) * 20,
            (random.next() - 0.5) * 10,
            -8 - random.next() * 8
        );
        
        pistonGroup.rotation.z = random.next() * Math.PI * 2;
        
        pistonGroup.userData = {
            type: 'piston',
            oscillationSpeed: 0.005 + random.next() * 0.01,
            oscillationPhase: random.next() * Math.PI * 2,
            layer: random.next(),
            rod: rod,
            originalOpacity: 0.25 + random.next() * 0.25
        };
        
        cylinder.material.opacity = pistonGroup.userData.originalOpacity;
        rod.material.opacity = pistonGroup.userData.originalOpacity;
        
        mechanicalParts.push(pistonGroup);
        scene.add(pistonGroup);
    }
}

// Create nebula background
function createNebula() {
    for (let i = 0; i < 8; i++) {
        const geometry = new THREE.PlaneGeometry(15, 15);
        const material = new THREE.ShaderMaterial({
            uniforms: {
                ...nebulaUniforms,
                color1: { value: new THREE.Color().setHSL(0.6 + random.next() * 0.2, 0.7, 0.2) },
                color2: { value: new THREE.Color().setHSL(0.7 + random.next() * 0.1, 0.8, 0.3) },
                intensity: { value: 0.3 + random.next() * 0.2 }
            },
            vertexShader: nebulaVertexShader,
            fragmentShader: nebulaFragmentShader,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });
        
        const nebula = new THREE.Mesh(geometry, material);
        nebula.position.set(
            (random.next() - 0.5) * 40,
            (random.next() - 0.5) * 30,
            -25 - random.next() * 10
        );
        
        nebula.userData = {
            layer: random.next(),
            material: material
        };
        
        nebulaClouds.push(nebula);
        scene.add(nebula);
    }
}

// Create star field
function createStarField() {
    const starCount = 500;
    const positions = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);
    const twinkles = new Float32Array(starCount);
    
    for (let i = 0; i < starCount; i++) {
        const i3 = i * 3;
        
        positions[i3] = (random.next() - 0.5) * 100;
        positions[i3 + 1] = (random.next() - 0.5) * 60;
        positions[i3 + 2] = -30 - random.next() * 20;
        
        sizes[i] = 1 + random.next() * 3;
        twinkles[i] = random.next() * 100;
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('twinkle', new THREE.BufferAttribute(twinkles, 1));
    
    const stars = new THREE.Points(geometry, starMaterial);
    scene.add(stars);
    
    return stars;
}

// Create lighting
function createLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x1a1a2e, 0.1);
    scene.add(ambientLight);
    
    // Point lights for atmosphere
    for (let i = 0; i < 4; i++) {
        const light = new THREE.PointLight(
            new THREE.Color().setHSL(0.5 + random.next() * 0.3, 0.8, 0.5),
            0.5,
            20,
            2
        );
        
        light.position.set(
            (random.next() - 0.5) * 30,
            (random.next() - 0.5) * 20,
            -5 - random.next() * 10
        );
        
        light.userData = {
            originalIntensity: light.intensity,
            pulsePhase: random.next() * Math.PI * 2,
            pulseSpeed: 0.001 + random.next() * 0.002
        };
        
        lightSources.push(light);
        scene.add(light);
    }
}

// Animation loop
function animateFrame() {
    if (!isInitialized) return;
    
    time += 16;
    
    // Update uniforms
    nebulaUniforms.time.value = time;
    nebulaUniforms.scrollFactor.value = scrollFactor;
    starMaterial.uniforms.time.value = time;
    starMaterial.uniforms.scrollFactor.value = scrollFactor;
    
    // Update nebula materials
    nebulaClouds.forEach(cloud => {
        cloud.userData.material.uniforms.time.value = time;
        cloud.userData.material.uniforms.scrollFactor.value = scrollFactor;
    });
    
    // Update mechanical parts
    mechanicalParts.forEach(part => {
        const userData = part.userData;
        const speedMultiplier = 1 + scrollFactor * 0.5;
        
        if (userData.type === 'gear' || userData.type === 'ring') {
            part.rotation.z += userData.rotationSpeed * speedMultiplier;
        } else if (userData.type === 'piston') {
            const oscillation = Math.sin(time * userData.oscillationSpeed * speedMultiplier + userData.oscillationPhase);
            userData.rod.position.x = 3 + oscillation * 0.5;
        }
        
        // Update opacity based on scroll
        const newOpacity = userData.originalOpacity * (0.8 + scrollFactor * 0.2);
        if (part.material) {
            part.material.opacity = newOpacity;
        } else if (part.children) {
            part.children.forEach(child => {
                if (child.material) child.material.opacity = newOpacity;
            });
        }
    });
    
    // Update lighting
    lightSources.forEach(light => {
        const userData = light.userData;
        const pulse = Math.sin(time * userData.pulseSpeed + userData.pulsePhase) * 0.5 + 0.5;
        light.intensity = userData.originalIntensity * (0.7 + pulse * 0.3) * (0.8 + scrollFactor * 0.2);
    });
    
    // Camera parallax based on mouse movement
    camera.position.x = mouseX * 0.1;
    camera.position.y = mouseY * 0.1;
    camera.lookAt(0, 0, -10);
    
    renderer.render(scene, camera);
    animationId = requestAnimationFrame(animateFrame);
}

// Event handlers
function handleResize() {
    if (!camera || !renderer || !container) return;
    
    width = container.clientWidth;
    height = container.clientHeight;
    
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}

function handleMouseMove(event) {
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    mouseX = ((event.clientX - rect.left) / width - 0.5) * 2;
    mouseY = -((event.clientY - rect.top) / height - 0.5) * 2;
}

// Exported functions
export function initScene2Background(containerElement) {
    if (isInitialized) {
        disposeScene2Background();
    }
    
    container = containerElement;
    width = container.clientWidth;
    height = container.clientHeight;
    
    // Create scene
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x0a0a0f, 15, 40);
    
    // Create camera
    camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 100);
    camera.position.set(0, 0, 0);
    
    // Create renderer
    renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: true,
        powerPreference: "high-performance"
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x0a0a0f, 1);
    renderer.shadowMap.enabled = false; // Disabled for performance
    
    // Style the canvas
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.zIndex = '-1';
    renderer.domElement.style.pointerEvents = 'none';
    
    container.appendChild(renderer.domElement);
    
    // Initialize materials and components
    initMaterials();
    createNebula();
    createStarField();
    createMechanicalParts();
    createLighting();
    
    // Add event listeners
    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    
    // Start animation
    isInitialized = true;
    animateFrame();
    
    console.log('Scene 2 Three.js background initialized');
}

export function updateScene2Background(scrollPosition) {
    if (!isInitialized) return;
    
    // Normalize scroll position
    scrollFactor = Math.min(scrollPosition / 1000, 1);
}

export function disposeScene2Background() {
    if (!isInitialized) return;
    
    // Cancel animation
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
    
    // Remove event listeners
    window.removeEventListener('resize', handleResize);
    window.removeEventListener('mousemove', handleMouseMove);
    
    // Dispose of Three.js objects
    if (scene) {
        scene.traverse((object) => {
            if (object.geometry) {
                object.geometry.dispose();
            }
            if (object.material) {
                if (Array.isArray(object.material)) {
                    object.material.forEach(material => material.dispose());
                } else {
                    object.material.dispose();
                }
            }
        });
    }
    
    if (renderer) {
        renderer.dispose();
        if (container && renderer.domElement) {
            container.removeChild(renderer.domElement);
        }
    }
    
    // Clear references
    scene = null;
    camera = null;
    renderer = null;
    container = null;
    isInitialized = false;
    time = 0;
    scrollFactor = 0;
    mouseX = 0;
    mouseY = 0;
    
    // Clear arrays
    mechanicalParts.length = 0;
    nebulaClouds.length = 0;
    lightSources.length = 0;
    
    // Clear materials
    gearMaterial = null;
    nebulaUniforms = {};
    starMaterial = null;
    
    console.log('Scene 2 Three.js background disposed');
}
