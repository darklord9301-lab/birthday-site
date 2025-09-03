// /modules/panel.js
let panelContainer = null;
let clickSound = null;
let panelResolve = null;
let glitterInterval = null;
let fixedDimensions = null;
let positionLocked = false;

/**
 * Capture screen dimensions and lock them permanently
 */
function lockScreenDimensions() {
    if (!fixedDimensions) {
        // Get the actual rendered dimensions, not window dimensions
        const body = document.body;
        const html = document.documentElement;
        
        fixedDimensions = {
            width: Math.max(body.scrollWidth, body.offsetWidth, html.clientWidth, html.scrollWidth, html.offsetWidth),
            height: Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight)
        };
        
        // Use current window dimensions as fallback
        if (fixedDimensions.width === 0) fixedDimensions.width = window.innerWidth;
        if (fixedDimensions.height === 0) fixedDimensions.height = window.innerHeight;
        
        console.log('Locked dimensions:', fixedDimensions);
    }
    
    return fixedDimensions;
}

/**
 * Apply fixed positioning with JavaScript
 */
function applyFixedPositioning() {
    if (!panelContainer || !fixedDimensions) return;
    
    const overlay = panelContainer;
    const panel = overlay.querySelector('.panel-container');
    
    if (overlay && panel) {
        // Set overlay to exact fixed dimensions
        overlay.style.position = 'fixed';
        overlay.style.top = '0px';
        overlay.style.left = '0px';
        overlay.style.width = fixedDimensions.width + 'px';
        overlay.style.height = fixedDimensions.height + 'px';
        overlay.style.zIndex = '1000';
        overlay.style.overflow = 'hidden';
        
        // Center the panel manually
        const panelWidth = 480;
        const panelHeight = 400;
        
        const centerX = (fixedDimensions.width - panelWidth) / 2;
        const centerY = (fixedDimensions.height - panelHeight) / 2;
        
        panel.style.position = 'absolute';
        panel.style.left = centerX + 'px';
        panel.style.top = centerY + 'px';
        panel.style.width = panelWidth + 'px';
        panel.style.transform = 'none'; // Remove all CSS transforms
        panel.style.margin = '0';
        panel.style.padding = '45px 55px';
        panel.style.boxSizing = 'border-box';
    }
}

/**
 * Prevent any viewport-related events
 */
function blockViewportEvents() {
    if (positionLocked) return;
    positionLocked = true;
    
    // Block resize events
    const originalResize = window.onresize;
    window.onresize = function(e) {
        if (panelContainer && panelContainer.classList.contains('visible')) {
            e.stopPropagation();
            e.preventDefault();
            applyFixedPositioning();
            return false;
        }
        if (originalResize) originalResize.call(this, e);
    };
    
    // Block orientation changes
    const originalOrientationChange = window.onorientationchange;
    window.onorientationchange = function(e) {
        if (panelContainer && panelContainer.classList.contains('visible')) {
            e.stopPropagation();
            e.preventDefault();
            return false;
        }
        if (originalOrientationChange) originalOrientationChange.call(this, e);
    };
    
    // Block visual viewport changes (iOS Safari)
    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', function(e) {
            if (panelContainer && panelContainer.classList.contains('visible')) {
                e.stopPropagation();
                e.preventDefault();
                applyFixedPositioning();
            }
        });
    }
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
 * Create minimal CSS - positioning handled by JavaScript
 */
function createPanelStyles() {
    const style = document.createElement('style');
    style.textContent = `
        /* Minimal CSS - positioning controlled by JavaScript */
        .panel-overlay {
            background: rgba(0, 5, 15, 0.004);
            opacity: 0;
            transition: opacity 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            pointer-events: none;
            backdrop-filter: blur(2px);
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
        }
        
        .panel-overlay.visible .panel-container {
            transform: scale(1);
        }
        
        /* JavaScript-controlled shake animation */
        .panel-container.shake {
            animation: jsShake 0.6s cubic-bezier(0.36, 0.07, 0.19, 0.97);
        }

        @keyframes jsShake {
            0%, 100% { transform: scale(1) translateX(0px); }
            10% { transform: scale(1) translateX(-8px); }
            20% { transform: scale(1) translateX(8px); }
            30% { transform: scale(1) translateX(-6px); }
            40% { transform: scale(1) translateX(6px); }
            50% { transform: scale(1) translateX(-4px); }
            60% { transform: scale(1) translateX(4px); }
            70% { transform: scale(1) translateX(-2px); }
            80% { transform: scale(1) translateX(2px); }
            90% { transform: scale(1) translateX(-1px); }
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
        }
        
        .button-text {
            position: relative;
            z-index: 2;
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
        }
        
        .panel-button:active .button-ripple {
            width: 200px;
            height: 200px;
        }
        
        /* Mobile responsive adjustments */
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
            }
        }
        
        @media (max-width: 400px) {
            .panel-title {
                font-size: 1.8rem;
                margin-bottom: 20px;
            }
        }
    `;
    
    return style;
}

/**
 * Handle form submission
 */
function handleSubmit(event) {
    event.preventDefault();
    
    const input = document.getElementById('security-answer');
    const answer = input.value.trim().toLowerCase();
    const panel = document.getElementById('security-panel');
    
    if (answer === 'urmi') {
        playClickSound();
        stopGlitterEffect();
        
        const overlay = document.getElementById('security-panel-overlay');
        overlay.classList.remove('visible');
        
        setTimeout(() => {
            if (panelResolve) {
                panelResolve(true);
                panelResolve = null;
            }
        }, 800);
        
    } else {
        panel.classList.add('shake');
        input.value = '';
        
        createGlitterEffect();
        createGlitterEffect();
        
        setTimeout(() => {
            panel.classList.remove('shake');
            // Reapply positioning after shake
            applyFixedPositioning();
            input.focus();
        }, 600);
    }
}

/**
 * Show the security panel with JavaScript positioning
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
        
        // Lock screen dimensions first
        lockScreenDimensions();
        blockViewportEvents();
        
        const styleElement = createPanelStyles();
        document.head.appendChild(styleElement);
        
        uiContainer.innerHTML = createPanelHTML();
        panelContainer = document.getElementById('security-panel-overlay');
        
        // Apply JavaScript positioning immediately
        applyFixedPositioning();
        
        const nextButton = document.getElementById('panel-next-btn');
        const input = document.getElementById('security-answer');
        
        nextButton.addEventListener('click', handleSubmit);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleSubmit(e);
            }
        });
        
        // Reapply positioning on any focus events
        input.addEventListener('focus', () => {
            setTimeout(() => applyFixedPositioning(), 100);
        });
        
        input.addEventListener('blur', () => {
            setTimeout(() => applyFixedPositioning(), 100);
        });
        
        setTimeout(() => {
            panelContainer.classList.add('visible');
            applyFixedPositioning(); // Ensure positioning after visible
            input.focus();
            setTimeout(startGlitterEffect, 500);
        }, 100);
    });
}

/**
 * Hide the panel manually
 */
export function hidePanel() {
    stopGlitterEffect();
    positionLocked = false;
    
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
