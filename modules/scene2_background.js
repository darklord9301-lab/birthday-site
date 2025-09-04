// /modules/scene2_background.js
// Spiral galaxy background with vibrant colors, slow rotation, and 4K quality

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
const driftSpeed = { x: 0.0001, y: 0.0001 }; // Slower drift for galaxy rotation
const galaxyRotationSpeed = 0.0002; // Very slow galaxy rotation

// Scene objects
const galaxyLayers = [];
const starSystems = [];
let dustParticles = null;
let galaxyCore = null;
let galaxyArms = [];

// Materials cache
const materials = {
  galaxy: [],
  stars: null,
  dust: null,
  core: null,
  arms: []
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

// Enhanced spiral galaxy vertex shader
const galaxyVertexShader = `
  varying vec2 vUv;
  varying vec3 vWorldPosition;
  uniform float time;
  uniform float rotationSpeed;
  
  void main() {
    vUv = uv;
    
    // Apply rotation to the entire plane
    float angle = time * rotationSpeed;
    mat2 rotation = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
    
    vec2 rotatedUv = rotation * (uv - 0.5) + 0.5;
    vUv = rotatedUv;
    
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Enhanced spiral galaxy fragment shader
const galaxyFragmentShader = `
  uniform float time;
  uniform vec3 coreColor;
  uniform vec3 armColor1;
  uniform vec3 armColor2;
  uniform vec3 armColor3;
  uniform float intensity;
  uniform float layer;
  uniform vec2 drift;
  uniform float rotationSpeed;
  
  varying vec2 vUv;
  varying vec3 vWorldPosition;
  
  // High-quality noise functions for 4K detail
  vec3 hash33(vec3 p3) {
    p3 = fract(p3 * vec3(0.1031, 0.1030, 0.0973));
    p3 += dot(p3, p3.yxz + 33.33);
    return fract((p3.xxy + p3.yxx) * p3.zyx);
  }
  
  float noise3D(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    vec3 u = f * f * (3.0 - 2.0 * f);
    
    vec3 a = hash33(i);
    vec3 b = hash33(i + vec3(1.0, 0.0, 0.0));
    vec3 c = hash33(i + vec3(0.0, 1.0, 0.0));
    vec3 d = hash33(i + vec3(1.0, 1.0, 0.0));
    vec3 e = hash33(i + vec3(0.0, 0.0, 1.0));
    vec3 f1 = hash33(i + vec3(1.0, 0.0, 1.0));
    vec3 g = hash33(i + vec3(0.0, 1.0, 1.0));
    vec3 h = hash33(i + vec3(1.0, 1.0, 1.0));
    
    return mix(
      mix(mix(a.x, b.x, u.x), mix(c.x, d.x, u.x), u.y),
      mix(mix(e.x, f1.x, u.x), mix(g.x, h.x, u.x), u.y),
      u.z
    );
  }
  
  float fbm(vec3 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    
    for (int i = 0; i < 8; i++) {
      value += amplitude * noise3D(p * frequency);
      frequency *= 2.02;
      amplitude *= 0.52;
    }
    return value;
  }
  
  void main() {
    vec2 uv = vUv;
    
    // Center the UV coordinates
    vec2 center = uv - 0.5;
    float dist = length(center);
    float angle = atan(center.y, center.x);
    
    // Create spiral arms pattern
    float spiralArms = 2.0; // Number of spiral arms
    float spiralTightness = 3.0;
    float spiralPhase = angle - dist * spiralTightness + time * rotationSpeed * 0.5;
    
    // Multiple spiral patterns for complexity
    float arm1 = sin(spiralPhase * spiralArms) * 0.5 + 0.5;
    float arm2 = sin(spiralPhase * spiralArms + 3.14159) * 0.5 + 0.5;
    
    // Add secondary spiral pattern
    float fineSpiral = sin(spiralPhase * spiralArms * 2.0 + time * 0.0001) * 0.3 + 0.7;
    
    // Create galaxy core
    float coreRadius = 0.15;
    float coreIntensity = 1.0 - smoothstep(0.0, coreRadius, dist);
    coreIntensity = pow(coreIntensity, 2.0) * 2.0;
    
    // Create arm density with distance falloff
    float armIntensity = (arm1 + arm2) * 0.5 * fineSpiral;
    armIntensity *= 1.0 - smoothstep(0.1, 0.8, dist); // Fade at edges
    armIntensity *= exp(-dist * 2.0); // Exponential falloff
    
    // Add high-frequency noise for star formation regions
    vec3 noisePos = vec3(uv * 4.0, time * 0.00002);
    float detailNoise = fbm(noisePos) * 0.8;
    float starFormation = fbm(noisePos * 2.0) * 0.6;
    
    // Combine all elements
    float totalDensity = coreIntensity + armIntensity * (0.7 + detailNoise * 0.5);
    totalDensity += starFormation * armIntensity * 0.3;
    
    // Color mixing based on distance and density
    vec3 finalColor;
    
    if (dist < 0.2) {
      // Core region - warm orange/yellow
      finalColor = mix(coreColor, armColor1, smoothstep(0.0, 0.2, dist));
    } else if (dist < 0.5) {
      // Inner arms - blue/cyan
      float mixFactor = (dist - 0.2) / 0.3;
      finalColor = mix(armColor1, armColor2, mixFactor);
      finalColor = mix(finalColor, armColor3, arm1 * 0.5);
    } else {
      // Outer regions - deep blue/purple
      finalColor = armColor3;
      finalColor = mix(finalColor, armColor2, starFormation * 0.3);
    }
    
    // Add brightness variation for more realism
    float brightness = 1.0 + 0.3 * sin(time * 0.0003 + angle * 2.0);
    brightness += detailNoise * 0.4;
    finalColor *= brightness;
    
    // Enhance saturation for vibrant colors
    float saturation = 1.3;
    vec3 luminance = vec3(0.299, 0.587, 0.114);
    float gray = dot(finalColor, luminance);
    finalColor = mix(vec3(gray), finalColor, saturation);
    
    // Final alpha with smooth edges
    float alpha = totalDensity * intensity;
    alpha *= smoothstep(0.8, 0.6, dist); // Soft edge falloff
    
    gl_FragColor = vec4(finalColor, alpha);
  }
`;

// Enhanced star field shaders for 4K quality
const starVertexShader = `
  attribute float size;
  attribute float twinklePhase;
  attribute float twinkleSpeed;
  attribute vec3 starColor;
  
  uniform float time;
  uniform vec2 drift;
  uniform float galaxyRotation;
  
  varying float vTwinkle;
  varying float vSize;
  varying vec3 vStarColor;
  
  void main() {
    vSize = size;
    vStarColor = starColor;
    
    // Enhanced twinkling with color variation
    vTwinkle = 0.6 + 0.4 * sin(time * twinkleSpeed + twinklePhase);
    
    vec3 pos = position;
    
    // Apply galaxy rotation to stars
    float angle = galaxyRotation * time;
    float cosA = cos(angle);
    float sinA = sin(angle);
    
    float newX = pos.x * cosA - pos.y * sinA;
    float newY = pos.x * sinA + pos.y * cosA;
    
    pos.x = newX;
    pos.y = newY;
    
    // Wrap around screen bounds
    pos.x = mod(pos.x + 30.0, 60.0) - 30.0;
    pos.y = mod(pos.y + 20.0, 40.0) - 20.0;
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = size * vTwinkle * (400.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const starFragmentShader = `
  varying float vTwinkle;
  varying float vSize;
  varying vec3 vStarColor;
  
  void main() {
    vec2 center = gl_PointCoord - 0.5;
    float dist = length(center);
    
    if (dist > 0.5) discard;
    
    // Enhanced star shape with HDR-like glow
    float alpha = pow(1.0 - dist * 2.0, 3.0) * vTwinkle;
    
    // Add bright core and outer glow
    alpha += 0.6 * exp(-dist * 12.0) * vTwinkle;
    alpha += 0.2 * exp(-dist * 4.0) * vTwinkle;
    
    // Color enhancement for larger stars
    vec3 finalColor = vStarColor;
    if (vSize > 3.0) {
      finalColor *= 1.2; // Brighter large stars
    }
    
    gl_FragColor = vec4(finalColor, alpha);
  }
`;

// Create spiral galaxy layers
function createGalaxyLayers() {
  // Main galaxy layer with high resolution
  const scale = 40; // Larger for 4K quality
  const geometry = new THREE.PlaneGeometry(scale, scale, 256, 256); // High resolution
  
  const material = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      coreColor: { value: new THREE.Vector3(1.0, 0.8, 0.4) }, // Warm yellow-orange core
      armColor1: { value: new THREE.Vector3(0.4, 0.8, 1.0) }, // Bright blue
      armColor2: { value: new THREE.Vector3(0.2, 0.6, 0.9) }, // Deep blue
      armColor3: { value: new THREE.Vector3(0.6, 0.3, 0.8) }, // Purple edges
      intensity: { value: 0.8 },
      layer: { value: 0 },
      drift: { value: new THREE.Vector2(driftSpeed.x, driftSpeed.y) },
      rotationSpeed: { value: galaxyRotationSpeed }
    },
    vertexShader: galaxyVertexShader,
    fragmentShader: galaxyFragmentShader,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide
  });
  
  const galaxy = new THREE.Mesh(geometry, material);
  galaxy.position.set(0, 0, -25);
  
  materials.galaxy.push(material);
  galaxyLayers.push(galaxy);
  scene.add(galaxy);
  
  // Additional background layer for depth
  const bgGeometry = new THREE.PlaneGeometry(scale * 1.5, scale * 1.5, 128, 128);
  const bgMaterial = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      coreColor: { value: new THREE.Vector3(0.2, 0.3, 0.6) },
      armColor1: { value: new THREE.Vector3(0.1, 0.2, 0.4) },
      armColor2: { value: new THREE.Vector3(0.3, 0.1, 0.5) },
      armColor3: { value: new THREE.Vector3(0.1, 0.1, 0.3) },
      intensity: { value: 0.3 },
      layer: { value: 1 },
      drift: { value: new THREE.Vector2(driftSpeed.x * 0.5, driftSpeed.y * 0.5) },
      rotationSpeed: { value: galaxyRotationSpeed * 0.7 }
    },
    vertexShader: galaxyVertexShader,
    fragmentShader: galaxyFragmentShader,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide
  });
  
  const bgGalaxy = new THREE.Mesh(bgGeometry, bgMaterial);
  bgGalaxy.position.set(0, 0, -45);
  
  materials.galaxy.push(bgMaterial);
  galaxyLayers.push(bgGalaxy);
  scene.add(bgGalaxy);
}

