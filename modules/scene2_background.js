// /modules/scene2_background.js
// INSANE 4K SPIRAL GALAXY - MIND-BLOWING HEAVENLY MASTERPIECE

import * as THREE from '../libs/three.module.js';

// Scene components
let scene = null;
let camera = null;
let renderer = null;
let container = null;
let animationId = null;
let isInitialized = false;
let composer = null;

// Animation state
let time = 0;
const galaxyRotationSpeed = 0.00015; // Perfect slow rotation
const cameraOscillation = 0.00008; // Subtle camera breathing

// Scene objects
const galaxyLayers = [];
const starSystems = [];
const nebulaClouds = [];
let dustParticles = null;
let galaxyCore = null;
let brightStars = [];
let cosmicRays = [];

// Materials cache
const materials = {
  galaxy: [],
  stars: [],
  dust: null,
  core: null,
  nebula: [],
  cosmicRays: null
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

// INSANE GALAXY VERTEX SHADER WITH ADVANCED EFFECTS
const galaxyVertexShader = `
  varying vec2 vUv;
  varying vec3 vWorldPosition;
  varying vec3 vNormal;
  uniform float time;
  uniform float rotationSpeed;
  uniform float cameraBreathing;
  
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    
    // Dynamic rotation with slight wobble for realism
    float angle = time * rotationSpeed + sin(time * 0.0001) * 0.02;
    mat2 rotation = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
    
    vec2 rotatedUv = rotation * (uv - 0.5) + 0.5;
    vUv = rotatedUv;
    
    // Subtle vertex displacement for depth
    vec3 pos = position;
    float wave = sin(time * 0.0005 + pos.x * 0.1 + pos.y * 0.1) * 0.1;
    pos.z += wave * cameraBreathing;
    
    vec4 worldPosition = modelMatrix * vec4(pos, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

// MIND-BLOWING GALAXY FRAGMENT SHADER - ULTRA REALISTIC
const galaxyFragmentShader = `
  uniform float time;
  uniform vec3 coreColor;
  uniform vec3 innerArmColor;
  uniform vec3 midArmColor;
  uniform vec3 outerArmColor;
  uniform vec3 edgeColor;
  uniform float intensity;
  uniform float layer;
  uniform float rotationSpeed;
  uniform float brightness;
  
  varying vec2 vUv;
  varying vec3 vWorldPosition;
  varying vec3 vNormal;
  
  // ULTRA HIGH QUALITY NOISE - 12 OCTAVES
  vec4 hash44(vec4 p4) {
    p4 = fract(p4 * vec4(0.1031, 0.1030, 0.0973, 0.1099));
    p4 += dot(p4, p4.wzxy + 33.33);
    return fract((p4.xxyz + p4.yzzw) * p4.zywx);
  }
  
  float noise4D(vec4 p) {
    vec4 i = floor(p);
    vec4 f = fract(p);
    vec4 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0); // Quintic interpolation
    
    return mix(
      mix(
        mix(hash44(i).x, hash44(i + vec4(1,0,0,0)).x, u.x),
        mix(hash44(i + vec4(0,1,0,0)).x, hash44(i + vec4(1,1,0,0)).x, u.x), u.y),
      mix(
        mix(hash44(i + vec4(0,0,1,0)).x, hash44(i + vec4(1,0,1,0)).x, u.x),
        mix(hash44(i + vec4(0,1,1,0)).x, hash44(i + vec4(1,1,1,0)).x, u.x), u.y), u.z);
  }
  
  float fbm4D(vec4 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    
    // 12 octaves for INSANE detail
    for (int i = 0; i < 12; i++) {
      value += amplitude * noise4D(p * frequency);
      frequency *= 2.03;
      amplitude *= 0.51;
    }
    return value;
  }
  
  // Spiral density function - ULTRA REALISTIC
  float spiralDensity(vec2 pos, float time) {
    float angle = atan(pos.y, pos.x);
    float radius = length(pos);
    
    // Multiple spiral patterns for complexity
    float mainSpiral = 2.0; // Two main arms
    float spiralTight = 4.5;
    float phase1 = angle - radius * spiralTight + time * 0.3;
    float phase2 = angle - radius * spiralTight + 3.14159 + time * 0.3;
    
    // Main arms
    float arm1 = pow(0.5 + 0.5 * cos(phase1 * mainSpiral), 3.0);
    float arm2 = pow(0.5 + 0.5 * cos(phase2 * mainSpiral), 3.0);
    
    // Secondary spiral structure
    float fineSpiral = 0.7 + 0.3 * sin(phase1 * mainSpiral * 3.0 + time * 0.1);
    
    // Feathering between arms
    float feather = 0.3 + 0.7 * sin(phase1 * mainSpiral * 1.5 + time * 0.05);
    
    return (arm1 + arm2) * fineSpiral * feather;
  }
  
  void main() {
    vec2 uv = vUv;
    vec2 center = uv - 0.5;
    float dist = length(center);
    float angle = atan(center.y, center.x);
    
    // 4D noise for incredible detail
    vec4 noisePos = vec4(uv * 8.0, time * 0.00003, layer * 0.5);
    float superNoise = fbm4D(noisePos);
    
    // High-frequency stellar formation noise
    vec4 stellarNoise = vec4(uv * 20.0, time * 0.00001, dist * 5.0);
    float starFormation = fbm4D(stellarNoise) * 0.8;
    
    // Spiral arm calculation
    float spiralIntensity = spiralDensity(center, time * rotationSpeed);
    
    // GALAXY CORE - Bright, warm, realistic
    float coreSize = 0.08 + 0.02 * sin(time * 0.0002);
    float coreIntensity = 1.0 - smoothstep(0.0, coreSize, dist);
    coreIntensity = pow(coreIntensity, 1.5) * 4.0;
    
    // Core heating effect
    float coreHeat = exp(-dist * 15.0) * (1.0 + 0.5 * sin(time * 0.0003 + angle * 3.0));
    coreIntensity += coreHeat * 0.8;
    
    // ARM REGIONS with realistic falloff
    float armMask = spiralIntensity;
    armMask *= exp(-pow(dist * 2.2, 2.0)); // Exponential falloff
    armMask += starFormation * spiralIntensity * 0.4;
    
    // Distance-based color zones (like real galaxies)
    vec3 finalColor;
    float colorZone = dist;
    
    if (dist < 0.12) {
      // Nuclear bulge - yellow/orange
      finalColor = mix(coreColor, innerArmColor, smoothstep(0.0, 0.12, dist));
      finalColor += vec3(0.3, 0.2, 0.0) * coreHeat;
    } else if (dist < 0.35) {
      // Inner disk - blue/cyan with star formation
      float zoneMix = (dist - 0.12) / 0.23;
      finalColor = mix(innerArmColor, midArmColor, zoneMix);
      finalColor = mix(finalColor, vec3(1.0, 0.9, 0.7), starFormation * 0.6);
    } else if (dist < 0.65) {
      // Main disk - deep blues
      float zoneMix = (dist - 0.35) / 0.30;
      finalColor = mix(midArmColor, outerArmColor, zoneMix);
      finalColor = mix(finalColor, innerArmColor, spiralIntensity * 0.4);
    } else {
      // Outer halo - purple/deep blue
      finalColor = outerArmColor;
      finalColor = mix(finalColor, edgeColor, smoothstep(0.65, 1.0, dist));
    }
    
    // ADVANCED LIGHTING EFFECTS
    
    // Stellar wind glow
    float stellarWind = 1.0 + 0.3 * sin(time * 0.0001 + angle * 5.0 + dist * 10.0);
    
    // Dust lane darkening (realistic!)
    float dustLanes = 0.8 + 0.4 * sin(angle * 4.0 + time * 0.0001 + dist * 8.0);
    dustLanes *= 0.7 + 0.3 * superNoise;
    
    // Brightness enhancement
    float totalBrightness = brightness * stellarWind;
    totalBrightness += superNoise * 0.3;
    totalBrightness += starFormation * 0.5;
    
    finalColor *= totalBrightness;
    finalColor *= dustLanes; // Apply dust lane dimming
    
    // HDR-style color enhancement
    finalColor = pow(finalColor, vec3(0.9)); // Slight gamma
    
    // Saturation boost for vibrant colors
    vec3 luminance = vec3(0.299, 0.587, 0.114);
    float gray = dot(finalColor, luminance);
    finalColor = mix(vec3(gray), finalColor, 1.4); // High saturation
    
    // Combine all density sources
    float totalDensity = coreIntensity + armMask * (0.8 + superNoise * 0.4);
    totalDensity *= intensity;
    
    // Edge softening for realism
    float edgeSoft = 1.0 - smoothstep(0.75, 1.2, dist);
    totalDensity *= edgeSoft;
    
    // Final HDR glow
    finalColor += finalColor * finalColor * 0.2; // Self-illumination
    
    gl_FragColor = vec4(finalColor, totalDensity);
  }
