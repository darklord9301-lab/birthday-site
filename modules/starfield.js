import * as THREE from '/birthday-site/libs/three.module.js';

/**
 * Epic Space Environment - Vibrant Starfield with Galaxies, Nebulae & Space Dust
 * Creates an immersive cosmic experience with multiple space elements
 * @param {THREE.Scene} scene - The Three.js scene
 * @param {THREE.Camera} camera - The camera
 * @returns {Object} - Space environment objects and animation functions
 */
export function initStarfield(scene, camera) {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    const starCount = isMobile ? 2000 : 4000;
    const dustParticleCount = isMobile ? 800 : 1500;
    const nebulaeCount = isMobile ? 3 : 6;
    const galaxyCount = isMobile ? 2 : 4;
    const maxDistance = 2000;
    
    const spaceObjects = [];
    
    // === MAIN STARFIELD ===
    const stars = [];
    const starGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 6);
    const colors = new Float32Array(starCount * 6);
    
    for (let i = 0; i < starCount; i++) {
        const star = {
            x: (Math.random() - 0.5) * 4000,
            y: (Math.random() - 0.5) * 2000, 
            z: (Math.random() - 0.5) * 4000,
            prevX: 0,
            prevY: 0,
            prevZ: 0,
            color: new THREE.Color(),
            brightness: 0.6 + Math.random() * 0.4,
            twinkle: Math.random() * Math.PI * 2
        };
        
        star.prevX = star.x;
        star.prevY = star.y;
        star.prevZ = star.z;
        
        // Enhanced stellar colors based on real star types
        const colorType = Math.random();
        if (colorType < 0.1) {
            // Blue giants
            star.color.setRGB(0.4, 0.8, 1.0);
        } else if (colorType < 0.2) {
            // Electric blue
            star.color.setRGB(0.2, 0.9, 1.0);
        } else if (colorType < 0.35) {
            // Brilliant white
            star.color.setRGB(1.0, 1.0, 1.0);
        } else if (colorType < 0.5) {
            // Warm orange (like our sun)
            star.color.setRGB(1.0, 0.7, 0.3);
        } else if (colorType < 0.65) {
            // Red giants
            star.color.setRGB(1.0, 0.4, 0.2);
        } else if (colorType < 0.8) {
            // Purple/magenta
            star.color.setRGB(0.9, 0.3, 1.0);
        } else if (colorType < 0.9) {
            // Golden yellow
            star.color.setRGB(1.0, 0.9, 0.4);
        } else {
            // Pink/rose
            star.color.setRGB(1.0, 0.6, 0.8);
        }
        
        stars.push(star);
    }
    
    // === SPACE DUST PARTICLES ===
    const dustGeometry = new THREE.BufferGeometry();
    const dustPositions = new Float32Array(dustParticleCount * 3);
    const dustColors = new Float32Array(dustParticleCount * 3);
    const dustSizes = new Float32Array(dustParticleCount);
    const dustParticles = [];
    
    for (let i = 0; i < dustParticleCount; i++) {
        const dust = {
            x: (Math.random() - 0.5) * 6000,
            y: (Math.random() - 0.5) * 3000,
            z: (Math.random() - 0.5) * 6000,
            driftX: (Math.random() - 0.5) * 0.1,
            driftY: (Math.random() - 0.5) * 0.05,
            opacity: 0.3 + Math.random() * 0.4
        };
        
        dustPositions[i * 3] = dust.x;
        dustPositions[i * 3 + 1] = dust.y;
        dustPositions[i * 3 + 2] = dust.z;
        
        // Subtle dust colors - cosmic dust tones
        const dustType = Math.random();
        if (dustType < 0.3) {
            // Blue cosmic dust
            dustColors[i * 3] = 0.3 * dust.opacity;
            dustColors[i * 3 + 1] = 0.6 * dust.opacity;
            dustColors[i * 3 + 2] = 0.9 * dust.opacity;
        } else if (dustType < 0.6) {
            // Orange/brown cosmic dust
            dustColors[i * 3] = 0.7 * dust.opacity;
            dustColors[i * 3 + 1] = 0.4 * dust.opacity;
            dustColors[i * 3 + 2] = 0.2 * dust.opacity;
        } else {
            // Purple nebula dust
            dustColors[i * 3] = 0.6 * dust.opacity;
            dustColors[i * 3 + 1] = 0.3 * dust.opacity;
            dustColors[i * 3 + 2] = 0.8 * dust.opacity;
        }
        
        dustSizes[i] = 1 + Math.random() * 2;
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
    
    // === DISTANT GALAXIES ===
    for (let g = 0; g < galaxyCount; g++) {
        const galaxyGeometry = new THREE.RingGeometry(50, 200, 32);
        const galaxyMaterial = new THREE.MeshBasicMaterial({
            color: new THREE.Color().setHSL(Math.random(), 0.7, 0.3),
            transparent: true,
            opacity: 0.15,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending
        });
        
        const galaxy = new THREE.Mesh(galaxyGeometry, galaxyMaterial);
        galaxy.position.set(
            (Math.random() - 0.5) * 8000,
            (Math.random() - 0.5) * 4000,
            -1000 - Math.random() * 2000
        );
        galaxy.rotation.x = Math.random() * Math.PI;
        galaxy.rotation.y = Math.random() * Math.PI;
        galaxy.rotation.z = Math.random() * Math.PI;
        
        scene.add(galaxy);
        spaceObjects.push(galaxy);
    }
    
    // === COLORFUL NEBULAE ===
    for (let n = 0; n < nebulaeCount; n++) {
        const nebulaeGeometry = new THREE.PlaneGeometry(800, 600);
        
        // Create nebulae texture with gradient
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        
        // Create radial gradient for nebula effect
        const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
        const hue = Math.random() * 360;
        gradient.addColorStop(0, `hsla(${hue}, 80%, 60%, 0.8)`);
        gradient.addColorStop(0.3, `hsla(${hue + 30}, 70%, 50%, 0.4)`);
        gradient.addColorStop(0.7, `hsla(${hue - 30}, 60%, 40%, 0.2)`);
        gradient.addColorStop(1, 'hsla(0, 0%, 0%, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 256, 256);
        
        const nebulaTexture = new THREE.CanvasTexture(canvas);
        
        const nebulaMaterial = new THREE.MeshBasicMaterial({
            map: nebulaTexture,
            transparent: true,
            opacity: 0.3,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide
        });
        
        const nebula = new THREE.Mesh(nebulaeGeometry, nebulaMaterial);
        nebula.position.set(
            (Math.random() - 0.5) * 6000,
            (Math.random() - 0.5) * 3000,
            -800 - Math.random() * 3000
        );
        nebula.rotation.z = Math.random() * Math.PI * 2;
        
        scene.add(nebula);
        spaceObjects.push(nebula);
    }
    
    // Constant warp speed parameters
    let warpSpeed = 3; // Even slower for better aesthetics
    let targetWarpSpeed = 3;
    let isWarping = true;
    
    function updateStarPositions() {
        for (let i = 0; i < starCount; i++) {
            const star = stars[i];
            const i6 = i * 6;
            
            // Update twinkle effect
            star.twinkle += 0.02;
            const twinkleIntensity = 0.8 + Math.sin(star.twinkle) * 0.2;
            
            // Store previous position
            star.prevX = star.x;
            star.prevY = star.y;
            star.prevZ = star.z;
            
            // Move star towards camera
            star.z += warpSpeed;
            
            // Reset star position
            if (star.z > 200) {
                star.x = (Math.random() - 0.5) * 4000;
                star.y = (Math.random() - 0.5) * 2000;
                star.z = -maxDistance;
                star.prevX = star.x;
                star.prevY = star.y;
                star.prevZ = star.z;
            }
            
            // Calculate distance and perspective
            const distance = Math.sqrt(star.x * star.x + star.y * star.y);
            const perspective = Math.max(0.1, (star.z + maxDistance) / maxDistance);
            
            // Current position
            positions[i6] = star.x;
            positions[i6 + 1] = star.y;
            positions[i6 + 2] = star.z;
            
            // Trail position - longer trails for slower speed
            const trailLength = Math.min(warpSpeed * 15, 300);
            const trailX = star.x - (star.x / distance) * trailLength * perspective;
            const trailY = star.y - (star.y / distance) * trailLength * perspective;
            const trailZ = star.z - trailLength;
            
            positions[i6 + 3] = isNaN(trailX) ? star.x : trailX;
            positions[i6 + 4] = isNaN(trailY) ? star.y : trailY;
            positions[i6 + 5] = trailZ;
            
            // Enhanced colors with twinkling
            const intensity = (1.2 + warpSpeed / 10) * star.brightness * twinkleIntensity;
            
            // Front point
            colors[i6] = star.color.r * intensity;
            colors[i6 + 1] = star.color.g * intensity;
            colors[i6 + 2] = star.color.b * intensity;
            
            // Trail point
            const trailIntensity = intensity * 0.7;
            colors[i6 + 3] = star.color.r * trailIntensity;
            colors[i6 + 4] = star.color.g * trailIntensity;
            colors[i6 + 5] = star.color.b * trailIntensity;
        }
        
        // Update space dust positions
        for (let i = 0; i < dustParticleCount; i++) {
            const dust = dustParticles[i];
            
            dust.x += dust.driftX;
            dust.y += dust.driftY;
            dust.z += warpSpeed * 0.3; // Dust moves slower than stars
            
            if (dust.z > 200) {
                dust.x = (Math.random() - 0.5) * 6000;
                dust.y = (Math.random() - 0.5) * 3000;
                dust.z = -maxDistance * 2;
            }
            
            dustPositions[i * 3] = dust.x;
            dustPositions[i * 3 + 1] = dust.y;
            dustPositions[i * 3 + 2] = dust.z;
        }
        
        dustGeometry.attributes.position.needsUpdate = true;
    }
    
    // Create main starfield
    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const starMaterial = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 1.0,
        blending: THREE.AdditiveBlending,
        linewidth: 2
    });
    
    const starField = new THREE.LineSegments(starGeometry, starMaterial);
    scene.add(starField);
    spaceObjects.push(starField);
    
    // === BRIGHT CENTER STARS (Different sizes and intensities) ===
    const centerStarCount = 400;
    const centerGeometry = new THREE.BufferGeometry();
    const centerPositions = new Float32Array(centerStarCount * 3);
    const centerColors = new Float32Array(centerStarCount * 3);
    const centerSizes = new Float32Array(centerStarCount);
    
    for (let i = 0; i < centerStarCount; i++) {
        centerPositions[i * 3] = (Math.random() - 0.5) * 1200;
        centerPositions[i * 3 + 1] = (Math.random() - 0.5) * 600;
        centerPositions[i * 3 + 2] = (Math.random() - 0.5) * 1200;
        
        // Stellar classification colors
        const starType = Math.random();
        let r, g, b;
        if (starType < 0.15) {
            // O-type (blue)
            r = 0.6; g = 0.8; b = 1.0;
        } else if (starType < 0.25) {
            // B-type (blue-white)
            r = 0.8; g = 0.9; b = 1.0;
        } else if (starType < 0.4) {
            // A-type (white)
            r = 1.0; g = 1.0; b = 1.0;
        } else if (starType < 0.55) {
            // F-type (yellow-white)
            r = 1.0; g = 1.0; b = 0.8;
        } else if (starType < 0.7) {
            // G-type (yellow like our Sun)
            r = 1.0; g = 0.9; b = 0.6;
        } else if (starType < 0.85) {
            // K-type (orange)
            r = 1.0; g = 0.7; b = 0.4;
        } else {
            // M-type (red)
            r = 1.0; g = 0.5; b = 0.3;
        }
        
        const brightness = 0.8 + Math.random() * 0.2;
        centerColors[i * 3] = r * brightness;
        centerColors[i * 3 + 1] = g * brightness;
        centerColors[i * 3 + 2] = b * brightness;
        
        centerSizes[i] = 2 + Math.random() * 5;
    }
    
    centerGeometry.setAttribute('position', new THREE.BufferAttribute(centerPositions, 3));
    centerGeometry.setAttribute('color', new THREE.BufferAttribute(centerColors, 3));
    centerGeometry.setAttribute('size', new THREE.BufferAttribute(centerSizes, 1));
    
    const centerMaterial = new THREE.PointsMaterial({
        vertexColors: true,
        sizeAttenuation: false,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending
    });
    
    const centerStars = new THREE.Points(centerGeometry, centerMaterial);
    scene.add(centerStars);
    spaceObjects.push(centerStars);
    
    // === COSMIC BACKGROUND GLOW ===
    const glowGeometry = new THREE.SphereGeometry(5000, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color(0.05, 0.05, 0.15),
        transparent: true,
        opacity: 0.1,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending
    });
    const cosmicGlow = new THREE.Mesh(glowGeometry, glowMaterial);
    scene.add(cosmicGlow);
    spaceObjects.push(cosmicGlow);
    
    // Animation variables
    let time = 0;
    
    // Control functions
    function startWarp() {
        isWarping = true;
        warpSpeed = 3;
    }
    
    function stopWarp() {
        isWarping = false;
        warpSpeed = 3;
    }
    
    function setWarpSpeed(speed) {
        warpSpeed = speed;
        targetWarpSpeed = speed;
    }
    
    // Main animation function
    function animate(deltaTime) {
        time += deltaTime * 0.001;
        
        updateStarPositions();
        
        // Update main starfield
        starGeometry.attributes.position.needsUpdate = true;
        starGeometry.attributes.color.needsUpdate = true;
        
        // Animate galaxies - slow rotation
        spaceObjects.forEach((obj, index) => {
            if (obj.geometry && obj.geometry.type === 'RingGeometry') {
                obj.rotation.z += 0.001;
                obj.rotation.x += 0.0005;
            }
        });
        
        // Animate nebulae - gentle drift and pulse
        spaceObjects.forEach((obj, index) => {
            if (obj.geometry && obj.geometry.type === 'PlaneGeometry') {
                obj.rotation.z += 0.0003;
                obj.material.opacity = 0.2 + Math.sin(time + index) * 0.1;
            }
        });
        
        // Gentle starfield rotation
        starField.rotation.z += 0.0003;
        
        // Cosmic glow pulse
        cosmicGlow.material.opacity = 0.08 + Math.sin(time * 0.5) * 0.02;
        cosmicGlow.material.color.setRGB(
            0.05 + Math.sin(time * 0.3) * 0.02,
            0.05 + Math.sin(time * 0.4) * 0.02,
            0.15 + Math.sin(time * 0.2) * 0.03
        );
    }
    
    function dispose() {
        spaceObjects.forEach(obj => {
            scene.remove(obj);
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) obj.material.dispose();
        });
        starGeometry.dispose();
        starMaterial.dispose();
        dustGeometry.dispose();
        dustMaterial.dispose();
    }
    
    return {
        starField,
        centerStars,
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
