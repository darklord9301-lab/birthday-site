import * as THREE from './libs/three.module.js';

/**
 * Epic Sci-Fi Starfield - Spacecraft Viewport Experience
 * Realistic space phenomena based on actual astronomical observations
 * @param {THREE.Scene} scene - The Three.js scene
 * @param {THREE.Camera} camera - The camera for spacecraft viewport
 * @returns {Object} - Starfield objects and animation functions
 */
export function initStarfield(scene, camera) {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Realistic star counts and distributions
    const starCount = isMobile ? 12000 : 20000;
    const galaxyRadius = 4000;
    const galaxyHeight = 200;
    
    // Stellar classification based on real astronomy
    const stellarClasses = [
        // O-type: Hot blue supergiants
        { color: [0.6, 0.8, 1.0], size: 3.5, brightness: 1.0, rarity: 0.000003, twinkle: 0.8 },
        // B-type: Blue-white giants
        { color: [0.7, 0.9, 1.0], size: 2.8, brightness: 0.9, rarity: 0.0013, twinkle: 0.7 },
        // A-type: White main sequence
        { color: [1.0, 1.0, 1.0], size: 2.2, brightness: 0.8, rarity: 0.0061, twinkle: 0.6 },
        // F-type: Yellow-white
        { color: [1.0, 1.0, 0.85], size: 1.8, brightness: 0.7, rarity: 0.031, twinkle: 0.5 },
        // G-type: Yellow (like our Sun)
        { color: [1.0, 0.95, 0.7], size: 1.5, brightness: 0.6, rarity: 0.076, twinkle: 0.4 },
        // K-type: Orange dwarfs
        { color: [1.0, 0.8, 0.5], size: 1.2, brightness: 0.5, rarity: 0.121, twinkle: 0.3 },
        // M-type: Red dwarfs (most common)
        { color: [1.0, 0.6, 0.3], size: 0.8, brightness: 0.4, rarity: 0.765, twinkle: 0.2 }
    ];
    
    // Create star data arrays
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);
    const twinklePhases = new Float32Array(starCount);
    const twinkleSpeeds = new Float32Array(starCount);
    const distances = new Float32Array(starCount);
    const brightnesses = new Float32Array(starCount);
    
    // Generate realistic star distribution
    for (let i = 0; i < starCount; i++) {
        const i3 = i * 3;
        
        // Create galactic disk distribution with spiral arms
        let x, y, z, radius;
        
        if (Math.random() < 0.85) {
            // Main galactic disk with spiral structure
            const angle = Math.random() * Math.PI * 2;
            const spiralArm = Math.sin(angle * 2 + Math.random() * 0.5) * 0.3 + 1;
            radius = Math.pow(Math.random(), 0.7) * galaxyRadius * spiralArm;
            
            x = Math.cos(angle) * radius;
            z = Math.sin(angle) * radius;
            
            // Galactic disk height distribution
            y = (Math.random() - 0.5) * galaxyHeight * Math.exp(-radius / (galaxyRadius * 0.3));
        } else {
            // Galactic halo - sparse, older stars
            const phi = Math.random() * Math.PI * 2;
            const theta = Math.acos(2 * Math.random() - 1);
            radius = galaxyRadius * 0.5 + Math.random() * galaxyRadius * 1.5;
            
            x = radius * Math.sin(theta) * Math.cos(phi);
            y = radius * Math.sin(theta) * Math.sin(phi);
            z = radius * Math.cos(theta);
        }
        
        positions[i3] = x;
        positions[i3 + 1] = y;
        positions[i3 + 2] = z;
        
        distances[i] = Math.sqrt(x * x + y * y + z * z);
        
        // Assign stellar class based on rarity
        let stellarClass = stellarClasses[stellarClasses.length - 1]; // Default to M-type
        const rand = Math.random();
        let cumulative = 0;
        
        for (let cls of stellarClasses) {
            cumulative += cls.rarity;
            if (rand <= cumulative) {
                stellarClass = cls;
                break;
            }
        }
        
        // Apply stellar class properties
        colors[i3] = stellarClass.color[0];
        colors[i3 + 1] = stellarClass.color[1];
        colors[i3 + 2] = stellarClass.color[2];
        
        // Size based on distance and stellar class
        const distanceFactor = Math.max(0.1, 1000 / (distances[i] + 100));
        sizes[i] = stellarClass.size * distanceFactor * (isMobile ? 0.8 : 1.0);
        
        brightnesses[i] = stellarClass.brightness;
        twinklePhases[i] = Math.random() * Math.PI * 2;
        twinkleSpeeds[i] = 0.5 + Math.random() * stellarClass.twinkle;
    }
    
    // Store original values for animation
    const originalColors = new Float32Array(colors);
    const originalSizes = new Float32Array(sizes);
    
    // Create star geometry
    const starGeometry = new THREE.BufferGeometry();
    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    starGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    // Realistic star material
    const starMaterial = new THREE.PointsMaterial({
        vertexColors: true,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending,
        alphaTest: 0.001
    });
    
    const starField = new THREE.Points(starGeometry, starMaterial);
    scene.add(starField);
    
    // Create nebula clouds (realistic astronomical phenomena)
    const nebulaGroup = new THREE.Group();
    const nebulas = [];
    const nebulaCount = isMobile ? 8 : 15;
    
    // Nebula types based on real space phenomena
    const nebulaTypes = [
        { color: 0xff4444, opacity: 0.08, name: 'H-alpha Emission' },
        { color: 0x4488ff, opacity: 0.06, name: 'Blue Reflection' },
        { color: 0xff88ff, opacity: 0.07, name: 'Planetary' },
        { color: 0x44ff88, opacity: 0.05, name: 'Oxygen III' },
        { color: 0xffaa44, opacity: 0.06, name: 'Sulfur II' }
    ];
    
    for (let i = 0; i < nebulaCount; i++) {
        const type = nebulaTypes[Math.floor(Math.random() * nebulaTypes.length)];
        
        // Create realistic nebula shapes
        const nebulaSize = 150 + Math.random() * 300;
        const nebulaGeometry = new THREE.SphereGeometry(
            nebulaSize,
            isMobile ? 16 : 32,
            isMobile ? 12 : 24
        );
        
        const nebulaMaterial = new THREE.MeshBasicMaterial({
            color: type.color,
            transparent: true,
            opacity: type.opacity,
            blending: THREE.AdditiveBlending,
            fog: false,
            side: THREE.DoubleSide
        });
        
        const nebulaMesh = new THREE.Mesh(nebulaGeometry, nebulaMaterial);
        
        // Position nebulas in spiral arm regions
        const armAngle = (i / nebulaCount) * Math.PI * 4 + Math.random() * 0.5;
        const armRadius = 800 + Math.random() * 2000;
        
        nebulaMesh.position.set(
            Math.cos(armAngle) * armRadius + (Math.random() - 0.5) * 400,
            (Math.random() - 0.5) * galaxyHeight * 2,
            Math.sin(armAngle) * armRadius + (Math.random() - 0.5) * 400
        );
        
        nebulaMesh.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );
        
        // Scale for realistic proportions
        const scale = 0.7 + Math.random() * 0.6;
        nebulaMesh.scale.set(scale, scale * 0.6, scale);
        
        nebulas.push({
            mesh: nebulaMesh,
            originalOpacity: type.opacity,
            rotationSpeed: {
                x: (Math.random() - 0.5) * 0.0005,
                y: (Math.random() - 0.5) * 0.0008,
                z: (Math.random() - 0.5) * 0.0003
            },
            pulsePhase: Math.random() * Math.PI * 2,
            pulseSpeed: 0.2 + Math.random() * 0.3
        });
        
        nebulaGroup.add(nebulaMesh);
    }
    
    scene.add(nebulaGroup);
    
    // Cosmic dust particles
    const dustCount = isMobile ? 2000 : 4000;
    const dustGeometry = new THREE.BufferGeometry();
    const dustPositions = new Float32Array(dustCount * 3);
    const dustColors = new Float32Array(dustCount * 3);
    const dustSizes = new Float32Array(dustCount);
    
    for (let i = 0; i < dustCount; i++) {
        const i3 = i * 3;
        
        // Distribute dust in local space around camera
        dustPositions[i3] = (Math.random() - 0.5) * 2000;
        dustPositions[i3 + 1] = (Math.random() - 0.5) * 500;
        dustPositions[i3 + 2] = (Math.random() - 0.5) * 2000;
        
        // Dust color - subtle browns and grays
        const dustBrightness = 0.1 + Math.random() * 0.2;
        dustColors[i3] = dustBrightness * (0.4 + Math.random() * 0.3);
        dustColors[i3 + 1] = dustBrightness * (0.3 + Math.random() * 0.2);
        dustColors[i3 + 2] = dustBrightness * (0.2 + Math.random() * 0.2);
        
        dustSizes[i] = 0.5 + Math.random() * 1.0;
    }
    
    dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    dustGeometry.setAttribute('color', new THREE.BufferAttribute(dustColors, 3));
    dustGeometry.setAttribute('size', new THREE.BufferAttribute(dustSizes, 1));
    
    const dustMaterial = new THREE.PointsMaterial({
        vertexColors: true,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.6,
        blending: THREE.NormalBlending
    });
    
    const cosmicDust = new THREE.Points(dustGeometry, dustMaterial);
    scene.add(cosmicDust);
    
    // Camera movement tracking
    let previousCameraPosition = camera.position.clone();
    let spacecraftVelocity = new THREE.Vector3();
    
    /**
     * Spacecraft-style animation with realistic physics
     */
    function animate(time) {
        const deltaTime = time * 0.001;
        
        // Calculate spacecraft movement
        const currentCameraPosition = camera.position.clone();
        spacecraftVelocity.copy(currentCameraPosition).sub(previousCameraPosition);
        const speed = spacecraftVelocity.length();
        
        // Realistic stellar parallax based on distance
        if (speed > 0.01) {
            const positionAttr = starGeometry.getAttribute('position');
            
            for (let i = 0; i < starCount; i++) {
                const i3 = i * 3;
                const starDistance = distances[i];
                
                // Parallax factor based on distance (closer stars move more)
                const parallaxFactor = Math.min(10.0, 5000.0 / (starDistance + 100));
                
                positionAttr.array[i3] -= spacecraftVelocity.x * parallaxFactor;
                positionAttr.array[i3 + 1] -= spacecraftVelocity.y * parallaxFactor;
                positionAttr.array[i3 + 2] -= spacecraftVelocity.z * parallaxFactor;
            }
            
            positionAttr.needsUpdate = true;
        }
        
        // Realistic stellar twinkling due to cosmic dust
        const sizeAttr = starGeometry.getAttribute('size');
        const colorAttr = starGeometry.getAttribute('color');
        
        for (let i = 0; i < starCount; i++) {
            const phase = twinklePhases[i] + deltaTime * twinkleSpeeds[i];
            const atmosphericTwinkle = 0.85 + 0.15 * Math.sin(phase);
            const brightness = brightnesses[i] * atmosphericTwinkle;
            
            // Update size for twinkling effect
            sizeAttr.array[i] = originalSizes[i] * atmosphericTwinkle;
            
            // Update color brightness
            const i3 = i * 3;
            colorAttr.array[i3] = originalColors[i3] * brightness;
            colorAttr.array[i3 + 1] = originalColors[i3 + 1] * brightness;
            colorAttr.array[i3 + 2] = originalColors[i3 + 2] * brightness;
        }
        
        sizeAttr.needsUpdate = true;
        colorAttr.needsUpdate = true;
        
        // Animate nebulas with realistic physics
        nebulas.forEach(nebula => {
            nebula.mesh.rotation.x += nebula.rotationSpeed.x;
            nebula.mesh.rotation.y += nebula.rotationSpeed.y;
            nebula.mesh.rotation.z += nebula.rotationSpeed.z;
            
            // Subtle opacity pulsing
            const pulse = nebula.pulsePhase + deltaTime * nebula.pulseSpeed;
            const pulseIntensity = 0.8 + 0.2 * Math.sin(pulse);
            nebula.mesh.material.opacity = nebula.originalOpacity * pulseIntensity;
        });
        
        // Cosmic dust movement
        const dustPosAttr = dustGeometry.getAttribute('position');
        for (let i = 0; i < dustCount; i++) {
            const i3 = i * 3;
            
            // Drift with spacecraft movement
            dustPosAttr.array[i3] -= spacecraftVelocity.x * 2.0;
            dustPosAttr.array[i3 + 1] -= spacecraftVelocity.y * 2.0;
            dustPosAttr.array[i3 + 2] -= spacecraftVelocity.z * 2.0;
            
            // Wrap around for infinite effect
            if (Math.abs(dustPosAttr.array[i3]) > 1000) {
                dustPosAttr.array[i3] = (Math.random() - 0.5) * 2000;
            }
            if (Math.abs(dustPosAttr.array[i3 + 2]) > 1000) {
                dustPosAttr.array[i3 + 2] = (Math.random() - 0.5) * 2000;
            }
        }
        dustPosAttr.needsUpdate = true;
        
        // Very subtle galactic rotation
        starField.rotation.y += 0.00005;
        nebulaGroup.rotation.y += 0.00003;
        
        previousCameraPosition.copy(currentCameraPosition);
    }
    
    function dispose() {
        scene.remove(starField);
        scene.remove(nebulaGroup);
        scene.remove(cosmicDust);
        
        starGeometry.dispose();
        starMaterial.dispose();
        dustGeometry.dispose();
        dustMaterial.dispose();
        
        nebulas.forEach(nebula => {
            nebula.mesh.geometry.dispose();
            nebula.mesh.material.dispose();
        });
    }
    
    // Get stats for HUD display
    function getStats() {
        return {
            starCount,
            nebulaCount,
            dustCount,
            galaxyRadius,
            spacecraftSpeed: spacecraftVelocity.length()
        };
    }
    
    return {
        starField,
        nebulaGroup,
        cosmicDust,
        nebulas,
        animate,
        dispose,
        getStats,
        isMobile
    };
}