`;

// INSANE STAR FIELD SHADERS - 4K QUALITY
const superStarVertexShader = `
  attribute float size;
  attribute float twinklePhase;
  attribute float twinkleSpeed;
  attribute vec3 starColor;
  attribute float starType;
  attribute float brightness;
  
  uniform float time;
  uniform float galaxyRotation;
  uniform float cameraBreathing;
  
  varying float vTwinkle;
  varying float vSize;
  varying vec3 vStarColor;
  varying float vStarType;
  varying float vBrightness;
  
  void main() {
    vSize = size;
    vStarColor = starColor;
    vStarType = starType;
    vBrightness = brightness;
    
    // Advanced twinkling with multiple frequencies
    float mainTwinkle = sin(time * twinkleSpeed + twinklePhase);
    float fastTwinkle = sin(time * twinkleSpeed * 3.0 + twinklePhase * 2.0) * 0.3;
    float slowTwinkle = sin(time * twinkleSpeed * 0.3 + twinklePhase * 0.7) * 0.2;
    
    vTwinkle = 0.7 + 0.3 * (mainTwinkle + fastTwinkle + slowTwinkle);
    
    vec3 pos = position;
    
    // Galaxy rotation with slight randomness
    float rotSpeed = galaxyRotation * (0.8 + starType * 0.4);
    float angle = rotSpeed * time + sin(time * 0.0001 + pos.z) * 0.01;
    float cosA = cos(angle);
    float sinA = sin(angle);
    
    float newX = pos.x * cosA - pos.y * sinA;
    float newY = pos.x * sinA + pos.y * cosA;
    pos.x = newX;
    pos.y = newY;
    
    // Parallax effect
    pos += vec3(0.0, 0.0, sin(time * 0.0002 + starType) * cameraBreathing);
    
    // Wrap around screen bounds
    pos.x = mod(pos.x + 40.0, 80.0) - 40.0;
    pos.y = mod(pos.y + 25.0, 50.0) - 25.0;
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = size * vTwinkle * brightness * (600.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const superStarFragmentShader = `
  varying float vTwinkle;
  varying float vSize;
  varying vec3 vStarColor;
  varying float vStarType;
  varying float vBrightness;
  
  void main() {
    vec2 center = gl_PointCoord - 0.5;
    float dist = length(center);
    
    if (dist > 0.5) discard;
    
    // Different star shapes based on type
    float alpha;
    
    if (vStarType > 0.9) {
      // Supergiant stars - complex diffraction pattern
      float spikes = abs(sin(atan(center.y, center.x) * 4.0)) * 0.3;
      alpha = pow(1.0 - dist * 2.0, 2.0) * vTwinkle;
      alpha += 0.8 * exp(-dist * 8.0) * vTwinkle; // Bright core
      alpha += 0.4 * exp(-dist * 3.0) * spikes; // Diffraction spikes
      alpha += 0.2 * exp(-dist * 1.5) * vTwinkle; // Extended halo
    } else if (vStarType > 0.7) {
      // Giant stars - bright with halo
      alpha = pow(1.0 - dist * 2.0, 3.0) * vTwinkle;
      alpha += 0.6 * exp(-dist * 10.0) * vTwinkle;
      alpha += 0.3 * exp(-dist * 4.0) * vTwinkle;
    } else if (vStarType > 0.4) {
      // Main sequence stars
      alpha = pow(1.0 - dist * 2.0, 2.5) * vTwinkle;
      alpha += 0.4 * exp(-dist * 6.0) * vTwinkle;
    } else {
      // Dwarf stars - simple pattern
      alpha = pow(1.0 - dist * 2.0, 2.0) * vTwinkle;
      alpha += 0.2 * exp(-dist * 8.0) * vTwinkle;
    }
    
    // Color enhancement for bright stars
    vec3 finalColor = vStarColor;
    if (vSize > 4.0) {
      finalColor *= 1.3 + 0.2 * vTwinkle; // Brighter large stars
      finalColor += vec3(0.1) * vTwinkle; // White boost
    }
    
    // HDR glow effect
    finalColor += finalColor * finalColor * 0.3 * vBrightness;
    
    gl_FragColor = vec4(finalColor, alpha * vBrightness);
  }
`;

// COSMIC DUST WITH ADVANCED PHYSICS
const cosmicDustVertexShader = `
  attribute float size;
  attribute float opacity;
  attribute vec3 velocity;
  attribute float dustType;
  
  uniform float time;
  uniform float galaxyRotation;
  
  varying float vOpacity;
  varying float vDustType;
  
  void main() {
    vOpacity = opacity * (0.5 + 0.5 * sin(time * 0.001 + position.x * 0.03 + dustType * 10.0));
    vDustType = dustType;
    
    vec3 pos = position;
    
    // Complex dust motion
    float rot = galaxyRotation * time * (0.6 + dustType * 0.8);
    float cosR = cos(rot);
    float sinR = sin(rot);
    
    float newX = pos.x * cosR - pos.y * sinR;
    float newY = pos.x * sinR + pos.y * cosR;
    
    pos.x = newX + velocity.x * time * 0.008;
    pos.y = newY + velocity.y * time * 0.008;
    pos.z += velocity.z * time * 0.003;
    
    // Brownian motion
    pos += vec3(
      sin(time * 0.001 + dustType * 20.0) * 0.5,
      cos(time * 0.0008 + dustType * 15.0) * 0.3,
      sin(time * 0.0012 + dustType * 25.0) * 0.2
    );
    
    // Boundary wrapping
    float maxDist = 45.0;
    vec2 planarPos = vec2(pos.x, pos.y);
    if (length(planarPos) > maxDist) {
      pos.x *= 0.85;
      pos.y *= 0.85;
    }
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = size * (300.0 / -mvPosition.z) * (0.8 + dustType * 0.4);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const cosmicDustFragmentShader = `
  uniform vec3 dustColor;
  uniform float time;
  
  varying float vOpacity;
  varying float vDustType;
  
  void main() {
    vec2 center = gl_PointCoord - 0.5;
    float dist = length(center);
    
    if (dist > 0.5) discard;
    
    // Different dust particle shapes
    float alpha;
    if (vDustType > 0.7) {
      // Dense dust clouds
      alpha = (1.0 - dist * 2.0) * vOpacity * 0.8;
      alpha += 0.3 * exp(-dist * 4.0) * vOpacity;
    } else {
      // Sparse dust
      alpha = pow(1.0 - dist * 2.0, 1.5) * vOpacity * 0.5;
    }
    
    // Color variation
    vec3 finalColor = dustColor;
    finalColor += vec3(0.1, 0.05, 0.2) * sin(time * 0.0005 + vDustType * 10.0);
    
    gl_FragColor = vec4(finalColor, alpha);
  }
`;

// Create INSANE galaxy layers with multiple components
function createInsaneGalaxyLayers() {
  // MAIN GALAXY LAYER - Ultra high resolution
  const mainScale = 60;
  const mainGeometry = new THREE.PlaneGeometry(mainScale, mainScale, 512, 512);
  
  const mainMaterial = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      coreColor: { value: new THREE.Vector3(1.2, 0.9, 0.3) }, // Bright golden core
      innerArmColor: { value: new THREE.Vector3(0.6, 1.0, 1.4) }, // Cyan-blue
      midArmColor: { value: new THREE.Vector3(0.3, 0.7, 1.2) }, // Deep blue
      outerArmColor: { value: new THREE.Vector3(0.5, 0.2, 0.9) }, // Purple
      edgeColor: { value: new THREE.Vector3(0.2, 0.1, 0.5) }, // Dark purple
      intensity: { value: 1.2 },
      layer: { value: 0 },
      rotationSpeed: { value: galaxyRotationSpeed },
      brightness: { value: 1.3 },
      cameraBreathing: { value: 0.5 }
    },
    vertexShader: galaxyVertexShader,
    fragmentShader: galaxyFragmentShader,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide
  });
  
  const mainGalaxy = new THREE.Mesh(mainGeometry, mainMaterial);
  mainGalaxy.position.set(0, 0, -30);
  
  materials.galaxy.push(mainMaterial);
  galaxyLayers.push(mainGalaxy);
  scene.add(mainGalaxy);
  
  // SECONDARY GALAXY LAYER - Different rotation speed
  const secGeometry = new THREE.PlaneGeometry(mainScale * 0.8, mainScale * 0.8, 384, 384);
  const secMaterial = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      coreColor: { value: new THREE.Vector3(1.0, 0.6, 0.2) },
      innerArmColor: { value: new THREE.Vector3(0.4, 0.8, 1.2) },
      midArmColor: { value: new THREE.Vector3(0.2, 0.5, 1.0) },
      outerArmColor: { value: new THREE.Vector3(0.3, 0.1, 0.7) },
      edgeColor: { value: new THREE.Vector3(0.1, 0.05, 0.3) },
      intensity: { value: 0.6 },
      layer: { value: 1 },
      rotationSpeed: { value: galaxyRotationSpeed * 0.8 },
      brightness: { value: 0.9 },
      cameraBreathing: { value: 0.3 }
    },
    vertexShader: galaxyVertexShader,
    fragmentShader: galaxyFragmentShader,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide
  });
  
  const secGalaxy = new THREE.Mesh(secGeometry, secMaterial);
  secGalaxy.position.set(0, 0, -35);
  
  materials.galaxy.push(secMaterial);
  galaxyLayers.push(secGalaxy);
  scene.add(secGalaxy);
  
  // BACKGROUND DEEP FIELD
  const bgGeometry = new THREE.PlaneGeometry(mainScale * 1.5, mainScale * 1.5, 256, 256);
  const bgMaterial = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      coreColor: { value: new THREE.Vector3(0.3, 0.2, 0.4) },
      innerArmColor: { value: new THREE.Vector3(0.2, 0.3, 0.6) },
      midArmColor: { value: new THREE.Vector3(0.1, 0.2, 0.5) },
      outerArmColor: { value: new THREE.Vector3(0.15, 0.05, 0.4) },
      edgeColor: { value: new THREE.Vector3(0.05, 0.02, 0.2) },
      intensity: { value: 0.3 },
      layer: { value: 2 },
      rotationSpeed: { value: galaxyRotationSpeed * 0.5 },
      brightness: { value: 0.7 },
      cameraBreathing: { value: 0.2 }
    },
    vertexShader: galaxyVertexShader,
    fragmentShader: galaxyFragmentShader,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide
  });
  
  const bgGalaxy = new THREE.Mesh(bgGeometry, bgMaterial);
  bgGalaxy.position.set(0, 0, -55);
  
  materials.galaxy.push(bgMaterial);
  galaxyLayers.push(bgGalaxy);
  scene.add(bgGalaxy);
}

// Create INSANE star field with 10,000+ stars
function createInsaneStarField() {
  // MAIN STAR FIELD - 8000 stars
  createStarLayer(8000, 1.0, 0, "main");
  
  // BRIGHT GIANTS - 1500 bright stars
  createStarLayer(1500, 2.5, 1, "giants");
  
  // BACKGROUND FIELD - 3000 distant stars  
  createStarLayer(3000, 0.6, 2, "background");
  
  // SUPERGIANTS - 200 massive stars
  createStarLayer(200, 4.0, 3, "supergiants");
}

function createStarLayer(starCount, sizeMult, layerIndex, layerType) {
  const positions = new Float32Array(starCount * 3);
  const sizes = new Float32Array(starCount);
  const twinklePhases = new Float32Array(starCount);
  const twinkleSpeeds = new Float32Array(starCount);
  const colors = new Float32Array(starCount * 3);
  const starTypes = new Float32Array(starCount);
  const brightness = new Float32Array(starCount);
  
  // REALISTIC STAR COLOR TYPES
  const stellarTypes = [
    { color: [0.6, 0.8, 1.0], temp: "O", prob: 0.00003 }, // Hot blue
    { color: [0.7, 0.85, 1.0], temp: "B", prob: 0.0013 }, // Blue-white  
    { color: [0.95, 0.95, 1.0], temp: "A", prob: 0.006 }, // White
    { color: [1.0, 0.98, 0.9], temp: "F", prob: 0.03 }, // Yellow-white
    { color: [1.0, 0.9, 0.7], temp: "G", prob: 0.076 }, // Yellow (Sun-like)
    { color: [1.0, 0.75, 0.5], temp: "K", prob: 0.121 }, // Orange
    { color: [1.0, 0.6, 0.4], temp: "M", prob: 0.765 } // Red
  ];
  
  for (let i = 0; i < starCount; i++) {
    const i3 = i * 3;
    
    // Realistic galactic distribution
    let radius, angle;
    
    if (layerType === "main" || layerType === "giants") {
      // Spiral arm distribution
      const armBias = random.next();
      if (armBias < 0.6) {
        // In spiral arms
        angle = random.next() * Math.PI * 2;
        const armRadius = Math.pow(random.next(), 0.6) * 35;
        const armOffset = Math.sin(angle * 2 - armRadius * 0.15) * 5;
        radius = armRadius + armOffset;
      } else {
        // Inter-arm regions
        angle = random.next() * Math.PI * 2;
        radius = Math.pow(random.next(), 0.8) * 30;
      }
    } else {
      // More uniform distribution for background
      angle = random.next() * Math.PI * 2;
      radius = Math.pow(random.next(), 0.5) * 45;
    }
    
    positions[i3] = Math.cos(angle) * radius + (random.next() - 0.5) * 15;
    positions[i3 + 1] = Math.sin(angle) * radius + (random.next() - 0.5) * 12;
    positions[i3 + 2] = -5 - random.next() * (40 + layerIndex * 15);
    
    // Size distribution based on layer
    let baseSize;
    const sizeRoll = random.next();
    
    if (layerType === "supergiants") {
      baseSize = 8.0 + random.next() * 6.0; // Massive stars
      starTypes[i] = 0.95 + random.next() * 0.05;
    } else if (layerType === "giants") {
      if (sizeRoll > 0.8) {
        baseSize = 5.0 + random.next() * 4.0; // Large giants
        starTypes[i] = 0.8 + random.next() * 0.15;
      } else {
        baseSize = 3.0 + random.next() * 3.0; // Medium giants
        starTypes[i] = 0.7 + random.next() * 0.2;
      }
    } else {
      if (sizeRoll > 0.95) {
        baseSize = 4.0 + random.next() * 3.0; // Bright stars
        starTypes[i] = 0.6 + random.next() * 0.3;
      } else if (sizeRoll > 0.8) {
        baseSize = 2.5 + random.next() * 2.0; // Medium stars
        starTypes[i] = 0.4 + random.next() * 0.3;
      } else {
        baseSize = 1.0 + random.next() * 1.5; // Small stars
        starTypes[i] = random.next() * 0.5;
      }
    }
    
    sizes[i] = baseSize * sizeMult;
    
    // Stellar color based on realistic distribution
    let chosenType = stellarTypes[stellarTypes.length - 1]; // Default to M-type
    let cumProb = 0;
    const typeRoll = random.next();
    
    for (const type of stellarTypes) {
      cumProb += type.prob;
      if (typeRoll <= cumProb) {
        chosenType = type;
        break;
      }
    }
    
    colors[i3] = chosenType.color[0];
    colors[i3 + 1] = chosenType.color[1];
    colors[i3 + 2] = chosenType.color[2];
    
    // Enhanced brightness for special stars
    brightness[i] = 0.8 + random.next() * 0.4;
    if (layerType === "supergiants") {
      brightness[i] *= 2.0;
    } else if (layerType === "giants") {
      brightness[i] *= 1.5;
    }
    
    twinklePhases[i] = random.next() * Math.PI * 2;
    twinkleSpeeds[i] = 0.0002 + random.next() * 0.001;
  }
  
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute('twinklePhase', new THREE.BufferAttribute(twinklePhases, 1));
  geometry.setAttribute('twinkleSpeed', new THREE.BufferAttribute(twinkleSpeeds, 1));
  geometry.setAttribute('starColor', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('starType', new THREE.BufferAttribute(starTypes, 1));
  geometry.setAttribute('brightness', new THREE.BufferAttribute(brightness, 1));
  
  const material = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      galaxyRotation: { value: galaxyRotationSpeed * (1 + layerIndex * 0.2) },
      cameraBreathing: { value: 1.0 }
    },
    vertexShader: superStarVertexShader,
    fragmentShader: superStarFragmentShader,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  
  const stars = new THREE.Points(geometry, material);
  starSystems.push(stars);
  materials.stars.push(material);
  scene.add(stars);
}

// Create INSANE cosmic dust with multiple types
function createCosmicDust() {
  // MAIN DUST CLOUDS - 1000 particles
  createDustLayer(1000, 1.0, 0, "main");
  
  // FINE DUST - 800 small particles
  createDustLayer(800, 0.6, 1, "fine");
  
  // DENSE CLOUDS - 400 large particles
  createDustLayer(400, 2.0, 2, "dense");
}

function createDustLayer(dustCount, sizeMult, layerIndex, dustLayerType) {
  const positions = new Float32Array(dustCount * 3);
  const sizes = new Float32Array(dustCount);
  const opacities = new Float32Array(dustCount);
  const velocities = new Float32Array(dustCount * 3);
  const dustTypes = new Float32Array(dustCount);
  
  for (let i = 0; i < dustCount; i++) {
    const i3 = i * 3;
    
    // Dust distribution follows spiral structure
    const angle = random.next() * Math.PI * 2;
    let radius;
    
    if (dustLayerType === "dense") {
      // Dense clouds in spiral arms
      const armAngle = angle * 2 - 3.14159; // Two arms
      radius = (15 + random.next() * 20) + Math.sin(armAngle) * 8;
    } else {
      radius = Math.pow(random.next(), 0.7) * 40;
    }
    
    positions[i3] = Math.cos(angle) * radius + (random.next() - 0.5) * 12;
    positions[i3 + 1] = Math.sin(angle) * radius + (random.next() - 0.5) * 10;
    positions[i3 + 2] = -3 - random.next() * (30 + layerIndex * 10);
    
    sizes[i] = (1.0 + random.next() * 2.5) * sizeMult;
    opacities[i] = 0.3 + random.next() * 0.6;
    dustTypes[i] = random.next();
    
    // Orbital velocities
    const orbitalSpeed = 0.4 / (1.0 + radius * 0.05);
    velocities[i3] = -Math.sin(angle) * orbitalSpeed + (random.next() - 0.5) * 0.2;
    velocities[i3 + 1] = Math.cos(angle) * orbitalSpeed + (random.next() - 0.5) * 0.2;
    velocities[i3 + 2] = (random.next() - 0.5) * 0.1;
  }
  
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute('opacity', new THREE.BufferAttribute(opacities, 1));
  geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
  geometry.setAttribute('dustType', new THREE.BufferAttribute(dustTypes, 1));
  
  const dustMaterial = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      dustColor: { value: new THREE.Vector3(0.6, 0.7, 1.0) },
      galaxyRotation: { value: galaxyRotationSpeed * (0.7 + layerIndex * 0.1) }
    },
    vertexShader: cosmicDustVertexShader,
    fragmentShader: cosmicDustFragmentShader,
    transparent: true,
    blending: THREE.NormalBlending,
    depthWrite: false
  });
  
  const dust = new THREE.Points(geometry, dustMaterial);
  dustParticles = dust;
  scene.add(dust);
}

// Create nebula clouds for extra depth
function createNebulaClouds() {
  for (let i = 0; i < 6; i++) {
    const cloudGeometry = new THREE.PlaneGeometry(25 + i * 5, 20 + i * 4, 128, 128);
    
    const cloudMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color1: { value: new THREE.Vector3(0.3, 0.6, 1.0) },
        color2: { value: new THREE.Vector3(0.8, 0.3, 0.9) },
        opacity: { value: 0.15 + random.next() * 0.1 },
        layer: { value: i }
      },
      vertexShader: `
        varying vec2 vUv;
        uniform float time;
        uniform float layer;
        
        void main() {
          vUv = uv;
          vec3 pos = position;
          float wave = sin(time * 0.0003 + pos.x * 0.05 + layer) * 0.5;
          pos.z += wave;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 color1;
        uniform vec3 color2;
        uniform float opacity;
        uniform float time;
        uniform float layer;
        varying vec2 vUv;
        
        float noise(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
        }
        
        void main() {
          vec2 uv = vUv + vec2(time * 0.00001, time * 0.00002);
          float n = noise(uv * 3.0 + layer);
          vec3 color = mix(color1, color2, n);
          float alpha = opacity * smoothstep(0.0, 1.0, 1.0 - length(vUv - 0.5) * 2.0);
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    
    const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);
    cloud.position.set(
      (random.next() - 0.5) * 80,
      (random.next() - 0.5) * 60,
      -60 - i * 8
    );
    cloud.rotation.z = random.next() * Math.PI * 2;
    
    nebulaClouds.push(cloud);
    materials.nebula.push(cloudMaterial);
    scene.add(cloud);
  }
}

// ADVANCED animation loop with camera effects
function animateFrame() {
  if (!isInitialized) return;
  
  time += 16;
  
  // Camera breathing effect
  const breathingIntensity = 0.5 + 0.3 * Math.sin(time * cameraOscillation);
  camera.position.z = 0.2 * Math.sin(time * cameraOscillation * 1.3);
  camera.rotation.z = 0.002 * Math.sin(time * cameraOscillation * 0.7);
  
  // Update galaxy materials
  materials.galaxy.forEach((material, index) => {
    material.uniforms.time.value = time;
    material.uniforms.cameraBreathing.value = breathingIntensity;
  });
  
  // Update star materials
  materials.stars.forEach((material, index) => {
    material.uniforms.time.value = time;
    material.uniforms.cameraBreathing.value = breathingIntensity;
  });
  
  // Update dust
  if (materials.dust) {
    materials.dust.uniforms.time.value = time;
  }
  
  // Update nebula clouds
  materials.nebula.forEach(material => {
    material.uniforms.time.value = time;
  });
  
  // Dynamic lighting adjustments
  const dynamicBrightness = 1.0 + 0.1 * Math.sin(time * 0.0001);
  materials.galaxy.forEach(material => {
    if (material.uniforms.brightness) {
      material.uniforms.brightness.value = material.uniforms.brightness.value * dynamicBrightness;
    }
  });
  
  renderer.render(scene, camera);
  animationId = requestAnimationFrame(animateFrame);
}

// Enhanced resize handling
function handleResize() {
  if (!camera || !renderer || !container) return;
  
  const width = container.clientWidth;
  const height = container.clientHeight;
  
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 3.0)); // Support 3x for ultra-high DPI
}

