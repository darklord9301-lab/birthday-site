// /modules/scene_2.js
// Interactive Scene 2 with mechanical background, glass panel UI, and scroll-synced audio

import { initScene2Background, updateScene2Background, disposeScene2Background } from './scene2_background.js';

let isInitialized = false;
let container = null;
let glassPanel = null;
let contentContainer = null;
let scrollContainer = null;

// Audio system
let audioContext = null;
let audioBuffer = null;
let audioSource = null;
let gainNode = null;
let isAudioLoaded = false;
let isAudioPlaying = false;
let tickAudioBuffer = null;
let lastTickTime = 0;

// Animation state
let animationId = null;
let scrollProgress = 0;
let targetScrollProgress = 0;
let lastScrollTime = 0;
let isScrolling = false;

// Flying elements
const flyingElements = [];
const flyingTexts = [
    '⚙️', '🔧', '🛠️', '⭐', '🌟', '✨', 
    'MECHANICAL', 'SPACE', 'PRECISION', 'CRAFTED', 'ENGINEERED', 'STELLAR',
    'GEARS', 'MOTION', 'COSMOS', 'ORBIT', 'VELOCITY', 'DIMENSION'
];

// Scroll content data
const panelContent = [
    {
        title: "Mechanical Cosmos",
        subtitle: "Where precision meets infinity",
        content: "In the vast expanse of space, mechanical precision drives the clockwork of the universe. Each gear, each rotation, each calculated movement contributes to the grand design of cosmic machinery."
    },
    {
        title: "Engineering the Stars",
        subtitle: "Crafted with stellar precision",
        content: "Every component serves a purpose in this celestial mechanism. From the smallest cog to the largest orbital ring, the mechanical symphony of space unfolds with mathematical beauty and engineering excellence."
    },
    {
        title: "Infinite Precision",
        subtitle: "Perfection in motion",
        content: "The harmony of mechanical movement resonates through the cosmos, creating patterns of light and shadow that dance across the stellar backdrop. This is where art meets science in perfect synchronization."
    },
    {
        title: "Cosmic Machinery",
        subtitle: "The universe in motion",
        content: "Witness the intricate ballet of mechanical elements as they rotate, oscillate, and pulse in rhythm with the heartbeat of the cosmos. Every movement is calculated, every rotation purposeful."
    }
];

// Create glass panel styles
function createGlassPanelStyles() {
    return {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '70%',
        maxWidth: '800px',
        height: '80%',
        maxHeight: '600px',
        background: 'rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: '20px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
        overflow: 'hidden',
        zIndex: '10',
        opacity: '0',
        transition: 'opacity 0.8s ease-in-out, transform 0.8s ease-in-out',
        pointerEvents: 'auto'
    };
}

// Create scroll container styles
function createScrollContainerStyles() {
    return {
        width: '100%',
        height: '100%',
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: '40px',
        boxSizing: 'border-box',
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(255, 255, 255, 0.3) transparent'
    };
}

// Create content styles
function createContentStyles() {
    return {
        color: 'rgba(255, 255, 255, 0.9)',
        fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
        lineHeight: '1.6',
        fontSize: '16px',
        textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
        minHeight: '200vh' // Ensure scrollable content
    };
}

// Initialize Web Audio API
async function initAudio() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Create gain node for volume control
        gainNode = audioContext.createGain();
        gainNode.gain.setValueAtTime(0.6, audioContext.currentTime);
        gainNode.connect(audioContext.destination);
        
        // Load main music
        const musicResponse = await fetch('/assets/sounds/music.mp3');
        if (musicResponse.ok) {
            const arrayBuffer = await musicResponse.arrayBuffer();
            audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            console.log('Music loaded successfully');
        }
        
        // Create synthetic tick sound
        createTickSound();
        
        isAudioLoaded = true;
    } catch (error) {
        console.warn('Audio initialization failed:', error);
        isAudioLoaded = false;
    }
}

