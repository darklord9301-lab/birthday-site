// /modules/panel.js
let panelContainer = null;
let clickSound = null;
let panelResolve = null;

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
 * Create panel HTML structure
 */
function createPanelHTML() {
    return `
        <div class="panel-overlay" id="security-panel-overlay">
            <div class="panel-container" id="security-panel">
                <div class="panel-content">
                    <h1 class="panel-title">Security Check</h1>
                    <div class="panel-question">
                        <p>Nickname given to you by Aditya.</p>
                    </div>
                    <div class="panel-input-group">
                        <input 
                            type="text" 
                            id="security-answer" 
                            class="panel-input" 
                            placeholder="Enter your answer"
                            autocomplete="off"
                        />
                    </div>
                    <button id="panel-next-btn" class="panel-button">
                        <span>Next</span>
                        <div class="button-glow"></div>
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
            height: 100vh;
            background: rgba(0, 0, 0, 0.3);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            opacity: 0;
            transition: opacity 0.5s ease-in-out;
            pointer-events: none;
        }
        
        .panel-overlay.visible {
            opacity: 1;
            pointer-events: auto;
        }
        
        .panel-container {
            background: linear-gradient(135deg, 
                rgba(255, 255, 255, 0.1) 0%, 
                rgba(255, 255, 255, 0.05) 100%
            );
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 20px;
            padding: 40px 50px;
            max-width: 450px;
            width: 90%;
            box-shadow: 
                0 8px 32px rgba(0, 0, 0, 0.3),
                0 0 60px rgba(0, 255, 255, 0.3),
                inset 0 1px 0 rgba(255, 255, 255, 0.2);
            transform: scale(0.8) translateY(50px);
            transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        
        .panel-overlay.visible .panel-container {
            transform: scale(1) translateY(0);
        }
        
        .panel-container.shake {
            animation: shake 0.5s ease-in-out;
        }
        
        @keyframes shake {
            0%, 100% { transform: scale(1) translateX(0); }
            25% { transform: scale(1) translateX(-10px); }
            75% { transform: scale(1) translateX(10px); }
        }
        
        .panel-content {
            text-align: center;
            color: white;
        }
        
        .panel-title {
            font-family: 'Arial', sans-serif;
            font-size: 2.5rem;
            font-weight: 700;
            margin: 0 0 30px 0;
            background: linear-gradient(45deg, #00ffff, #ff00ff);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            text-shadow: 
                0 0 20px rgba(0, 255, 255, 0.5),
                0 0 40px rgba(255, 0, 255, 0.3);
            letter-spacing: 2px;
        }
        
        .panel-question {
            margin-bottom: 30px;
        }
        
        .panel-question p {
            font-size: 1.2rem;
            margin: 0;
            color: rgba(255, 255, 255, 0.9);
            text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
        }
        
        .panel-input-group {
            margin-bottom: 30px;
        }
        
        .panel-input {
            width: 100%;
            padding: 15px 20px;
            font-size: 1.1rem;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 10px;
            color: white;
            outline: none;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
            box-sizing: border-box;
        }
        
        .panel-input::placeholder {
            color: rgba(255, 255, 255, 0.5);
        }
        
        .panel-input:focus {
            border-color: #00ffff;
            box-shadow: 
                0 0 0 2px rgba(0, 255, 255, 0.3),
                0 0 20px rgba(0, 255, 255, 0.2);
            background: rgba(255, 255, 255, 0.15);
        }
        
        .panel-button {
            position: relative;
            padding: 15px 40px;
            font-size: 1.2rem;
            font-weight: 600;
            background: linear-gradient(45deg, #00ffff, #ff00ff);
            border: none;
            border-radius: 50px;
            color: white;
            cursor: pointer;
            outline: none;
            overflow: hidden;
            text-transform: uppercase;
            letter-spacing: 1px;
            transition: all 0.3s ease;
            box-shadow: 
                0 4px 15px rgba(0, 255, 255, 0.4),
                0 0 50px rgba(255, 0, 255, 0.3);
        }
        
        .panel-button:hover {
            transform: translateY(-2px);
            box-shadow: 
                0 6px 20px rgba(0, 255, 255, 0.5),
                0 0 70px rgba(255, 0, 255, 0.4);
        }
        
        .panel-button:active {
            transform: translateY(0);
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
            transition: left 0.5s ease;
        }
        
        .panel-button:hover .button-glow {
            left: 100%;
        }
        
        /* Responsive design */
        @media (max-width: 600px) {
            .panel-container {
                padding: 30px 25px;
                margin: 20px;
            }
            
            .panel-title {
                font-size: 2rem;
            }
            
            .panel-question p {
                font-size: 1.1rem;
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
        
        // Fade out panel
        const overlay = document.getElementById('security-panel-overlay');
        overlay.classList.remove('visible');
        
        // Resolve promise after fade out
        setTimeout(() => {
            if (panelResolve) {
                panelResolve(true);
                panelResolve = null;
            }
        }, 500);
        
    } else {
        // Wrong answer - shake panel
        panel.classList.add('shake');
        input.value = '';
        input.focus();
        
        // Remove shake class after animation
        setTimeout(() => {
            panel.classList.remove('shake');
        }, 500);
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
        }, 100);
    });
}

/**
 * Hide the panel manually
 */
export function hidePanel() {
    const overlay = document.getElementById('security-panel-overlay');
    if (overlay) {
        overlay.classList.remove('visible');
        
        setTimeout(() => {
            const uiContainer = document.getElementById('ui-container');
            if (uiContainer) {
                uiContainer.innerHTML = '';
            }
        }, 500);
    }
    
    // Reset resolve function
    if (panelResolve) {
        panelResolve(false);
        panelResolve = null;
    }
}
