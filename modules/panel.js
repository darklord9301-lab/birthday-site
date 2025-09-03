// /modules/panel.js
let panelContainer = null;
let clickSound = null;
let panelResolve = null;
let glitterInterval = null;

// Lock viewport height to prevent alignment issues when keyboard pops up
function lockViewportHeight() {
    document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
}
lockViewportHeight();
window.addEventListener('resize', lockViewportHeight);


/**
 * Preload click sound
 */
function preloadAudio() {
    // Click sound only
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

    // Create multiple glitter particles
    for (let i = 0; i < 8; i++) {
        const glitter = document.createElement('div');
        glitter.className = 'glitter-particle';
        
        // Random position
        glitter.style.left = Math.random() * 100 + '%';
        glitter.style.top = Math.random() * 100 + '%';
        
        // Random animation delay
        glitter.style.animationDelay = Math.random() * 3 + 's';
        glitter.style.animationDuration = (2 + Math.random() * 2) + 's';
        
        container.appendChild(glitter);
        
        // Remove after animation
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
 * Create panel CSS styles
 */
function createPanelStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .panel-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: calc(var(--vh, 1vh) * 100);
            background: rgba(0, 5, 15, 0.004);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
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
            position: relative;
            background: rgba(255, 255, 255, 0.03);
            backdrop-filter: blur(25px) saturate(180%);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 24px;
            padding: 45px 55px;
            max-width: 480px;
            width: 90%;
            max-height: 90vh;
            box-sizing: border-box;
            box-shadow: 
                0 20px 60px rgba(0, 0, 0, 0.4),
                0 0 80px rgba(0, 255, 255, 0.15),
                0 0 120px rgba(255, 0, 255, 0.08),
                inset 0 1px 0 rgba(255, 255, 255, 0.1),
                inset 0 -1px 0 rgba(255, 255, 255, 0.05);
            transform: scale(0.85) translateY(60px);
            transition: all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            overflow: hidden;
        }
        
        .panel-overlay.visible .panel-container {
            transform: scale(1) translateY(0);
        }
        
        .panel-container.shake {
            animation: shakeX 0.6s cubic-bezier(0.36, 0.07, 0.19, 0.97);
        }

        @keyframes shakeX {
            0%, 100% { transform: translateX(0); }
            20% { transform: translateX(-8px); }
            40% { transform: translateX(8px); }
            60% { transform: translateX(-6px); }
            80% { transform: translateX(6px); }
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
        
        /* Responsive design */
        @media (max-width: 600px) {
            .panel-container {
                padding: 35px 30px;
                margin: 20px;
                max-width: 95%;
            }
            
            .panel-title {
                font-size: 2.2rem;
                letter-spacing: 1px;
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
            .panel-container {
                padding: 25px 20px;
            }
            
            .panel-title {
                font-size: 1.8rem;
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
        // Correct answer
        playClickSound();
        stopGlitterEffect();
        
        // Fade out panel
        const overlay = document.getElementById('security-panel-overlay');
        overlay.classList.remove('visible');
        
        // Resolve promise after fade out
        setTimeout(() => {
            if (panelResolve) {
                panelResolve(true);
                panelResolve = null;
            }
        }, 800);
        
    } else {
        // Wrong answer - shake panel and create burst of glitter
        panel.classList.add('shake');
        input.value = '';
        input.focus();
        
        // Create extra glitter on wrong answer
        createGlitterEffect();
        createGlitterEffect();
        
        // Remove shake class after animation
        setTimeout(() => {
            panel.classList.remove('shake');
        }, 600);
    }
}

/**
 * Show the security panel
 * @returns {Promise<boolean>} Resolves to true when correct answer is entered
 */
export function showPanel() {
    return new Promise((resolve) => {
        // Store resolve function
        panelResolve = resolve;
        
        // Preload audio
        preloadAudio();
        
        // Get UI container
        const uiContainer = document.getElementById('ui-container');
        if (!uiContainer) {
            console.error('UI container not found');
            resolve(false);
            return;
        }
        
        // Add styles
        const styleElement = createPanelStyles();
        document.head.appendChild(styleElement);
        
        // Create and inject panel
        uiContainer.innerHTML = createPanelHTML();
        panelContainer = document.getElementById('security-panel-overlay');
        
        // Set up event listeners
        const nextButton = document.getElementById('panel-next-btn');
        const input = document.getElementById('security-answer');
        
        nextButton.addEventListener('click', handleSubmit);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleSubmit(e);
            }
        });
        
        // Show panel with animation
        setTimeout(() => {
            panelContainer.classList.add('visible');
            input.focus();
            
            // Start glitter effect after panel is visible
            setTimeout(startGlitterEffect, 500);
        }, 100);
    });
}

/**
 * Hide the panel manually
 */
export function hidePanel() {
    stopGlitterEffect();
    
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
    
    // Reset resolve function
    if (panelResolve) {
        panelResolve(false);
        panelResolve = null;
    }
}
