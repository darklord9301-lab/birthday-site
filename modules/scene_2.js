// /modules/scene_2.js
// Birthday Scene with typewriter effects, synthetic music, and space background

import { initScene2Background, disposeScene2Background } from './scene2_background.js';

// Module scope variables
let isInitialized = false;
let container = null;
let scrollContainer = null;
let overlayElement = null;
let contentContainer = null;

// Audio system
let audioContext = null;
let isAudioLoaded = false;
let currentAudioSource = null;
let gainNode = null;
let happyBirthdayNotes = null;
let noteDuration = 0.5; // seconds per note
let totalMusicDuration = 0;

// Animation state
let animationId = null;
let scrollProgress = 0;
let targetScrollProgress = 0;
let lastScrollTime = 0;

// Typewriter state
const messageElements = [];
const messages = [
    { text: "Happy Birthday Urmi!", isTitle: true, typed: false, element: null },
    { text: "Wishing you joy and happiness 🎉", isTitle: false, typed: false, element: null },
    { text: "May your year be filled with love 💖", isTitle: false, typed: false, element: null },
    { text: "You are amazing and wonderful 🌟", isTitle: false, typed: false, element: null },
    { text: "Hope your special day is magical ✨", isTitle: false, typed: false, element: null },
    { text: "Another year of awesome adventures 🚀", isTitle: false, typed: false, element: null },
    { text: "You bring light to everyone around you 🌞", isTitle: false, typed: false, element: null },
    { text: "Here's to your brightest year yet! 🎊", isTitle: false, typed: false, element: null },
    { text: "Celebrating you today and always 🎂", isTitle: false, typed: false, element: null }
];

// Happy Birthday melody (simplified version)
// Notes: C C D C F E, C C D C G F, C C C A F E D, Bb Bb A F G F
const happyBirthdayMelody = [
    // "Happy Birthday to you"
    { note: 'C4', duration: 0.75 },
    { note: 'C4', duration: 0.25 },
    { note: 'D4', duration: 1.0 },
    { note: 'C4', duration: 1.0 },
    { note: 'F4', duration: 1.0 },
    { note: 'E4', duration: 2.0 },
    
    // "Happy Birthday to you"
    { note: 'C4', duration: 0.75 },
    { note: 'C4', duration: 0.25 },
    { note: 'D4', duration: 1.0 },
    { note: 'C4', duration: 1.0 },
    { note: 'G4', duration: 1.0 },
    { note: 'F4', duration: 2.0 },
    
    // "Happy Birthday dear [name]"
    { note: 'C4', duration: 0.75 },
    { note: 'C4', duration: 0.25 },
    { note: 'C5', duration: 1.0 },
    { note: 'A4', duration: 1.0 },
    { note: 'F4', duration: 1.0 },
    { note: 'E4', duration: 1.0 },
    { note: 'D4', duration: 2.0 },
    
    // "Happy Birthday to you"
    { note: 'Bb4', duration: 0.75 },
    { note: 'Bb4', duration: 0.25 },
    { note: 'A4', duration: 1.0 },
    { note: 'F4', duration: 1.0 },
    { note: 'G4', duration: 1.0 },
    { note: 'F4', duration: 2.0 }
];

// Note frequencies (in Hz)
const noteFrequencies = {
    'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23,
    'G4': 392.00, 'A4': 440.00, 'Bb4': 466.16, 'C5': 523.25
};

// Initialize Web Audio API and create synthetic Happy Birthday tune
async function initAudio() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Create gain node for volume control
        gainNode = audioContext.createGain();
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.connect(audioContext.destination);
        
        // Generate the Happy Birthday melody
        await generateHappyBirthdayAudio();
        
        isAudioLoaded = true;
        console.log('Synthetic Happy Birthday audio initialized');
    } catch (error) {
        console.warn('Audio initialization failed:', error);
        isAudioLoaded = false;
    }
}

