import * as THREE from '/birthday-site/libs/three.module.js';
import { initStarfield } from '/birthday-site/modules/starfield.js';
import { showLoading } from '/birthday-site/modules/loading.js';
import { showPanel } from '/birthday-site/modules/panel.js';
import { initScene2 } from '/birthday-site/modules/scene_2.js';

// Warp → Camera transition variables
let cameraTransitionActive = false;
let cameraTransitionStart = 0;
let cameraTransitionDuration = 2000; // ms
let canvasFadeDuration = 1500; // 1.5s fade
let cameraStartZ = 0;
let cameraTargetZ = -150; // how far forward camera moves

// Audio context and warp sound variables
let audioContext = null;
let warpOscillator = null;
let warpGain = null;
let warpFilter = null;
let warpSoundActive = false;

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000); // pure black

// Camera setup
const camera = new THREE.PerspectiveCamera(
    75, // Field of view
    window.innerWidth / window.innerHeight, // Aspect ratio
    0.1, // Near clipping plane
    10000 // Increased far clipping plane for starfield
);

// Position camera
camera.position.set(0, 0, 0);
camera.lookAt(0, 0, -1);

// Renderer setup
const renderer = new THREE.WebGLRenderer({ 
    antialias: true,
    alpha: true // Allow transparent background if needed
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// Animation variables
let starfield;
let animationId;
let lastTime = 0;

/**
 * Initialize Web Audio API context
 */
function initAudioContext() {
    if (!audioContext) {
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (error) {
            console.warn('Web Audio API not supported:', error);
        }
    }
    
    // Resume context if suspended (required by some browsers)
    if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume();
    }
}
function fadeOutRendererAndDispose() {
  const canvas = renderer.domElement;
  // ensure canvas has style so we can fade
  canvas.style.transition = `opacity ${canvasFadeDuration}ms ease`;
  canvas.style.opacity = '0';

  // Also optionally tint to black: create overlay to hide visual pop.

  // After fade completes:
  setTimeout(() => {
    // Stop the animation loop before disposing
    if (animationId) cancelAnimationFrame(animationId);

    // Dispose starfield (free geometries)
    if (starfield && starfield.dispose) starfield.dispose();

    // Dispose renderer
    try {
      renderer.forceContextLoss();
      renderer.domElement.parentNode && renderer.domElement.parentNode.removeChild(renderer.domElement);
      renderer.dispose();
    } catch (e) {
      console.warn('Renderer disposal error', e);
    }

    // Now initialize scene 2 UI
    initScene2();
  }, canvasFadeDuration);
}
/**
 * Start the warp acceleration sound effect
 */
function startWarpSound() {
    if (!audioContext || warpSoundActive) return;
    
    try {
        // Create oscillator for the main warp sound
        warpOscillator = audioContext.createOscillator();
        warpOscillator.type = 'sawtooth'; // Rich harmonics for spacey sound
        warpOscillator.frequency.setValueAtTime(60, audioContext.currentTime); // Start at low frequency
        
        // Create gain node for volume control
        warpGain = audioContext.createGain();
        warpGain.gain.setValueAtTime(0, audioContext.currentTime);
        warpGain.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.1); // Fade in
        
        // Create lowpass filter that opens up during warp
        warpFilter = audioContext.createBiquadFilter();
        warpFilter.type = 'lowpass';
        warpFilter.frequency.setValueAtTime(200, audioContext.currentTime); // Start filtered
        warpFilter.Q.setValueAtTime(2, audioContext.currentTime); // Some resonance
        
        // Connect the audio graph
        warpOscillator.connect(warpFilter);
        warpFilter.connect(warpGain);
        warpGain.connect(audioContext.destination);
        
        // Start the oscillator
        warpOscillator.start(audioContext.currentTime);
        
        warpSoundActive = true;
        console.log('Warp sound started');
        
    } catch (error) {
        console.warn('Error starting warp sound:', error);
    }
}

/**
 * Update warp sound parameters based on transition progress
 */