// Create synthetic tick sound
function createTickSound() {
    const tickLength = 0.05; // 50ms
    const sampleRate = audioContext.sampleRate;
    const frameCount = tickLength * sampleRate;
    
    tickAudioBuffer = audioContext.createBuffer(1, frameCount, sampleRate);
    const channelData = tickAudioBuffer.getChannelData(0);
    
    // Generate a mechanical tick sound
    for (let i = 0; i < frameCount; i++) {
        const t = i / sampleRate;
        const envelope = Math.exp(-t * 50); // Quick decay
        const noise = (Math.random() - 0.5) * 0.3;
        const tone = Math.sin(2 * Math.PI * 800 * t) * 0.7; // 800Hz tone
        
        channelData[i] = (tone + noise) * envelope;
    }
}

// Play tick sound
function playTickSound() {
    if (!isAudioLoaded || !tickAudioBuffer) return;
    
    const now = audioContext.currentTime;
    if (now - lastTickTime < 0.1) return; // Throttle tick sounds
    
    const source = audioContext.createBufferSource();
    const tickGain = audioContext.createGain();
    
    source.buffer = tickAudioBuffer;
    tickGain.gain.setValueAtTime(0.2, now);
    
    source.connect(tickGain);
    tickGain.connect(audioContext.destination);
    
    source.start(now);
    lastTickTime = now;
}

// Update audio playback based on scroll progress
function updateAudioPlayback(progress) {
    if (!isAudioLoaded || !audioBuffer) return;
    
    // Stop current source if playing
    if (audioSource) {
        try {
            audioSource.stop();
        } catch (e) {
            // Source might already be stopped
        }
        audioSource = null;
    }
    
    // Calculate playback position
    const playbackPosition = progress * audioBuffer.duration;
    const remainingDuration = audioBuffer.duration - playbackPosition;
    
    if (remainingDuration > 0.1) { // Only play if significant duration remains
        audioSource = audioContext.createBufferSource();
        audioSource.buffer = audioBuffer;
        audioSource.connect(gainNode);
        
        try {
            audioSource.start(0, playbackPosition);
            isAudioPlaying = true;
            
            // Stop after a short duration to allow for smooth scrubbing
            setTimeout(() => {
                if (audioSource) {
                    try {
                        audioSource.stop();
                    } catch (e) {
                        // Source might already be stopped
                    }
                    audioSource = null;
                    isAudioPlaying = false;
                }
            }, 200); // Play for 200ms chunks
        } catch (error) {
            console.warn('Audio playback error:', error);
        }
    }
}

// Create flying element
function createFlyingElement(text, isEmoji = false) {
    const element = document.createElement('div');
    element.textContent = text;
    
    const baseStyles = {
        position: 'absolute',
        color: isEmoji ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.6)',
        fontSize: isEmoji ? '24px' : '14px',
        fontWeight: isEmoji ? 'normal' : 'bold',
        fontFamily: isEmoji ? 'Arial' : '"Courier New", monospace',
        pointerEvents: 'none',
        zIndex: '5',
        textShadow: '0 0 10px rgba(255, 255, 255, 0.5)',
        transition: 'opacity 0.3s ease-out',
        letterSpacing: isEmoji ? '0' : '2px'
    };
    
    Object.assign(element.style, baseStyles);
    
    // Random starting position and movement
    const side = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
    const containerRect = container.getBoundingClientRect();
    
    let startX, startY, endX, endY;
    
    switch (side) {
        case 0: // from top
            startX = Math.random() * containerRect.width;
            startY = -50;
            endX = startX + (Math.random() - 0.5) * 200;
            endY = containerRect.height + 50;
            break;
        case 1: // from right
            startX = containerRect.width + 50;
            startY = Math.random() * containerRect.height;
            endX = -50;
            endY = startY + (Math.random() - 0.5) * 200;
            break;
        case 2: // from bottom
            startX = Math.random() * containerRect.width;
            startY = containerRect.height + 50;
            endX = startX + (Math.random() - 0.5) * 200;
            endY = -50;
            break;
        case 3: // from left
            startX = -50;
            startY = Math.random() * containerRect.height;
            endX = containerRect.width + 50;
            endY = startY + (Math.random() - 0.5) * 200;
            break;
    }
    
    element.style.left = startX + 'px';
    element.style.top = startY + 'px';
    
    const flyingData = {
        element,
        startX,
        startY,
        endX,
        endY,
        progress: 0,
        speed: 0.005 + Math.random() * 0.01,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        rotation: 0,
        opacity: 0.8 + Math.random() * 0.2,
        isEmoji
    };
    
    element.style.opacity = '0';
    container.appendChild(element);
    
    return flyingData;
}

