import * as THREE from '/birthday-site/libs/three.module.js';

/**
 * Classic Warp Speed Starfield - Exact Match to Reference Image
 * Creates the iconic radial star streak effect with bright central convergence
 * @param {THREE.Scene} scene - The Three.js scene
 * @param {THREE.Camera} camera - The camera
 * @returns {Object} - Space environment objects and animation functions
 */
export function initStarfield(scene, camera) {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Configuration matching the reference
    const config = {
        starCount: isMobile ? 2000 : 4000,
        brightStarCount: isMobile ? 300 : 600,
        dustParticleCount: isMobile ? 1000 : 2000,
        maxDistance: 3000,
        centerGlowIntensity: 0.4
    };
    
    const spaceObjects = [];
    const stars = [];
    const brightStars = [];
    const dustParticles = [];
    
    // === MAIN WARP STREAKS (Perfect radial lines) ===
    const streakGeometry = new THREE.BufferGeometry();
    const streakPositions = new Float32Array(config.starCount * 6); // 2 points per streak
    const streakColors = new Float32Array(config.starCount * 6);
    
    // Initialize stars with exact radial distribution like the reference
    for (let i = 0; i < config.starCount; i++) {
        // Radial distribution - more stars near center, spread outward
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.pow(Math.random(), 0.6) * 2000; // Power curve for center clustering
        
        const star = {
            x: Math.cos(angle) * radius,
            y: Math.sin(angle) * radius,
            z: -config.maxDistance - Math.random() * 2000,
            originalX: Math.cos(angle) * radius,
            originalY: Math.sin(angle) * radius,
            angle: angle,
            radius: radius,
            speed: 3 + Math.random() * 4,
            brightness: 0.3 + Math.random() * 0.7,
            streakLength: 0,
            twinkle: Math.random() * Math.PI * 2,
            color: new THREE.Color(),
            size: 0.8 + Math.random() * 2.5
        };
        
        // Realistic star color distribution matching reference
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
    
    // === BRIGHT POINT STARS ===
    const brightGeometry = new THREE.BufferGeometry();
    const brightPositions = new Float32Array(config.brightStarCount * 3);
    const brightColors = new Float32Array(config.brightStarCount * 3);
    const brightSizes = new Float32Array(config.brightStarCount);
    
    for (let i = 0; i < config.brightStarCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.pow(Math.random(), 0.8) * 1500;
        
        const brightStar = {
            x: Math.cos(angle) * radius,
            y: Math.sin(angle) * radius,
            z: -config.maxDistance - Math.random() * 1500,
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
        
        // Hero star colors matching reference
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
    
    // === SPACE DUST ===
    const dustGeometry = new THREE.BufferGeometry();
    const dustPositions = new Float32Array(config.dustParticleCount * 3);
    const dustColors = new Float32Array(config.dustParticleCount * 3);
    const dustSizes = new Float32Array(config.dustParticleCount);
    
    for (let i = 0; i < config.dustParticleCount; i++) {
        const dust = {
            x: (Math.random() - 0.5) * 6000,
            y: (Math.random() - 0.5) * 4000,
            z: -config.maxDistance - Math.random() * 3000,
            speed: 1 + Math.random() * 2,
            opacity: 0.1 + Math.random() * 0.3,
            twinkle: Math.random() * Math.PI * 2
        };
        
        dustParticles.push(dust);
        
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
    
    let warpSpeed = 5;
    let targetWarpSpeed = 5;
    let time = 0;
    
    function updateStarPositions() {
        // Update main star streaks - exact match to reference behavior
        for (let i = 0; i < config.starCount; i++) {
            const star = stars[i];
            const i6 = i * 6;
            
            // Move star forward
            star.z += star.speed * warpSpeed * 0.5;
            
            // Reset if too close
            if (star.z > 200) {
                star.z = -config.maxDistance - Math.random() * 2000;
                
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
            const perspective = Math.max(0.1, 1 - (star.z + config.maxDistance) / (config.maxDistance * 3));
            
            // Direction from center
            const dirX = distanceFromCenter > 0 ? star.x / distanceFromCenter : 0;
            const dirY = distanceFromCenter > 0 ? star.y / distanceFromCenter : 0;
            
            // Calculate streak length based on speed and distance
            const baseStreakLength = 80 + warpSpeed * 30;
            const streakLength = baseStreakLength * perspective * (1 + distanceFromCenter / 800);
            
            // Star position (front of streak)
            streakPositions[i6] = star.x;
            streakPositions[i6 + 1] = star.y;
            streakPositions[i6 + 2] = star.z;
            
            // Streak tail (behind the star, radiating outward from center)
            streakPositions[i6 + 3] = star.x - dirX * streakLength;
            streakPositions[i6 + 4] = star.y - dirY * streakLength;
            streakPositions[i6 + 5] = star.z - streakLength * 0.2;
            
            // Twinkling effect
            star.twinkle += 0.02 + warpSpeed * 0.01;
            const twinkleIntensity = 0.7 + Math.sin(star.twinkle) * 0.3;
            
            // Color and brightness based on perspective and twinkle
            const intensity = star.brightness * twinkleIntensity * perspective * Math.min(2, 0.5 + warpSpeed / 8);
            const frontIntensity = intensity;
            const trailIntensity = intensity * 0.1; // Very dim trail
            
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
        for (let i = 0; i < config.brightStarCount; i++) {
            const star = brightStars[i];
            
            star.z += star.speed * warpSpeed * 0.6;
            
            if (star.z > 150) {
                star.z = -config.maxDistance - Math.random() * 1500;
                const newAngle = Math.random() * Math.PI * 2;
                const newRadius = Math.pow(Math.random(), 0.8) * 1500;
                star.x = Math.cos(newAngle) * newRadius;
                star.y = Math.sin(newAngle) * newRadius;
            }
            
            star.twinkle += 0.03;
            const twinkle = 0.8 + Math.sin(star.twinkle) * 0.2;
            const perspective = Math.max(0.1, 1 - (star.z + config.maxDistance) / (config.maxDistance * 2));
            
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
        for (let i = 0; i < config.dustParticleCount; i++) {
            const dust = dustParticles[i];
            
            dust.z += dust.speed * warpSpeed * 0.3;
            
            if (dust.z > 100) {
                dust.x = (Math.random() - 0.5) * 6000;
                dust.y = (Math.random() - 0.5) * 4000;
                dust.z = -config.maxDistance * 2;
            }
            
            dustPositions[i * 3] = dust.x;
            dustPositions[i * 3 + 1] = dust.y;
            dustPositions[i * 3 + 2] = dust.z;
        }
    }
    
    // Create streak lines
    streakGeometry.setAttribute('position', new THREE.BufferAttribute(streakPositions, 3));
    streakGeometry.setAttribute('color', new THREE.BufferAttribute(streakColors, 3));
    
    const streakMaterial = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 1.0,
        blending: THREE.AdditiveBlending,
        linewidth: isMobile ? 1 : 2
    });
    
    const starStreaks = new THREE.LineSegments(streakGeometry, streakMaterial);
    scene.add(starStreaks);
    spaceObjects.push(starStreaks);
    
    // Create bright point stars
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
    
    // === DARK SPACE BACKGROUND ===
    const backgroundGeometry = new THREE.SphereGeometry(5000, 32, 32);
    const backgroundMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color(0.01, 0.01, 0.02),
        side: THREE.BackSide
    });
    const spaceBackground = new THREE.Mesh(backgroundGeometry, backgroundMaterial);
    scene.add(spaceBackground);
    spaceObjects.push(spaceBackground);
    
    // Control functions
    function startWarp() {
        targetWarpSpeed = 8;
    }
    
    function stopWarp() {
        targetWarpSpeed = 2;
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
        
        // Update buffer attributes
        streakGeometry.attributes.position.needsUpdate = true;
        streakGeometry.attributes.color.needsUpdate = true;
        brightGeometry.attributes.position.needsUpdate = true;
        brightGeometry.attributes.color.needsUpdate = true;
        brightGeometry.attributes.size.needsUpdate = true;
        dustGeometry.attributes.position.needsUpdate = true;
        
        // Subtle camera movement for immersion
        if (camera.position) {
            camera.position.x = Math.sin(time * 0.1) * 2;
            camera.position.y = Math.cos(time * 0.07) * 1;
        }
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
        isMobile,
        // Expose star data for external manipulation if needed
        stars,
        brightStars,
        dustParticles,
        config
    };
}