// Generate synthetic Happy Birthday audio buffer
async function generateHappyBirthdayAudio() {
    // Calculate total duration
    totalMusicDuration = happyBirthdayMelody.reduce((sum, note) => sum + note.duration, 0);
    
    const sampleRate = audioContext.sampleRate;
    const totalFrames = Math.floor(totalMusicDuration * sampleRate);
    
    // Create audio buffer
    happyBirthdayNotes = audioContext.createBuffer(1, totalFrames, sampleRate);
    const channelData = happyBirthdayNotes.getChannelData(0);
    
    let currentTime = 0;
    
    // Generate each note
    happyBirthdayMelody.forEach(noteInfo => {
        const frequency = noteFrequencies[noteInfo.note];
        const noteDurationSamples = Math.floor(noteInfo.duration * sampleRate);
        const startSample = Math.floor(currentTime * sampleRate);
        
        // Generate sine wave with envelope
        for (let i = 0; i < noteDurationSamples && startSample + i < totalFrames; i++) {
            const t = i / sampleRate;
            const phase = 2 * Math.PI * frequency * t;
            
            // Create envelope (attack, sustain, release)
            let envelope = 1.0;
            const attackTime = 0.05;
            const releaseTime = 0.1;
            
            if (t < attackTime) {
                envelope = t / attackTime;
            } else if (t > noteInfo.duration - releaseTime) {
                envelope = (noteInfo.duration - t) / releaseTime;
            }
            
            // Add harmonics for richer sound
            const fundamental = Math.sin(phase);
            const harmonic2 = 0.3 * Math.sin(phase * 2);
            const harmonic3 = 0.1 * Math.sin(phase * 3);
            
            const sample = (fundamental + harmonic2 + harmonic3) * envelope * 0.2;
            
            channelData[startSample + i] += sample;
        }
        
        currentTime += noteInfo.duration;
    });
}

// Play audio at specific position based on scroll
function updateAudioPlayback(progress) {
    if (!isAudioLoaded || !happyBirthdayNotes || !audioContext) return;
    
    // Stop current source if playing
    if (currentAudioSource) {
        try {
            currentAudioSource.stop();
        } catch (e) {
            // Source might already be stopped
        }
        currentAudioSource = null;
    }
    
    // Calculate playback position
    const playbackPosition = Math.min(progress * totalMusicDuration, totalMusicDuration - 0.1);
    const remainingDuration = totalMusicDuration - playbackPosition;
    
    if (remainingDuration > 0.05) {
        currentAudioSource = audioContext.createBufferSource();
        currentAudioSource.buffer = happyBirthdayNotes;
        currentAudioSource.connect(gainNode);
        
        try {
            currentAudioSource.start(0, playbackPosition);
            
            // Stop after short duration for smooth scrolling effect
            setTimeout(() => {
                if (currentAudioSource) {
                    try {
                        currentAudioSource.stop();
                    } catch (e) {
                        // Source might already be stopped
                    }
                    currentAudioSource = null;
                }
            }, 150); // Play 150ms chunks
        } catch (error) {
            console.warn('Audio playback error:', error);
        }
    }
}

// Create container styles
function createContainerStyles() {
    return {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        zIndex: '1',
        fontFamily: '"Segoe UI", "Helvetica Neue", Arial, sans-serif'
    };
}

// Create dark gradient overlay for text readability
function createOverlayStyles() {
    return {
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        background: 'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.4) 100%)',
        pointerEvents: 'none',
        zIndex: '1'
    };
}

// Create scroll container styles
function createScrollContainerStyles() {
    return {
        position: 'relative',
        width: '100%',
        height: '100%',
        overflowY: 'auto',
        overflowX: 'hidden',
        zIndex: '2',
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(255, 255, 255, 0.3) transparent',
        WebkitOverflowScrolling: 'touch'
    };
}

// Create content container styles
function createContentContainerStyles() {
    return {
        minHeight: '300vh', // Ensure enough scroll content
        padding: '80px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '120px'
    };
}

