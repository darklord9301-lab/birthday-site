import * as THREE from './libs/three.module.js';

/**
 * Warp Speed Starfield - Classic Star Trek/Star Wars Hyperspace Effect
 * Creates the iconic stretching star trails effect during FTL travel
 * @param {THREE.Scene} scene - The Three.js scene
 * @param {THREE.Camera} camera - The camera
 * @returns {Object} - Starfield objects and animation functions
 */
export function initStarfield(scene, camera) {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    const starCount = isMobile ? 1500 : 3000;
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
            color: new THREE.Color()
        };
        
        // Set initial previous position
        star.prevX = star.x;
        star.prevY = star.y;
        star.prevZ = star.z;
        
        // Random star colors - blue, white, red spectrum
        const colorType = Math.random();
        if (colorType < 0.3) {
            star.color.setRGB(0.8 + Math.random() * 0.2, 0.9 + Math.random() * 0.1, 1.0); // Blue-white
        } else if (colorType < 0.7) {
            star.color.setRGB(1.0, 1.0, 1.0); // Pure white
        } else {
            star.color.setRGB(1.0, 0.7 + Math.random() * 0.3, 0.6 + Math.random() * 0.2); // Orange-red
        }
        
        stars.push(star);
    }
    
    // Warp speed parameters
    let warpSpeed = 0;
    let targetWarpSpeed = 50;
    let isWarping = false;
    
    function updateStarPositions() {
        for (let i = 0; i < starCount; i++) {
            const star = stars[i];
            const i6 = i * 6; // 6 coordinates per star (2 points × 3 coords)
            
            // Store previous position for trail effect
            star.prevX = star.x;
            star.prevY = star.y;
            star.prevZ = star.z;
            
            // Move star towards camera
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
            
            // Previous star position (back of trail) - stretched based on speed
            const trailLength = Math.min(warpSpeed * 3, 300);
            const trailX = star.x - (star.x / distance) * trailLength * perspective;
            const trailY = star.y - (star.y / distance) * trailLength * perspective;
            const trailZ = star.z - trailLength;
            
            positions[i6 + 3] = isNaN(trailX) ? star.x : trailX;
            positions[i6 + 4] = isNaN(trailY) ? star.y : trailY;
            positions[i6 + 5] = trailZ;
            
            // Color intensity based on speed and distance
            const intensity = Math.min(1.0, warpSpeed / 100 + 0.3);
            const alpha = Math.max(0.1, perspective * intensity);
            
            // Front point (brighter)
            colors[i6] = star.color.r * intensity;
            colors[i6 + 1] = star.color.g * intensity;
            colors[i6 + 2] = star.color.b * intensity;
            
            // Back point (dimmer for trail effect)
            colors[i6 + 3] = star.color.r * intensity * 0.3;
            colors[i6 + 4] = star.color.g * intensity * 0.3;
            colors[i6 + 5] = star.color.b * intensity * 0.3;
        }
    }
    
    // Create geometry
    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    // Line material for streaking effect
    const starMaterial = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 1.0,
        blending: THREE.AdditiveBlending,
        linewidth: 2
    });
    
    const starField = new THREE.LineSegments(starGeometry, starMaterial);
    scene.add(starField);
    
    // Add some bright center stars that don't streak
    const centerStarCount = 200;
    const centerGeometry = new THREE.BufferGeometry();
    const centerPositions = new Float32Array(centerStarCount * 3);
    const centerColors = new Float32Array(centerStarCount * 3);
    const centerSizes = new Float32Array(centerStarCount);
    
    for (let i = 0; i < centerStarCount; i++) {
        centerPositions[i * 3] = (Math.random() - 0.5) * 1000;
        centerPositions[i * 3 + 1] = (Math.random() - 0.5) * 500;
        centerPositions[i * 3 + 2] = (Math.random() - 0.5) * 1000;
        
        const brightness = 0.5 + Math.random() * 0.5;
        centerColors[i * 3] = brightness;
        centerColors[i * 3 + 1] = brightness;
        centerColors[i * 3 + 2] = brightness;
        
        centerSizes[i] = 2 + Math.random() * 3;
    }
    
    centerGeometry.setAttribute('position', new THREE.BufferAttribute(centerPositions, 3));
    centerGeometry.setAttribute('color', new THREE.BufferAttribute(centerColors, 3));
    centerGeometry.setAttribute('size', new THREE.BufferAttribute(centerSizes, 1));
    
    const centerMaterial = new THREE.PointsMaterial({
        vertexColors: true,
        sizeAttenuation: false,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });
    
    const centerStars = new THREE.Points(centerGeometry, centerMaterial);
    scene.add(centerStars);
    
    // Control functions
    function startWarp() {
        isWarping = true;
        targetWarpSpeed = 150;
    }
    
    function stopWarp() {
        isWarping = false;
        targetWarpSpeed = 5;
    }
    
    function setWarpSpeed(speed) {
        targetWarpSpeed = speed;
    }
    
    // Animation function
    function animate(time) {
        // Smooth speed transition
        const speedDiff = targetWarpSpeed - warpSpeed;
        warpSpeed += speedDiff * 0.02;
        
        updateStarPositions();
        
        // Update geometry
        starGeometry.attributes.position.needsUpdate = true;
        starGeometry.attributes.color.needsUpdate = true;
        
        // Rotate slightly for more dynamic effect
        starField.rotation.z += 0.001;
        
        // Add some camera shake at high speeds
        if (warpSpeed > 100) {
            const shake = (warpSpeed - 100) * 0.0001;
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
    
    // Auto-start warp effect after a delay
    setTimeout(startWarp, 1000);
    
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