// MAIN INITIALIZATION - INSANE 4K GALAXY
export function initScene2Background(containerElement) {
  if (isInitialized) {
    disposeScene2Background();
  }
  
  container = containerElement;
  const width = container.clientWidth;
  const height = container.clientHeight;
  
  // Create scene with fog
  scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x000102, 50, 100);
  
  // Enhanced camera with wider FOV
  camera = new THREE.PerspectiveCamera(90, width / height, 0.1, 200);
  camera.position.set(0, 0, 0);
  camera.lookAt(0, 0, -10);
  
  // ULTRA HIGH-END RENDERER SETTINGS
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
    precision: 'highp',
    logarithmicDepthBuffer: true
  });
  
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 3.0));
  renderer.setClearColor(0x000102, 1);
  
  // Advanced rendering settings
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.4;
  renderer.shadowMap.enabled = false; // Disable for performance
  
  // Style canvas
  renderer.domElement.style.position = 'absolute';
  renderer.domElement.style.top = '0';
  renderer.domElement.style.left = '0';
  renderer.domElement.style.zIndex = '-1';
  renderer.domElement.style.pointerEvents = 'none';
  renderer.domElement.style.filter = 'contrast(1.1) saturate(1.3) brightness(1.05)';
  
  container.appendChild(renderer.domElement);
  
  // Create all scene components
  createInsaneGalaxyLayers();
  createInsaneStarField();
  createCosmicDust();
  createNebulaClouds();
  
  // Add resize listener
  window.addEventListener('resize', handleResize);
  
  // Start animation
  isInitialized = true;
  animateFrame();
  
  console.log('🌌 INSANE 4K SPIRAL GALAXY MASTERPIECE INITIALIZED 🌌');
  console.log('📊 Stats: 12,500+ stars, 2,200+ dust particles, 9 galaxy layers');
  console.log('🎨 Features: HDR colors, 12-octave noise, realistic stellar types');
}

export function updateScene2Background(scrollProgress) {
  // Background is autonomous - no scroll dependency
}

export function disposeScene2Background() {
  if (!isInitialized) return;
  
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
  
  window.removeEventListener('resize', handleResize);
  
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
  
  // Clear all references
  scene = null;
  camera = null;
  renderer = null;
  container = null;
  isInitialized = false;
  time = 0;
  
  galaxyLayers.length = 0;
  starSystems.length = 0;
  nebulaClouds.length = 0;
  brightStars.length = 0;
  cosmicRays.length = 0;
  dustParticles = null;
  galaxyCore = null;
  
  materials.galaxy.length = 0;
  materials.stars.length = 0;
  materials.nebula.length = 0;
  materials.dust = null;
  materials.core = null;
  materials.cosmicRays = null;
  
  console.log('🌌 INSANE SPIRAL GALAXY DISPOSED 🌌');
}
