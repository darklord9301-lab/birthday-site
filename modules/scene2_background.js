// /modules/scene2_background.js
// Space nebula background with colorful clouds, twinkling stars, and floating dust particles

import * as THREE from '../libs/three.module.js';

// Scene components
let scene = null;
let camera = null;
let renderer = null;
let container = null;
let animationId = null;
let isInitialized = false;

// Animation state
let time = 0;
const driftSpeed = { x: 0.0002, y: 0.0001 }; // Slow diagonal drift

// Scene objects
const nebulaLayers = [];
const starSystems = [];
let dustParticles = null;
let glowingPlanet = null;

// Materials cache
const materials = {
  nebula: [],
  stars: null,
  dust: null,
  planet: null
};

// Seeded random for consistent generation
class SeededRandom {
  constructor(seed = 12345) {
    this.seed = seed;
  }
  
  next() {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
}

const random = new SeededRandom(777);

// Custom shaders for nebula effect
const nebulaVertexShader = `
  varying vec2 vUv;
  varying vec3 vWorldPosition;
  
  void main() {
    vUv = uv;
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const nebulaFragmentShader = `
  uniform float time;
  uniform vec3 color1;
  uniform vec3 color2;
  uniform vec3 color3;
  uniform float intensity;
  uniform float layer;
  uniform vec2 drift;
  
  varying vec2 vUv;
  varying vec3 vWorldPosition;
  
  // Improved noise functions
  vec2 hash22(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.xx + p3.yz) * p3.zy);
  }
  
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    
    vec2 a = hash22(i);
    vec2 b = hash22(i + vec2(1.0, 0.0));
    vec2 c = hash22(i + vec2(0.0, 1.0));
    vec2 d = hash22(i + vec2(1.0, 1.0));
    
    float noiseA = dot(a, f);
    float noiseB = dot(b, f - vec2(1.0, 0.0));
    float noiseC = dot(c, f - vec2(0.0, 1.0));
    float noiseD = dot(d, f - vec2(1.0, 1.0));
    
    return mix(mix(noiseA, noiseB, u.x), mix(noiseC, noiseD, u.x), u.y);
  }
  
  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    
    for (int i = 0; i < 6; i++) {
      value += amplitude * noise(p * frequency);
      frequency *= 2.07;
      amplitude *= 0.54;
    }
    return value;
  }
  
  void main() {
    vec2 uv = vUv;
    
    // Apply layer-specific drift
    uv += drift * time * (0.5 + layer * 0.3);
    
    // Multiple octaves of noise for complex nebula structure
    float n1 = fbm(uv * 2.0 + time * 0.00003);
    float n2 = fbm(uv * 1.2 + time * 0.00005 + vec2(100.0));
    float n3 = fbm(uv * 3.5 + time * 0.00002 + vec2(200.0));
    
    // Combine noise patterns
    float density = n1 * 0.5 + n2 * 0.3 + n3 * 0.2;
    density = smoothstep(0.2, 0.8, density);
    
    // Distance-based falloff from center
    vec2 center = vUv - 0.5;
    float dist = length(center);
    float radialFalloff = 1.0 - smoothstep(0.3, 1.2, dist);
    
    // Color mixing based on noise patterns
    float colorMix1 = smoothstep(0.3, 0.7, n1);
    float colorMix2 = smoothstep(0.4, 0.6, n2);
    
    vec3 finalColor = mix(color1, color2, colorMix1);
    finalColor = mix(finalColor, color3, colorMix2 * 0.5);
    
    // Add subtle brightness variation
    float brightness = 0.8 + 0.4 * sin(time * 0.0001 + layer * 2.0);
    finalColor *= brightness;
    
    float alpha = density * radialFalloff * intensity;
    
    gl_FragColor = vec4(finalColor, alpha);
  }
