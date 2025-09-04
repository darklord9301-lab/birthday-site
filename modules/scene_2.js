// /modules/scene_2.js
// Glass Panel Birthday Scene with typewriter effects, gesture controls, and background music

import { initScene2Background, disposeScene2Background } from './scene2_background.js';

// Module scope variables
let isInitialized = false;
let container = null;
let glassPanel = null;
let textContainer = null;
let hintElement = null;
let currentBlockIndex = 0;
let isTyping = false;
let isWaitingForInput = false;
let typewriterTimeout = null;

// Audio system
let backgroundMusic = null;
let audioContext = null;

// Event handlers for cleanup
let eventHandlers = {
    keydown: null,
    click: null,
    touchstart: null,
    touchend: null
};

// Touch gesture detection
let touchStartX = 0;
let touchStartY = 0;
let touchStartTime = 0;
const SWIPE_THRESHOLD = 50;
const SWIPE_TIME_THRESHOLD = 300;

// Text blocks for easy editing
const textBlocks = [
    "Happy Birthday Urmi! 🎉",
    "Today marks another beautiful year of your incredible journey through life.",
    "Your smile lights up every room you enter, bringing joy to everyone around you.",
    "May this new year bring you countless adventures, wonderful surprises, and dreams come true.",
    "You have a heart of gold and a spirit that inspires others to be their best selves.",
    "Here's to celebrating you today and all the amazing things you'll accomplish this year.",
    "Wishing you laughter that echoes, love that surrounds you, and happiness that never fades.",
    "May every moment of your special day be filled with the magic you bring to our lives.",
    "Happy Birthday, Urmi! You are truly one of a kind! ✨🎂"
];

// Initialize background music
async function initBackgroundMusic() {
    try {
        // Create audio context for better control
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Create audio element
        backgroundMusic = new Audio('assets/sounds/background.mp3');
        backgroundMusic.loop = true;
        backgroundMusic.volume = 0.6;
        
        // Handle autoplay restrictions
        const playPromise = backgroundMusic.play();
        
        if (playPromise !== undefined) {
            playPromise.then(() => {
                console.log('Background music started successfully');
            }).catch(error => {
                console.warn('Autoplay prevented, music will start on user interaction:', error);
                
                // Add one-time click listener to start music
                const startMusicOnInteraction = () => {
                    backgroundMusic.play().then(() => {
                        console.log('Background music started after user interaction');
                    }).catch(err => console.warn('Failed to start music:', err));
                    
                    document.removeEventListener('click', startMusicOnInteraction);
                    document.removeEventListener('touchstart', startMusicOnInteraction);
                };
                
                document.addEventListener('click', startMusicOnInteraction, { once: true });
                document.addEventListener('touchstart', startMusicOnInteraction, { once: true });
            });
        }
        
        return true;
    } catch (error) {
        console.warn('Failed to initialize background music:', error);
        return false;
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
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: '10',
        fontFamily: '"Segoe UI", "Helvetica Neue", Arial, sans-serif',
        pointerEvents: 'auto'
    };
}

// Create glass panel styles
function createGlassPanelStyles() {
    return {
        position: 'relative',
        width: 'min(90vw, 600px)',
        minHeight: '300px',
        maxHeight: '70vh',
        background: 'rgba(255, 255, 255, 0.001)', // Reduced from 0.1 to 0.05
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)', // Reduced from 0.2 to 0.1
        borderRadius: '20px',
        padding: '40px',
        boxShadow: `
            0 8px 32px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.1),
            0 0 40px rgba(102, 217, 245, 0.2),
            0 0 80px rgba(255, 107, 157, 0.1)
        `, // Reduced inner highlight and glow opacity
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        overflow: 'hidden'
    };
}

// Create text container styles
function createTextContainerStyles() {
    return {
        width: '100%',
        minHeight: '150px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 'clamp(1.2rem, 4vw, 1.8rem)',
        lineHeight: '1.6',
        color: 'rgba(255, 255, 255, 0.95)',
        textShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
        letterSpacing: '0.02em',
        wordWrap: 'break-word',
        hyphens: 'auto'
    };
}

// Create hint element styles
function createHintStyles() {
    return {
        position: 'absolute',
        bottom: '20px',
        right: '30px',
        fontSize: '0.9rem',
        color: 'rgba(255, 255, 255, 0.7)',
        opacity: '0',
        transition: 'opacity 0.3s ease-in-out',
        animation: 'pulseHint 2s ease-in-out infinite',
        textShadow: '0 1px 4px rgba(0, 0, 0, 0.5)',
        pointerEvents: 'none',
        userSelect: 'none'
    };
}

