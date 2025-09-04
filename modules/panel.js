// /modules/panel.js
let panelContainer = null;
let clickSound = null;
let panelResolve = null;
let glitterInterval = null;
let fixedDimensions = null;
let positionLocked = false;
let originalViewportHeight = 0;
let isKeyboardOpen = false;
let repositionTimer = null;

/**
 * Capture screen dimensions and lock them permanently
 */
function lockScreenDimensions() {
    if (!fixedDimensions) {
        // Capture initial viewport before any keyboard interactions
        originalViewportHeight = window.innerHeight;
        
        // Get the actual rendered dimensions, not window dimensions
        const body = document.body;
        const html = document.documentElement;
        
        fixedDimensions = {
            width: Math.max(body.scrollWidth, body.offsetWidth, html.clientWidth, html.scrollWidth, html.offsetWidth, window.innerWidth),
            height: Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight, originalViewportHeight)
        };
        
        // Use current window dimensions as fallback
        if (fixedDimensions.width === 0) fixedDimensions.width = window.innerWidth;
        if (fixedDimensions.height === 0) fixedDimensions.height = originalViewportHeight;
        
        console.log('Locked dimensions:', fixedDimensions);
        console.log('Original viewport height:', originalViewportHeight);
    }
    
    return fixedDimensions;
}

/**
 * Detect if mobile keyboard is open
 */
function detectKeyboard() {
    const currentHeight = window.innerHeight;
    const heightDiff = originalViewportHeight - currentHeight;
    
    // If height reduced by more than 150px, assume keyboard is open
    isKeyboardOpen = heightDiff > 150;
    
    return isKeyboardOpen;
}

/**
 * Apply ultra-fixed positioning with JavaScript - immune to all viewport changes
 */
function applyFixedPositioning() {
    if (!panelContainer || !fixedDimensions) return;
    
    const overlay = panelContainer;
    const panel = overlay.querySelector('.panel-container');
    
    if (overlay && panel) {
        // Detect keyboard state
        detectKeyboard();
        
        // Set overlay to use the original locked dimensions, never viewport dimensions
        overlay.style.position = 'fixed';
        overlay.style.top = '0px';
        overlay.style.left = '0px';
        overlay.style.width = fixedDimensions.width + 'px';
        overlay.style.height = fixedDimensions.height + 'px'; // Always use locked height
        overlay.style.zIndex = '10000';
        overlay.style.overflow = 'hidden';
        
        // Prevent any browser optimizations that might interfere
        overlay.style.willChange = 'auto';
        overlay.style.transform = 'translate3d(0,0,0)'; // Force GPU layer
        overlay.style.backfaceVisibility = 'hidden';
        
        // Panel dimensions - absolutely fixed
        const panelWidth = 480;
        const panelHeight = 400;
        
        // Always center based on original locked dimensions, not current viewport
        const centerX = (fixedDimensions.width - panelWidth) / 2;
        const centerY = (fixedDimensions.height - panelHeight) / 2;
        
        // Apply absolute positioning within the overlay
        panel.style.position = 'absolute';
        panel.style.left = centerX + 'px';
        panel.style.top = centerY + 'px';
        panel.style.width = panelWidth + 'px';
        panel.style.height = panelHeight + 'px';
        panel.style.transform = 'none'; // Remove all CSS transforms
        panel.style.margin = '0';
        panel.style.padding = '45px 55px';
        panel.style.boxSizing = 'border-box';
        
        // Force GPU acceleration and prevent subpixel rendering
        panel.style.willChange = 'auto';
        panel.style.transform = 'translate3d(0,0,0)';
        panel.style.backfaceVisibility = 'hidden';
        
        // Additional mobile-specific fixes
        if (isKeyboardOpen) {
            // When keyboard is open, ensure panel stays in exact same position
            overlay.style.position = 'fixed';
            overlay.style.height = fixedDimensions.height + 'px'; // Force original height
            
            // Prevent any scrolling or movement
            document.body.style.position = 'fixed';
            document.body.style.top = '0';
            document.body.style.left = '0';
            document.body.style.width = '100%';
            document.body.style.height = fixedDimensions.height + 'px';
            document.body.style.overflow = 'hidden';
        }
    }
}

/**
 * Lock body scroll and prevent any viewport-related interference
 */