`;

// Star field shaders
const starVertexShader = `
  attribute float size;
  attribute float twinklePhase;
  attribute float twinkleSpeed;
  
  uniform float time;
  uniform vec2 drift;
  
  varying float vTwinkle;
  varying float vSize;
  
  void main() {
    vSize = size;
    
    // Twinkling effect
    vTwinkle = 0.5 + 0.5 * sin(time * twinkleSpeed + twinklePhase);
    
    vec3 pos = position;
    
    // Apply drift to stars
    pos.x += drift.x * time;
    pos.y += drift.y * time;
    
    // Wrap around screen bounds
    pos.x = mod(pos.x + 25.0, 50.0) - 25.0;
    pos.y = mod(pos.y + 15.0, 30.0) - 15.0;
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = size * vTwinkle * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const starFragmentShader = `
  uniform vec3 starColor;
  
  varying float vTwinkle;
  varying float vSize;
  
  void main() {
    vec2 center = gl_PointCoord - 0.5;
    float dist = length(center);
    
    if (dist > 0.5) discard;
    
    // Soft star shape with glow
    float alpha = pow(1.0 - dist * 2.0, 2.0) * vTwinkle;
    
    // Add outer glow for larger stars
    if (vSize > 2.5) {
      alpha += 0.3 * exp(-dist * 8.0) * vTwinkle;
    }
    
    gl_FragColor = vec4(starColor, alpha);
  }
`;

// Dust particle shaders
const dustVertexShader = `
  attribute float size;
  attribute float opacity;
  attribute vec3 velocity;
  
  uniform float time;
  uniform vec2 drift;
  
  varying float vOpacity;
  
  void main() {
    vOpacity = opacity * (0.3 + 0.7 * sin(time * 0.001 + position.x * 0.1));
    
    vec3 pos = position;
    
    // Particle motion
    pos += velocity * time * 0.01;
    pos.x += drift.x * time * 0.5;
    pos.y += drift.y * time * 0.5;
    
    // Wrap particles
    pos.x = mod(pos.x + 30.0, 60.0) - 30.0;
    pos.y = mod(pos.y + 20.0, 40.0) - 20.0;
    pos.z = mod(pos.z + 15.0, 30.0) - 15.0;
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = size * (200.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const dustFragmentShader = `
  uniform vec3 dustColor;
  
  varying float vOpacity;
  
  void main() {
    vec2 center = gl_PointCoord - 0.5;
    float dist = length(center);
    
    if (dist > 0.5) discard;
    
    float alpha = (1.0 - dist * 2.0) * vOpacity * 0.4;
    
    gl_FragColor = vec4(dustColor, alpha);
  }
`;

// Create nebula layers with different colors and scales
function createNebulaLayers() {
  const nebulaColors = [
    // Purple-blue nebula
    { c1: [0.4, 0.1, 0.8], c2: [0.8, 0.2, 0.9], c3: [0.2, 0.5, 1.0] },
    // Pink-orange nebula
    { c1: [0.9, 0.3, 0.5], c2: [1.0, 0.5, 0.2], c3: [0.8, 0.1, 0.6] },
    // Green-blue nebula
    { c1: [0.2, 0.8, 0.6], c2: [0.1, 0.6, 0.9], c3: [0.4, 0.9, 0.3] },
    // Deep space blues
    { c1: [0.1, 0.2, 0.6], c2: [0.3, 0.1, 0.8], c3: [0.0, 0.4, 0.7] }
  ];
  
  for (let i = 0; i < 4; i++) {
    const scale = 15 + i * 8;
    const geometry = new THREE.PlaneGeometry(scale, scale);
    
    const colors = nebulaColors[i];
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color1: { value: new THREE.Vector3(...colors.c1) },
        color2: { value: new THREE.Vector3(...colors.c2) },
        color3: { value: new THREE.Vector3(...colors.c3) },
        intensity: { value: 0.4 + random.next() * 0.3 },
        layer: { value: i },
        drift: { value: new THREE.Vector2(driftSpeed.x * (1 + i * 0.3), driftSpeed.y * (1 + i * 0.2)) }
      },
      vertexShader: nebulaVertexShader,
      fragmentShader: nebulaFragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    
    const nebula = new THREE.Mesh(geometry, material);
    nebula.position.set(
      (random.next() - 0.5) * 20,
      (random.next() - 0.5) * 15,
      -20 - i * 5
    );
    
    nebula.rotation.z = random.next() * Math.PI * 2;
    
    materials.nebula.push(material);
    nebulaLayers.push(nebula);
    scene.add(nebula);
  }
}

// Create twinkling star field
function createStarField() {
  const starCount = 800;
  const positions = new Float32Array(starCount * 3);
  const sizes = new Float32Array(starCount);
  const twinklePhases = new Float32Array(starCount);
  const twinkleSpeeds = new Float32Array(starCount);
  
  for (let i = 0; i < starCount; i++) {
    const i3 = i * 3;
    
    // Distribute stars in 3D space
    positions[i3] = (random.next() - 0.5) * 50;
    positions[i3 + 1] = (random.next() - 0.5) * 30;
    positions[i3 + 2] = -5 - random.next() * 40;
    
    // Vary star sizes (most small, few large)
    const sizeRoll = random.next();
    if (sizeRoll > 0.95) {
      sizes[i] = 3.5 + random.next() * 2.5; // Large bright stars
    } else if (sizeRoll > 0.85) {
      sizes[i] = 2.0 + random.next() * 1.5; // Medium stars
    } else {
      sizes[i] = 0.8 + random.next() * 1.2; // Small stars
    }
    
    twinklePhases[i] = random.next() * Math.PI * 2;
    twinkleSpeeds[i] = 0.0005 + random.next() * 0.002;
  }
  
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute('twinklePhase', new THREE.BufferAttribute(twinklePhases, 1));
  geometry.setAttribute('twinkleSpeed', new THREE.BufferAttribute(twinkleSpeeds, 1));
  
  materials.stars = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      starColor: { value: new THREE.Vector3(0.9, 0.95, 1.0) },
      drift: { value: new THREE.Vector2(driftSpeed.x, driftSpeed.y) }
    },
    vertexShader: starVertexShader,
    fragmentShader: starFragmentShader,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  
  const stars = new THREE.Points(geometry, materials.stars);
  starSystems.push(stars);
  scene.add(stars);
}

// Create floating dust particles
function createDustParticles() {
  const dustCount = 200;
  const positions = new Float32Array(dustCount * 3);
  const sizes = new Float32Array(dustCount);
  const opacities = new Float32Array(dustCount);
  const velocities = new Float32Array(dustCount * 3);
  
  for (let i = 0; i < dustCount; i++) {
    const i3 = i * 3;
    
    positions[i3] = (random.next() - 0.5) * 60;
    positions[i3 + 1] = (random.next() - 0.5) * 40;
    positions[i3 + 2] = -2 - random.next() * 30;
    
    sizes[i] = 1.0 + random.next() * 2.0;
    opacities[i] = 0.3 + random.next() * 0.7;
    
    // Random drift velocities
    velocities[i3] = (random.next() - 0.5) * 0.5;
    velocities[i3 + 1] = (random.next() - 0.5) * 0.3;
    velocities[i3 + 2] = (random.next() - 0.5) * 0.2;
  }
  
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute('opacity', new THREE.BufferAttribute(opacities, 1));
  geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
  
  materials.dust = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      dustColor: { value: new THREE.Vector3(0.8, 0.9, 1.0) },
      drift: { value: new THREE.Vector2(driftSpeed.x, driftSpeed.y) }
    },
    vertexShader: dustVertexShader,
    fragmentShader: dustFragmentShader,
    transparent: true,
    blending: THREE.NormalBlending,
    depthWrite: false
  });
  
  dustParticles = new THREE.Points(geometry, materials.dust);
  scene.add(dustParticles);
}

// Create optional glowing planet
function createGlowingPlanet() {
  const planetGeometry = new THREE.SphereGeometry(3, 32, 32);
  
  materials.planet = new THREE.MeshBasicMaterial({
    color: new THREE.Color(0.8, 0.4, 0.9),
    transparent: true,
    opacity: 0.6
  });
  
  glowingPlanet = new THREE.Mesh(planetGeometry, materials.planet);
  glowingPlanet.position.set(18, -10, -35);
  
  // Add atmospheric glow
  const glowGeometry = new THREE.SphereGeometry(4.5, 32, 32);
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color(0.4, 0.2, 0.8),
    transparent: true,
    opacity: 0.15,
    side: THREE.BackSide
  });
  
  const glow = new THREE.Mesh(glowGeometry, glowMaterial);
  glowingPlanet.add(glow);
  
  scene.add(glowingPlanet);
}

// Animation loop
function animateFrame() {
  if (!isInitialized) return;
  
  time += 16; // ~60fps timing
  
  // Update all material uniforms
  materials.nebula.forEach(material => {
    material.uniforms.time.value = time;
  });
  
  if (materials.stars) {
    materials.stars.uniforms.time.value = time;
  }
  
  if (materials.dust) {
    materials.dust.uniforms.time.value = time;
  }
  
  // Subtle planet glow animation
  if (glowingPlanet && materials.planet) {
    const glow = 0.6 + 0.2 * Math.sin(time * 0.001);
    materials.planet.opacity = glow;
  }
  
  renderer.render(scene, camera);
  animationId = requestAnimationFrame(animateFrame);
}

// Handle window resize
function handleResize() {
  if (!camera || !renderer || !container) return;
  
  const width = container.clientWidth;
  const height = container.clientHeight;
  
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  
  renderer.setSize(width, height);
}

// Exported functions
export function initScene2Background(containerElement) {
  if (isInitialized) {
    disposeScene2Background();
  }
  
  container = containerElement;
  const width = container.clientWidth;
  const height = container.clientHeight;
  
  // Create scene
  scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x000408, 30, 60);
  
  // Create camera
  camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 100);
  camera.position.set(0, 0, 0);
  camera.lookAt(0, 0, -10);
  
  // Create renderer
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance'
  });
  
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000408, 1);
  
  // Style canvas
  renderer.domElement.style.position = 'absolute';
  renderer.domElement.style.top = '0';
  renderer.domElement.style.left = '0';
  renderer.domElement.style.zIndex = '-1';
  renderer.domElement.style.pointerEvents = 'none';
  
  container.appendChild(renderer.domElement);
  
  // Create scene objects
  createNebulaLayers();
  createStarField();
  createDustParticles();
  createGlowingPlanet();
  
  // Add resize listener
  window.addEventListener('resize', handleResize);
  
  // Start animation
  isInitialized = true;
  animateFrame();
  
  console.log('Scene 2 space nebula background initialized');
}

export function updateScene2Background(scrollProgress) {
  // Background motion is constant and doesn't depend on scroll
  // This function exists for API compatibility but doesn't affect the animation
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
  
  // Dispose Three.js objects
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
  
  // Clear arrays
  nebulaLayers.length = 0;
  starSystems.length = 0;
  dustParticles = null;
  glowingPlanet = null;
  
  // Clear materials
  materials.nebula.length = 0;
  materials.stars = null;
  materials.dust = null;
  materials.planet = null;
  
  console.log('Scene 2 space nebula background disposed');
}