function updateWarpSound(progress) {
    if (!audioContext || !warpSoundActive || !warpOscillator || !warpFilter) return;
    
    try {
        const currentTime = audioContext.currentTime;
        
        // Increase pitch from 60Hz to 400Hz over the duration
        const startFreq = 60;
        const endFreq = 400;
        const frequency = startFreq + (endFreq - startFreq) * progress;
        warpOscillator.frequency.setValueAtTime(frequency, currentTime);
        
        // Open the filter from 200Hz to 2000Hz
        const startFilterFreq = 200;
        const endFilterFreq = 2000;
        const filterFreq = startFilterFreq + (endFilterFreq - startFilterFreq) * progress;
        warpFilter.frequency.setValueAtTime(filterFreq, currentTime);
        
        // Slightly increase volume as we accelerate
        const startGain = 0.3;
        const endGain = 0.4;
        const gain = startGain + (endGain - startGain) * progress;
        warpGain.gain.setValueAtTime(gain, currentTime);
        
    } catch (error) {
        console.warn('Error updating warp sound:', error);
    }
}

/**
 * Stop the warp sound effect cleanly
 */
function stopWarpSound() {
    if (!audioContext || !warpSoundActive) return;
    
    try {
        const currentTime = audioContext.currentTime;
        const fadeOutDuration = 0.2; // 200ms fade out
        
        if (warpGain) {
            // Fade out the volume
            warpGain.gain.setValueAtTime(warpGain.gain.value, currentTime);
            warpGain.gain.linearRampToValueAtTime(0, currentTime + fadeOutDuration);
        }
        
        if (warpOscillator) {
            // Stop the oscillator after fade out
            warpOscillator.stop(currentTime + fadeOutDuration);
        }
        
        // Clean up references
        setTimeout(() => {
            warpOscillator = null;
            warpGain = null;
            warpFilter = null;
            warpSoundActive = false;
        }, (fadeOutDuration + 0.1) * 1000);
        
        console.log('Warp sound stopped');
        
    } catch (error) {
        console.warn('Error stopping warp sound:', error);
    }
}

/**
 * Main animation loop
 */
function animate(time) {
    // Calculate delta time
    const deltaTime = time - lastTime;
    lastTime = time;
    
    // Update starfield animations (twinkling, parallax)
    if (starfield && starfield.animate) {
        starfield.animate(deltaTime);
    }

    if (cameraTransitionActive) {
        const elapsed = time - cameraTransitionStart;
        const t = Math.min(elapsed / cameraTransitionDuration, 1); // progress 0→1
        camera.position.z = cameraStartZ + (cameraTargetZ - cameraStartZ) * t;

        // Update warp sound based on transition progress
        updateWarpSound(t);

        if (t >= 1) {
            cameraTransitionActive = false;
            stopWarpSound(); // Stop sound when warp completes
            console.log("Camera warp complete!");
            fadeOutRendererAndDispose();
        }
    }
    
    // Render the scene
    renderer.render(scene, camera);
    
    // Continue animation loop
    animationId = requestAnimationFrame(animate);
}

/**
 * Handle window resize
 */
function onWindowResize() {
    // Update camera aspect ratio
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    
    // Update renderer size
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
}

/**
 * Initialize the application
 */
function init() {
    // Add resize listener
    window.addEventListener('resize', onWindowResize);

    // Initialize audio context
    initAudioContext();

    // Start starfield immediately (runs behind overlay)
    starfield = initStarfield(scene, camera);
    animate(0);
    
    // Show loading overlay, then fade to starfield
    showLoading(30).then(() => {
        // After loading completes, we could trigger other modules here (e.g., glass panel)
        console.log("Loading finished!");
        // Show security panel
        showPanel().then((success) => {
           if (success) {
               console.log("Security check passed!");
               
               // Ensure audio context is ready (user interaction required)
               initAudioContext();
               
               // Start warp acceleration
               if (starfield && starfield.setWarpSpeed) {
                   starfield.setWarpSpeed(10); // jump from normal to warp speed
               }

               // Start camera push forward and warp sound
               cameraTransitionActive = true;
               cameraTransitionStart = performance.now();
               cameraStartZ = camera.position.z;
               
               // Start the warp sound effect
               startWarpSound();
               
           }
         });
    });
}

/**
 * Cleanup function (optional, for development)
 */
function dispose() {
    // Cancel animation loop
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    
    // Stop any active warp sound
    if (warpSoundActive) {
        stopWarpSound();
    }
    
    // Remove resize listener
    window.removeEventListener('resize', onWindowResize);
    
    // Dispose starfield
    if (starfield && starfield.dispose) {
        starfield.dispose();
    }
    
    // Dispose renderer
    renderer.dispose();
    
    // Close audio context
    if (audioContext && audioContext.state !== 'closed') {
        audioContext.close();
        audioContext = null;
    }
    
    // Remove canvas from DOM
    if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
    }
}

// Start the application
init();

// Make dispose available globally for development/debugging
window.disposeStarfield = dispose;