function lockBodyPosition() {
    // Prevent body scrolling completely
    document.body.style.position = 'fixed';
    document.body.style.top = '0';
    document.body.style.left = '0';
    document.body.style.width = '100%';
    document.body.style.height = fixedDimensions.height + 'px';
    document.body.style.overflow = 'hidden';
    
    // Allow touch actions on interactive elements - CRITICAL FIX
    document.body.style.touchAction = 'manipulation';
    document.body.style.userSelect = 'none';
    
    // Prevent zoom on mobile
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
        viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
    }
}

/**
 * Unlock body position
 */
function unlockBodyPosition() {
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.width = '';
    document.body.style.height = '';
    document.body.style.overflow = '';
    document.body.style.touchAction = '';
    document.body.style.userSelect = '';
}

/**
 * Prevent any viewport-related events and force repositioning
 */
function blockViewportEvents() {
    if (positionLocked) return;
    positionLocked = true;
    
    // Aggressive repositioning function
    function forceReposition() {
        if (panelContainer && panelContainer.classList.contains('visible')) {
            applyFixedPositioning();
        }
    }
    
    // Block and override resize events
    const originalResize = window.onresize;
    window.onresize = function(e) {
        if (panelContainer && panelContainer.classList.contains('visible')) {
            e.stopImmediatePropagation();
            e.preventDefault();
            
            // Clear any existing timer
            if (repositionTimer) clearTimeout(repositionTimer);
            
            // Force immediate repositioning
            forceReposition();
            
            // Also reposition after a short delay to catch any delayed effects
            repositionTimer = setTimeout(forceReposition, 50);
            
            return false;
        }
        if (originalResize) originalResize.call(this, e);
    };
    
    // Block orientation changes
    const originalOrientationChange = window.onorientationchange;
    window.onorientationchange = function(e) {
        if (panelContainer && panelContainer.classList.contains('visible')) {
            e.stopImmediatePropagation();
            e.preventDefault();
            forceReposition();
            return false;
        }
        if (originalOrientationChange) originalOrientationChange.call(this, e);
    };
    
    // Handle visual viewport changes (critical for iOS Safari keyboard)
    if (window.visualViewport) {
        const handleVisualViewportChange = function(e) {
            if (panelContainer && panelContainer.classList.contains('visible')) {
                e.stopImmediatePropagation();
                e.preventDefault();
                
                // Force repositioning on viewport changes
                if (repositionTimer) clearTimeout(repositionTimer);
                forceReposition();
                repositionTimer = setTimeout(forceReposition, 100);
            }
        };
        
        window.visualViewport.addEventListener('resize', handleVisualViewportChange, { passive: false });
        window.visualViewport.addEventListener('scroll', handleVisualViewportChange, { passive: false });
    }
    
    // Handle window scroll events
    const handleScroll = function(e) {
        if (panelContainer && panelContainer.classList.contains('visible')) {
            e.stopImmediatePropagation();
            e.preventDefault();
            window.scrollTo(0, 0); // Force scroll to top
            forceReposition();
            return false;
        }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: false, capture: true });
    document.addEventListener('scroll', handleScroll, { passive: false, capture: true });
    
    // Handle focus events that might trigger keyboard
    const handleFocusEvents = function(e) {
        if (panelContainer && panelContainer.classList.contains('visible')) {
            // Allow the focus, but force repositioning
            setTimeout(() => {
                forceReposition();
                // Double-check positioning after potential keyboard animation
                setTimeout(forceReposition, 300);
            }, 10);
        }
    };
    
    document.addEventListener('focusin', handleFocusEvents, true);
    document.addEventListener('focusout', handleFocusEvents, true);
}

/**
 * Preload click sound
 */
function preloadAudio() {
    clickSound = new Audio('/birthday-site/assets/sounds/click.mp3');
    clickSound.volume = 0.7;
    clickSound.preload = 'auto';
}

/**
 * Play click sound
 */
function playClickSound() {
    if (clickSound) {
        clickSound.currentTime = 0;
        clickSound.play().catch(e => {
            console.warn('Click sound failed to play:', e);
        });
    }
}

/**
 * Create glitter particles
 */
function createGlitterEffect() {
    const container = document.querySelector('.panel-container');
    if (!container) return;

    for (let i = 0; i < 8; i++) {
        const glitter = document.createElement('div');
        glitter.className = 'glitter-particle';
        
        glitter.style.left = Math.random() * 100 + '%';
        glitter.style.top = Math.random() * 100 + '%';
        glitter.style.animationDelay = Math.random() * 3 + 's';
        glitter.style.animationDuration = (2 + Math.random() * 2) + 's';
        
        container.appendChild(glitter);
        
        setTimeout(() => {
            if (glitter.parentNode) {
                glitter.parentNode.removeChild(glitter);
            }
        }, 5000);
    }
}