// Add CSS animations
function addAnimationStyles() {
    if (document.getElementById('scene2-glass-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'scene2-glass-styles';
    style.textContent = `
        @keyframes pulseHint {
            0%, 100% { opacity: 0.3; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.05); }
        }
        
        @keyframes wipeOut {
            0% { 
                opacity: 1; 
                transform: translateX(0) scale(1); 
                filter: blur(0px);
            }
            50% { 
                opacity: 0.5; 
                transform: translateX(20px) scale(0.95); 
                filter: blur(2px);
            }
            100% { 
                opacity: 0; 
                transform: translateX(100px) scale(0.8); 
                filter: blur(5px);
            }
        }
        
        @keyframes wipeIn {
            0% { 
                opacity: 0; 
                transform: translateX(-100px) scale(0.8); 
                filter: blur(5px);
            }
            50% { 
                opacity: 0.5; 
                transform: translateX(-20px) scale(0.95); 
                filter: blur(2px);
            }
            100% { 
                opacity: 1; 
                transform: translateX(0) scale(1); 
                filter: blur(0px);
            }
        }
    `;
    document.head.appendChild(style);
}

// Detect device type
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           (navigator.maxTouchPoints && navigator.maxTouchPoints > 2);
}

// Update hint text based on device
function updateHintText() {
    if (!hintElement) return;
    
    const isMobile = isMobileDevice();
    hintElement.textContent = isMobile ? 'Next →' : 'Press → or Click Next';
}

// Show hint with fade in
function showHint() {
    if (!hintElement || isTyping) return;
    
    updateHintText();
    hintElement.style.opacity = '0.7';
    isWaitingForInput = true;
}

// Hide hint with fade out
function hideHint() {
    if (!hintElement) return;
    
    hintElement.style.opacity = '0';
    isWaitingForInput = false;
}

// Typewriter effect for a single block
async function typeBlock(text) {
    if (!textContainer) return;
    
    isTyping = true;
    textContainer.textContent = '';
    textContainer.style.animation = 'wipeIn 0.5s ease-out';
    
    // Type each character
    for (let i = 0; i <= text.length; i++) {
        if (!isInitialized) return; // Exit if scene was disposed
        
        textContainer.textContent = text.substring(0, i);
        
        // Dramatic typing speed (80-100ms per character)
        const delay = 80 + Math.random() * 20;
        await new Promise(resolve => {
            typewriterTimeout = setTimeout(resolve, delay);
        });
        
        // Extra pause after punctuation for drama
        if (i < text.length && '.!?'.includes(text[i])) {
            await new Promise(resolve => {
                typewriterTimeout = setTimeout(resolve, 300);
            });
        }
    }
    
    isTyping = false;
    
    // Show hint after typing completes
    setTimeout(() => {
        if (!isTyping && isInitialized) {
            showHint();
        }
    }, 500);
}

// Wipe animation before next block
async function wipeCurrentText() {
    if (!textContainer) return;
    
    textContainer.style.animation = 'wipeOut 0.8s ease-in';
    
    return new Promise(resolve => {
        setTimeout(() => {
            if (textContainer) {
                textContainer.textContent = '';
            }
            resolve();
        }, 800);
    });
}

// Handle input to advance to next block
async function handleAdvanceInput() {
    if (!isWaitingForInput || isTyping || !isInitialized) return;
    
    hideHint();
    
    // Move to next block
    currentBlockIndex++;
    
    if (currentBlockIndex >= textBlocks.length) {
        // All blocks completed
        console.log('All text blocks completed');
        return;
    }
    
    // Wipe current text and show next block
    await wipeCurrentText();
    
    if (isInitialized) {
        await typeBlock(textBlocks[currentBlockIndex]);
    }
}

// Keyboard event handler
function handleKeyDown(event) {
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown' || event.key === ' ') {
        event.preventDefault();
        handleAdvanceInput();
    }
}

// Click event handler
function handleClick(event) {
    // Only handle clicks on the glass panel area
    if (glassPanel && (glassPanel.contains(event.target) || event.target === glassPanel)) {
        handleAdvanceInput();
    }
}

// Touch event handlers for swipe detection
function handleTouchStart(event) {
    if (!glassPanel || !glassPanel.contains(event.target)) return;
    
    const touch = event.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    touchStartTime = Date.now();
}

function handleTouchEnd(event) {
    if (!glassPanel || event.changedTouches.length === 0) return;
    
    const touch = event.changedTouches[0];
    const touchEndX = touch.clientX;
    const touchEndY = touch.clientY;
    const touchEndTime = Date.now();
    
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    const deltaTime = touchEndTime - touchStartTime;
    
    // Check if it's a valid swipe (right or down)
    if (deltaTime < SWIPE_TIME_THRESHOLD) {
        const isRightSwipe = deltaX > SWIPE_THRESHOLD && Math.abs(deltaY) < SWIPE_THRESHOLD;
        const isDownSwipe = deltaY > SWIPE_THRESHOLD && Math.abs(deltaX) < SWIPE_THRESHOLD;
        
        if (isRightSwipe || isDownSwipe) {
            event.preventDefault();
            handleAdvanceInput();
        }
    }
}

// Add event listeners
function addEventListeners() {
    // Keyboard events
    eventHandlers.keydown = handleKeyDown;
    document.addEventListener('keydown', eventHandlers.keydown);
    
    // Click events
    eventHandlers.click = handleClick;
    document.addEventListener('click', eventHandlers.click);
    
    // Touch events for mobile (vertical swipe like reels)
    eventHandlers.touchstart = handleTouchStart;
    eventHandlers.touchend = handleTouchEnd;
    document.addEventListener('touchstart', eventHandlers.touchstart, { passive: false });
    document.addEventListener('touchend', eventHandlers.touchend, { passive: false });
}

