import * as THREE from '/birthday-site/libs/three.module.js';

/**
 * Enhanced Warp Speed Starfield - Exact Match to Reference Image
 * Creates the iconic radial star streak effect with bright central convergence
 * @param {THREE.Scene} scene - The Three.js scene
 * @param {THREE.Camera} camera - The camera
 * @returns {Object} - Space environment objects and animation functions
 */
export function initStarfield(scene, camera) {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    const starCount = isMobile ? 4000 : 8000;
    const brightStarCount = isMobile ? 300 : 600;
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
        const angle = (i / starCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.1; // Very slight randomness
        const radius = 15 + Math.pow(Math.random(), 0.2) * 1800; // Start very close to center
        
        const star = {
            angle: angle,
            baseRadius: radius,
            radius: radius,
            z: -Math.random() * maxDistance * 0.5, // Keep stars closer for visibility
            speed: 12 + Math.random() * 8, // Much faster for dramatic effect
            brightness: 0.4 + Math.random() * 0.6,
            streakLength: 300 + Math.random() * 1200, // Much longer streaks
            twinkle: Math.random() * Math.PI * 2,
            color: new THREE.Color(),
            originalBrightness: 0.4 + Math.random() * 0.6,
            thickness: 1 + Math.random() * 2
        };
        
        // Enhanced star colors matching reference image
        const colorType = Math.random();
        if (colorType < 0.45) {
            // Bright white/blue-white (most common in center)
            star.color.setRGB(0.95 + Math.random() * 0.05, 0.95 + Math.random() * 0.05, 1.0);
        } else if (colorType < 0.65) {
            // Pure brilliant white
            star.color.setRGB(1.0, 1.0, 1.0);
        } else if (colorType < 0.75) {
            // Cyan/blue
            star.color.setRGB(0.6 + Math.random() * 0.2, 0.8 + Math.random() * 0.2, 1.0);
        } else if (colorType < 0.88) {
            // Orange/yellow
            star.color.setRGB(1.0, 0.7 + Math.random() * 0.3, 0.3 + Math.random() * 0.4);
        } else {
            // Red
            star.color.setRGB(1.0, 0.3 + Math.random() * 0.4, 0.2 + Math.random() * 0.3);
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
        const radius = Math.pow(Math.random(), 0.3) * 1200;
        
        const brightStar = {
            angle: angle,
            baseRadius: radius,
            radius: radius,
            z: -Math.random() * maxDistance * 0.7,
            speed: 8 + Math.random() * 6,
            brightness: 0.9 + Math.random() * 0.1,
            twinkle: Math.random() * Math.PI * 2,
            color: new THREE.Color(),
            size: 3 + Math.random() * 8
        };
        
        // Bright star colors - more intense
        const brightType = Math.random();
        if (brightType < 0.35) {
            brightStar.color.setRGB(1.0, 1.0, 1.0); // Brilliant white
        } else if (brightType < 0.55) {
            brightStar.color.setRGB(0.8, 0.9, 1.0); // Blue-white
        } else if (brightType < 0.70) {
            brightStar.color.setRGB(0.7, 0.8, 1.0); // Cyan-blue
        } else if (brightType < 0.85) {
            brightStar.color.setRGB(1.0, 0.85, 0.6); // Golden yellow
        } else {
            brightStar.color.setRGB(1.0, 0.5, 0.2); // Orange-red
        }
        
        brightStars.push(brightStar);
    }
    
    // === ENHANCED CENTER BRIGHT CONVERGENCE POINT ===
    const centerGlowGeometry = new THREE.PlaneGeometry(400, 400);
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    // Create multiple layered glows for intense center
    ctx.clearRect(0, 0, 512, 512);
    
    // Outer glow
    const outerGlow = ctx.createRadialGradient(256, 256, 0, 256, 256, 250);
    outerGlow.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
    outerGlow.addColorStop(0.05, 'rgba(240, 250, 255, 0.95)');
    outerGlow.addColorStop(0.15, 'rgba(200, 230, 255, 0.8)');
    outerGlow.addColorStop(0.35, 'rgba(150, 200, 255, 0.5)');
    outerGlow.addColorStop(0.6, 'rgba(100, 150, 255, 0.2)');
    outerGlow.addColorStop(0.8, 'rgba(50, 100, 200, 0.1)');
    outerGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    ctx.fillStyle = outerGlow;
    ctx.fillRect(0, 0, 512, 512);
    
    // Inner intense core
    const innerGlow = ctx.createRadialGradient(256, 256, 0, 256, 256, 80);
    innerGlow.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
    innerGlow.addColorStop(0.3, 'rgba(255, 255, 255, 0.9)');
    innerGlow.addColorStop(0.7, 'rgba(200, 230, 255, 0.6)');
    innerGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = innerGlow;
    ctx.fillRect(0, 0, 512, 512);
    
    const glowTexture = new THREE.CanvasTexture(canvas);
    const glowMaterial = new THREE.MeshBasicMaterial({
        map: glowTexture,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending
    });
    
    const centerGlowMesh = new THREE.Mesh(centerGlowGeometry, glowMaterial);
    centerGlowMesh.position.z = -15;
    scene.add(centerGlowMesh);
    spaceObjects.push(centerGlowMesh);
    
    let warpSpeed = 12;
    let targetWarpSpeed = 12;
    let time = 0;
    
    function updateStarPositions() {
        // Update main star streaks - perfect radial from center
        for (let i = 0; i < starCount; i++) {
            const star = stars[i];
            const i6 = i * 6;
            
            // Update twinkle
            star.twinkle += 0.03 + Math.random() * 0.02;
            const twinkleIntensity = 0.7 + Math.sin(star.twinkle) * 0.3;
            
            // Move star outward from center
            star.radius += star.speed;
            
            // Reset if too far - keep cycling for continuous effect
            if (star.radius > 2200) {
                star.radius = 10 + Math.random() * 50;
                star.angle = (Math.random() * Math.PI * 2) + (Math.random() - 0.5) * 0.1;
                star.z = -Math.random() * maxDistance * 0.5;
                
                // Reassign color occasionally for variety
                if (Math.random() < 0.1) {
                    const colorType = Math.random();
                    if (colorType < 0.45) {
                        star.color.setRGB(0.95 + Math.random() * 0.05, 0.95 + Math.random() * 0.05, 1.0);
                    } else if (colorType < 0.65) {
                        star.color.setRGB(1.0, 1.0, 1.0);
                    } else if (colorType < 0.75) {
                        star.color.setRGB(0.6 + Math.random() * 0.2, 0.8 + Math.random() * 0.2, 1.0);
                    } else if (colorType < 0.88) {
                        star.color.setRGB(1.0, 0.7 + Math.random() * 0.3, 0.3 + Math.random() * 0.4);
                    } else {
                        star.color.setRGB(1.0, 0.3 + Math.random() * 0.4, 0.2 + Math.random() * 0.3);
                    }
                }
            }
            
            // Calculate position from center using angle and radius
            const x = Math.cos(star.angle) * star.radius;
            const y = Math.sin(star.angle) * star.radius;
            const z = star.z;
            
            // Calculate streak length based on distance from center - much longer
            const distanceFromCenter = star.radius;
            const baseStreakLength = star.streakLength * (1 + distanceFromCenter / 600);
            const speedMultiplier = Math.max(1, warpSpeed / 8);
            const streakLength = baseStreakLength * speedMultiplier;
            
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
            
            // Enhanced color intensity - much brighter near center
            const centerProximity = Math.max(0.05, 1200 / (star.radius + 50));
            const intensity = star.brightness * twinkleIntensity * centerProximity;
            
            // Much brighter front points for visibility
            const frontIntensity = Math.min(3.0, intensity * 4.0 * (1 + centerProximity));
            const trailIntensity = intensity * 0.05; // Very dim trails
            
            // Front point (very bright)
            streakColors[i6] = star.color.r * frontIntensity;
            streakColors[i6 + 1] = star.color.g * frontIntensity;
            streakColors[i6 + 2] = star.color.b * frontIntensity;
            
            // Trail point (very dim)
            streakColors[i6 + 3] = star.color.r * trailIntensity;
            streakColors[i6 + 4] = star.color.g * trailIntensity;
            streakColors[i6 + 5] = star.color.b * trailIntensity;
        }
        
        // Update bright point stars
        for (let i = 0; i < brightStarCount; i++) {
            const star = brightStars[i];
            
            star.twinkle += 0.04 + Math.random() * 0.02;
            const twinkle = 0.6 + Math.sin(star.twinkle) * 0.4;
            
            // Move outward from center
            star.radius += star.speed;
            
            if (star.radius > 1800) {
                star.radius = 8 + Math.random() * 40;
                star.angle = Math.random() * Math.PI * 2;
                star.z = -Math.random() * maxDistance * 0.6;
            }
            
            const x = Math.cos(star.angle) * star.radius;
            const y = Math.sin(star.angle) * star.radius;
            
            brightPositions[i * 3] = x;
            brightPositions[i * 3 + 1] = y;
            brightPositions[i * 3 + 2] = star.z;
            
            // Much brighter near center for the convergence effect
            const centerProximity = Math.max(0.1, 1000 / (star.radius + 30));
            const intensity = star.brightness * twinkle * centerProximity;
            
            brightColors[i * 3] = star.color.r * intensity * 2.0;
            brightColors[i * 3 + 1] = star.color.g * intensity * 2.0;
            brightColors[i * 3 + 2] = star.color.b * intensity * 2.0;
            
            brightSizes[i] = star.size * centerProximity * (1 + intensity);
        }
    }
    
    // Create streak lines with enhanced material
    streakGeometry.setAttribute('position', new THREE.BufferAttribute(streakPositions, 3));
    streakGeometry.setAttribute('color', new THREE.BufferAttribute(streakColors, 3));
    
    const streakMaterial = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 1.0,
        blending: THREE.AdditiveBlending,
        linewidth: isMobile ? 1.5 : 3 // Thicker lines for better visibility
    });
    
    const starStreaks = new THREE.LineSegments(streakGeometry, streakMaterial);
    scene.add(starStreaks);
    spaceObjects.push(starStreaks);
    
    // Create bright point stars with enhanced material
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
    
    // === ENHANCED DARK SPACE BACKGROUND ===
    const backgroundGeometry = new THREE.SphereGeometry(5000, 32, 32);
    const backgroundMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color(0.005, 0.005, 0.01), // Darker for better contrast
        side: THREE.BackSide
    });
    const spaceBackground = new THREE.Mesh(backgroundGeometry, backgroundMaterial);
    scene.add(spaceBackground);
    spaceObjects.push(spaceBackground);
    
    // === ADDITIONAL CENTER GLOW LAYERS ===
    // Secondary glow layer for extra intensity
    const secondaryGlowGeometry = new THREE.PlaneGeometry(600, 600);
    const canvas2 = document.createElement('canvas');
    canvas2.width = 256;
    canvas2.height = 256;
    const ctx2 = canvas2.getContext('2d');
    
    const secondaryGlow = ctx2.createRadialGradient(128, 128, 0, 128, 128, 120);
    secondaryGlow.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
    secondaryGlow.addColorStop(0.2, 'rgba(200, 230, 255, 0.2)');
    secondaryGlow.addColorStop(0.5, 'rgba(150, 200, 255, 0.1)');
    secondaryGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    ctx2.fillStyle = secondaryGlow;
    ctx2.fillRect(0, 0, 256, 256);
    
    const secondaryTexture = new THREE.CanvasTexture(canvas2);
    const secondaryMaterial = new THREE.MeshBasicMaterial({
        map: secondaryTexture,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });
    
    const secondaryGlowMesh = new THREE.Mesh(secondaryGlowGeometry, secondaryMaterial);
    secondaryGlowMesh.position.z = -25;
    scene.add(secondaryGlowMesh);
    spaceObjects.push(secondaryGlowMesh);
    
    // Control functions
    function startWarp() {
        targetWarpSpeed = 12;
    }
    
    function stopWarp() {
        targetWarpSpeed = 4;
    }
    
    function setWarpSpeed(speed) {
        warpSpeed = speed;
        targetWarpSpeed = speed;
    }
    
    // Main animation function
    function animate(deltaTime) {
        time += deltaTime * 0.001;
        
        // Smooth warp speed transitions
        warpSpeed += (targetWarpSpeed - warpSpeed) * 0.03;
        
        // Update all star speeds based on warp speed with more variation
        stars.forEach((star, index) => {
            const speedVariation = 1 + Math.sin(time * 2 + index * 0.1) * 0.2;
            star.speed = star.speed * 0.9 + (warpSpeed * speedVariation + Math.random() * 3) * 0.1;
        });
        
        brightStars.forEach((star, index) => {
            const speedVariation = 1 + Math.sin(time * 1.5 + index * 0.15) * 0.15;
            star.speed = star.speed * 0.9 + (warpSpeed * 0.7 * speedVariation + Math.random() * 2) * 0.1;
        });
        
        updateStarPositions();
        
        // Update buffer attributes
        streakGeometry.attributes.position.needsUpdate = true;
        streakGeometry.attributes.color.needsUpdate = true;
        brightGeometry.attributes.position.needsUpdate = true;
        brightGeometry.attributes.color.needsUpdate = true;
        brightGeometry.attributes.size.needsUpdate = true;
        
        // Enhanced center glow animation
        const pulse = Math.sin(time * 4) * 0.15 + Math.sin(time * 6) * 0.1;
        centerGlowMesh.material.opacity = 0.8 + pulse;
        centerGlowMesh.rotation.z += 0.003;
        
        // Animate secondary glow
        secondaryGlowMesh.material.opacity = 0.5 + Math.sin(time * 2.5) * 0.2;
        secondaryGlowMesh.rotation.z -= 0.002;
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
