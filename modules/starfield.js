import * as THREE from './libs/three.module.js';

/**
 * Creates an EPIC 3D starfield with massive star counts, brilliant colors, and spectacular effects
 * This is SPACE - it should be breathtaking!
 * @param {THREE.Scene} scene - The Three.js scene to add stars to
 * @param {THREE.Camera} camera - The camera for parallax calculations
 * @returns {Object} - Contains starfield objects that need animation updates
 */
export function initStarfield(scene, camera) {
    // MASSIVE star counts for true space experience
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const starCount = isMobile ? 15000 : 25000; // GO BIG!
    const nebulaCount = isMobile ? 20 : 35;
    const starFieldRadius = 2500;
    
    // Arrays to store star data
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);
    const twinklePhases = new Float32Array(starCount);
    const twinkleSpeeds = new Float32Array(starCount);
    const distances = new Float32Array(starCount);
    
    // EPIC constellation patterns - more and bigger!
    const constellations = [
        // Big Dipper
        { stars: 12, center: [800, 600, -1200], spread: 400 },
        // Orion - the hunter
        { stars: 15, center: [-900, -400, -1400], spread: 500 },
        // Cassiopeia
        { stars: 8, center: [600, 900, -1000], spread: 300 },
        // Southern Cross
        { stars: 6, center: [-600, -800, -1500], spread: 250 },
        // Ursa Major
        { stars: 10, center: [400, 200, -800], spread: 350 },
        // Cygnus
        { stars: 9, center: [-300, 700, -1100], spread: 280 },
        // Scorpius
        { stars: 11, center: [200, -600, -900], spread: 380 },
        // Leo
        { stars: 8, center: [-500, 300, -1300], spread: 320 }
    ];
    
    let starIndex = 0;
    
    // Generate BRILLIANT constellation stars first
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
            
            // BRILLIANT constellation stars with EPIC colors
            const constellationColor = Math.random();
            if (constellationColor < 0.3) {
                // Brilliant Blue Supergiants
                colors[i3] = 0.4 + Math.random() * 0.6;
                colors[i3 + 1] = 0.8 + Math.random() * 0.2;
                colors[i3 + 2] = 1.0;
            } else if (constellationColor < 0.6) {
                // Blazing White Giants
                colors[i3] = 1.0;
                colors[i3 + 1] = 1.0;
                colors[i3 + 2] = 1.0;
            } else {
                // Golden Supergiants
                colors[i3] = 1.0;
                colors[i3 + 1] = 0.9 + Math.random() * 0.1;
                colors[i3 + 2] = 0.3 + Math.random() * 0.4;
            }
            
            // MASSIVE constellation stars
            sizes[starIndex] = (isMobile ? 8.0 : 12.0) + Math.random() * (isMobile ? 6.0 : 10.0);
            
            twinklePhases[starIndex] = Math.random() * Math.PI * 2;
            twinkleSpeeds[starIndex] = 0.3 + Math.random() * 0.7;
            
            starIndex++;
        }
    });
    
    // Generate the REST of the galaxy!
    for (let i = starIndex; i < starCount; i++) {
        const i3 = i * 3;
        
        // Multiple distribution methods for variety
        let x, y, z, length;
        
        if (Math.random() < 0.7) {
            // Spherical distribution
            do {
                x = (Math.random() - 0.5) * 2;
                y = (Math.random() - 0.5) * 2;
                z = (Math.random() - 0.5) * 2;
                length = Math.sqrt(x * x + y * y + z * z);
            } while (length > 1);
        } else {
            // Galactic plane concentration
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random();
            x = Math.cos(angle) * radius;
            y = (Math.random() - 0.5) * 0.3; // Flatter distribution
            z = Math.sin(angle) * radius;
            length = Math.sqrt(x * x + y * y + z * z);
        }
        
        const radius = starFieldRadius * (0.2 + Math.random() * 0.8);
        const scale = radius / length;
        
        positions[i3] = x * scale;
        positions[i3 + 1] = y * scale;
        positions[i3 + 2] = z * scale;
        
        distances[i] = Math.sqrt(
            positions[i3] * positions[i3] + 
            positions[i3 + 1] * positions[i3 + 1] + 
            positions[i3 + 2] * positions[i3 + 2]
        );
        
        // SPECTACULAR color variations - this is SPACE!
        const temp = Math.random();
        if (temp < 0.15) {
            // Electric Blue Giants
            colors[i3] = 0.2 + Math.random() * 0.3;
            colors[i3 + 1] = 0.6 + Math.random() * 0.4;
            colors[i3 + 2] = 1.0;
        } else if (temp < 0.25) {
            // Blazing White Dwarfs
            colors[i3] = 1.0;
            colors[i3 + 1] = 1.0;
            colors[i3 + 2] = 1.0;
        } else if (temp < 0.35) {
            // Golden Yellow Giants
            colors[i3] = 1.0;
            colors[i3 + 1] = 0.9 + Math.random() * 0.1;
            colors[i3 + 2] = 0.4 + Math.random() * 0.3;
        } else if (temp < 0.45) {
            // Orange Giants
            colors[i3] = 1.0;
            colors[i3 + 1] = 0.6 + Math.random() * 0.3;
            colors[i3 + 2] = 0.2 + Math.random() * 0.3;
        } else if (temp < 0.55) {
            // Red Supergiants
            colors[i3] = 1.0;
            colors[i3 + 1] = 0.3 + Math.random() * 0.4;
            colors[i3 + 2] = 0.1 + Math.random() * 0.3;
        } else if (temp < 0.65) {
            // Purple/Violet Stars
            colors[i3] = 0.8 + Math.random() * 0.2;
            colors[i3 + 1] = 0.4 + Math.random() * 0.3;
            colors[i3 + 2] = 1.0;
        } else if (temp < 0.75) {
            // Cyan/Turquoise Stars
            colors[i3] = 0.2 + Math.random() * 0.3;
            colors[i3 + 1] = 0.8 + Math.random() * 0.2;
            colors[i3 + 2] = 0.9 + Math.random() * 0.1;
        } else if (temp < 0.85) {
            // Green Giants (rare)
            colors[i3] = 0.3 + Math.random() * 0.4;
            colors[i3 + 1] = 1.0;
            colors[i3 + 2] = 0.4 + Math.random() * 0.3;
        } else if (temp < 0.95) {
            // Pink/Magenta Stars
            colors[i3] = 1.0;
            colors[i3 + 1] = 0.4 + Math.random() * 0.3;
            colors[i3 + 2] = 0.8 + Math.random() * 0.2;
        } else {
            // Rainbow/Prismatic Stars (ultra rare)
            colors[i3] = 0.7 + Math.random() * 0.3;
            colors[i3 + 1] = 0.7 + Math.random() * 0.3;
            colors[i3 + 2] = 0.7 + Math.random() * 0.3;
        }
        
        // BIGGER stars with more variation
        const baseBrightness = Math.random();
        const distanceFactor = starFieldRadius / (distances[i] + 100);
        const baseSize = isMobile ? 3.5 : 5.0;
        sizes[i] = baseSize + baseBrightness * (isMobile ? 4.0 : 8.0) + distanceFactor * 0.5;
        
        twinklePhases[i] = Math.random() * Math.PI * 2;
        twinkleSpeeds[i] = 0.5 + Math.random() * 2.0;
    }
    
    // Store original colors for animation
    const originalColors = new Float32Array(colors);
    
    // Create star geometry
    const starGeometry = new THREE.BufferGeometry();
    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    starGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    // BRILLIANT star material
    const starMaterial = new THREE.PointsMaterial({
        vertexColors: true,
        sizeAttenuation: true,
        transparent: true,
        opacity: 1.0, // FULL BRIGHTNESS!
        blending: THREE.AdditiveBlending,
        alphaTest: 0.01
    });
    
    const starField = new THREE.Points(starGeometry, starMaterial);
    scene.add(starField);
    
    // Create SPECTACULAR nebula clouds
    const nebulaGroup = new THREE.Group();
    const nebulas = [];
    
    for (let i = 0; i < nebulaCount; i++) {
        const nebulaGeometry = new THREE.SphereGeometry(
            80 + Math.random() * 200, // BIGGER nebulas
            isMobile ? 12 : 24,       // More detailed
            isMobile ? 8 : 16
        );
        
        // EPIC nebula colors
        const nebulaColors = [
            new THREE.Color(0xFF0080), // Electric Pink
            new THREE.Color(0x00FFFF), // Cyan
            new THREE.Color(0xFF4000), // Electric Orange
            new THREE.Color(0x8000FF), // Electric Purple
            new THREE.Color(0x00FF40), // Electric Green
            new THREE.Color(0xFF8000), // Bright Orange
            new THREE.Color(0x0080FF), // Electric Blue
            new THREE.Color(0xFF0040), // Hot Pink
            new THREE.Color(0x40FF00), // Lime Green
            new THREE.Color(0xFF4080), // Rose
            new THREE.Color(0x80FF40), // Spring Green
            new THREE.Color(0x4080FF)  // Sky Blue
        ];
        
        const nebulaColor = nebulaColors[Math.floor(Math.random() * nebulaColors.length)];
        
        const nebulaMaterial = new THREE.MeshBasicMaterial({
            color: nebulaColor,
            transparent: true,
            opacity: 0.1 + Math.random() * 0.15, // MORE visible
            blending: THREE.AdditiveBlending,
            fog: false
        });
        
        const nebulaMesh = new THREE.Mesh(nebulaGeometry, nebulaMaterial);
        
        // Position nebulas throughout space
        nebulaMesh.position.set(
            (Math.random() - 0.5) * starFieldRadius * 2,
            (Math.random() - 0.5) * starFieldRadius * 2,
            (Math.random() - 0.5) * starFieldRadius * 2
        );
        
        nebulaMesh.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );
        
        nebulas.push({
            mesh: nebulaMesh,
            rotationSpeed: {
                x: (Math.random() - 0.5) * 0.002,
                y: (Math.random() - 0.5) * 0.002,
                z: (Math.random() - 0.5) * 0.002
            },
            pulseFase: Math.random() * Math.PI * 2,
            pulseSpeed: 0.5 + Math.random() * 1.0
        });
        
        nebulaGroup.add(nebulaMesh);
    }
    
    scene.add(nebulaGroup);
    
    let prevCameraPosition = camera.position.clone();
    
    /**
     * EPIC animation function
     */
    function animate(time) {
        const timeSeconds = time * 0.001;
        
        // Update BRILLIANT star twinkling
        const sizeAttribute = starGeometry.getAttribute('size');
        const colorAttribute = starGeometry.getAttribute('color');
        
        for (let i = 0; i < starCount; i++) {
            const phase = twinklePhases[i] + timeSeconds * twinkleSpeeds[i];
            const twinkle = 0.6 + 0.4 * Math.sin(phase); // MORE dramatic twinkling
            
            // Update size for BRILLIANT twinkling
            sizeAttribute.array[i] = sizes[i] * twinkle;
            
            // BRIGHT color updates
            const i3 = i * 3;
            const intensity = twinkle * 0.7 + 0.3; // Brighter baseline
            colorAttribute.array[i3] = originalColors[i3] * intensity;
            colorAttribute.array[i3 + 1] = originalColors[i3 + 1] * intensity;
            colorAttribute.array[i3 + 2] = originalColors[i3 + 2] * intensity;
        }
        
        sizeAttribute.needsUpdate = true;
        colorAttribute.needsUpdate = true;
        
        // Animate SPECTACULAR nebulas
        nebulas.forEach(nebula => {
            nebula.mesh.rotation.x += nebula.rotationSpeed.x;
            nebula.mesh.rotation.y += nebula.rotationSpeed.y;
            nebula.mesh.rotation.z += nebula.rotationSpeed.z;
            
            // Pulsing nebula effect
            const pulse = nebula.pulseFase + timeSeconds * nebula.pulseSpeed;
            const pulseIntensity = 0.8 + 0.2 * Math.sin(pulse);
            nebula.mesh.material.opacity = (0.1 + Math.random() * 0.15) * pulseIntensity;
        });
        
        // Enhanced parallax
        const currentCameraPosition = camera.position;
        const deltaPosition = currentCameraPosition.clone().sub(prevCameraPosition);
        
        if (deltaPosition.lengthSq() > 0.0005) {
            const positionAttribute = starGeometry.getAttribute('position');
            
            for (let i = 0; i < starCount; i++) {
                const i3 = i * 3;
                const parallaxFactor = 2.0 / (distances[i] * 0.001 + 0.05);
                
                positionAttribute.array[i3] -= deltaPosition.x * parallaxFactor;
                positionAttribute.array[i3 + 1] -= deltaPosition.y * parallaxFactor;
                positionAttribute.array[i3 + 2] -= deltaPosition.z * parallaxFactor;
            }
            
            positionAttribute.needsUpdate = true;
            prevCameraPosition = currentCameraPosition.clone();
        }
        
        // EPIC rotation
        starField.rotation.y += 0.0002;
        starField.rotation.x += 0.0001;
        nebulaGroup.rotation.y += 0.0001;
    }
    
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
        isMobile,
        starCount
    };
}