/**
 * Start continuous glitter effect
 */
function startGlitterEffect() {
    createGlitterEffect();
    glitterInterval = setInterval(createGlitterEffect, 1500);
}

/**
 * Stop glitter effect
 */
function stopGlitterEffect() {
    if (glitterInterval) {
        clearInterval(glitterInterval);
        glitterInterval = null;
    }
}

/**
 * Create panel HTML structure
 */
function createPanelHTML() {
    return `
        <div class="panel-overlay" id="security-panel-overlay">
            <div class="panel-container" id="security-panel">
                <div class="panel-bg-effects">
                    <div class="glass-reflection"></div>
                    <div class="cosmic-glow"></div>
                    <div class="edge-highlight"></div>
                </div>
                <div class="panel-content">
                    <h1 class="panel-title">
                        <span class="title-text">Security Check</span>
                        <div class="title-shimmer"></div>
                    </h1>
                    <div class="panel-question">
                        <p>Nickname given to you by Aditya.</p>
                        <div class="question-underline"></div>
                    </div>
                    <div class="panel-input-group">
                        <input 
                            type="text" 
                            id="security-answer" 
                            class="panel-input" 
                            placeholder="Enter your answer"
                            autocomplete="off"
                            autocapitalize="none"
                            spellcheck="false"
                        />
                        <div class="input-glow"></div>
                    </div>
                    <button id="panel-next-btn" class="panel-button">
                        <span class="button-text">Next</span>
                        <div class="button-glow"></div>
                        <div class="button-ripple"></div>
                    </button>
                </div>
            </div>
        </div>
    `;
}

/**
 * Create enhanced CSS with mobile-specific fixes
 */
