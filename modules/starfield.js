import * as THREE from '/birthday-site/libs/three.module.js';
/**
 * Enhanced Warp Speed Starfield - More Vibrant and Colorful
 * Creates a slower, more colorful stretching star trails effect
 * @param {THREE.Scene} scene - The Three.js scene
 * @param {THREE.Camera} camera - The camera
 * @returns {Object} - Starfield objects and animation functions
 */
export function initStarfield(scene, camera) {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    const starCount = isMobile ? 2000 : 4000;
    const maxDistance = 2000;
    
    // Star data
    const stars = [];
    const starGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 6); // 2 points per star for trail
    const colors = new Float32Array(starCount * 6);
    
    // Initialize stars
    for (let i = 0; i < starCount; i++) {
        const star = {
            x: (Math.random() - 0.5) * 4000,
            y: (Math.random() - 0.5) * 2000, 
            z: (Math.random() - 0.5) * 4000,
            prevX: 0,
            prevY: 0,
            prevZ: 0,
            speed: 0,
            color: new THREE.Color(),
            brightness: 0.8 + Math.random() * 0.2
        };
        
        // Set initial previous position
        star.prevX = star.x;
        star.prevY = star.y;
        star.prevZ = star.z;
        
        // More vibrant and varied star colors
        const colorType = Math.random();
        if (colorType < 0.15) {
            // Bright blue stars
            star.color.setRGB(0.3, 0.7, 1.0);
        } else if (colorType < 0.3) {
            // Cyan/electric blue
            star.color.setRGB(0.0, 0.9, 1.0);
        } else if (colorType < 0.45) {
            // Pure brilliant white
            star.color.setRGB(1.0, 1.0, 1.0);
        } else if (colorType < 0.6) {
            // Warm orange
            star.color.setRGB(1.0, 0.6, 0.2);
        } else if (colorType < 0.75) {
            // Red/pink
            star.color.setRGB(1.0, 0.3, 0.4);
        } else if (colorType < 0.9) {
            // Purple/magenta
            star.color.setRGB(0.9, 0.4, 1.0);
        } else {
            // Golden yellow
            star.color.setRGB(1.0, 0.9, 0.3);
        }
        
        stars.push(star);
    }
    
    // Warp speed parameters - much slower and smoother
    let warpSpeed = 0;
    let targetWarpSpeed = 15; // Much slower than before
    let isWarping = false;
    
    function updateStarPositions() {
        for (let i = 0; i < starCount; i++) {
            const star = stars[i];
            const i6 = i * 6; // 6 coordinates per star (2 points × 3 coords)
            
            // Store previous position for trail effect
            star.prevX = star.x;
            star.prevY = star.y;
            star.prevZ = star.z;
            
            // Move star towards camera (slower)
            star.z += warpSpeed;
            
            // Reset star position when it passes the camera
            if (star.z > 200) {
                star.x = (Math.random() - 0.5) * 4000;
                star.y = (Math.random() - 0.5) * 2000;
                star.z = -maxDistance;
                star.prevX = star.x;
                star.prevY = star.y;
                star.prevZ = star.z;
            }
            
            // Calculate distance from center for perspective effect
            const distance = Math.sqrt(star.x * star.x + star.y * star.y);
            const perspective = Math.max(0.1, (star.z + maxDistance) / maxDistance);
            
            // Current star position (front of trail)
            positions[i6] = star.x;
            positions[i6 + 1] = star.y;
            positions[i6 + 2] = star.z;
            
            // Previous star position (back of trail) - longer, more visible trails
            const trailLength = Math.min(warpSpeed * 8, 400); // Longer trails
            const trailX = star.x - (star.x / distance) * trailLength * perspective;
            const trailY = star.y - (star.y / distance) * trailLength * perspective;
            const trailZ = star.z - trailLength;
            
            positions[i6 + 3] = isNaN(trailX) ? star.x : trailX;
            positions[i6 + 4] = isNaN(trailY) ? star.y : trailY;
            positions[i6 + 5] = trailZ;
            
            // Enhanced color intensity and vibrancy
            const baseIntensity = Math.min(1.5, warpSpeed / 30 + 0.6); // Higher base intensity
            const intensity = baseIntensity * star.brightness;
            const alpha = Math.max(0.2, perspective * intensity);
            
            // Front point (very bright and colorful)
            colors[i6] = star.color.r * intensity;
            colors[i6 + 1] = star.color.g * intensity;
            colors[i6 + 2] = star.color.b * intensity;
            
            // Back point (still bright for visible trail effect)
            const trailIntensity = intensity * 0.6; // Less dimming for more visible trails
            colors[i6 + 3] = star.color.r * trailIntensity;
            colors[i6 + 4] = star.color.g * trailIntensity;
            colors[i6 + 5] = star.color.b * trailIntensity;
        }
    }
    
    // Create geometry
    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    // Enhanced line material for more vibrant streaking effect
    const starMaterial = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 1.0,
        blending: THREE.AdditiveBlending,
        linewidth: 3 // Thicker lines for more visibility
    });
    
    const starField = new THREE.LineSegments(starGeometry, starMaterial);
    scene.add(starField);
    
    // Add more colorful center stars
    const centerStarCount = 300;
    const centerGeometry = new THREE.BufferGeometry();
    const centerPositions = new Float32Array(centerStarCount * 3);
    const centerColors = new Float32Array(centerStarCount * 3);
    const centerSizes = new Float32Array(centerStarCount);
    
    for (let i = 0; i < centerStarCount; i++) {
        centerPositions[i * 3] = (Math.random() - 0.5) * 1000;
        centerPositions[i * 3 + 1] = (Math.random() - 0.5) * 500;
        centerPositions[i * 3 + 2] = (Math.random() - 0.5) * 1000;
        
        // More colorful center stars
        const colorType = Math.random();
        let r, g, b;
        if (colorType < 0.2) {
            // Blue
            r = 0.4; g = 0.8; b = 1.0;
        } else if (colorType < 0.4) {
            // White
            r = 1.0; g = 1.0; b = 1.0;
        } else if (colorType < 0.6) {
            // Orange
            r = 1.0; g = 0.7; b = 0.3;
        } else if (colorType < 0.8) {
            // Pink/Red
            r = 1.0; g = 0.4; b = 0.6;
        } else {
            // Purple
            r = 0.8; g = 0.4; b = 1.0;
        }
        
        const brightness = 0.7 + Math.random() * 0.3;
        centerColors[i * 3] = r * brightness;
        centerColors[i * 3 + 1] = g * brightness;
        centerColors[i * 3 + 2] = b * brightness;
        
        centerSizes[i] = 3 + Math.random() * 4; // Bigger center stars
    }
    
    centerGeometry.setAttribute('position', new THREE.BufferAttribute(centerPositions, 3));
    centerGeometry.setAttribute('color', new THREE.BufferAttribute(centerColors, 3));
    centerGeometry.setAttribute('size', new THREE.BufferAttribute(centerSizes, 1));
    
    const centerMaterial = new THREE.PointsMaterial({
        vertexColors: true,
        sizeAttenuation: false,
        transparent: true,
        opacity: 0.9, // More opaque
        blending: THREE.AdditiveBlending
    });
    
    const centerStars = new THREE.Points(centerGeometry, centerMaterial);
    scene.add(centerStars);
    
    // Control functions
    function startWarp() {
        isWarping = true;
        targetWarpSpeed = 25; // Slower max speed
    }
    
    function stopWarp() {
        isWarping = false;
        targetWarpSpeed = 2; // Very slow when not warping
    }
    
    function setWarpSpeed(speed) {
        targetWarpSpeed = Math.min(speed, 40); // Cap maximum speed
    }
    
    // Animation function
    function animate(time) {
        // Much slower, smoother speed transition
        const speedDiff = targetWarpSpeed - warpSpeed;
        warpSpeed += speedDiff * 0.01; // Slower acceleration
        
        updateStarPositions();
        
        // Update geometry
        starGeometry.attributes.position.needsUpdate = true;
        starGeometry.attributes.color.needsUpdate = true;
        
        // Very gentle rotation for subtle dynamic effect
        starField.rotation.z += 0.0005;
        
        // Minimal camera shake only at very high speeds
        if (warpSpeed > 30) {
            const shake = (warpSpeed - 30) * 0.00005;
            camera.position.x += (Math.random() - 0.5) * shake;
            camera.position.y += (Math.random() - 0.5) * shake;
        }
    }
    
    function dispose() {
        scene.remove(starField);
        scene.remove(centerStars);
        starGeometry.dispose();
        starMaterial.dispose();
        centerGeometry.dispose();
        centerMaterial.dispose();
    }
    
    // Auto-start warp effect after a delay - slower buildup
    setTimeout(() => {
        isWarping = true;
        targetWarpSpeed = 12; // Start even slower
    }, 1500);
    
    return {
        starField,
        centerStars,
        animate,
        dispose,
        startWarp,
        stopWarp,
        setWarpSpeed,
        getCurrentSpeed: () => warpSpeed,
        isMobile
    };
}
