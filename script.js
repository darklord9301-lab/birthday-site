import * as THREE from '/birthday-site/libs/three.module.js';
import { initStarfield } from '/birthday-site/modules/starfield.js';

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

// Initialize starfield
const starfield = initStarfield(scene, camera);

// Animation variables
let animationId;
let lastTime = 0;

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
    
    // Start animation loop
    animate(0);
}

/**
 * Cleanup function (optional, for development)
 */
function dispose() {
    // Cancel animation loop
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    
    // Remove resize listener
    window.removeEventListener('resize', onWindowResize);
    
    // Dispose starfield
    if (starfield && starfield.dispose) {
        starfield.dispose();
    }
    
    // Dispose renderer
    renderer.dispose();
    
    // Remove canvas from DOM
    if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
    }
}

// Start the application
init();

// Make dispose available globally for development/debugging
window.disposeStarfield = dispose;