function createPanelStyles() {
    const style = document.createElement('style');
    style.textContent = `
        /* Ultra-fixed positioning - immune to viewport changes */
        .panel-overlay {
            background: rgba(0, 5, 15, 0.004);
            opacity: 0;
            transition: opacity 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            pointer-events: none;
            backdrop-filter: blur(2px);
            
            /* Mobile-specific fixes */
            -webkit-overflow-scrolling: touch;
            overscroll-behavior: none;
            /* CRITICAL: Allow touch actions for interactive elements */
            touch-action: manipulation;
        }
        
        .panel-overlay.visible {
            opacity: 1;
            pointer-events: auto;
        }
        
        .panel-container {
            background: rgba(255, 255, 255, 0.03);
            backdrop-filter: blur(25px) saturate(180%);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 24px;
            box-shadow: 
                0 20px 60px rgba(0, 0, 0, 0.4),
                0 0 80px rgba(0, 255, 255, 0.15),
                0 0 120px rgba(255, 0, 255, 0.08),
                inset 0 1px 0 rgba(255, 255, 255, 0.1),
                inset 0 -1px 0 rgba(255, 255, 255, 0.05);
            overflow: hidden;
            transition: transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            transform: scale(0.85);
            
            /* Prevent any mobile browser optimizations that could interfere */
            -webkit-transform-style: preserve-3d;
            transform-style: preserve-3d;
            -webkit-backface-visibility: hidden;
            backface-visibility: hidden;
            
            /* CRITICAL: Allow touch interactions */
            touch-action: manipulation;
            /* Allow text selection in input */
            user-select: text;
            -webkit-user-select: text;
            -moz-user-select: text;
            -ms-user-select: text;
        }
        
        .panel-overlay.visible .panel-container {
            transform: scale(1);
        }
        
        /* Enhanced shake animation that maintains exact positioning */
        .panel-container.shake {
            animation: ultraStableShake 0.6s cubic-bezier(0.36, 0.07, 0.19, 0.97) forwards;
        }

        @keyframes ultraStableShake {
            0% { transform: scale(1) translate3d(0px, 0px, 0px); }
            10% { transform: scale(1) translate3d(-8px, 0px, 0px); }
            20% { transform: scale(1) translate3d(8px, 0px, 0px); }
            30% { transform: scale(1) translate3d(-6px, 0px, 0px); }
            40% { transform: scale(1) translate3d(6px, 0px, 0px); }
            50% { transform: scale(1) translate3d(-4px, 0px, 0px); }
            60% { transform: scale(1) translate3d(4px, 0px, 0px); }
            70% { transform: scale(1) translate3d(-2px, 0px, 0px); }
            80% { transform: scale(1) translate3d(2px, 0px, 0px); }
            90% { transform: scale(1) translate3d(-1px, 0px, 0px); }
            100% { transform: scale(1) translate3d(0px, 0px, 0px); }
        }
        
        .panel-bg-effects {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            pointer-events: none;
            border-radius: 24px;
            overflow: hidden;
        }
        
        .glass-reflection {
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: linear-gradient(
                45deg,
                transparent 30%,
                rgba(255, 255, 255, 0.03) 50%,
                transparent 70%
            );
            animation: glassReflection 4s ease-in-out infinite;
        }
        
        @keyframes glassReflection {
            0%, 100% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
            50% { transform: translateX(100%) translateY(100%) rotate(45deg); }
        }
        
        .cosmic-glow {
            position: absolute;
            top: 50%;
            left: 50%;
            width: 120%;
            height: 120%;
            background: radial-gradient(
                ellipse at center,
                rgba(0, 255, 255, 0.08) 0%,
                rgba(255, 0, 255, 0.05) 40%,
                transparent 70%
            );
            transform: translate(-50%, -50%);
            animation: cosmicPulse 3s ease-in-out infinite alternate;
        }
        
        @keyframes cosmicPulse {
            0% { opacity: 0.3; transform: translate(-50%, -50%) scale(0.95); }
            100% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.05); }
        }
        
        .edge-highlight {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            border-radius: 24px;
            background: linear-gradient(
                135deg,
                rgba(255, 255, 255, 0.15) 0%,
                transparent 20%,
                transparent 80%,
                rgba(0, 255, 255, 0.1) 100%
            );
            mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            mask-composite: xor;
            padding: 1px;
        }
        
        .glitter-particle {
            position: absolute;
            width: 3px;
            height: 3px;
            background: radial-gradient(circle, rgba(255, 255, 255, 0.9) 0%, transparent 70%);
            border-radius: 50%;
            pointer-events: none;
            animation: glitterSparkle 2s linear infinite;
            z-index: 10;
        }
        
        @keyframes glitterSparkle {
            0%, 100% { 
                opacity: 0; 
                transform: scale(0) rotate(0deg);
                box-shadow: 0 0 0 rgba(255, 255, 255, 0);
            }
            50% { 
                opacity: 1; 
                transform: scale(1) rotate(180deg);
                box-shadow: 0 0 8px rgba(255, 255, 255, 0.6);
            }
        }
        
        .panel-content {
            position: relative;
            text-align: center;
            color: rgba(255, 255, 255, 0.95);
            z-index: 5;
        }
        
        .panel-title {
            position: relative;
            font-family: 'Segoe UI', 'Arial', sans-serif;
            font-size: 2.8rem;
            font-weight: 300;
            margin: 0 0 35px 0;
            letter-spacing: 3px;
            overflow: hidden;
        }
        
        .title-text {
            position: relative;
            background: linear-gradient(
                135deg, 
                #ffffff 0%,
                #00ffff 25%,
                #ffffff 50%,
                #ff00ff 75%,
                #ffffff 100%
            );
            background-size: 200% 200%;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            animation: titleGradient 4s ease-in-out infinite;
            text-shadow: 0 0 30px rgba(255, 255, 255, 0.3);
        }
        
        @keyframes titleGradient {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
        }
        
        .title-shimmer {
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(
                90deg,
                transparent,
                rgba(255, 255, 255, 0.4),
                transparent
            );
            animation: titleShimmer 3s ease-in-out infinite;
        }
        
        @keyframes titleShimmer {
            0% { left: -100%; }
            100% { left: 100%; }
        }
        
        .panel-question {
            position: relative;
            margin-bottom: 35px;
        }
        
        .panel-question p {
            font-size: 1.3rem;
            font-weight: 300;
            margin: 0 0 10px 0;
            color: rgba(255, 255, 255, 0.85);
            text-shadow: 0 0 15px rgba(255, 255, 255, 0.2);
            letter-spacing: 0.5px;
        }
        
        .question-underline {
            width: 60px;
            height: 2px;
            background: linear-gradient(90deg, #00ffff, #ff00ff);
            margin: 0 auto;
            border-radius: 1px;
            animation: underlinePulse 2s ease-in-out infinite alternate;
        }
        
        @keyframes underlinePulse {
            0% { width: 40px; opacity: 0.6; }
            100% { width: 80px; opacity: 1; }
        }
        
        .panel-input-group {
            position: relative;
            margin-bottom: 35px;
        }
        
        .panel-input {
            width: 100%;
            padding: 18px 25px;
            font-size: 1.2rem;
            font-weight: 300;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.15);
            border-radius: 15px;
            color: rgba(255, 255, 255, 0.95);
            outline: none;
            transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            backdrop-filter: blur(15px);
            box-sizing: border-box;
            letter-spacing: 0.5px;
            
            /* Mobile-specific input fixes */
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;
            -webkit-user-select: text;
            user-select: text;
            touch-action: manipulation;
        }
        
        .panel-input::placeholder {
            color: rgba(255, 255, 255, 0.4);
            font-weight: 300;
        }
        
        .panel-input:focus {
            background: rgba(255, 255, 255, 0.08);
            border-color: rgba(0, 255, 255, 0.6);
            box-shadow: 
                0 0 0 3px rgba(0, 255, 255, 0.2),
                0 0 25px rgba(0, 255, 255, 0.3),
                0 8px 25px rgba(0, 0, 0, 0.2);
            transform: translateY(-1px);
        }
        
        .input-glow {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            border-radius: 15px;
            background: linear-gradient(45deg, 
                rgba(0, 255, 255, 0.1),
                rgba(255, 0, 255, 0.1)
            );
            opacity: 0;
            transition: opacity 0.4s ease;
            pointer-events: none;
            z-index: -1;
        }
        
        .panel-input:focus + .input-glow {
            opacity: 1;
        }
        
        .panel-button {
            position: relative;
            padding: 18px 50px;
            font-size: 1.3rem;
            font-weight: 400;
            background: linear-gradient(135deg, 
                rgba(0, 255, 255, 0.2) 0%,
                rgba(255, 0, 255, 0.2) 100%
            );
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 50px;
            color: rgba(255, 255, 255, 0.95);
            cursor: pointer;
            outline: none;
            overflow: hidden;
            text-transform: uppercase;
            letter-spacing: 2px;
            transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            backdrop-filter: blur(20px);
            box-shadow: 
                0 8px 25px rgba(0, 0, 0, 0.2),
                0 0 40px rgba(0, 255, 255, 0.2),
                inset 0 1px 0 rgba(255, 255, 255, 0.1);
            
            /* CRITICAL: Mobile touch optimizations */
            touch-action: manipulation;
            -webkit-tap-highlight-color: transparent;
            /* Ensure button is clickable */
            pointer-events: auto;
            /* Large touch target for mobile */
            min-height: 60px;
            min-width: 120px;
        }
        
        .panel-button:hover {
            background: linear-gradient(135deg, 
                rgba(0, 255, 255, 0.12) 0%,
                rgba(255, 0, 255, 0.12) 100%
            );
            border-color: rgba(255, 255, 255, 0.15);
            transform: translateY(-3px);
            box-shadow: 
                0 12px 35px rgba(0, 0, 0, 0.15),
                0 0 60px rgba(0, 255, 255, 0.15),
                0 0 80px rgba(255, 0, 255, 0.08),
                inset 0 1px 0 rgba(255, 255, 255, 0.08);
        }
        
        .panel-button:active {
            transform: translateY(-1px);
            /* Visual feedback for touch */
            background: linear-gradient(135deg, 
                rgba(0, 255, 255, 0.15) 0%,
                rgba(255, 0, 255, 0.15) 100%
            );
        }
        
        .button-text {
            position: relative;
            z-index: 2;
            pointer-events: none; /* Let clicks pass through to button */
        }
        
        .button-glow {
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, 
                transparent, 
                rgba(255, 255, 255, 0.3), 
                transparent
            );
            transition: left 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            z-index: 1;
            pointer-events: none;
        }
        
        .panel-button:hover .button-glow {
            left: 100%;
        }
        
        .button-ripple {
            position: absolute;
            top: 50%;
            left: 50%;
            width: 0;
            height: 0;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            transform: translate(-50%, -50%);
            transition: all 0.6s ease;
            pointer-events: none;
        }
        
        .panel-button:active .button-ripple {
            width: 200px;
            height: 200px;
        }
        
        /* Enhanced mobile responsive adjustments */
        @media (max-width: 600px) {
            .panel-title {
                font-size: 2.2rem;
                letter-spacing: 1px;
                margin-bottom: 25px;
            }
            
            .panel-question p {
                font-size: 1.1rem;
            }
            
            .panel-input {
                padding: 15px 20px;
                font-size: 1.1rem;
            }
            
            .panel-button {
                padding: 15px 40px;
                font-size: 1.1rem;
                letter-spacing: 1px;
                /* Larger touch target on small screens */
                min-height: 56px;
            }
        }
        
        @media (max-width: 400px) {
            .panel-title {
                font-size: 1.8rem;
                margin-bottom: 20px;
            }
        }
        
        /* Landscape orientation fixes for mobile */
        @media (orientation: landscape) and (max-height: 500px) {
            .panel-container {
                transform: scale(0.8) !important;
            }
            
            .panel-overlay.visible .panel-container {
                transform: scale(0.8) !important;
            }
            
            .panel-container.shake {
                animation: ultraStableShakeLandscape 0.6s cubic-bezier(0.36, 0.07, 0.19, 0.97) forwards;
            }
        }

        @keyframes ultraStableShakeLandscape {
            0% { transform: scale(0.8) translate3d(0px, 0px, 0px); }
            10% { transform: scale(0.8) translate3d(-8px, 0px, 0px); }
            20% { transform: scale(0.8) translate3d(8px, 0px, 0px); }
            30% { transform: scale(0.8) translate3d(-6px, 0px, 0px); }
            40% { transform: scale(0.8) translate3d(6px, 0px, 0px); }
            50% { transform: scale(0.8) translate3d(-4px, 0px, 0px); }
            60% { transform: scale(0.8) translate3d(4px, 0px, 0px); }
            70% { transform: scale(0.8) translate3d(-2px, 0px, 0px); }
            80% { transform: scale(0.8) translate3d(2px, 0px, 0px); }
            90% { transform: scale(0.8) translate3d(-1px, 0px, 0px); }
            100% { transform: scale(0.8) translate3d(0px, 0px, 0px); }
        }
    `;
    
    return style;
}

