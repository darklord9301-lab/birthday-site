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
    
    const starCount = isMobile ? 3000 : 6000;
    const brightStarCount = isMobile ? 200 : 400;
    const maxDistance = 3000;
    
    const spaceObjects = [];
    const stars = [];
    const brightStars = [];
    
    // === MAIN WARP STREAKS (Perfect radial lines) ===
    const streakGeometry = new THREE.BufferGeometry();
    const streakPositions = new Float32Array(starCount * 6); // 2 points per streak
    const streakColors = new Float32Array(streakPositions.length);
    
    // Initialize stars in perfect radial pattern
    for (let i = 0; i < starCount; i++) {
        // Create perfect radial distribution from center point
        const angle = (i / starCount) * Math.PI * 2 + Math.random() * 0.3; // Slight randomness
        const radius = 50 + Math.pow(Math.random(), 0.3) * 2000; // Start close to center
        
        const star = {
            angle: angle,
            baseRadius: radius,
            radius: radius,
            z: -Math.random() * maxDistance,
            speed: 8 + Math.random() * 4, // Faster for dramatic effect
            brightness: 0.3 + Math.random() * 0.7,
            streakLength: 200 + Math.random() * 800,
            twinkle: Math.random() * Math.PI * 2,
            color: new THREE.Color(),
            originalBrightness: 0.3 + Math.random() * 0.7
        };
        
        // Classic star colors - mostly white/blue with some variety
        const colorType = Math.random();
        if (colorType < 0.6) {
            // White/blue-white (most common)
            star.color.setRGB(0.9 + Math.random() * 0.1, 0.9 + Math.random() * 0.1, 1.0);
        } else if (colorType < 0.8) {
            // Pure white
            star.color.setRGB(1.0, 1.0, 1.0);
        } else if (colorType < 0.9) {
            // Orange/yellow
            star.color.setRGB(1.0, 0.8 + Math.random() * 0.2, 0.4 + Math.random() * 0.3);
        } else {
            // Red
            star.color.setRGB(1.0, 0.4 + Math.random() * 0.3, 0.2 + Math.random() * 0.2);
        }
        
        stars.push(star);
    }
    
    // === BRIGHT POINT STARS ===
    const brightGeometry = new THREE.BufferGeometry();
    const brightPositions = new Float32Array(brightStarCount * 3);
    const brightColors = new Float32Array(brightStarCount * 3);
    const brightSizes = new Float32Array(brightStarCount);
    
    for (let i = 0; i < brightStarCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.pow(Math.random(), 0.5) * 1500;
        
        const brightStar = {
            angle: angle,
            baseRadius: radius,
            radius: radius,
            z: -Math.random() * maxDistance,
            speed: 6 + Math.random() * 3,
            brightness: 0.8 + Math.random() * 0.2,
            twinkle: Math.random() * Math.PI * 2,
            color: new THREE.Color(),
            size: 2 + Math.random() * 6
        };
        
        // Bright star colors
        const brightType = Math.random();
        if (brightType < 0.4) {
            brightStar.color.setRGB(1.0, 1.0, 1.0); // White
        } else if (brightType < 0.7) {
            brightStar.color.setRGB(0.8, 0.9, 1.0); // Blue-white
        } else if (brightType < 0.85) {
            brightStar.color.setRGB(1.0, 0.9, 0.7); // Yellow
        } else {
            brightStar.color.setRGB(1.0, 0.6, 0.3); // Orange
        }
        
        brightStars.push(brightStar);
    }
    
    // === CENTER BRIGHT CONVERGENCE POINT ===
    const centerGlowGeometry = new THREE.PlaneGeometry(300, 300);
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    // Create intense center glow
    const centerGlow = ctx.createRadialGradient(128, 128, 0, 128, 128, 120);
    centerGlow.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
    centerGlow.addColorStop(0.1, 'rgba(220, 240, 255, 0.9)');
    centerGlow.addColorStop(0.3, 'rgba(180, 220, 255, 0.6)');
    centerGlow.addColorStop(0.6, 'rgba(120, 180, 255, 0.3)');
    centerGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    ctx.fillStyle = centerGlow;
    ctx.fillRect(0, 0, 256, 256);
    
    const glowTexture = new THREE.CanvasTexture(canvas);
    const glowMaterial = new THREE.MeshBasicMaterial({
        map: glowTexture,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });
    
    const centerGlowMesh = new THREE.Mesh(centerGlowGeometry, glowMaterial);
    centerGlowMesh.position.z = -20;
    scene.add(centerGlowMesh);
    spaceObjects.push(centerGlowMesh);
    
    let warpSpeed = 8;
    let targetWarpSpeed = 8;
    let time = 0;
    
    function updateStarPositions() {
        // Update main star streaks - perfect radial from center
        for (let i = 0; i < starCount; i++) {
            const star = stars[i];
            const i6 = i * 6;
            
            // Update twinkle
            star.twinkle += 0.02;
            const twinkleIntensity = 0.8 + Math.sin(star.twinkle) * 0.2;
            
            // Move star outward from center
            star.radius += star.speed;
            
            // Reset if too far
            if (star.radius > 2500) {
                star.radius = 30 + Math.random() * 100;
                star.angle = Math.random() * Math.PI * 2;
                star.z = -Math.random() * maxDistance;
            }
            
            // Calculate position from center using angle and radius
            const x = Math.cos(star.angle) * star.radius;
            const y = Math.sin(star.angle) * star.radius;
            const z = star.z;
            
            // Calculate streak length based on distance from center
            const distanceFromCenter = star.radius;
            const streakLength = star.streakLength * (1 + distanceFromCenter / 1000) * (warpSpeed / 5);
            
            // Direction vector (pointing away from center)
            const dirX = Math.cos(star.angle);
            const dirY = Math.sin(star.angle);
            
            // Front point of streak (star position)
            streakPositions[i6] = x;
            streakPositions[i6 + 1] = y;
            streakPositions[i6 + 2] = z;
            
            // Back point of streak (trail pointing toward center)
            streakPositions[i6 + 3] = x - dirX * streakLength;
            streakPositions[i6 + 4] = y - dirY * streakLength;
            streakPositions[i6 + 5] = z;
            
            // Color intensity - brighter near center, dimmer at edges
            const centerProximity = Math.max(0.1, 1000 / (star.radius + 100));
            const intensity = star.brightness * twinkleIntensity * centerProximity;
            const frontIntensity = intensity * 2.0;
            const trailIntensity = intensity * 0.1;
            
            // Front point (bright)
            streakColors[i6] = star.color.r * frontIntensity;
            streakColors[i6 + 1] = star.color.g * frontIntensity;
            streakColors[i6 + 2] = star.color.b * frontIntensity;
            
            // Trail point (dim)
            streakColors[i6 + 3] = star.color.r * trailIntensity;
            streakColors[i6 + 4] = star.color.g * trailIntensity;
            streakColors[i6 + 5] = star.color.b * trailIntensity;
        }
        
        // Update bright point stars
        for (let i = 0; i < brightStarCount; i++) {
            const star = brightStars[i];
            
            star.twinkle += 0.03;
            const twinkle = 0.7 + Math.sin(star.twinkle) * 0.3;
            
            // Move outward from center
            star.radius += star.speed;
            
            if (star.radius > 2000) {
                star.radius = 20 + Math.random() * 80;
                star.angle = Math.random() * Math.PI * 2;
                star.z = -Math.random() * maxDistance;
            }
            
            const x = Math.cos(star.angle) * star.radius;
            const y = Math.sin(star.angle) * star.radius;
            
            brightPositions[i * 3] = x;
            brightPositions[i * 3 + 1] = y;
            brightPositions[i * 3 + 2] = star.z;
            
            // Brighter near center
            const centerProximity = Math.max(0.2, 800 / (star.radius + 50));
            const intensity = star.brightness * twinkle * centerProximity;
            
            brightColors[i * 3] = star.color.r * intensity;
            brightColors[i * 3 + 1] = star.color.g * intensity;
            brightColors[i * 3 + 2] = star.color.b * intensity;
            
            brightSizes[i] = star.size * centerProximity * (1 + intensity * 0.5);
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
        
        // Update all star speeds based on warp speed
        stars.forEach(star => {
            star.speed = star.speed * 0.9 + (warpSpeed + Math.random() * 2) * 0.1;
        });
        
        brightStars.forEach(star => {
            star.speed = star.speed * 0.9 + (warpSpeed * 0.8 + Math.random() * 1) * 0.1;
        });
        
        updateStarPositions();
        
        // Update buffer attributes
        streakGeometry.attributes.position.needsUpdate = true;
        streakGeometry.attributes.color.needsUpdate = true;
        brightGeometry.attributes.position.needsUpdate = true;
        brightGeometry.attributes.color.needsUpdate = true;
        brightGeometry.attributes.size.needsUpdate = true;
        
        // Animate center glow intensity
        centerGlowMesh.material.opacity = 0.7 + Math.sin(time * 3) * 0.2;
        centerGlowMesh.rotation.z += 0.002;
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
