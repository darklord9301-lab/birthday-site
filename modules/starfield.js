import * as THREE from '/birthday-site/libs/three.module.js';


// starfield.js - Exact Starfield Warp Effect
// Extracted and configured for warp speed 2.5 and 4000 stars

class StarfieldWarpEffect {
    constructor(container) {
        this.container = container;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.animationId = null;
        this.stars = [];
        this.starStreaks = null;
        this.brightPoints = null;
        this.spaceDust = null;
        this.warpSpeed = 2.5;
        this.isPaused = false;
        this.time = 0;
        
        // Configuration with your specified parameters
        this.config = {
            starCount: 4000,
            brightStarCount: 300, // 7.5% of star count
            dustParticleCount: 1000, // 25% of star count
            maxDistance: 3000,
            centerGlowIntensity: 0.4
        };
    }

    init() {
        // Scene setup
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
        this.camera.position.z = 0;
        
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x000000);
        this.container.appendChild(this.renderer.domElement);
        
        this.createStarfield();
        this.setupEventListeners();
        this.animate();
    }

    createStarfield() {
        // Clear existing objects
        if (this.starStreaks) this.scene.remove(this.starStreaks);
        if (this.brightPoints) this.scene.remove(this.brightPoints);
        if (this.spaceDust) this.scene.remove(this.spaceDust);
        
        this.stars = [];
        
        // === MAIN STAR STREAKS ===
        const streakGeometry = new THREE.BufferGeometry();
        const streakPositions = new Float32Array(this.config.starCount * 6); // 2 points per line
        const streakColors = new Float32Array(this.config.starCount * 6);
        
        // Create stars with exact radial distribution
        for (let i = 0; i < this.config.starCount; i++) {
            // Radial distribution - more stars near center, spread outward
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.pow(Math.random(), 0.6) * 2000; // Power curve for center clustering
            
            const star = {
                x: Math.cos(angle) * radius,
                y: Math.sin(angle) * radius,
                z: -this.config.maxDistance - Math.random() * 2000,
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
            
            // Realistic star color distribution
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
            
            this.stars.push(star);
        }
        
        // === BRIGHT HERO STARS (Point sprites) ===
        const brightGeometry = new THREE.BufferGeometry();
        const brightPositions = new Float32Array(this.config.brightStarCount * 3);
        const brightColors = new Float32Array(this.config.brightStarCount * 3);
        const brightSizes = new Float32Array(this.config.brightStarCount);
        this.brightStars = [];
        
        for (let i = 0; i < this.config.brightStarCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.pow(Math.random(), 0.8) * 1500;
            
            const brightStar = {
                x: Math.cos(angle) * radius,
                y: Math.sin(angle) * radius,
                z: -this.config.maxDistance - Math.random() * 1500,
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
            
            // Hero star colors
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
            
            this.brightStars.push(brightStar);
        }
        
        // === SPACE DUST ===
        const dustGeometry = new THREE.BufferGeometry();
        const dustPositions = new Float32Array(this.config.dustParticleCount * 3);
        const dustColors = new Float32Array(this.config.dustParticleCount * 3);
        const dustSizes = new Float32Array(this.config.dustParticleCount);
        this.dustParticles = [];
        
        for (let i = 0; i < this.config.dustParticleCount; i++) {
            const dust = {
                x: (Math.random() - 0.5) * 6000,
                y: (Math.random() - 0.5) * 4000,
                z: -this.config.maxDistance - Math.random() * 3000,
                speed: 1 + Math.random() * 2,
                opacity: 0.1 + Math.random() * 0.3,
                twinkle: Math.random() * Math.PI * 2
            };
            
            this.dustParticles.push(dust);
            
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
        
        this.spaceDust = new THREE.Points(dustGeometry, dustMaterial);
        this.scene.add(this.spaceDust);
        
        // Create materials
        streakGeometry.setAttribute('position', new THREE.BufferAttribute(streakPositions, 3));
        streakGeometry.setAttribute('color', new THREE.BufferAttribute(streakColors, 3));
        
        const streakMaterial = new THREE.LineBasicMaterial({
            vertexColors: true,
            transparent: true,
            opacity: 1.0,
            blending: THREE.AdditiveBlending
        });
        
        this.starStreaks = new THREE.LineSegments(streakGeometry, streakMaterial);
        this.scene.add(this.starStreaks);
        
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
        
        this.brightPoints = new THREE.Points(brightGeometry, brightMaterial);
        this.scene.add(this.brightPoints);
    }

    updateStarfield() {
        if (!this.starStreaks || !this.brightPoints || !this.spaceDust) return;
        
        const streakPositions = this.starStreaks.geometry.attributes.position.array;
        const streakColors = this.starStreaks.geometry.attributes.color.array;
        const brightPositions = this.brightPoints.geometry.attributes.position.array;
        const brightColors = this.brightPoints.geometry.attributes.color.array;
        const brightSizes = this.brightPoints.geometry.attributes.size.array;
        const dustPositions = this.spaceDust.geometry.attributes.position.array;
        
        // Update main star streaks
        for (let i = 0; i < this.stars.length; i++) {
            const star = this.stars[i];
            const i6 = i * 6;
            
            // Move star forward
            star.z += star.speed * this.warpSpeed * 0.5;
            
            // Reset if too close
            if (star.z > 200) {
                star.z = -this.config.maxDistance - Math.random() * 2000;
                
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
            const perspective = Math.max(0.1, 1 - (star.z + this.config.maxDistance) / (this.config.maxDistance * 3));
            
            // Direction from center
            const dirX = distanceFromCenter > 0 ? star.x / distanceFromCenter : 0;
            const dirY = distanceFromCenter > 0 ? star.y / distanceFromCenter : 0;
            
            // Calculate streak length based on speed and distance
            const baseStreakLength = 80 + this.warpSpeed * 30;
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
            star.twinkle += 0.02 + this.warpSpeed * 0.01;
            const twinkleIntensity = 0.7 + Math.sin(star.twinkle) * 0.3;
            
            // Color and brightness based on perspective and twinkle
            const intensity = star.brightness * twinkleIntensity * perspective * Math.min(2, 0.5 + this.warpSpeed / 8);
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
        for (let i = 0; i < this.brightStars.length; i++) {
            const star = this.brightStars[i];
            
            star.z += star.speed * this.warpSpeed * 0.6;
            
            if (star.z > 150) {
                star.z = -this.config.maxDistance - Math.random() * 1500;
                const newAngle = Math.random() * Math.PI * 2;
                const newRadius = Math.pow(Math.random(), 0.8) * 1500;
                star.x = Math.cos(newAngle) * newRadius;
                star.y = Math.sin(newAngle) * newRadius;
            }
            
            star.twinkle += 0.03;
            const twinkle = 0.8 + Math.sin(star.twinkle) * 0.2;
            const perspective = Math.max(0.1, 1 - (star.z + this.config.maxDistance) / (this.config.maxDistance * 2));
            
            brightPositions[i * 3] = star.x;
            brightPositions[i * 3 + 1] = star.y;
            brightPositions[i * 3 + 2] = star.z;
            
            const intensity = star.brightness * twinkle * perspective * (1 + this.warpSpeed / 10);
            
            brightColors[i * 3] = star.color.r * intensity;
            brightColors[i * 3 + 1] = star.color.g * intensity;
            brightColors[i * 3 + 2] = star.color.b * intensity;
            
            brightSizes[i] = star.size * perspective * (1 + intensity * 0.3);
        }
        
        // Update space dust
        for (let i = 0; i < this.dustParticles.length; i++) {
            const dust = this.dustParticles[i];
            
            dust.z += dust.speed * this.warpSpeed * 0.3;
            
            if (dust.z > 100) {
                dust.x = (Math.random() - 0.5) * 6000;
                dust.y = (Math.random() - 0.5) * 4000;
                dust.z = -this.config.maxDistance * 2;
            }
            
            dustPositions[i * 3] = dust.x;
            dustPositions[i * 3 + 1] = dust.y;
            dustPositions[i * 3 + 2] = dust.z;
        }
        
        // Mark for update
        if (this.starStreaks) {
            this.starStreaks.geometry.attributes.position.needsUpdate = true;
            this.starStreaks.geometry.attributes.color.needsUpdate = true;
        }
        if (this.brightPoints) {
            this.brightPoints.geometry.attributes.position.needsUpdate = true;
            this.brightPoints.geometry.attributes.color.needsUpdate = true;
            this.brightPoints.geometry.attributes.size.needsUpdate = true;
        }
        if (this.spaceDust) {
            this.spaceDust.geometry.attributes.position.needsUpdate = true;
        }
    }

    setupEventListeners() {
        // Window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
        
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowUp':
                    this.warpSpeed = Math.min(15, this.warpSpeed + 0.5);
                    break;
                case 'ArrowDown':
                    this.warpSpeed = Math.max(0, this.warpSpeed - 0.5);
                    break;
                case ' ':
                    e.preventDefault();
                    this.togglePause();
                    break;
            }
        });
        
        // Mouse controls for camera
        document.addEventListener('mousemove', (e) => {
            const mouseX = (e.clientX / window.innerWidth) * 2 - 1;
            const mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
            
            this.camera.rotation.y = mouseX * 0.05;
            this.camera.rotation.x = mouseY * 0.05;
        });
    }

    animate() {
        if (this.isPaused) return;
        
        this.animationId = requestAnimationFrame(() => this.animate());
        this.time += 0.016;
        
        this.updateStarfield();
        
        // Subtle camera movement for immersion
        this.camera.position.x = Math.sin(this.time * 0.1) * 2;
        this.camera.position.y = Math.cos(this.time * 0.07) * 1;
        
        this.renderer.render(this.scene, this.camera);
    }

    // Public methods for external control
    setWarpSpeed(speed) {
        this.warpSpeed = Math.max(0, Math.min(15, speed));
    }

    getWarpSpeed() {
        return this.warpSpeed;
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        if (!this.isPaused) {
            this.animate();
        }
        return this.isPaused;
    }

    reset() {
        this.camera.position.set(0, 0, 0);
        this.camera.rotation.set(0, 0, 0);
        this.warpSpeed = 2.5;
        this.time = 0;
    }

    setStarCount(count) {
        this.config.starCount = count;
        this.config.brightStarCount = Math.floor(count * 0.075);
        this.config.dustParticleCount = Math.floor(count * 0.25);
        this.createStarfield();
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        if (this.renderer && this.container.contains(this.renderer.domElement)) {
            this.container.removeChild(this.renderer.domElement);
        }
        if (this.renderer) {
            this.renderer.dispose();
        }
    }
}

// Usage example:
// const container = document.getElementById('your-container');
// const starfield = new StarfieldWarpEffect(container);
// starfield.init();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StarfieldWarpEffect;
}