/**
 * Handle form submission with enhanced positioning stability
 */
function handleSubmit(event) {
    event.preventDefault();
    
    const input = document.getElementById('security-answer');
    const answer = input.value.trim().toLowerCase();
    const panel = document.getElementById('security-panel');
    
    console.log('Form submitted with answer:', answer); // Debug log
    
    if (answer === 'urmi') {
        playClickSound();
        stopGlitterEffect();
        
        const overlay = document.getElementById('security-panel-overlay');
        overlay.classList.remove('visible');
        
        setTimeout(() => {
            unlockBodyPosition();
            if (panelResolve) {
                panelResolve(true);
                panelResolve = null;
            }
        }, 800);
        
    } else {
        console.log('Wrong answer, triggering shake'); // Debug log
        
        // Enhanced shake with guaranteed position restoration
        panel.classList.add('shake');
        input.value = '';
        
        createGlitterEffect();
        createGlitterEffect();
        
        setTimeout(() => {
            panel.classList.remove('shake');
            
            // Force multiple repositioning attempts to ensure stability
            applyFixedPositioning();
            
            setTimeout(() => {
                applyFixedPositioning();
                input.focus();
                
                // Final positioning check after focus
                setTimeout(() => {
                    applyFixedPositioning();
                }, 150);
            }, 50);
        }, 600);
    }
}