// Create enhanced star field with color variation
function createStarField() {
  const starCount = 1500; // More stars for 4K quality
  const positions = new Float32Array(starCount * 3);
  const sizes = new Float32Array(starCount);
  const twinklePhases = new Float32Array(starCount);
  const twinkleSpeeds = new Float32Array(starCount);
  const colors = new Float32Array(starCount * 3);
  
  // Star color palettes
  const starColorTypes = [
    [1.0, 1.0, 1.0],    // White
    [0.8, 0.9, 1.0],    // Blue-white
    [1.0, 0.9, 0.8],    // Yellow-white
    [1.0, 0.8, 0.6],    // Orange
    [0.9, 0.7, 0.9],    // Purple-pink
    [0.7, 0.9, 1.0],    // Blue
  ];
  
  for (let i = 0; i < starCount; i++) {
    const i3 = i * 3;
    
    // Distribute stars with galaxy-like clustering
    const angle = random.next() * Math.PI * 2;
    const radius = Math.pow(random.next(), 0.7) * 25; // Clustered toward center
    
    positions[i3] = Math.cos(angle) * radius + (random.next() - 0.5) * 10;
    positions[i3 + 1] = Math.sin(angle) * radius + (random.next() - 0.5) * 8;
    positions[i3 + 2] = -5 - random.next() * 35;
    
    // Size distribution with more large stars
    const sizeRoll = random.next();
    if (sizeRoll > 0.92) {
      sizes[i] = 4.0 + random.next() * 3.0; // Very large bright stars
    } else if (sizeRoll > 0.8) {
      sizes[i] = 2.5 + random.next() * 2.0; // Large stars
    } else if (sizeRoll > 0.6) {
      sizes[i] = 1.5 + random.next() * 1.5; // Medium stars
    } else {
      sizes[i] = 0.8 + random.next() * 1.0; // Small stars
    }
    
    twinklePhases[i] = random.next() * Math.PI * 2;
    twinkleSpeeds[i] = 0.0003 + random.next() * 0.0015;
    
    // Assign star colors
    const colorType = starColorTypes[Math.floor(random.next() * starColorTypes.length)];
    colors[i3] = colorType[0];
    colors[i3 + 1] = colorType[1];
    colors[i3 + 2] = colorType[2];
  }
  
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute('twinklePhase', new THREE.BufferAttribute(twinklePhases, 1));
  geometry.setAttribute('twinkleSpeed', new THREE.BufferAttribute(twinkleSpeeds, 1));
  geometry.setAttribute('starColor', new THREE.BufferAttribute(colors, 3));
  
  materials.stars = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      drift: { value: new THREE.Vector2(driftSpeed.x, driftSpeed.y) },
      galaxyRotation: { value: galaxyRotationSpeed * 0.8 }
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

// Create cosmic dust with galaxy rotation
function createDustParticles() {
  const dustCount = 500; // More dust for richness
  const positions = new Float32Array(dustCount * 3);
  const sizes = new Float32Array(dustCount);
  const opacities = new Float32Array(dustCount);
  const velocities = new Float32Array(dustCount * 3);
  
  for (let i = 0; i < dustCount; i++) {
    const i3 = i * 3;
    
    // Distribute dust in spiral pattern
    const angle = random.next() * Math.PI * 2;
    const radius = Math.pow(random.next(), 0.8) * 30;
    
    positions[i3] = Math.cos(angle) * radius;
    positions[i3 + 1] = Math.sin(angle) * radius;
    positions[i3 + 2] = -2 - random.next() * 25;
    
    sizes[i] = 0.8 + random.next() * 1.5;
    opacities[i] = 0.2 + random.next() * 0.5;
    
    // Rotational velocities
    velocities[i3] = -Math.sin(angle) * 0.3;
    velocities[i3 + 1] = Math.cos(angle) * 0.3;
    velocities[i3 + 2] = (random.next() - 0.5) * 0.1;
  }
  
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute('opacity', new THREE.BufferAttribute(opacities, 1));
  geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
  
  const dustVertexShader = `
    attribute float size;
    attribute float opacity;
    attribute vec3 velocity;
    
    uniform float time;
    uniform vec2 drift;
    uniform float galaxyRotation;
    
    varying float vOpacity;
    
    void main() {
      vOpacity = opacity * (0.4 + 0.6 * sin(time * 0.0008 + position.x * 0.05));
      
      vec3 pos = position;
      
      // Galaxy rotation
      float angle = galaxyRotation * time;
      float cosA = cos(angle);
      float sinA = sin(angle);
      
      float newX = pos.x * cosA - pos.y * sinA;
      float newY = pos.x * sinA + pos.y * cosA;
      
      pos.x = newX + velocity.x * time * 0.005;
      pos.y = newY + velocity.y * time * 0.005;
      pos.z += velocity.z * time * 0.002;
      
      // Wrap particles
      float maxDist = 35.0;
      if (length(vec2(pos.x, pos.y)) > maxDist) {
        pos.x *= 0.8;
        pos.y *= 0.8;
      }
      
      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_PointSize = size * (250.0 / -mvPosition.z);
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
      
      float alpha = (1.0 - dist * 2.0) * vOpacity * 0.6;
      
      gl_FragColor = vec4(dustColor, alpha);
    }
  `;
  
  materials.dust = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      dustColor: { value: new THREE.Vector3(0.7, 0.8, 1.0) },
      drift: { value: new THREE.Vector2(driftSpeed.x, driftSpeed.y) },
      galaxyRotation: { value: galaxyRotationSpeed * 0.6 }
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

// Animation loop with enhanced timing
function animateFrame() {
  if (!isInitialized) return;
  
  time += 16; // ~60fps timing
  
  // Update all material uniforms
  materials.galaxy.forEach(material => {
    material.uniforms.time.value = time;
  });
  
  if (materials.stars) {
    materials.stars.uniforms.time.value = time;
  }
  
  if (materials.dust) {
    materials.dust.uniforms.time.value = time;
  }
  
  renderer.render(scene, camera);
  animationId = requestAnimationFrame(animateFrame);
}

// Handle window resize with 4K support
function handleResize() {
  if (!camera || !renderer || !container) return;
  
  const width = container.clientWidth;
  const height = container.clientHeight;
  
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  
  renderer.setSize(width, height);
  
  // Maintain high pixel ratio for 4K displays
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.5));
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
  scene.fog = new THREE.Fog(0x000204, 40, 80);
  
  // Create camera with wider FOV for immersive experience
  camera = new THREE.PerspectiveCamera(85, width / height, 0.1, 100);
  camera.position.set(0, 0, 0);
  camera.lookAt(0, 0, -10);
  
  // Create renderer with enhanced settings for 4K
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
    precision: 'highp'
  });
  
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.5));
  renderer.setClearColor(0x000204, 1);
  
  // Enhanced renderer settings
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  
  // Style canvas
  renderer.domElement.style.position = 'absolute';
  renderer.domElement.style.top = '0';
  renderer.domElement.style.left = '0';
  renderer.domElement.style.zIndex = '-1';
  renderer.domElement.style.pointerEvents = 'none';
  
  container.appendChild(renderer.domElement);
  
  // Create scene objects
  createGalaxyLayers();
  createStarField();
  createDustParticles();
  
  // Add resize listener
  window.addEventListener('resize', handleResize);
  
  // Start animation
  isInitialized = true;
  animateFrame();
  
  console.log('Enhanced 4K spiral galaxy background initialized');
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
  galaxyLayers.length = 0;
  starSystems.length = 0;
  dustParticles = null;
  galaxyCore = null;
  galaxyArms.length = 0;
  
  // Clear materials
  materials.galaxy.length = 0;
  materials.stars = null;
  materials.dust = null;
  materials.core = null;
  materials.arms.length = 0;
  
  console.log('Enhanced spiral galaxy background disposed');
}