// Update flying elements
function updateFlyingElements() {
    // Create new elements based on scroll progress
    if (Math.random() < 0.05 + scrollProgress * 0.05) {
        const text = flyingTexts[Math.floor(Math.random() * flyingTexts.length)];
        const isEmoji = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(text);
        flyingElements.push(createFlyingElement(text, isEmoji));
    }
    
    // Update existing elements
    for (let i = flyingElements.length - 1; i >= 0; i--) {
        const flying = flyingElements[i];
        flying.progress += flying.speed * (1 + scrollProgress);
        
        if (flying.progress <= 1) {
            // Interpolate position
            const currentX = flying.startX + (flying.endX - flying.startX) * flying.progress;
            const currentY = flying.startY + (flying.endY - flying.startY) * flying.progress;
            
            // Add some floating motion
            const floatX = Math.sin(flying.progress * Math.PI * 4) * 20;
            const floatY = Math.cos(flying.progress * Math.PI * 3) * 15;
            
            flying.element.style.left = (currentX + floatX) + 'px';
            flying.element.style.top = (currentY + floatY) + 'px';
            
            // Update rotation
            flying.rotation += flying.rotationSpeed;
            flying.element.style.transform = `rotate(${flying.rotation}rad)`;
            
            // Update opacity (fade in then fade out)
            const fadeProgress = flying.progress;
            const opacity = fadeProgress < 0.2 
                ? (fadeProgress / 0.2) * flying.opacity
                : fadeProgress > 0.8 
                ? ((1 - fadeProgress) / 0.2) * flying.opacity
                : flying.opacity;
            
            flying.element.style.opacity = opacity * (0.5 + scrollProgress * 0.5);
        } else {
            // Remove element
            container.removeChild(flying.element);
            flyingElements.splice(i, 1);
        }
    }
}

// Create panel content
function createPanelContent() {
    contentContainer.innerHTML = '';
    
    panelContent.forEach((section, index) => {
        const sectionDiv = document.createElement('div');
        sectionDiv.style.marginBottom = '80px';
        sectionDiv.style.opacity = '0';
        sectionDiv.style.transform = 'translateY(30px)';
        sectionDiv.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        sectionDiv.style.transitionDelay = `${index * 0.1}s`;
        
        const title = document.createElement('h2');
        title.textContent = section.title;
        title.style.fontSize = '28px';
        title.style.fontWeight = '300';
        title.style.marginBottom = '10px';
        title.style.color = 'rgba(255, 255, 255, 0.95)';
        title.style.textShadow = '0 2px 4px rgba(0, 0, 0, 0.5)';
        
        const subtitle = document.createElement('h3');
        subtitle.textContent = section.subtitle;
        subtitle.style.fontSize = '16px';
        subtitle.style.fontWeight = '400';
        subtitle.style.marginBottom = '20px';
        subtitle.style.color = 'rgba(255, 255, 255, 0.7)';
        subtitle.style.fontStyle = 'italic';
        
        const content = document.createElement('p');
        content.textContent = section.content;
        content.style.fontSize = '16px';
        content.style.lineHeight = '1.7';
        content.style.color = 'rgba(255, 255, 255, 0.8)';
        content.style.textAlign = 'justify';
        
        sectionDiv.appendChild(title);
        sectionDiv.appendChild(subtitle);
        sectionDiv.appendChild(content);
        contentContainer.appendChild(sectionDiv);
        
        // Animate in
        setTimeout(() => {
            sectionDiv.style.opacity = '1';
            sectionDiv.style.transform = 'translateY(0)';
        }, 100 + index * 100);
    });
}

// Handle scroll events
function handleScroll(event) {
    if (!scrollContainer) return;
    
    const scrollTop = scrollContainer.scrollTop;
    const scrollHeight = scrollContainer.scrollHeight - scrollContainer.clientHeight;
    const newProgress = Math.min(scrollTop / Math.max(scrollHeight, 1), 1);
    
    // Smooth scroll progress interpolation
    targetScrollProgress = newProgress;
    
    const now = Date.now();
    const scrollDelta = Math.abs(newProgress - scrollProgress);
    
    // Play tick sound on scroll
    if (scrollDelta > 0.01 && now - lastScrollTime > 50) {
        playTickSound();
        lastScrollTime = now;
    }
    
    isScrolling = true;
    setTimeout(() => { isScrolling = false; }, 150);
}

