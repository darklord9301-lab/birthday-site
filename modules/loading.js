// /modules/loading.js
export function showLoading() {
  return new Promise((resolve) => {
    // Create and inject styles with unique ID
    const styleElement = document.createElement('style');
    styleElement.id = 'loading-styles';
    styleElement.textContent = `
      #loading-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 1;
        transition: opacity 1.5s ease-out;
        overflow: hidden;
      }

      .loading-container {
        position: relative;
        width: 100%;
        height: 100%;
        overflow: hidden;
      }

      .figure-container {
        position: absolute;
        top: 35%;
        transform: translateY(-50%);
        filter: drop-shadow(0 0 8px rgba(255,255,255,0.1));
      }

      .figure {
        max-width: 18vw;
        height: auto;
        min-width: 120px;
        max-height: 280px;
      }

      #man-container {
        left: -20%;
        animation: walk-right 6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
      }

      #woman-container {
        right: -20%;
        animation: walk-left 6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
      }

      /* Walking animations for containers */
      @keyframes walk-right {
        0% { 
          left: -20%; 
          transform: translateY(-50%) scale(0.8);
        }
        20% {
          transform: translateY(-50%) scale(0.85);
        }
        70% {
          transform: translateY(-50%) scale(0.95);
        }
        100% { 
          left: calc(50% - 9vw); 
          transform: translateY(-50%) scale(1);
        }
      }

      @keyframes walk-left {
        0% { 
          right: -20%; 
          transform: translateY(-50%) scale(0.8) scaleX(-1);
        }
        20% {
          transform: translateY(-50%) scale(0.85) scaleX(-1);
        }
        70% {
          transform: translateY(-50%) scale(0.95) scaleX(-1);
        }
        100% { 
          right: calc(50% - 9vw); 
          transform: translateY(-50%) scale(1) scaleX(-1);
        }
      }

      /* Body sway during walking */
      .walking .man-figure .body-group {
        animation: body-sway-right 1.2s ease-in-out infinite;
      }

      .walking .woman-figure .body-group {
        animation: body-sway-left 1.2s ease-in-out infinite;
      }

      @keyframes body-sway-right {
        0%, 100% { transform: rotate(0deg) translateX(0px); }
        25% { transform: rotate(1deg) translateX(0.5px); }
        75% { transform: rotate(-1deg) translateX(-0.5px); }
      }

      @keyframes body-sway-left {
        0%, 100% { transform: rotate(0deg) translateX(0px); }
        25% { transform: rotate(-1deg) translateX(-0.5px); }
        75% { transform: rotate(1deg) translateX(0.5px); }
      }

      /* Detailed leg walking animations */
      .walking .man-figure .left-leg {
        animation: man-left-leg-walk 1.2s ease-in-out infinite;
      }

      .walking .man-figure .right-leg {
        animation: man-right-leg-walk 1.2s ease-in-out infinite;
      }

      .walking .woman-figure .left-leg {
        animation: woman-left-leg-walk 1.4s ease-in-out infinite;
      }

      .walking .woman-figure .right-leg {
        animation: woman-right-leg-walk 1.4s ease-in-out infinite;
      }

      @keyframes man-left-leg-walk {
        0%, 100% { transform-origin: 30px 85px; transform: rotate(0deg); }
        25% { transform-origin: 30px 85px; transform: rotate(-18deg); }
        50% { transform-origin: 30px 85px; transform: rotate(0deg); }
        75% { transform-origin: 30px 85px; transform: rotate(15deg); }
      }

      @keyframes man-right-leg-walk {
        0%, 100% { transform-origin: 30px 85px; transform: rotate(0deg); }
        25% { transform-origin: 30px 85px; transform: rotate(15deg); }
        50% { transform-origin: 30px 85px; transform: rotate(0deg); }
        75% { transform-origin: 30px 85px; transform: rotate(-18deg); }
      }

      @keyframes woman-left-leg-walk {
        0%, 100% { transform-origin: 30px 78px; transform: rotate(0deg); }
        25% { transform-origin: 30px 78px; transform: rotate(-12deg); }
        50% { transform-origin: 30px 78px; transform: rotate(0deg); }
        75% { transform-origin: 30px 78px; transform: rotate(10deg); }
      }

      @keyframes woman-right-leg-walk {
        0%, 100% { transform-origin: 30px 78px; transform: rotate(0deg); }
        25% { transform-origin: 30px 78px; transform: rotate(10deg); }
        50% { transform-origin: 30px 78px; transform: rotate(0deg); }
        75% { transform-origin: 30px 78px; transform: rotate(-12deg); }
      }

      /* Arm swinging during walk */
      .walking .man-figure .left-arm {
        animation: man-left-arm-swing 1.2s ease-in-out infinite;
      }

      .walking .man-figure .right-arm {
        animation: man-right-arm-swing 1.2s ease-in-out infinite;
      }

      .walking .woman-figure .left-arm {
        animation: woman-left-arm-swing 1.4s ease-in-out infinite;
      }

      .walking .woman-figure .right-arm {
        animation: woman-right-arm-swing 1.4s ease-in-out infinite;
      }

      @keyframes man-left-arm-swing {
        0%, 100% { transform-origin: 30px 40px; transform: rotate(0deg); }
        25% { transform-origin: 30px 40px; transform: rotate(20deg); }
        75% { transform-origin: 30px 40px; transform: rotate(-15deg); }
      }

      @keyframes man-right-arm-swing {
        0%, 100% { transform-origin: 30px 40px; transform: rotate(0deg); }
        25% { transform-origin: 30px 40px; transform: rotate(-15deg); }
        75% { transform-origin: 30px 40px; transform: rotate(20deg); }
      }

      @keyframes woman-left-arm-swing {
        0%, 100% { transform-origin: 30px 40px; transform: rotate(0deg); }
        25% { transform-origin: 30px 40px; transform: rotate(15deg); }
        75% { transform-origin: 30px 40px; transform: rotate(-12deg); }
      }

      @keyframes woman-right-arm-swing {
        0%, 100% { transform-origin: 30px 40px; transform: rotate(0deg); }
        25% { transform-origin: 30px 40px; transform: rotate(-12deg); }
        75% { transform-origin: 30px 40px; transform: rotate(15deg); }
      }

      /* Meeting and anticipation phase */
      .meeting .figure-container {
        animation: meeting-bounce 1s ease-out forwards;
      }

      @keyframes meeting-bounce {
        0% { transform: translateY(-50%) scale(1); }
        30% { transform: translateY(-52%) scale(1.02); }
        60% { transform: translateY(-48%) scale(0.98); }
        100% { transform: translateY(-50%) scale(1); }
      }

      /* Extended hug sequence */
      .hugging .man-figure .left-arm {
        animation: hug-man-left-arm 2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
      }

      .hugging .man-figure .right-arm {
        animation: hug-man-right-arm 2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
      }

      .hugging .woman-figure .left-arm {
        animation: hug-woman-left-arm 2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
      }

      .hugging .woman-figure .right-arm {
        animation: hug-woman-right-arm 2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
      }

      /* Head movement during hug */
      .hugging .man-figure .head-group {
        animation: hug-head-tilt-right 2s ease-out forwards;
      }

      .hugging .woman-figure .head-group {
        animation: hug-head-tilt-left 2s ease-out forwards;
      }

      @keyframes hug-man-left-arm {
        0% { transform-origin: 30px 40px; transform: rotate(0deg); }
        30% { transform-origin: 30px 40px; transform: rotate(-20deg); }
        100% { transform-origin: 30px 40px; transform: rotate(-75deg); }
      }

      @keyframes hug-man-right-arm {
        0% { transform-origin: 30px 40px; transform: rotate(0deg); }
        30% { transform-origin: 30px 40px; transform: rotate(20deg); }
        100% { transform-origin: 30px 40px; transform: rotate(75deg); }
      }

      @keyframes hug-woman-left-arm {
        0% { transform-origin: 30px 40px; transform: rotate(0deg); }
        30% { transform-origin: 30px 40px; transform: rotate(-20deg); }
        100% { transform-origin: 30px 40px; transform: rotate(-75deg); }
      }

      @keyframes hug-woman-right-arm {
        0% { transform-origin: 30px 40px; transform: rotate(0deg); }
        30% { transform-origin: 30px 40px; transform: rotate(20deg); }
        100% { transform-origin: 30px 40px; transform: rotate(75deg); }
      }

      @keyframes hug-head-tilt-right {
        0% { transform-origin: 30px 20px; transform: rotate(0deg); }
        100% { transform-origin: 30px 20px; transform: rotate(8deg); }
      }

      @keyframes hug-head-tilt-left {
        0% { transform-origin: 30px 20px; transform: rotate(0deg); }
        100% { transform-origin: 30px 20px; transform: rotate(-8deg); }
      }

      /* Heart particles */
      .heart-particle {
        position: absolute;
        color: rgba(255, 150, 150, 0.8);
        font-size: 20px;
        pointer-events: none;
        animation: float-heart 3s ease-out forwards;
      }

      @keyframes float-heart {
        0% {
          opacity: 0;
          transform: translateY(0px) scale(0.5);
        }
        20% {
          opacity: 1;
          transform: translateY(-20px) scale(1);
        }
        100% {
          opacity: 0;
          transform: translateY(-80px) scale(0.3);
        }
      }

      /* Fade out class */
      .fade-out {
        opacity: 0 !important;
      }

      /* Responsive adjustments */
      @media (max-width: 768px) {
        .figure {
          min-width: 90px;
          max-height: 200px;
          max-width: 25vw;
        }

        @keyframes walk-right {
          0% { left: -25%; transform: translateY(-50%) scale(0.7); }
          100% { left: calc(50% - 12.5vw); transform: translateY(-50%) scale(1); }
        }

        @keyframes walk-left {
          0% { right: -25%; transform: translateY(-50%) scale(0.7) scaleX(-1); }
          100% { right: calc(50% - 12.5vw); transform: translateY(-50%) scale(1) scaleX(-1); }
        }
      }
    `;
    
    document.head.appendChild(styleElement);

    // Create overlay HTML with detailed characters
    const overlay = document.createElement('div');
    overlay.id = 'loading-overlay';
    overlay.className = 'walking';
    
    overlay.innerHTML = `
      <div class="loading-container">
        <div class="figure-container" id="man-container">
          <svg class="figure man-figure" viewBox="0 0 60 140" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="roughen">
                <feTurbulence baseFrequency="0.04" numOctaves="3" result="noise" seed="1"/>
                <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.8"/>
              </filter>
            </defs>
            <g stroke="white" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round" filter="url(#roughen)">
              
              <!-- Head group -->
              <g class="head-group">
                <!-- Head -->
                <circle cx="30" cy="20" r="9"/>
                <!-- Hair (messy, hand-drawn style) -->
                <path d="M21 15 Q19 12 21 10 Q25 8 30 9 Q35 8 39 10 Q41 12 39 15"/>
                <path d="M22 13 Q20 11 22 9"/>
                <path d="M38 13 Q40 11 38 9"/>
                <!-- Face details -->
                <circle cx="26" cy="18" r="0.8" fill="white"/>
                <circle cx="34" cy="18" r="0.8" fill="white"/>
                <path d="M28 23 Q30 25 32 23"/>
                <!-- Ears -->
                <path d="M21 18 Q19 18 19 20 Q19 22 21 22"/>
                <path d="M39 18 Q41 18 41 20 Q41 22 39 22"/>
              </g>

              <!-- Body group -->
              <g class="body-group">
                <!-- Neck -->
                <line x1="30" y1="29" x2="30" y2="35"/>
                <!-- Torso (slightly curved) -->
                <path d="M30 35 L30 85 M25 45 Q30 43 35 45 M24 65 Q30 63 36 65"/>
                <!-- Shoulder line -->
                <path d="M22 40 Q30 38 38 40"/>
                <!-- Belt -->
                <path d="M24 75 L36 75"/>
                <rect x="28" y="73" width="4" height="4" stroke-width="1"/>
              </g>

              <!-- Left arm group -->
              <g class="left-arm">
                <!-- Upper arm -->
                <path d="M24 40 Q18 48 16 58"/>
                <!-- Forearm -->
                <path d="M16 58 Q14 68 18 75"/>
                <!-- Hand -->
                <path d="M18 75 Q16 77 18 79 Q20 77 22 79"/>
                <!-- Fingers detail -->
                <path d="M18 77 L17 79 M19 77 L18 79 M20 77 L19 79"/>
              </g>

              <!-- Right arm group -->
              <g class="right-arm">
                <!-- Upper arm -->
                <path d="M36 40 Q42 48 44 58"/>
                <!-- Forearm -->
                <path d="M44 58 Q46 68 42 75"/>
                <!-- Hand -->
                <path d="M42 75 Q40 77 42 79 Q44 77 46 79"/>
                <!-- Fingers detail -->
                <path d="M42 77 L41 79 M43 77 L42 79 M44 77 L43 79"/>
              </g>

              <!-- Left leg group -->
              <g class="left-leg">
                <!-- Thigh -->
                <path d="M27 85 Q25 95 24 105"/>
                <!-- Shin -->
                <path d="M24 105 Q22 115 24 125"/>
                <!-- Foot -->
                <path d="M24 125 L20 128 L26 128 Z"/>
                <!-- Shoe detail -->
                <path d="M20 127 Q23 126 26 127"/>
              </g>

              <!-- Right leg group -->
              <g class="right-leg">
                <!-- Thigh -->
                <path d="M33 85 Q35 95 36 105"/>
                <!-- Shin -->
                <path d="M36 105 Q38 115 36 125"/>
                <!-- Foot -->
                <path d="M36 125 L32 128 L40 128 Z"/>
                <!-- Shoe detail -->
                <path d="M32 127 Q35 126 40 127"/>
              </g>
            </g>
          </svg>
        </div>
        
        <div class="figure-container" id="woman-container">
          <svg class="figure woman-figure" viewBox="0 0 60 140" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="roughen2">
                <feTurbulence baseFrequency="0.04" numOctaves="3" result="noise" seed="2"/>
                <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.8"/>
              </filter>
            </defs>
            <g stroke="white" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round" filter="url(#roughen2)">
              
              <!-- Head group -->
              <g class="head-group">
                <!-- Head -->
                <circle cx="30" cy="20" r="9"/>
                <!-- Hair (longer, flowing) -->
                <path d="M21 12 Q15 8 18 6 Q25 4 30 6 Q35 4 42 6 Q45 8 39 12"/>
                <path d="M20 15 Q15 12 17 20 Q19 25 22 22"/>
                <path d="M40 15 Q45 12 43 20 Q41 25 38 22"/>
                <path d="M25 8 Q23 5 25 3"/>
                <path d="M35 8 Q37 5 35 3"/>
                <!-- Face details -->
                <circle cx="26" cy="18" r="0.8" fill="white"/>
                <circle cx="34" cy="18" r="0.8" fill="white"/>
                <path d="M27 23 Q30 25 33 23"/>
                <!-- Earrings -->
                <circle cx="20" cy="22" r="1.2"/>
                <circle cx="40" cy="22" r="1.2"/>
              </g>

              <!-- Body group -->
              <g class="body-group">
                <!-- Neck -->
                <line x1="30" y1="29" x2="30" y2="35"/>
                <!-- Torso -->
                <path d="M30 35 L30 78"/>
                <!-- Chest/blouse details -->
                <path d="M24 42 Q30 40 36 42"/>
                <path d="M26 52 Q30 50 34 52"/>
                <!-- Waist -->
                <path d="M26 70 Q30 68 34 70"/>
              </g>

              <!-- Left arm group -->
              <g class="left-arm">
                <!-- Upper arm -->
                <path d="M24 40 Q18 46 16 56"/>
                <!-- Forearm -->
                <path d="M16 56 Q14 66 18 72"/>
                <!-- Hand with bracelet -->
                <path d="M18 72 Q16 74 18 76 Q20 74 22 76"/>
                <circle cx="18" cy="70" r="1.5"/>
                <!-- Fingers detail -->
                <path d="M18 74 L17 76 M19 74 L18 76 M20 74 L19 76"/>
              </g>

              <!-- Right arm group -->
              <g class="right-arm">
                <!-- Upper arm -->
                <path d="M36 40 Q42 46 44 56"/>
                <!-- Forearm -->
                <path d="M44 56 Q46 66 42 72"/>
                <!-- Hand with bracelet -->
                <path d="M42 72 Q40 74 42 76 Q44 74 46 76"/>
                <circle cx="42" cy="70" r="1.5"/>
                <!-- Fingers detail -->
                <path d="M42 74 L41 76 M43 74 L42 76 M44 74 L43 76"/>
              </g>

              <!-- Dress -->
              <path d="M26 78 Q20 95 18 112 Q25 115 30 115 Q35 115 42 112 Q40 95 34 78 Z"/>
              <path d="M22 85 Q30 83 38 85"/>
              <path d="M20 100 Q30 98 40 100"/>

              <!-- Left leg group -->
              <g class="left-leg">
                <!-- Leg -->
                <path d="M26 112 Q24 118 26 125"/>
                <!-- Foot with heel -->
                <path d="M26 125 L22 128 L28 130 L24 132"/>
                <!-- Shoe detail -->
                <path d="M22 128 Q25 127 28 128"/>
              </g>

              <!-- Right leg group -->
              <g class="right-leg">
                <!-- Leg -->
                <path d="M34 112 Q36 118 34 125"/>
                <!-- Foot with heel -->
                <path d="M34 125 L30 128 L36 130 L32 132"/>
                <!-- Shoe detail -->
                <path d="M30 128 Q33 127 36 128"/>
              </g>
            </g>
          </svg>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    // Extended animation timeline (12 seconds total)
    
    // 6s: Stop walking, brief meeting pause
    setTimeout(() => {
      overlay.classList.remove('walking');
      overlay.classList.add('meeting');
    }, 6000);

    // 7s: Start hugging sequence
    setTimeout(() => {
      overlay.classList.remove('meeting');
      overlay.classList.add('hugging');
      
      // Add heart particles
      for (let i = 0; i < 5; i++) {
        setTimeout(() => {
          const heart = document.createElement('div');
          heart.className = 'heart-particle';
          heart.textContent = '♥';
          heart.style.left = `${48 + Math.random() * 8}%`;
          heart.style.top = `${40 + Math.random() * 10}%`;
          overlay.appendChild(heart);
          
          setTimeout(() => heart.remove(), 3000);
        }, i * 400);
      }
    }, 7000);

    // 9.5s: Start fade out
    setTimeout(() => {
      overlay.classList.add('fade-out');
    }, 9500);

    // 11s: Remove overlay, clean up, resolve promise
    setTimeout(() => {
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
      
      const loadingStyles = document.getElementById('loading-styles');
      if (loadingStyles) {
        loadingStyles.remove();
      }
      
      resolve();
    }, 11000);
  });
}

// Utility functions
export function isLoadingActive() {
  return document.getElementById('loading-overlay') !== null;
}

export function forceStopLoading() {
  const overlay = document.getElementById('loading-overlay');
  if (overlay) {
    overlay.remove();
  }
  
  const styles = document.getElementById('loading-styles');
  if (styles) {
    styles.remove();
  }
}
