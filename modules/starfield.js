import * as THREE from '/birthday-site/libs/three.module.js';

/**
 * Exact Starfield Warp Effect - Perfect Recreation
 * Creates the exact radial star streak effect from the reference image
 * @param {THREE.Scene} scene - The Three.js scene
 * @param {THREE.Camera} camera - The camera
 * @returns {Object} - Starfield objects and animation functions
 */
export function initStarfield(scene, camera) {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    const starCount = isMobile ? 4000 : 8000;
    const brightStarCount = isMobile ? 300 : 600;
    const dustParticleCount = isMobile ? 1000 : 2000;
    const maxDistance = 3000;
    
    const spaceObjects = [];
    const stars = [];
    const brightStars = [];
    const dustParticles = [];
    
    // === MAIN WARP STREAKS (Radial from center) ===
    const streakGeometry = new THREE.BufferGeometry();
    const streakPositions = new Float32Array(starCount * 6); // 2 points per streak
    const streakColors = new Float32Array(starCount * 6);
    
    // Initialize main stars with exact radial distribution
    for (let i = 0; i < starCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.pow(Math.random(), 0.6) * 2000; // Center-focused distribution
        
        const star = {
            x: Math.cos(angle) * radius,
            y: Math.sin(angle) * radius,
            z: -maxDistance - Math.random() * 2000,
            originalX: Math.cos(angle) * radius,
            originalY: Math.sin(angle) * radius,
            angle: angle,
            radius: radius,
            speed: 3 + Math.random() * 4,
            brightness: 0.3 + Math.random() * 0.7,
            twinkle: Math.random() * Math.PI * 2,
            color: new THREE.Color(),
            size: 0.8 + Math.random() * 2.5
        };
        
        // Realistic stellar color temperature distribution
        const temp = Math.random();
        if (temp < 0.05) {
            // Hot blue stars (rare)
            star.color.setRGB(0.7, 0.9, 1.0);
            star.brightness *= 1.8;
        } else if (temp < 0.15) {
            // Blue-white
            star.color.setRGB(0.9, 0.95, 1.0);
            star.brightness *= 1.4;
        } else if (temp < 0.35) {
            // Pure white
            star.color.setRGB(1.0, 1.0, 1.0);
            star.brightness *= 1.2;
        } else if (temp < 0.55) {
            // Yellow-white (sun-like)
            star.color.setRGB(1.0, 0.98, 0.8);
        } else if (temp < 0.75) {
            // Orange
            star.color.setRGB(1.0, 0.8, 0.5);
            star.brightness *= 0.9;
        } else {
            // Red (most common)
            star.color.setRGB(1.0, 0.6, 0.3);
            star.brightness *= 0.7;
        }
        
        stars.push(star);
    }
    
    // === BRIGHT HERO STARS ===
    const brightGeometry = new THREE.BufferGeometry();
    const brightPositions = new Float32Array(brightStarCount * 3);
    const brightColors = new Float32Array(brightStarCount * 3);
    const brightSizes = new Float32Array(brightStarCount);
    
    for (let i = 0; i < brightStarCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.pow(Math.random(), 0.8) * 1500;
        
        const brightStar = {
            x: Math.cos(angle) * radius,
            y: Math.sin(angle) * radius,
            z: -maxDistance - Math.random() * 1500,
            originalX: Math.cos(angle) * radius,
            originalY: Math.sin(angle) * radius,
            angle: angle,
            radius: radius,
            speed: 3.5 + Math.random() * 3,
            brightness: 0.8 + Math.random() * 0.2,
            twinkle: Math.random() * Math.PI * 2,
            color: new THREE.Color(),
            size: 3 + Math.random() * 6
        };
        
        // Hero star colors - dramatic
        const heroType = Math.random();
        if (heroType < 0.3) {
            brightStar.color.setRGB(0.6, 0.9, 1.0); // Blue
        } else if (heroType < 0.5) {
            brightStar.color.setRGB(1.0, 1.0, 1.0); // White
        } else if (heroType < 0.7) {
            brightStar.color.setRGB(1.0, 0.9, 0.6); // Yellow
        } else if (heroType < 0.9) {
            brightStar.color.setRGB(1.0, 0.7, 0.4); // Orange
        } else {
            brightStar.color.setRGB(1.0, 0.5, 0.2); // Red
        }
        
        brightStars.push(brightStar);
    }
    
    // === SPACE DUST FIELD ===
    const dustGeometry = new THREE.BufferGeometry();
    const dustPositions = new Float32Array(dustParticleCount * 3);
    const dustColors = new Float32Array(dustParticleCount * 3);
    const dustSizes = new Float32Array(dustParticleCount);
    
    for (let i = 0; i < dustParticleCount; i++) {
        const dust = {
            x: (Math.random() - 0.5) * 6000,
            y: (Math.random() - 0.5) * 4000,
            z: -maxDistance - Math.random() * 3000,
            speed: 1 + Math.random() * 2,
            opacity: 0.1 + Math.random() * 0.3,
            twinkle: Math.random() * Math.PI * 2
        };
        
        dustParticles.push(dust);
        
        // Cosmic dust colors
        const dustColor = Math.random();
        let r, g, b;
        if (dustColor < 0.4) {
            r = 0.5; g = 0.7; b = 1.0; // Blue
        } else if (dustColor < 0.7) {
            r = 1.0; g = 0.8; b = 0.6; // Orange
        } else {
            r = 0.8; g = 0.8; b = 0.8; // White
        }
        
        dustColors[i * 3] = r * dust.opacity;
        dustColors[i * 3 + 1] = g * dust.opacity;
        dustColors[i * 3 + 2] = b * dust.opacity;
        dustSizes[i] = 0.5 + Math.random() * 1.5;
    }
    
    // Create geometries
    dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    dustGeometry.setAttribute('color', new THREE.BufferAttribute(dustColors, 3));
    dustGeometry.setAttribute('size', new THREE.BufferAttribute(dustSizes, 1));
    
    const dustMaterial = new THREE.PointsMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true
    });
    
    const spaceDust = new THREE.Points(dustGeometry, dustMaterial);
    scene.add(spaceDust);
    spaceObjects.push(spaceDust);
    
    // Main star streaks
    streakGeometry.setAttribute('position', new THREE.BufferAttribute(streakPositions, 3));
    streakGeometry.setAttribute('color', new THREE.BufferAttribute(streakColors, 3));
    
    const streakMaterial = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 1.0,
        blending: THREE.AdditiveBlending
    });
    
    const starStreaks = new THREE.LineSegments(streakGeometry, streakMaterial);
    scene.add(starStreaks);
    spaceObjects.push(starStreaks);
    
    // Bright stars
    brightGeometry.setAttribute('position', new THREE.BufferAttribute(brightPositions, 3));
    brightGeometry.setAttribute('color', new THREE.BufferAttribute(brightColors, 3));
    brightGeometry.setAttribute('size', new THREE.BufferAttribute(brightSizes, 1));
    
    const brightMaterial = new THREE.PointsMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 1.0,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true
    });
    
    const brightPoints = new THREE.Points(brightGeometry, brightMaterial);
    scene.add(brightPoints);
    spaceObjects.push(brightPoints);
    
    let warpSpeed = 5;
    let targetWarpSpeed = 5;
    let isWarping = true;
    let time = 0;
    
    function updateStarPositions() {
        // Update main star streaks with exact radial pattern
        for (let i = 0; i < starCount; i++) {
            const star = stars[i];
            const i6 = i * 6;
            
            // Move star forward
            star.z += star.speed * warpSpeed * 0.5;
            
            // Reset if too close
            if (star.z > 200) {
                star.z = -maxDistance - Math.random() * 2000;
                
                // Redistribute in radial pattern
                const newAngle = Math.random() * Math.PI * 2;
                const newRadius = Math.pow(Math.random(), 0.6) * 2000;
                star.x = Math.cos(newAngle) * newRadius;
                star.y = Math.sin(newAngle) * newRadius;
                star.originalX = star.x;
                star.originalY = star.y;
                star.angle = newAngle;
                star.radius = newRadius;
            }
            
            // Calculate distance from center for perspective
            const distanceFromCenter = Math.sqrt(star.x * star.x + star.y * star.y);
            const perspective = Math.max(0.1, 1 - (star.z + maxDistance) / (maxDistance * 3));
            
            // Direction from center (this creates the exact radial effect)
            const dirX = distanceFromCenter > 0 ? star.x / distanceFromCenter : 0;
            const dirY = distanceFromCenter > 0 ? star.y / distanceFromCenter : 0;
            
            // Calculate streak length - longer for outer stars
            const baseStreakLength = 80 + warpSpeed * 30;
            const streakLength = baseStreakLength * perspective * (1 + distanceFromCenter / 800);
            
            // Star position (front of streak)
            streakPositions[i6] = star.x;
            streakPositions[i6 + 1] = star.y;
            streakPositions[i6 + 2] = star.z;
            
            // Streak tail (radiating outward from center)
            streakPositions[i6 + 3] = star.x - dirX * streakLength;
            streakPositions[i6 + 4] = star.y - dirY * streakLength;
            streakPositions[i6 + 5] = star.z - streakLength * 0.2;
            
            // Twinkling effect
            star.twinkle += 0.02 + warpSpeed * 0.01;
            const twinkleIntensity = 0.7 + Math.sin(star.twinkle) * 0.3;
            
            // Color intensity based on perspective and speed
            const intensity = star.brightness * twinkleIntensity * perspective * Math.min(2, 0.5 + warpSpeed / 8);
            const frontIntensity = intensity;
            const trailIntensity = intensity * 0.1;
            
            // Front point (bright star)
            streakColors[i6] = star.color.r * frontIntensity;
            streakColors[i6 + 1] = star.color.g * frontIntensity;
            streakColors[i6 + 2] = star.color.b * frontIntensity;
            
            // Trail point (dim)
            streakColors[i6 + 3] = star.color.r * trailIntensity;
            streakColors[i6 + 4] = star.color.g * trailIntensity;
            streakColors[i6 + 5] = star.color.b * trailIntensity;
        }
        
        // Update bright hero stars
        for (let i = 0; i < brightStarCount; i++) {
            const star = brightStars[i];
            
            star.z += star.speed * warpSpeed * 0.6;
            
            if (star.z > 150) {
                star.z = -maxDistance - Math.random() * 1500;
                const newAngle = Math.random() * Math.PI * 2;
                const newRadius = Math.pow(Math.random(), 0.8) * 1500;
                star.x = Math.cos(newAngle) * newRadius;
                star.y = Math.sin(newAngle) * newRadius;
            }
            
            star.twinkle += 0.03;
            const twinkle = 0.8 + Math.sin(star.twinkle) * 0.2;
            const perspective = Math.max(0.1, 1 - (star.z + maxDistance) / (maxDistance * 2));
            
            brightPositions[i * 3] = star.x;
            brightPositions[i * 3 + 1] = star.y;
            brightPositions[i * 3 + 2] = star.z;
            
            const intensity = star.brightness * twinkle * perspective * (1 + warpSpeed / 10);
            
            brightColors[i * 3] = star.color.r * intensity;
            brightColors[i * 3 + 1] = star.color.g * intensity;
            brightColors[i * 3 + 2] = star.color.b * intensity;
            
            brightSizes[i] = star.size * perspective * (1 + intensity * 0.3);
        }
        
        // Update space dust
        for (let i = 0; i < dustParticleCount; i++) {
            const dust = dustParticles[i];
            
            dust.z += dust.speed * warpSpeed * 0.3;
            
            if (dust.z > 100) {
                dust.x = (Math.random() - 0.5) * 6000;
                dust.y = (Math.random() - 0.5) * 4000;
                dust.z = -maxDistance * 2;
            }
            
            dustPositions[i * 3] = dust.x;
            dustPositions[i * 3 + 1] = dust.y;
            dustPositions[i * 3 + 2] = dust.z;
        }
    }
    
    // Create main star streak lines
    streakGeometry.setAttribute('position', new THREE.BufferAttribute(streakPositions, 3));
    streakGeometry.setAttribute('color', new THREE.BufferAttribute(streakColors, 3));
    
    const streakMaterial = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 1.0,
        blending: THREE.AdditiveBlending
    });
    
    const starStreaks = new THREE.LineSegments(streakGeometry, streakMaterial);
    scene.add(starStreaks);
    spaceObjects.push(starStreaks);
    
    // Create bright star points
    const brightGeometry = new THREE.BufferGeometry();
    const brightPositions = new Float32Array(brightStarCount * 3);
    const brightColors = new Float32Array(brightStarCount * 3);
    const brightSizes = new Float32Array(brightStarCount);
    
    brightGeometry.setAttribute('position', new THREE.BufferAttribute(brightPositions, 3));
    brightGeometry.setAttribute('color', new THREE.BufferAttribute(brightColors, 3));
    brightGeometry.setAttribute('size', new THREE.BufferAttribute(brightSizes, 1));
    
    const brightMaterial = new THREE.PointsMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 1.0,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true
    });
    
    const brightPoints = new THREE.Points(brightGeometry, brightMaterial);
    scene.add(brightPoints);
    spaceObjects.push(brightPoints);
    
    // Create space dust
    const dustGeometry = new THREE.BufferGeometry();
    const dustPositions = new Float32Array(dustParticleCount * 3);
    const dustColors = new Float32Array(dustParticleCount * 3);
    const dustSizes = new Float32Array(dustParticleCount);
    
    dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    dustGeometry.setAttribute('color', new THREE.BufferAttribute(dustColors, 3));
    dustGeometry.setAttribute('size', new THREE.BufferAttribute(dustSizes, 1));
    
    const dustMaterial = new THREE.PointsMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true
    });
    
    const spaceDust = new THREE.Points(dustGeometry, dustMaterial);
    scene.add(spaceDust);
    spaceObjects.push(spaceDust);
    
    // Control functions
    function startWarp() {
        isWarping = true;
        targetWarpSpeed = 5;
    }
    
    function stopWarp() {
        isWarping = false;
        targetWarpSpeed = 1;
    }
    
    function setWarpSpeed(speed) {
        warpSpeed = speed;
        targetWarpSpeed = speed;
    }
    
    // Main animation function
    function animate(deltaTime) {
        time += deltaTime * 0.001;
        
        // Smooth warp speed transitions
        warpSpeed += (targetWarpSpeed - warpSpeed) * 0.02;
        
        updateStarPositions();
        
        // Update all buffer attributes
        streakGeometry.attributes.position.needsUpdate = true;
        streakGeometry.attributes.color.needsUpdate = true;
        brightGeometry.attributes.position.needsUpdate = true;
        brightGeometry.attributes.color.needsUpdate = true;
        brightGeometry.attributes.size.needsUpdate = true;
        dustGeometry.attributes.position.needsUpdate = true;
    }
    
    function dispose() {
        spaceObjects.forEach(obj => {
            scene.remove(obj);
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) {
                if (obj.material.map) obj.material.map.dispose();
                obj.material.dispose();
            }
        });
    }
    
    return {
        starStreaks,
        brightPoints,
        spaceDust,
        spaceObjects,
        animate,
        dispose,
        startWarp,
        stopWarp,
        setWarpSpeed,
        getCurrentSpeed: () => warpSpeed,
        isMobile
    };
}