// Create message element
function createMessageElement(messageData, index) {
    const element = document.createElement('div');
    
    const baseStyles = {
        textAlign: 'center',
        color: 'rgba(255, 255, 255, 0.9)',
        textShadow: '0 2px 4px rgba(0, 0, 0, 0.8), 0 0 20px rgba(255, 255, 255, 0.3)',
        opacity: '0',
        transform: 'translateY(30px)',
        transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
        maxWidth: '90%',
        margin: '0 auto'
    };
    
    if (messageData.isTitle) {
        Object.assign(baseStyles, {
            fontSize: 'clamp(2.5rem, 8vw, 4.5rem)',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #ff6b9d, #ffc93c, #06ffa5, #66d9f5)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundSize: '300% 300%',
            animation: 'gradientShift 3s ease-in-out infinite',
            marginBottom: '40px',
            letterSpacing: '0.05em'
        });
    } else {
        Object.assign(baseStyles, {
            fontSize: 'clamp(1.2rem, 4vw, 1.8rem)',
            fontWeight: '400',
            lineHeight: '1.4',
            letterSpacing: '0.02em'
        });
    }
    
    Object.assign(element.style, baseStyles);
    
    messageData.element = element;
    contentContainer.appendChild(element);
    
    return element;
}

// Add gradient animation styles
function addAnimationStyles() {
    if (document.getElementById('scene2-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'scene2-styles';
    style.textContent = `
        @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        
        .scene2-scroll::-webkit-scrollbar {
            width: 8px;
        }
        .scene2-scroll::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 4px;
        }
        .scene2-scroll::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.3);
            border-radius: 4px;
        }
        .scene2-scroll::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.5);
        }
    `;
    document.head.appendChild(style);
}

// Typewriter effect
async function typeMessage(messageData) {
    if (messageData.typed || !messageData.element) return;
    
    messageData.typed = true;
    const text = messageData.text;
    const element = messageData.element;
    
    // Show element
    element.style.opacity = '1';
    element.style.transform = 'translateY(0)';
    
    element.textContent = '';
    
    // Type each character
    for (let i = 0; i < text.length; i++) {
        element.textContent = text.substring(0, i + 1);
        
        // Random delay between characters for realistic typing
        const delay = 30 + Math.random() * 50;
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Pause longer after punctuation
        if ('.!?'.includes(text[i])) {
            await new Promise(resolve => setTimeout(resolve, 200));
        }
    }
}

// Check which messages should be typed based on viewport
function updateTypewriterEffects() {
    if (!scrollContainer) return;
    
    const containerRect = scrollContainer.getBoundingClientRect();
    const containerHeight = containerRect.height;
    const triggerPoint = containerHeight * 0.7; // Start typing when 70% visible
    
    messages.forEach((messageData, index) => {
        if (messageData.typed || !messageData.element) return;
        
        const elementRect = messageData.element.getBoundingClientRect();
        const elementTop = elementRect.top - containerRect.top;
        
        // Check if element has entered the viewport trigger zone
        if (elementTop < triggerPoint) {
            typeMessage(messageData);
        }
    });
}

// Handle scroll events
function handleScroll() {
    if (!scrollContainer) return;
    
    const scrollTop = scrollContainer.scrollTop;
    const scrollHeight = scrollContainer.scrollHeight - scrollContainer.clientHeight;
    targetScrollProgress = Math.min(scrollTop / Math.max(scrollHeight, 1), 1);
    
    // Update typewriter effects
    updateTypewriterEffects();
    
    lastScrollTime = Date.now();
}

// Animation loop
function animate() {
    if (!isInitialized) return;
    
    // Smooth scroll progress interpolation
    const scrollLerpFactor = 0.1;
    const prevProgress = scrollProgress;
    scrollProgress += (targetScrollProgress - scrollProgress) * scrollLerpFactor;
    
    // Update audio if scroll changed significantly
    if (Math.abs(scrollProgress - prevProgress) > 0.01) {
        updateAudioPlayback(scrollProgress);
    }
    
    // Update message fade based on scroll position
    messages.forEach((messageData, index) => {
        if (!messageData.element) return;
        
        const messageRect = messageData.element.getBoundingClientRect();
        const containerRect = scrollContainer.getBoundingClientRect();
        const messageCenter = messageRect.top + messageRect.height / 2;
        const containerCenter = containerRect.top + containerRect.height / 2;
        
        // Calculate distance from center
        const distance = Math.abs(messageCenter - containerCenter);
        const maxDistance = containerRect.height * 0.7;
        
        // Fade out messages that are far from center
        let opacity = 1;
        if (distance > maxDistance) {
            opacity = Math.max(0.3, 1 - (distance - maxDistance) / (containerRect.height * 0.3));
        }
        
        if (messageData.typed) {
            messageData.element.style.opacity = opacity.toString();
        }
    });
    
    animationId = requestAnimationFrame(animate);
}

// Initialize the birthday scene
export async function initScene2(containerElement) {
    if (isInitialized) {
        disposeScene2();
    }
    
    // Create or use provided container
    if (!containerElement) {
        containerElement = document.createElement('div');
        containerElement.id = 'scene2-container';
        Object.assign(containerElement.style, createContainerStyles());
        document.body.appendChild(containerElement);
    } else {
        Object.assign(containerElement.style, createContainerStyles());
    }
    
    container = containerElement;
    
    // Initialize background
    initScene2Background(container);
    
    // Initialize audio
    await initAudio();
    
    // Create overlay for text readability
    overlayElement = document.createElement('div');
    Object.assign(overlayElement.style, createOverlayStyles());
    container.appendChild(overlayElement);
    
    // Create scroll container
    scrollContainer = document.createElement('div');
    Object.assign(scrollContainer.style, createScrollContainerStyles());
    scrollContainer.classList.add('scene2-scroll');
    
    // Create content container
    contentContainer = document.createElement('div');
    Object.assign(contentContainer.style, createContentContainerStyles());
    
    // Add animation styles
    addAnimationStyles();
    
    // Create message elements
    messages.forEach((messageData, index) => {
        createMessageElement(messageData, index);
    });
    
    // Assemble UI
    scrollContainer.appendChild(contentContainer);
    container.appendChild(scrollContainer);
    
    // Add event listeners
    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    
    // Start animation loop
    isInitialized = true;
    animate();
    
    // Trigger initial typewriter check after a brief delay
    setTimeout(() => {
        updateTypewriterEffects();
    }, 500);
    
    console.log('Birthday Scene 2 initialized with typewriter effects and synthetic music');
    
    return {
        container,
        scrollContainer,
        contentContainer
    };
}

// Dispose the scene
export function disposeScene2() {
    if (!isInitialized) return;
    
    // Stop animation
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
    
    // Stop and cleanup audio
    if (currentAudioSource) {
        try {
            currentAudioSource.stop();
        } catch (e) {
            // Source might already be stopped
        }
        currentAudioSource = null;
    }
    
    if (audioContext && audioContext.state !== 'closed') {
        try {
            audioContext.close();
        } catch (e) {
            // AudioContext might already be closed
        }
        audioContext = null;
    }
    
    // Remove event listeners
    if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', handleScroll);
    }
    
    // Remove style element
    const styleElement = document.getElementById('scene2-styles');
    if (styleElement) {
        styleElement.remove();
    }
    
    // Remove container if auto-created
    if (container && container.id === 'scene2-container' && container.parentNode) {
        container.parentNode.removeChild(container);
    }
    
    // Dispose background
    disposeScene2Background();
    
    // Reset state
    container = null;
    scrollContainer = null;
    overlayElement = null;
    contentContainer = null;
    happyBirthdayNotes = null;
    gainNode = null;
    isAudioLoaded = false;
    isInitialized = false;
    scrollProgress = 0;
    targetScrollProgress = 0;
    lastScrollTime = 0;
    
    // Reset message states
    messages.forEach(messageData => {
        messageData.typed = false;
        messageData.element = null;
    });
    messageElements.length = 0;
    
    console.log('Birthday Scene 2 disposed');
}

// Export utility functions
export function getScrollProgress() {
    return scrollProgress;
}

export function isScene2Initialized() {
    return isInitialized;
}

export function setAudioVolume(volume) {
    if (gainNode) {
        gainNode.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), audioContext.currentTime);
    }
}
