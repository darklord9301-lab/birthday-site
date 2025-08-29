import * as THREE from '/birthday-site/libs/three.module.js';

/**
 * Epic HD Warp Speed Starfield - Cinema Quality Space Jump Effect
 * Creates a photorealistic warp speed effect with proper star streaking at speed 5
 * @param {THREE.Scene} scene - The Three.js scene
 * @param {THREE.Camera} camera - The camera
 * @returns {Object} - Space environment objects and animation functions
 */
export function initStarfield(scene, camera) {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    const starCount = isMobile ? 4000 : 8000;
    const brightStarCount = isMobile ? 300 : 600;
    const dustParticleCount = isMobile ? 1000 : 2000;
    const nebulaeCount = isMobile ? 4 : 8;
    const galaxyCount = isMobile ? 3 : 6;
    const maxDistance = 2500;
    
    const spaceObjects = [];
    const stars = [];
    const brightStars = [];
    
    // === MAIN WARP STREAKS (Line Segments for HD streaks) ===
    const streakGeometry = new THREE.BufferGeometry();
    const streakPositions = new Float32Array(starCount * 6); // 2 points per streak
    const streakColors = new Float32Array(starCount * 6);
    
    // Initialize main stars with realistic distribution
    for (let i = 0; i < starCount; i++) {
        // Create radial distribution like in the reference image
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.pow(Math.random(), 0.7) * 1500; // Power distribution for center clustering
        
        const star = {
            x: Math.cos(angle) * radius + (Math.random() - 0.5) * 200,
            y: Math.sin(angle) * radius * 0.7 + (Math.random() - 0.5) * 150,
            z: -maxDistance - Math.random() * 1500,
            speed: 4 + Math.random() * 2, // Individual speed variation around 5
            brightness: 0.4 + Math.random() * 0.6,
            streakLength: 150 + Math.random() * 400,
            twinkle: Math.random() * Math.PI * 2,
            color: new THREE.Color(),
            size: 1 + Math.random() * 3
        };
        
        // Realistic stellar color temperature distribution
        const temp = Math.random();
        if (temp < 0.03) {
            // Hot blue giants (rare, very bright)
            star.color.setRGB(0.6, 0.8, 1.0);
            star.brightness *= 2.0;
            star.size *= 1.8;
        } else if (temp < 0.08) {
            // Blue-white stars
            star.color.setRGB(0.8, 0.9, 1.0);
            star.brightness *= 1.6;
            star.size *= 1.4;
        } else if (temp < 0.25) {
            // White stars (like Vega)
            star.color.setRGB(1.0, 1.0, 1.0);
            star.brightness *= 1.3;
            star.size *= 1.2;
        } else if (temp < 0.45) {
            // Yellow-white (like our Sun)
            star.color.setRGB(1.0, 0.95, 0.7);
            star.brightness *= 1.1;
        } else if (temp < 0.7) {
            // Orange stars
            star.color.setRGB(1.0, 0.7, 0.4);
            star.brightness *= 0.95;
        } else {
            // Red dwarfs (most common)
            star.color.setRGB(1.0, 0.5, 0.2);
            star.brightness *= 0.8;
            star.size *= 0.8;
        }
        
        stars.push(star);
    }
    
    // === BRIGHT HERO STARS (Point sprites for intense glow) ===
    const brightGeometry = new THREE.BufferGeometry();
    const brightPositions = new Float32Array(brightStarCount * 3);
    const brightColors = new Float32Array(brightStarCount * 3);
    const brightSizes = new Float32Array(brightStarCount);
    
    for (let i = 0; i < brightStarCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.pow(Math.random(), 1.2) * 1200; // More center-focused
        
        const brightStar = {
            x: Math.cos(angle) * radius,
            y: Math.sin(angle) * radius * 0.6,
            z: -maxDistance - Math.random() * 1000,
            speed: 4.5 + Math.random() * 1,
            brightness: 0.8 + Math.random() * 0.2,
            twinkle: Math.random() * Math.PI * 2,
            color: new THREE.Color(),
            size: 4 + Math.random() * 8
        };
        
        // Hero star colors - more dramatic
        const heroType = Math.random();
        if (heroType < 0.2) {
            // Brilliant blue
            brightStar.color.setRGB(0.5, 0.8, 1.0);
        } else if (heroType < 0.4) {
            // Pure white
            brightStar.color.setRGB(1.0, 1.0, 1.0);
        } else if (heroType < 0.6) {
            // Golden yellow
            brightStar.color.setRGB(1.0, 0.9, 0.5);
        } else if (heroType < 0.8) {
            // Orange giant
            brightStar.color.setRGB(1.0, 0.6, 0.2);
        } else {
            // Red supergiant
            brightStar.color.setRGB(1.0, 0.4, 0.1);
        }
        
        brightStars.push(brightStar);
    }
    
    // === SPACE DUST FIELD ===
    const dustGeometry = new THREE.BufferGeometry();
    const dustPositions = new Float32Array(dustParticleCount * 3);
    const dustColors = new Float32Array(dustParticleCount * 3);
    const dustSizes = new Float32Array(dustParticleCount);
    const dustParticles = [];
    
    for (let i = 0; i < dustParticleCount; i++) {
        const dust = {
            x: (Math.random() - 0.5) * 8000,
            y: (Math.random() - 0.5) * 4000,
            z: -maxDistance - Math.random() * 3000,
            driftX: (Math.random() - 0.5) * 0.05,
            driftY: (Math.random() - 0.5) * 0.03,
            speed: 1 + Math.random() * 2,
            opacity: 0.2 + Math.random() * 0.4,
            twinkle: Math.random() * Math.PI * 2
        };
        
        // Cosmic dust colors
        const dustType = Math.random();
        let r, g, b;
        if (dustType < 0.3) {
            // Blue cosmic dust
            r = 0.4; g = 0.7; b = 1.0;
        } else if (dustType < 0.6) {
            // Orange nebula dust
            r = 1.0; g = 0.6; b = 0.3;
        } else if (dustType < 0.8) {
            // Purple space dust
            r = 0.8; g = 0.4; b = 1.0;
        } else {
            // White cosmic dust
            r = 0.9; g = 0.9; b = 0.9;
        }
        
        dustColors[i * 3] = r * dust.opacity;
        dustColors[i * 3 + 1] = g * dust.opacity;
        dustColors[i * 3 + 2] = b * dust.opacity;
        
        dustSizes[i] = 0.5 + Math.random() * 2;
        dustParticles.push(dust);
    }
    
    dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    dustGeometry.setAttribute('color', new THREE.BufferAttribute(dustColors, 3));
    dustGeometry.setAttribute('size', new THREE.BufferAttribute(dustSizes, 1));
    
    const dustMaterial = new THREE.PointsMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true
    });
    
    const spaceDust = new THREE.Points(dustGeometry, dustMaterial);
    scene.add(spaceDust);
    spaceObjects.push(spaceDust);
    
    // === DISTANT SPIRAL GALAXIES ===
    for (let g = 0; g < galaxyCount; g++) {
        const galaxyGeometry = new THREE.RingGeometry(80, 300, 64);
        const galaxyMaterial = new THREE.MeshBasicMaterial({
            color: new THREE.Color().setHSL(0.6 + Math.random() * 0.4, 0.8, 0.4),
            transparent: true,
            opacity: 0.08,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending
        });
        
        const galaxy = new THREE.Mesh(galaxyGeometry, galaxyMaterial);
        galaxy.position.set(
            (Math.random() - 0.5) * 12000,
            (Math.random() - 0.5) * 6000,
            -2000 - Math.random() * 4000
        );
        galaxy.rotation.x = Math.random() * Math.PI;
        galaxy.rotation.y = Math.random() * Math.PI;
        galaxy.rotation.z = Math.random() * Math.PI;
        
        scene.add(galaxy);
        spaceObjects.push(galaxy);
    }
    
    // === COLORFUL NEBULAE CLOUDS ===
    for (let n = 0; n < nebulaeCount; n++) {
        const nebulaGeometry = new THREE.PlaneGeometry(1200, 900);
        
        // Create high-detail nebula texture
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        
        // Multiple gradient layers for realistic nebula
        const gradient1 = ctx.createRadialGradient(256, 256, 0, 256, 256, 200);
        const hue1 = Math.random() * 360;
        gradient1.addColorStop(0, `hsla(${hue1}, 90%, 70%, 0.6)`);
        gradient1.addColorStop(0.4, `hsla(${hue1 + 40}, 80%, 60%, 0.3)`);
        gradient1.addColorStop(0.8, `hsla(${hue1 - 40}, 70%, 50%, 0.1)`);
        gradient1.addColorStop(1, 'hsla(0, 0%, 0%, 0)');
        
        ctx.fillStyle = gradient1;
        ctx.fillRect(0, 0, 512, 512);
        
        // Add wispy details
        const gradient2 = ctx.createRadialGradient(200, 300, 0, 200, 300, 150);
        const hue2 = (hue1 + 120) % 360;
        gradient2.addColorStop(0, `hsla(${hue2}, 100%, 60%, 0.4)`);
        gradient2.addColorStop(0.6, `hsla(${hue2}, 80%, 50%, 0.2)`);
        gradient2.addColorStop(1, 'hsla(0, 0%, 0%, 0)');
        
        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = gradient2;
        ctx.fillRect(0, 0, 512, 512);
        
        const nebulaTexture = new THREE.CanvasTexture(canvas);
        
        const nebulaMaterial = new THREE.MeshBasicMaterial({
            map: nebulaTexture,
            transparent: true,
            opacity: 0.25,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide
        });
        
        const nebula = new THREE.Mesh(nebulaGeometry, nebulaMaterial);
        nebula.position.set(
            (Math.random() - 0.5) * 8000,
            (Math.random() - 0.5) * 4000,
            -1500 - Math.random() * 4000
        );
        nebula.rotation.z = Math.random() * Math.PI * 2;
        
        scene.add(nebula);
        spaceObjects.push(nebula);
    }
    
    // === DEEP SPACE BACKGROUND ===
    const backgroundGeometry = new THREE.SphereGeometry(8000, 32, 32);
    const backgroundMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color(0.02, 0.02, 0.08),
        transparent: true,
        opacity: 0.3,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending
    });
    const spaceBackground = new THREE.Mesh(backgroundGeometry, backgroundMaterial);
    scene.add(spaceBackground);
    spaceObjects.push(spaceBackground);
    
    let warpSpeed = 5;
    let targetWarpSpeed = 5;
    let isWarping = true;
    let time = 0;
    
    function updateStarPositions() {
        // Update main star streaks
        for (let i = 0; i < starCount; i++) {
            const star = stars[i];
            const i6 = i * 6;
            
            // Update twinkle
            star.twinkle += 0.03;
            const twinkleIntensity = 0.7 + Math.sin(star.twinkle) * 0.3;
            
            // Move star towards camera
            star.z += star.speed;
            
            // Reset if too close
            if (star.z > 100) {
                const angle = Math.random() * Math.PI * 2;
                const radius = 100 + Math.random() * 2000;
                star.x = Math.cos(angle) * radius + (Math.random() - 0.5) * 500;
                star.y = Math.sin(angle) * radius * 0.6 + (Math.random() - 0.5) * 300;
                star.z = -maxDistance - Math.random() * 1500;
            }
            
            // Calculate streak effect - longer streaks for distant stars
            const distanceFromCenter = Math.sqrt(star.x * star.x + star.y * star.y);
            const perspectiveFactor = Math.max(0.1, (-star.z) / maxDistance);
            const dynamicStreakLength = star.streakLength * perspectiveFactor * (1 + distanceFromCenter / 1000);
            
            // Direction vector from center
            const dirX = star.x / Math.max(1, distanceFromCenter);
            const dirY = star.y / Math.max(1, distanceFromCenter);
            
            // Front point of streak (star position)
            streakPositions[i6] = star.x;
            streakPositions[i6 + 1] = star.y;
            streakPositions[i6 + 2] = star.z;
            
            // Back point of streak (trail)
            streakPositions[i6 + 3] = star.x - dirX * dynamicStreakLength;
            streakPositions[i6 + 4] = star.y - dirY * dynamicStreakLength;
            streakPositions[i6 + 5] = star.z - dynamicStreakLength * 0.3;
            
            // Color intensity based on distance and brightness
            const intensity = star.brightness * twinkleIntensity * perspectiveFactor;
            const frontIntensity = intensity * (1.5 + warpSpeed / 10);
            const trailIntensity = frontIntensity * 0.2;
            
            // Front point (bright)
            streakColors[i6] = star.color.r * frontIntensity;
            streakColors[i6 + 1] = star.color.g * frontIntensity;
            streakColors[i6 + 2] = star.color.b * frontIntensity;
            
            // Trail point (dim)
            streakColors[i6 + 3] = star.color.r * trailIntensity;
            streakColors[i6 + 4] = star.color.g * trailIntensity;
            streakColors[i6 + 5] = star.color.b * trailIntensity;
        }
        
        // Update bright star positions
        for (let i = 0; i < brightStarCount; i++) {
            const star = brightStars[i];
            
            star.twinkle += 0.04;
            const twinkle = 0.8 + Math.sin(star.twinkle) * 0.2;
            
            star.z += star.speed;
            
            if (star.z > 50) {
                const angle = Math.random() * Math.PI * 2;
                const radius = Math.pow(Math.random(), 1.2) * 1200;
                star.x = Math.cos(angle) * radius;
                star.y = Math.sin(angle) * radius * 0.6;
                star.z = -maxDistance - Math.random() * 800;
            }
            
            brightPositions[i * 3] = star.x;
            brightPositions[i * 3 + 1] = star.y;
            brightPositions[i * 3 + 2] = star.z;
            
            const perspective = Math.max(0.1, (-star.z + 100) / maxDistance);
            const intensity = star.brightness * twinkle * perspective;
            
            brightColors[i * 3] = star.color.r * intensity;
            brightColors[i * 3 + 1] = star.color.g * intensity;
            brightColors[i * 3 + 2] = star.color.b * intensity;
            
            brightSizes[i] = star.size * perspective * (1 + intensity * 0.5);
        }
        
        // Update space dust
        for (let i = 0; i < dustParticleCount; i++) {
            const dust = dustParticles[i];
            
            dust.x += dust.driftX;
            dust.y += dust.driftY;
            dust.z += dust.speed;
            
            if (dust.z > 100) {
                dust.x = (Math.random() - 0.5) * 8000;
                dust.y = (Math.random() - 0.5) * 4000;
                dust.z = -maxDistance * 2;
            }
            
            dustPositions[i * 3] = dust.x;
            dustPositions[i * 3 + 1] = dust.y;
            dustPositions[i * 3 + 2] = dust.z;
        }
    }
    
    // Create geometries and materials
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
    
    // Bright stars setup
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
    
    // === CENTER GLOW EFFECT ===
    const glowGeometry = new THREE.PlaneGeometry(400, 400);
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    const centerGlow = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    centerGlow.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
    centerGlow.addColorStop(0.3, 'rgba(200, 230, 255, 0.4)');
    centerGlow.addColorStop(0.7, 'rgba(100, 150, 255, 0.2)');
    centerGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    ctx.fillStyle = centerGlow;
    ctx.fillRect(0, 0, 256, 256);
    
    const glowTexture = new THREE.CanvasTexture(canvas);
    const glowMaterial = new THREE.MeshBasicMaterial({
        map: glowTexture,
        transparent: true,
        opacity: 0.3,
        blending: THREE.AdditiveBlending
    });
    
    const centerGlowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
    centerGlowMesh.position.z = -50;
    scene.add(centerGlowMesh);
    spaceObjects.push(centerGlowMesh);
    
    // Control functions
    function startWarp() {
        isWarping = true;
        targetWarpSpeed = 5;
    }
    
    function stopWarp() {
        isWarping = false;
        targetWarpSpeed = 5;
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
        
        // Animate galaxies
        spaceObjects.forEach((obj, index) => {
            if (obj.geometry && obj.geometry.type === 'RingGeometry') {
                obj.rotation.z += 0.0008;
                obj.rotation.x += 0.0004;
            }
        });
        
        // Animate nebulae
        spaceObjects.forEach((obj, index) => {
            if (obj.geometry && obj.geometry.type === 'PlaneGeometry' && obj !== centerGlowMesh) {
                obj.rotation.z += 0.0002;
                obj.material.opacity = 0.2 + Math.sin(time * 0.5 + index) * 0.05;
            }
        });
        
        // Center glow pulse
        centerGlowMesh.material.opacity = 0.25 + Math.sin(time * 2) * 0.05;
        centerGlowMesh.rotation.z += 0.001;
        
        // Background pulse
        spaceBackground.material.opacity = 0.25 + Math.sin(time * 0.3) * 0.05;
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