// Animation loop
function animate() {
    if (!isInitialized) return;
    
    // Smooth scroll progress interpolation
    const scrollLerpFactor = 0.1;
    scrollProgress += (targetScrollProgress - scrollProgress) * scrollLerpFactor;
    
    // Update background
    updateScene2Background(scrollProgress);
    
    // Update audio playback
    if (isAudioLoaded && Math.abs(targetScrollProgress - scrollProgress) < 0.01) {
        updateAudioPlayback(scrollProgress);
    }
    
    // Update flying elements
    updateFlyingElements();
    
    // Update glass panel effects based on scroll
    if (glassPanel) {
        const backdropBlur = 20 + scrollProgress * 10;
        glassPanel.style.backdropFilter = `blur(${backdropBlur}px)`;
        glassPanel.style.WebkitBackdropFilter = `blur(${backdropBlur}px)`;
        
        const borderOpacity = 0.2 + scrollProgress * 0.1;
        glassPanel.style.borderColor = `rgba(255, 255, 255, ${borderOpacity})`;
    }
    
    animationId = requestAnimationFrame(animate);
}

// Initialize scene
export async function initScene2(containerElement) {
    if (isInitialized) {
        disposeScene2();
    }
    
    container = containerElement;
    
    // Initialize background
    initScene2Background(container);
    
    // Initialize audio
    await initAudio();
    
    // Create glass panel
    glassPanel = document.createElement('div');
    Object.assign(glassPanel.style, createGlassPanelStyles());
    
    // Create scroll container
    scrollContainer = document.createElement('div');
    Object.assign(scrollContainer.style, createScrollContainerStyles());
    
    // Create content container
    contentContainer = document.createElement('div');
    Object.assign(contentContainer.style, createContentStyles());
    
    // Add scrollbar styling
    const style = document.createElement('style');
    style.textContent = `
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
    scrollContainer.classList.add('scene2-scroll');
    
    // Assemble UI
    scrollContainer.appendChild(contentContainer);
    glassPanel.appendChild(scrollContainer);
    container.appendChild(glassPanel);
    
    // Create content
    createPanelContent();
    
    // Add event listeners
    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    
    // Show panel with animation
    setTimeout(() => {
        glassPanel.style.opacity = '1';
        glassPanel.style.transform = 'translate(-50%, -50%) scale(1)';
    }, 500);
    
    // Start animation loop
    isInitialized = true;
    animate();
    
    console.log('Scene 2 initialized with glass panel and audio sync');
    
    return {
        container,
        glassPanel,
        scrollContainer,
        contentContainer
    };
}

// Dispose scene
export function disposeScene2() {
    if (!isInitialized) return;
    
    // Stop animation
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
    
    // Stop and cleanup audio
    if (audioSource) {
        try {
            audioSource.stop();
        } catch (e) {
            // Source might already be stopped
        }
        audioSource = null;
    }
    
    if (audioContext) {
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
    
    // Clean up flying elements
    flyingElements.forEach(flying => {
        if (flying.element.parentNode) {
            flying.element.parentNode.removeChild(flying.element);
        }
    });
    flyingElements.length = 0;
    
    // Remove UI elements
    if (glassPanel && glassPanel.parentNode) {
        glassPanel.parentNode.removeChild(glassPanel);
    }
    
    // Dispose background
    disposeScene2Background();
    
    // Reset state
    container = null;
    glassPanel = null;
    contentContainer = null;
    scrollContainer = null;
    audioBuffer = null;
    tickAudioBuffer = null;
    gainNode = null;
    isAudioLoaded = false;
    isAudioPlaying = false;
    isInitialized = false;
    scrollProgress = 0;
    targetScrollProgress = 0;
    lastScrollTime = 0;
    lastTickTime = 0;
    isScrolling = false;
    
    console.log('Scene 2 disposed');
}

// Export additional utilities
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