/**
 * Show the security panel with ultra-stable JavaScript positioning
 * @returns {Promise<boolean>} Resolves to true when correct answer is entered
 */
export function showPanel() {
    return new Promise((resolve) => {
        panelResolve = resolve;
        preloadAudio();
        
        const uiContainer = document.getElementById('ui-container');
        if (!uiContainer) {
            console.error('UI container not found');
            resolve(false);
            return;
        }
        
        // Lock screen dimensions first - critical for stability
        lockScreenDimensions();
        blockViewportEvents();
        lockBodyPosition();
        
        const styleElement = createPanelStyles();
        document.head.appendChild(styleElement);
        
        uiContainer.innerHTML = createPanelHTML();
        panelContainer = document.getElementById('security-panel-overlay');
        
        // Apply JavaScript positioning immediately and repeatedly
        applyFixedPositioning();
        
        const nextButton = document.getElementById('panel-next-btn');
        const input = document.getElementById('security-answer');
        
        console.log('Button found:', !!nextButton); // Debug log
        console.log('Input found:', !!input); // Debug log
        
        // CRITICAL FIX: Add multiple event listeners for better mobile compatibility
        if (nextButton) {
            // Click event
            nextButton.addEventListener('click', (e) => {
                console.log('Button clicked'); // Debug log
                handleSubmit(e);
            });
            
            // Touch events for mobile
            nextButton.addEventListener('touchstart', (e) => {
                console.log('Button touched'); // Debug log
                // Visual feedback
                nextButton.style.transform = 'translateY(-1px)';
                nextButton.style.background = 'linear-gradient(135deg, rgba(0, 255, 255, 0.15) 0%, rgba(255, 0, 255, 0.15) 100%)';
            }, { passive: true });
            
            nextButton.addEventListener('touchend', (e) => {
                console.log('Touch ended'); // Debug log
                // Reset visual state
                nextButton.style.transform = '';
                nextButton.style.background = '';
                
                // Trigger click after a small delay
                setTimeout(() => {
                    handleSubmit(e);
                }, 50);
            }, { passive: false });
            
            // Prevent touch event conflicts
            nextButton.addEventListener('touchcancel', () => {
                console.log('Touch cancelled');
                nextButton.style.transform = '';
                nextButton.style.background = '';
            });
        }
        
        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    console.log('Enter key pressed'); // Debug log
                    handleSubmit(e);
                }
            });
            
            // Enhanced event handlers for ultra-stable positioning
            input.addEventListener('focus', () => {
                setTimeout(() => {
                    applyFixedPositioning();
                    // Double-check positioning after potential keyboard slide
                    setTimeout(() => applyFixedPositioning(), 200);
                    setTimeout(() => applyFixedPositioning(), 500);
                }, 50);
            });
            
            input.addEventListener('blur', () => {
                setTimeout(() => {
                    applyFixedPositioning();
                    setTimeout(() => applyFixedPositioning(), 200);
                }, 50);
            });
            
            // Listen for any input changes that might affect positioning
            input.addEventListener('input', () => {
                if (repositionTimer) clearTimeout(repositionTimer);
                repositionTimer = setTimeout(() => applyFixedPositioning(), 100);
            });
        }
        
        // IMPROVED: Handle touch events more carefully
        if (panelContainer) {
            panelContainer.addEventListener('touchstart', (e) => {
                const target = e.target;
                console.log('Touch target:', target.tagName, target.className);
                
                // Allow interactions with button and input
                if (target.closest('.panel-button') || target.closest('.panel-input')) {
                    return; // Allow the touch
                }
                
                // Prevent scrolling on other areas
                e.preventDefault();
            }, { passive: false });
            
            panelContainer.addEventListener('touchmove', (e) => {
                // Only prevent if not interacting with input or button
                if (!e.target.closest('.panel-input') && !e.target.closest('.panel-button')) {
                    e.preventDefault();
                    applyFixedPositioning();
                }
            }, { passive: false });
        }
        
        // Show panel with multiple positioning checks
        setTimeout(() => {
            panelContainer.classList.add('visible');
            applyFixedPositioning();
            
            // Progressive positioning verification
            setTimeout(() => {
                applyFixedPositioning();
                input.focus();
                
                setTimeout(() => {
                    applyFixedPositioning();
                    setTimeout(startGlitterEffect, 200);
                }, 100);
            }, 200);
        }, 100);
        
        // Continuous position monitoring (mobile safety net)
        const positionMonitor = setInterval(() => {
            if (panelContainer && panelContainer.classList.contains('visible')) {
                applyFixedPositioning();
            } else {
                clearInterval(positionMonitor);
            }
        }, 1000);
    });
}

/**
 * Hide the panel manually with cleanup
 */
export function hidePanel() {
    stopGlitterEffect();
    unlockBodyPosition();
    positionLocked = false;
    
    if (repositionTimer) {
        clearTimeout(repositionTimer);
        repositionTimer = null;
    }
    
    const overlay = document.getElementById('security-panel-overlay');
    if (overlay) {
        overlay.classList.remove('visible');
        
        setTimeout(() => {
            const uiContainer = document.getElementById('ui-container');
            if (uiContainer) {
                uiContainer.innerHTML = '';
            }
        }, 800);
    }
    
    if (panelResolve) {
        panelResolve(false);
        panelResolve = null;
    }
}
