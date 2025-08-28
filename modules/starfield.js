import * as THREE from '../libs/three.module.min.js';

/**
 * Creates a realistic 3D starfield with twinkling effects and parallax motion
 * @param {THREE.Scene} scene - The Three.js scene to add stars to
 * @param {THREE.Camera} camera - The camera for parallax calculations
 * @returns {Object} - Contains starfield objects that need animation updates
 */
export function initStarfield(scene, camera) {
    const starCount = 8000; // High density for UHD quality
    const starFieldRadius = 2000; // Large sphere for immersive experience
    
    // Arrays to store star data
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);
    const opacities = new Float32Array(starCount);
    const twinklePhases = new Float32Array(starCount);
    const twinkleSpeeds = new Float32Array(starCount);
    const distances = new Float32Array(starCount);
    
    // Generate stars in a spherical distribution
    for (let i = 0; i < starCount; i++) {
        const i3 = i * 3;
        
        // Spherical distribution using rejection sampling for uniform distribution
        let x, y, z, length;
        do {
            x = (Math.random() - 0.5) * 2;
            y = (Math.random() - 0.5) * 2;
            z = (Math.random() - 0.5) * 2;
            length = Math.sqrt(x * x + y * y + z * z);
        } while (length > 1);
        
        // Scale to desired radius with some variation
        const radius = starFieldRadius * (0.3 + Math.random() * 0.7);
        const scale = radius / length;
        
        positions[i3] = x * scale;
        positions[i3 + 1] = y * scale;
        positions[i3 + 2] = z * scale;
        
        // Store distance for parallax calculations
        distances[i] = Math.sqrt(
            positions[i3] * positions[i3] + 
            positions[i3 + 1] * positions[i3 + 1] + 
            positions[i3 + 2] * positions[i3 + 2]
        );
        
        // Star color variations (mostly white with some blue/red tint)
        const temp = Math.random();
        if (temp < 0.7) {
            // White stars
            colors[i3] = 1.0;
            colors[i3 + 1] = 1.0;
            colors[i3 + 2] = 1.0;
        } else if (temp < 0.85) {
            // Blue-white stars
            colors[i3] = 0.7 + Math.random() * 0.3;
            colors[i3 + 1] = 0.8 + Math.random() * 0.2;
            colors[i3 + 2] = 1.0;
        } else {
            // Red-orange stars
            colors[i3] = 1.0;
            colors[i3 + 1] = 0.6 + Math.random() * 0.4;
            colors[i3 + 2] = 0.4 + Math.random() * 0.3;
        }
        
        // Size variation based on distance and brightness
        const baseBrightness = Math.random();
        sizes[i] = (0.5 + baseBrightness * 2.0) * (starFieldRadius / distances[i]) * 0.5;
        
        // Base opacity
        opacities[i] = 0.3 + baseBrightness * 0.7;
        
        // Twinkling parameters
        twinklePhases[i] = Math.random() * Math.PI * 2;
        twinkleSpeeds[i] = 0.5 + Math.random() * 2.0;
    }
    
    // Create BufferGeometry for optimal performance
    const starGeometry = new THREE.BufferGeometry();
    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    starGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    // Create point material with size attenuation
    const starMaterial = new THREE.PointsMaterial({
        vertexColors: true,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
        alphaTest: 0.1
    });
    
    // Create the star points mesh
    const starField = new THREE.Points(starGeometry, starMaterial);
    scene.add(starField);
    
    // Store previous camera position for parallax calculations
    let prevCameraPosition = camera.position.clone();
    
    /**
     * Animation function to be called each frame
     * @param {number} time - Current time in milliseconds
     */
    function animate(time) {
        const timeSeconds = time * 0.001;
        
        // Update twinkling effect
        const sizeAttribute = starGeometry.getAttribute('size');
        const colorAttribute = starGeometry.getAttribute('color');
        
        for (let i = 0; i < starCount; i++) {
            const phase = twinklePhases[i] + timeSeconds * twinkleSpeeds[i];
            const twinkle = 0.8 + 0.2 * Math.sin(phase);
            
            // Update size for twinkling
            sizeAttribute.array[i] = sizes[i] * twinkle;
            
            // Subtle color intensity variation
            const i3 = i * 3;
            const intensity = twinkle * 0.9 + 0.1;
            colorAttribute.array[i3] *= intensity;
            colorAttribute.array[i3 + 1] *= intensity;
            colorAttribute.array[i3 + 2] *= intensity;
        }
        
        sizeAttribute.needsUpdate = true;
        colorAttribute.needsUpdate = true;
        
        // Parallax effect based on camera movement
        const currentCameraPosition = camera.position;
        const deltaPosition = currentCameraPosition.clone().sub(prevCameraPosition);
        
        if (deltaPosition.lengthSq() > 0.001) {
            const positionAttribute = starGeometry.getAttribute('position');
            
            for (let i = 0; i < starCount; i++) {
                const i3 = i * 3;
                const parallaxFactor = 1.0 / (distances[i] * 0.001 + 0.1);
                
                positionAttribute.array[i3] -= deltaPosition.x * parallaxFactor;
                positionAttribute.array[i3 + 1] -= deltaPosition.y * parallaxFactor;
                positionAttribute.array[i3 + 2] -= deltaPosition.z * parallaxFactor;
            }
            
            positionAttribute.needsUpdate = true;
            prevCameraPosition = currentCameraPosition.clone();
        }
        
        // Subtle rotation for more dynamic feel
        starField.rotation.y += 0.0001;
        starField.rotation.x += 0.00005;
    }
    
    /**
     * Cleanup function to remove starfield from scene
     */
    function dispose() {
        scene.remove(starField);
        starGeometry.dispose();
        starMaterial.dispose();
    }
    
    // Return objects and functions needed for animation
    return {
        starField,
        animate,
        dispose,
        geometry: starGeometry,
        material: starMaterial
    };
}
