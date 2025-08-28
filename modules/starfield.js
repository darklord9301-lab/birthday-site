import * as THREE from '../libs/three.module.js';

/**
 * Creates a realistic 3D starfield with twinkling effects, nebulas, and constellations
 * Optimized for mobile devices
 * @param {THREE.Scene} scene - The Three.js scene to add stars to
 * @param {THREE.Camera} camera - The camera for parallax calculations
 * @returns {Object} - Contains starfield objects that need animation updates
 */
export function initStarfield(scene, camera) {
    // Mobile detection and optimization
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const starCount = isMobile ? 3000 : 6000; // Reduce stars on mobile
    const nebulaCount = isMobile ? 8 : 15;
    const starFieldRadius = 1500;
    
    // Arrays to store star data
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);
    const twinklePhases = new Float32Array(starCount);
    const twinkleSpeeds = new Float32Array(starCount);
    const distances = new Float32Array(starCount);
    
    // Define constellation patterns (simplified major constellations)
    const constellations = [
        // Big Dipper
        { stars: 7, center: [500, 400, -800], spread: 200 },
        // Orion
        { stars: 8, center: [-600, -300, -900], spread: 250 },
        // Cassiopeia
        { stars: 5, center: [300, 600, -700], spread: 150 },
        // Southern Cross
        { stars: 4, center: [-400, -500, -1000], spread: 120 }
    ];
    
    let starIndex = 0;
    
    // Generate constellation stars first
    constellations.forEach(constellation => {
        for (let j = 0; j < constellation.stars && starIndex < starCount; j++) {
            const i3 = starIndex * 3;
            
            // Position around constellation center
            positions[i3] = constellation.center[0] + (Math.random() - 0.5) * constellation.spread;
            positions[i3 + 1] = constellation.center[1] + (Math.random() - 0.5) * constellation.spread;
            positions[i3 + 2] = constellation.center[2] + (Math.random() - 0.5) * constellation.spread;
            
            distances[starIndex] = Math.sqrt(
                positions[i3] * positions[i3] + 
                positions[i3 + 1] * positions[i3 + 1] + 
                positions[i3 + 2] * positions[i3 + 2]
            );
            
            // Constellation stars are brighter and more blue-white
            colors[i3] = 0.9 + Math.random() * 0.1;
            colors[i3 + 1] = 0.95 + Math.random() * 0.05;
            colors[i3 + 2] = 1.0;
            
            // Bigger, brighter constellation stars
            sizes[starIndex] = (isMobile ? 4.0 : 5.0) + Math.random() * 2.0;
            
            twinklePhases[starIndex] = Math.random() * Math.PI * 2;
            twinkleSpeeds[starIndex] = 0.3 + Math.random() * 0.5; // Slower twinkling
            
            starIndex++;
        }
    });
    
    // Generate remaining random stars
    for (let i = starIndex; i < starCount; i++) {
        const i3 = i * 3;
        
        // Spherical distribution
        let x, y, z, length;
        do {
            x = (Math.random() - 0.5) * 2;
            y = (Math.random() - 0.5) * 2;
            z = (Math.random() - 0.5) * 2;
            length = Math.sqrt(x * x + y * y + z * z);
        } while (length > 1);
        
        const radius = starFieldRadius * (0.4 + Math.random() * 0.6);
        const scale = radius / length;
        
        positions[i3] = x * scale;
        positions[i3 + 1] = y * scale;
        positions[i3 + 2] = z * scale;
        
        distances[i] = Math.sqrt(
            positions[i3] * positions[i3] + 
            positions[i3 + 1] * positions[i3 + 1] + 
            positions[i3 + 2] * positions[i3 + 2]
        );
        
        // Enhanced color variations
        const temp = Math.random();
        if (temp < 0.4) {
            // Pure white stars
            colors[i3] = 1.0;
            colors[i3 + 1] = 1.0;
            colors[i3 + 2] = 1.0;
        } else if (temp < 0.6) {
            // Blue-white giants
            colors[i3] = 0.8 + Math.random() * 0.2;
            colors[i3 + 1] = 0.9 + Math.random() * 0.1;
            colors[i3 + 2] = 1.0;
        } else if (temp < 0.75) {
            // Yellow-white stars (like our sun)
            colors[i3] = 1.0;
            colors[i3 + 1] = 0.95 + Math.random() * 0.05;
            colors[i3 + 2] = 0.7 + Math.random() * 0.2;
        } else if (temp < 0.88) {
            // Red giants
            colors[i3] = 1.0;
            colors[i3 + 1] = 0.4 + Math.random() * 0.3;
            colors[i3 + 2] = 0.2 + Math.random() * 0.3;
        } else {
            // Purple/violet rare stars
            colors[i3] = 0.8 + Math.random() * 0.2;
            colors[i3 + 1] = 0.6 + Math.random() * 0.2;
            colors[i3 + 2] = 1.0;
        }
        
        // Bigger base size, mobile optimized
        const baseBrightness = Math.random();
        const baseSize = isMobile ? 2.5 : 3.0;
        sizes[i] = baseSize + baseBrightness * (isMobile ? 2.0 : 3.0);
        
        twinklePhases[i] = Math.random() * Math.PI * 2;
        twinkleSpeeds[i] = 0.5 + Math.random() * 1.5;
    }
    
    // Store original colors for non-destructive animation
    const originalColors = new Float32Array(colors);
    
    // Create star geometry
    const starGeometry = new THREE.BufferGeometry();
    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    starGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    // Enhanced star material
    const starMaterial = new THREE.PointsMaterial({
        vertexColors: true,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        alphaTest: 0.05
    });
    
    const starField = new THREE.Points(starGeometry, starMaterial);
    scene.add(starField);
    
    // Create nebula clouds
    const nebulaGroup = new THREE.Group();
    const nebulas = [];
    
    for (let i = 0; i < nebulaCount; i++) {
        // Nebula geometry
        const nebulaGeometry = new THREE.SphereGeometry(
            50 + Math.random() * 100, // Size
            isMobile ? 8 : 16,        // Width segments
            isMobile ? 6 : 12         // Height segments
        );
        
        // Nebula colors - various space colors
        const nebulaColors = [
            new THREE.Color(0x8A2BE2), // Blue Violet
            new THREE.Color(0xFF1493), // Deep Pink
            new THREE.Color(0x00CED1), // Dark Turquoise
            new THREE.Color(0xFF4500), // Orange Red
            new THREE.Color(0x9400D3), // Violet
            new THREE.Color(0x00FF7F), // Spring Green
            new THREE.Color(0xFF69B4), // Hot Pink
            new THREE.Color(0x1E90FF)  // Dodger Blue
        ];
        
        const nebulaColor = nebulaColors[Math.floor(Math.random() * nebulaColors.length)];
        
        const nebulaMaterial = new THREE.MeshBasicMaterial({
            color: nebulaColor,
            transparent: true,
            opacity: 0.05 + Math.random() * 0.1, // Very subtle
            blending: THREE.AdditiveBlending,
            fog: false
        });
        
        const nebulaMesh = new THREE.Mesh(nebulaGeometry, nebulaMaterial);
        
        // Position nebulas randomly in space
        nebulaMesh.position.set(
            (Math.random() - 0.5) * starFieldRadius * 1.5,
            (Math.random() - 0.5) * starFieldRadius * 1.5,
            (Math.random() - 0.5) * starFieldRadius * 1.5
        );
        
        // Random rotation
        nebulaMesh.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );
        
        nebulas.push({
            mesh: nebulaMesh,
            rotationSpeed: {
                x: (Math.random() - 0.5) * 0.001,
                y: (Math.random() - 0.5) * 0.001,
                z: (Math.random() - 0.5) * 0.001
            }
        });
        
        nebulaGroup.add(nebulaMesh);
    }
    
    scene.add(nebulaGroup);
    
    // Store previous camera position for parallax
    let prevCameraPosition = camera.position.clone();
    
    /**
     * Animation function - mobile optimized
     */
    function animate(time) {
        const timeSeconds = time * 0.001;
        
        // Optimize animation frequency for mobile
        const frameSkip = isMobile ? 2 : 1;
        if (Math.floor(timeSeconds * 60) % frameSkip !== 0) {
            return;
        }
        
        // Update star twinkling
        const sizeAttribute = starGeometry.getAttribute('size');
        const colorAttribute = starGeometry.getAttribute('color');
        
        for (let i = 0; i < starCount; i++) {
            const phase = twinklePhases[i] + timeSeconds * twinkleSpeeds[i];
            const twinkle = 0.7 + 0.3 * Math.sin(phase);
            
            // Update size for twinkling
            sizeAttribute.array[i] = sizes[i] * twinkle;
            
            // Update color intensity using original colors
            const i3 = i * 3;
            const intensity = twinkle * 0.8 + 0.2;
            colorAttribute.array[i3] = originalColors[i3] * intensity;
            colorAttribute.array[i3 + 1] = originalColors[i3 + 1] * intensity;
            colorAttribute.array[i3 + 2] = originalColors[i3 + 2] * intensity;
        }
        
        sizeAttribute.needsUpdate = true;
        colorAttribute.needsUpdate = true;
        
        // Animate nebulas
        nebulas.forEach(nebula => {
            nebula.mesh.rotation.x += nebula.rotationSpeed.x;
            nebula.mesh.rotation.y += nebula.rotationSpeed.y;
            nebula.mesh.rotation.z += nebula.rotationSpeed.z;
        });
        
        // Parallax effect (simplified for mobile)
        const currentCameraPosition = camera.position;
        const deltaPosition = currentCameraPosition.clone().sub(prevCameraPosition);
        
        if (deltaPosition.lengthSq() > 0.001) {
            const positionAttribute = starGeometry.getAttribute('position');
            
            // Reduced parallax calculation for performance
            const parallaxStrength = isMobile ? 0.5 : 1.0;
            
            for (let i = 0; i < starCount; i++) {
                const i3 = i * 3;
                const parallaxFactor = parallaxStrength / (distances[i] * 0.001 + 0.1);
                
                positionAttribute.array[i3] -= deltaPosition.x * parallaxFactor;
                positionAttribute.array[i3 + 1] -= deltaPosition.y * parallaxFactor;
                positionAttribute.array[i3 + 2] -= deltaPosition.z * parallaxFactor;
            }
            
            positionAttribute.needsUpdate = true;
            prevCameraPosition = currentCameraPosition.clone();
        }
        
        // Gentle rotation for dynamics
        starField.rotation.y += 0.0001;
        nebulaGroup.rotation.y += 0.00005;
    }
    
    /**
     * Cleanup function
     */
    function dispose() {
        scene.remove(starField);
        scene.remove(nebulaGroup);
        
        starGeometry.dispose();
        starMaterial.dispose();
        
        nebulas.forEach(nebula => {
            nebula.mesh.geometry.dispose();
            nebula.mesh.material.dispose();
        });
    }
    
    return {
        starField,
        nebulaGroup,
        nebulas,
        animate,
        dispose,
        isMobile
    };
}