// Remove event listeners
function removeEventListeners() {
    if (eventHandlers.keydown) {
        document.removeEventListener('keydown', eventHandlers.keydown);
        eventHandlers.keydown = null;
    }
    
    if (eventHandlers.click) {
        document.removeEventListener('click', eventHandlers.click);
        eventHandlers.click = null;
    }
    
    if (eventHandlers.touchstart) {
        document.removeEventListener('touchstart', eventHandlers.touchstart);
        eventHandlers.touchstart = null;
    }
    
    if (eventHandlers.touchend) {
        document.removeEventListener('touchend', eventHandlers.touchend);
        eventHandlers.touchend = null;
    }
}

// Initialize Scene 2
export async function initScene2(containerElement) {
    if (isInitialized) {
        disposeScene2();
    }
    
    console.log('Initializing Scene 2 - Glass Panel UI');
    
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
    
    // Initialize background video
    try {
        await initScene2Background(container);
    } catch (error) {
        console.warn('Failed to initialize background:', error);
    }
    
    // Initialize background music
    await initBackgroundMusic();
    
    // Add animation styles
    addAnimationStyles();
    
    // Create glass panel
    glassPanel = document.createElement('div');
    Object.assign(glassPanel.style, createGlassPanelStyles());
    
    // Create text container
    textContainer = document.createElement('div');
    Object.assign(textContainer.style, createTextContainerStyles());
    
    // Create hint element
    hintElement = document.createElement('div');
    Object.assign(hintElement.style, createHintStyles());
    
    // Assemble UI
    glassPanel.appendChild(textContainer);
    glassPanel.appendChild(hintElement);
    container.appendChild(glassPanel);
    
    // Add event listeners
    addEventListeners();
    
    // Initialize state
    currentBlockIndex = 0;
    isInitialized = true;
    
    // Start with first text block
    setTimeout(async () => {
        if (isInitialized && textBlocks.length > 0) {
            await typeBlock(textBlocks[currentBlockIndex]);
        }
    }, 1000);
    
    console.log('Scene 2 initialized successfully');
    
    return {
        container,
        glassPanel,
        textContainer,
        hintElement
    };
}

// Dispose Scene 2
export function disposeScene2() {
    if (!isInitialized) return;
    
    console.log('Disposing Scene 2');
    
    // Clear any pending timeouts
    if (typewriterTimeout) {
        clearTimeout(typewriterTimeout);
        typewriterTimeout = null;
    }
    
    // Stop and cleanup audio
    if (backgroundMusic) {
        backgroundMusic.pause();
        backgroundMusic.currentTime = 0;
        backgroundMusic = null;
    }
    
    if (audioContext && audioContext.state !== 'closed') {
        try {
            audioContext.close();
        } catch (error) {
            console.warn('Error closing audio context:', error);
        }
        audioContext = null;
    }
    
    // Remove event listeners
    removeEventListeners();
    
    // Remove style element
    const styleElement = document.getElementById('scene2-glass-styles');
    if (styleElement) {
        styleElement.remove();
    }
    
    // Remove container if auto-created
    if (container && container.id === 'scene2-container' && container.parentNode) {
        container.parentNode.removeChild(container);
    }
    
    // Dispose background
    try {
        disposeScene2Background();
    } catch (error) {
        console.warn('Error disposing background:', error);
    }
    
    // Reset state
    container = null;
    glassPanel = null;
    textContainer = null;
    hintElement = null;
    currentBlockIndex = 0;
    isTyping = false;
    isWaitingForInput = false;
    isInitialized = false;
    
    console.log('Scene 2 disposed successfully');
}

// Export utility functions
export function getCurrentBlockIndex() {
    return currentBlockIndex;
}

export function isScene2Initialized() {
    return isInitialized;
}

export function isCurrentlyTyping() {
    return isTyping;
}

export function isWaitingForUserInput() {
    return isWaitingForInput;
}

export function getTextBlocks() {
    return [...textBlocks]; // Return a copy
}

export function setMusicVolume(volume) {
    if (backgroundMusic) {
        backgroundMusic.volume = Math.max(0, Math.min(1, volume));
    }
}

// Debug function to test music manually
export function testMusic() {
    console.log('=== MUSIC DEBUG INFO ===');
    console.log('Background music object:', backgroundMusic);
    console.log('Audio context:', audioContext);
    console.log('Current src:', backgroundMusic?.src);
    console.log('Ready state:', backgroundMusic?.readyState);
    console.log('Paused:', backgroundMusic?.paused);
    console.log('Volume:', backgroundMusic?.volume);
    console.log('Duration:', backgroundMusic?.duration);
    
    if (backgroundMusic) {
        backgroundMusic.play()
            .then(() => console.log('✅ Manual play successful'))
            .catch(err => console.error('❌ Manual play failed:', err));
    }
}
