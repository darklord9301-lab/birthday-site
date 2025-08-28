import * as THREE from './libs/three.module.min.js';
import { initStarfield } from './modules/starfield.js';

// Scene setup
const scene = new THREE.Scene();

// Camera setup
const camera = new THREE.PerspectiveCamera(
    75, // Field of view
    window.innerWidth / window.innerHeight, // Aspect ratio
    0.1, // Near clipping plane
    2000 // Far clipping plane
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

/**
 * Main animation loop
 */
function animate(time) {
    // Update starfield animations (twinkling, parallax)
    if (starfield && starfield.animate) {
        starfield.animate(time);
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
    animate();
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
