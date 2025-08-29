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
        background-color: #000;
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 1;
        transition: opacity 1s ease-out;
      }

      .loading-container {
        position: relative;
        width: 100%;
        height: 100%;
        overflow: hidden;
      }

      .figure-container {
        position: absolute;
        top: 40%;
        transform: translateY(-50%);
      }

      .figure {
        max-width: 15vw;
        height: auto;
        min-width: 80px;
        max-height: 200px;
      }

      #man-container {
        left: 5%;
        animation: walk-right 2.5s ease-in-out forwards;
      }

      #woman-container {
        right: 5%;
        animation: walk-left 2.5s ease-in-out forwards;
      }

      /* Walking animations for containers */
      @keyframes walk-right {
        0% { left: 5%; }
        100% { left: calc(50% - 7.5vw); }
      }

      @keyframes walk-left {
        0% { right: 5%; }
        100% { right: calc(50% - 7.5vw); }
      }

      /* Leg walking animations during 0-2.5s */
      .walking .man-figure .left-leg {
        animation: leg-swing-left 0.6s ease-in-out infinite;
      }

      .walking .man-figure .right-leg {
        animation: leg-swing-right 0.6s ease-in-out infinite;
      }

      .walking .woman-figure .left-leg {
        animation: leg-swing-left 0.6s ease-in-out infinite;
      }

      .walking .woman-figure .right-leg {
        animation: leg-swing-right 0.6s ease-in-out infinite;
      }

      @keyframes leg-swing-left {
        0%, 100% { transform-origin: 30px 70px; transform: rotate(0deg); }
        50% { transform-origin: 30px 70px; transform: rotate(-12deg); }
      }

      @keyframes leg-swing-right {
        0%, 100% { transform-origin: 30px 70px; transform: rotate(0deg); }
        50% { transform-origin: 30px 70px; transform: rotate(12deg); }
      }

      /* Hug animations starting at 2.5s */
      .hugging .man-figure .left-arm {
        animation: hug-man-left-arm 0.5s ease-out forwards;
        animation-delay: 0s;
      }

      .hugging .man-figure .right-arm {
        animation: hug-man-right-arm 0.5s ease-out forwards;
        animation-delay: 0s;
      }

      .hugging .woman-figure .left-arm {
        animation: hug-woman-left-arm 0.5s ease-out forwards;
        animation-delay: 0s;
      }

      .hugging .woman-figure .right-arm {
        animation: hug-woman-right-arm 0.5s ease-out forwards;
        animation-delay: 0s;
      }

      @keyframes hug-man-left-arm {
        0% { transform-origin: 30px 35px; transform: rotate(0deg); }
        100% { transform-origin: 30px 35px; transform: rotate(-60deg); }
      }

      @keyframes hug-man-right-arm {
        0% { transform-origin: 30px 35px; transform: rotate(0deg); }
        100% { transform-origin: 30px 35px; transform: rotate(60deg); }
      }

      @keyframes hug-woman-left-arm {
        0% { transform-origin: 30px 35px; transform: rotate(0deg); }
        100% { transform-origin: 30px 35px; transform: rotate(-60deg); }
      }

      @keyframes hug-woman-right-arm {
        0% { transform-origin: 30px 35px; transform: rotate(0deg); }
        100% { transform-origin: 30px 35px; transform: rotate(60deg); }
      }

      /* Fade out class */
      .fade-out {
        opacity: 0 !important;
      }

      /* Responsive adjustments */
      @media (max-width: 768px) {
        .figure {
          min-width: 60px;
          max-height: 150px;
        }

        @keyframes walk-right {
          0% { left: 5%; }
          100% { left: calc(50% - 30px); }
        }

        @keyframes walk-left {
          0% { right: 5%; }
          100% { right: calc(50% - 30px); }
        }
      }
    `;
    
    document.head.appendChild(styleElement);

    // Create overlay HTML
    const overlay = document.createElement('div');
    overlay.id = 'loading-overlay';
    overlay.className = 'walking'; // Start with walking state
    
    overlay.innerHTML = `
      <div class="loading-container">
        <div class="figure-container" id="man-container">
          <svg class="figure man-figure" viewBox="0 0 60 120" xmlns="http://www.w3.org/2000/svg">
            <g stroke="white" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
              <!-- Head -->
              <circle cx="30" cy="15" r="8"/>
              <!-- Body -->
              <line x1="30" y1="23" x2="30" y2="70"/>
              <!-- Arms -->
              <line x1="30" y1="35" x2="18" y2="50" class="left-arm"/>
              <line x1="30" y1="35" x2="42" y2="50" class="right-arm"/>
              <!-- Legs -->
              <line x1="30" y1="70" x2="22" y2="100" class="left-leg"/>
              <line x1="30" y1="70" x2="38" y2="100" class="right-leg"/>
              <!-- Feet -->
              <line x1="22" y1="100" x2="18" y2="105"/>
              <line x1="38" y1="100" x2="42" y2="105"/>
            </g>
          </svg>
        </div>
        
        <div class="figure-container" id="woman-container">
          <svg class="figure woman-figure" viewBox="0 0 60 120" xmlns="http://www.w3.org/2000/svg">
            <g stroke="white" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
              <!-- Head with hair -->
              <circle cx="30" cy="15" r="8"/>
              <path d="M22 8 Q30 3 38 8" stroke-width="1.5"/>
              <!-- Body -->
              <line x1="30" y1="23" x2="30" y2="60"/>
              <!-- Dress/skirt -->
              <path d="M30 60 L24 85 L36 85 Z" stroke-width="2"/>
              <!-- Arms -->
              <line x1="30" y1="35" x2="18" y2="50" class="left-arm"/>
              <line x1="30" y1="35" x2="42" y2="50" class="right-arm"/>
              <!-- Legs -->
              <line x1="26" y1="85" x2="24" y2="105" class="left-leg"/>
              <line x1="34" y1="85" x2="36" y2="105" class="right-leg"/>
              <!-- Feet -->
              <line x1="24" y1="105" x2="20" y2="108"/>
              <line x1="36" y1="105" x2="40" y2="108"/>
            </g>
          </svg>
        </div>
      </div>
    `;

    // Insert overlay into DOM
    document.body.appendChild(overlay);

    // Animation timeline
    // 0.0s - 2.5s: Walking animation (already started with CSS)
    
    // 2.5s: Stop walking, start hugging
    setTimeout(() => {
      overlay.classList.remove('walking');
      overlay.classList.add('hugging');
    }, 2500);

    // 3.0s: Start fade out
    setTimeout(() => {
      overlay.classList.add('fade-out');
    }, 3000);

    // 4.0s: Remove overlay, clean up, resolve promise
    setTimeout(() => {
      // Remove overlay
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
      
      // Remove styles
      const loadingStyles = document.getElementById('loading-styles');
      if (loadingStyles) {
        loadingStyles.remove();
      }
      
      // Resolve the promise
      resolve();
    }, 4000);
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
