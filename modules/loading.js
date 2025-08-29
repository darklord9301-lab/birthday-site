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
        background: radial-gradient(circle at center, #1a1a1a 0%, #000000 100%);
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
        top: 38%;
        transform: translateY(-50%);
        filter: drop-shadow(0 0 12px rgba(255,255,255,0.15));
      }

      .figure {
        max-width: 22vw;
        height: auto;
        min-width: 140px;
        max-height: 320px;
      }

      #man-container {
        left: -25%;
        animation: walk-right 6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
      }

      #woman-container {
        right: -25%;
        animation: walk-left 6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
      }

      /* Walking animations for containers */
      @keyframes walk-right {
        0% { 
          left: -25%; 
          transform: translateY(-50%) scale(0.75);
        }
        100% { 
          left: calc(50% - 11vw); 
          transform: translateY(-50%) scale(1);
        }
      }

      @keyframes walk-left {
        0% { 
          right: -25%; 
          transform: translateY(-50%) scale(0.75) scaleX(-1);
        }
        100% { 
          right: calc(50% - 11vw); 
          transform: translateY(-50%) scale(1) scaleX(-1);
        }
      }

      /* Realistic body movement */
      .walking .man-figure .torso-group {
        animation: realistic-body-sway 1.4s ease-in-out infinite;
      }

      .walking .woman-figure .torso-group {
        animation: realistic-body-sway-feminine 1.6s ease-in-out infinite;
      }

      @keyframes realistic-body-sway {
        0%, 100% { transform: rotate(0deg) translateX(0px); }
        25% { transform: rotate(0.8deg) translateX(0.3px); }
        75% { transform: rotate(-0.8deg) translateX(-0.3px); }
      }

      @keyframes realistic-body-sway-feminine {
        0%, 100% { transform: rotate(0deg) translateX(0px); }
        25% { transform: rotate(-0.6deg) translateX(-0.2px); }
        75% { transform: rotate(0.6deg) translateX(0.2px); }
      }

      /* Realistic leg walking animations */
      .walking .man-figure .left-leg {
        animation: man-realistic-left-leg 1.4s ease-in-out infinite;
      }

      .walking .man-figure .right-leg {
        animation: man-realistic-right-leg 1.4s ease-in-out infinite;
      }

      .walking .woman-figure .left-leg {
        animation: woman-realistic-left-leg 1.6s ease-in-out infinite;
      }

      .walking .woman-figure .right-leg {
        animation: woman-realistic-right-leg 1.6s ease-in-out infinite;
      }

      @keyframes man-realistic-left-leg {
        0%, 100% { transform-origin: 50px 110px; transform: rotate(0deg); }
        25% { transform-origin: 50px 110px; transform: rotate(-25deg); }
        50% { transform-origin: 50px 110px; transform: rotate(0deg); }
        75% { transform-origin: 50px 110px; transform: rotate(20deg); }
      }

      @keyframes man-realistic-right-leg {
        0%, 100% { transform-origin: 50px 110px; transform: rotate(0deg); }
        25% { transform-origin: 50px 110px; transform: rotate(20deg); }
        50% { transform-origin: 50px 110px; transform: rotate(0deg); }
        75% { transform-origin: 50px 110px; transform: rotate(-25deg); }
      }

      @keyframes woman-realistic-left-leg {
        0%, 100% { transform-origin: 50px 105px; transform: rotate(0deg); }
        25% { transform-origin: 50px 105px; transform: rotate(-20deg); }
        50% { transform-origin: 50px 105px; transform: rotate(0deg); }
        75% { transform-origin: 50px 105px; transform: rotate(15deg); }
      }

      @keyframes woman-realistic-right-leg {
        0%, 100% { transform-origin: 50px 105px; transform: rotate(0deg); }
        25% { transform-origin: 50px 105px; transform: rotate(15deg); }
        50% { transform-origin: 50px 105px; transform: rotate(0deg); }
        75% { transform-origin: 50px 105px; transform: rotate(-20deg); }
      }

      /* Realistic arm swinging */
      .walking .man-figure .left-arm {
        animation: man-realistic-left-arm 1.4s ease-in-out infinite;
      }

      .walking .man-figure .right-arm {
        animation: man-realistic-right-arm 1.4s ease-in-out infinite;
      }

      .walking .woman-figure .left-arm {
        animation: woman-realistic-left-arm 1.6s ease-in-out infinite;
      }

      .walking .woman-figure .right-arm {
        animation: woman-realistic-right-arm 1.6s ease-in-out infinite;
      }

      @keyframes man-realistic-left-arm {
        0%, 100% { transform-origin: 50px 60px; transform: rotate(0deg); }
        25% { transform-origin: 50px 60px; transform: rotate(25deg); }
        75% { transform-origin: 50px 60px; transform: rotate(-20deg); }
      }

      @keyframes man-realistic-right-arm {
        0%, 100% { transform-origin: 50px 60px; transform: rotate(0deg); }
        25% { transform-origin: 50px 60px; transform: rotate(-20deg); }
        75% { transform-origin: 50px 60px; transform: rotate(25deg); }
      }

      @keyframes woman-realistic-left-arm {
        0%, 100% { transform-origin: 50px 60px; transform: rotate(0deg); }
        25% { transform-origin: 50px 60px; transform: rotate(20deg); }
        75% { transform-origin: 50px 60px; transform: rotate(-15deg); }
      }

      @keyframes woman-realistic-right-arm {
        0%, 100% { transform-origin: 50px 60px; transform: rotate(0deg); }
        25% { transform-origin: 50px 60px; transform: rotate(-15deg); }
        75% { transform-origin: 50px 60px; transform: rotate(20deg); }
      }

      /* Meeting phase */
      .meeting .figure-container {
        animation: meeting-anticipation 1s ease-out forwards;
      }

      @keyframes meeting-anticipation {
        0% { transform: translateY(-50%) scale(1); }
        50% { transform: translateY(-48%) scale(1.03); }
        100% { transform: translateY(-50%) scale(1); }
      }

      /* Extended realistic hug sequence */
      .hugging .man-figure .left-arm {
        animation: hug-man-left-realistic 2.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
      }

      .hugging .man-figure .right-arm {
        animation: hug-man-right-realistic 2.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
      }

      .hugging .woman-figure .left-arm {
        animation: hug-woman-left-realistic 2.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
      }

      .hugging .woman-figure .right-arm {
        animation: hug-woman-right-realistic 2.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
      }

      .hugging .man-figure .head-group {
        animation: hug-head-tilt-masculine 2.5s ease-out forwards;
      }

      .hugging .woman-figure .head-group {
        animation: hug-head-tilt-feminine 2.5s ease-out forwards;
      }

      @keyframes hug-man-left-realistic {
        0% { transform-origin: 50px 60px; transform: rotate(0deg); }
        40% { transform-origin: 50px 60px; transform: rotate(-30deg); }
        100% { transform-origin: 50px 60px; transform: rotate(-85deg); }
      }

      @keyframes hug-man-right-realistic {
        0% { transform-origin: 50px 60px; transform: rotate(0deg); }
        40% { transform-origin: 50px 60px; transform: rotate(30deg); }
        100% { transform-origin: 50px 60px; transform: rotate(85deg); }
      }

      @keyframes hug-woman-left-realistic {
        0% { transform-origin: 50px 60px; transform: rotate(0deg); }
        40% { transform-origin: 50px 60px; transform: rotate(-25deg); }
        100% { transform-origin: 50px 60px; transform: rotate(-80deg); }
      }

      @keyframes hug-woman-right-realistic {
        0% { transform-origin: 50px 60px; transform: rotate(0deg); }
        40% { transform-origin: 50px 60px; transform: rotate(25deg); }
        100% { transform-origin: 50px 60px; transform: rotate(80deg); }
      }

      @keyframes hug-head-tilt-masculine {
        0% { transform-origin: 50px 30px; transform: rotate(0deg); }
        100% { transform-origin: 50px 30px; transform: rotate(12deg); }
      }

      @keyframes hug-head-tilt-feminine {
        0% { transform-origin: 50px 30px; transform: rotate(0deg); }
        100% { transform-origin: 50px 30px; transform: rotate(-10deg); }
      }

      /* Heart particles */
      .heart-particle {
        position: absolute;
        color: rgba(255, 180, 180, 0.9);
        font-size: 24px;
        pointer-events: none;
        animation: float-heart-realistic 4s ease-out forwards;
      }

      @keyframes float-heart-realistic {
        0% {
          opacity: 0;
          transform: translateY(0px) scale(0.3) rotate(0deg);
        }
        15% {
          opacity: 1;
          transform: translateY(-15px) scale(1) rotate(5deg);
        }
        100% {
          opacity: 0;
          transform: translateY(-100px) scale(0.2) rotate(25deg);
        }
      }

      .fade-out {
        opacity: 0 !important;
      }

      @media (max-width: 768px) {
        .figure {
          min-width: 100px;
          max-height: 240px;
          max-width: 30vw;
        }

        @keyframes walk-right {
          0% { left: -30%; transform: translateY(-50%) scale(0.65); }
          100% { left: calc(50% - 15vw); transform: translateY(-50%) scale(1); }
        }

        @keyframes walk-left {
          0% { right: -30%; transform: translateY(-50%) scale(0.65) scaleX(-1); }
          100% { right: calc(50% - 15vw); transform: translateY(-50%) scale(1) scaleX(-1); }
        }
      }
    `;
    
    document.head.appendChild(styleElement);

    // Create overlay HTML with realistic silhouettes
    const overlay = document.createElement('div');
    overlay.id = 'loading-overlay';
    overlay.className = 'walking';
    
    overlay.innerHTML = `
      <div class="loading-container">
        <div class="figure-container" id="man-container">
          <svg class="figure man-figure" viewBox="0 0 100 180" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="pencilTexture">
                <feTurbulence baseFrequency="0.8" numOctaves="4" result="noise" seed="1"/>
                <feColorMatrix in="noise" type="saturate" values="0"/>
                <feComponentTransfer>
                  <feFuncA type="discrete" tableValues="0 .5 .5 .7 .7 .8 .9 1"/>
                </feComponentTransfer>
                <feComposite operator="multiply" in2="SourceGraphic" result="noisy"/>
                <feGaussianBlur stdDeviation="0.2" result="blur"/>
              </filter>
            </defs>
            
            <!-- Realistic male silhouette -->
            <g stroke="white" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round" filter="url(#pencilTexture)">
              
              <!-- Head group with realistic proportions -->
              <g class="head-group">
                <!-- Head outline -->
                <path d="M42 15 Q42 8 50 8 Q58 8 58 15 Q58 22 56 28 Q54 32 50 32 Q46 32 44 28 Q42 22 42 15 Z"/>
                <!-- Hair (natural male hairline) -->
                <path d="M44 12 Q46 7 50 8 Q54 7 56 12"/>
                <path d="M45 10 Q47 6 50 7 Q53 6 55 10"/>
                <!-- Neck -->
                <path d="M48 32 Q48 36 48 40 Q52 36 52 40"/>
                <!-- Facial features (subtle) -->
                <path d="M46 18 Q47 17 48 18"/>
                <path d="M52 18 Q53 17 54 18"/>
                <path d="M49 22 Q50 24 51 22"/>
              </g>

              <!-- Torso group -->
              <g class="torso-group">
                <!-- Shoulders and chest -->
                <path d="M40 50 Q44 45 50 47 Q56 45 60 50"/>
                <path d="M42 55 Q50 52 58 55"/>
                <!-- Torso -->
                <path d="M44 60 Q46 68 47 78 Q48 88 47 98 Q46 108 47 110"/>
                <path d="M56 60 Q54 68 53 78 Q52 88 53 98 Q54 108 53 110"/>
                <!-- Waist -->
                <path d="M47 95 Q50 93 53 95"/>
                <!-- Back line -->
                <path d="M48 50 Q49 70 49 90 Q50 105 50 110"/>
              </g>

              <!-- Left arm group (detailed) -->
              <g class="left-arm">
                <!-- Shoulder -->
                <path d="M40 50 Q35 55 32 62"/>
                <!-- Upper arm -->
                <path d="M32 62 Q28 72 26 82"/>
                <!-- Elbow -->
                <circle cx="26" cy="82" r="1.5"/>
                <!-- Forearm -->
                <path d="M26 82 Q24 92 28 102"/>
                <!-- Hand -->
                <path d="M28 102 Q26 106 28 110 Q32 108 34 110"/>
                <!-- Fingers -->
                <path d="M28 106 L27 108 M29 106 L28 108 M30 106 L29 108 M31 106 L30 108"/>
                <!-- Thumb -->
                <path d="M32 104 Q34 102 36 104"/>
              </g>

              <!-- Right arm group (detailed) -->
              <g class="right-arm">
                <!-- Shoulder -->
                <path d="M60 50 Q65 55 68 62"/>
                <!-- Upper arm -->
                <path d="M68 62 Q72 72 74 82"/>
                <!-- Elbow -->
                <circle cx="74" cy="82" r="1.5"/>
                <!-- Forearm -->
                <path d="M74 82 Q76 92 72 102"/>
                <!-- Hand -->
                <path d="M72 102 Q74 106 72 110 Q68 108 66 110"/>
                <!-- Fingers -->
                <path d="M72 106 L73 108 M71 106 L72 108 M70 106 L71 108 M69 106 L70 108"/>
                <!-- Thumb -->
                <path d="M68 104 Q66 102 64 104"/>
              </g>

              <!-- Left leg group (realistic anatomy) -->
              <g class="left-leg">
                <!-- Hip connection -->
                <path d="M47 110 Q45 115 44 120"/>
                <!-- Thigh -->
                <path d="M44 120 Q42 135 40 150"/>
                <!-- Knee -->
                <circle cx="40" cy="150" r="2"/>
                <!-- Shin -->
                <path d="M40 150 Q38 165 40 175"/>
                <!-- Foot -->
                <path d="M40 175 L35 178 L45 178 Z"/>
                <!-- Shoe detail -->
                <path d="M35 177 Q40 176 45 177"/>
                <path d="M35 178 L32 179"/>
              </g>

              <!-- Right leg group (realistic anatomy) -->
              <g class="right-leg">
                <!-- Hip connection -->
                <path d="M53 110 Q55 115 56 120"/>
                <!-- Thigh -->
                <path d="M56 120 Q58 135 60 150"/>
                <!-- Knee -->
                <circle cx="60" cy="150" r="2"/>
                <!-- Shin -->
                <path d="M60 150 Q62 165 60 175"/>
                <!-- Foot -->
                <path d="M60 175 L55 178 L65 178 Z"/>
                <!-- Shoe detail -->
                <path d="M55 177 Q60 176 65 177"/>
                <path d="M65 178 L68 179"/>
              </g>
            </g>
          </svg>
        </div>
        
        <div class="figure-container" id="woman-container">
          <svg class="figure woman-figure" viewBox="0 0 100 180" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="pencilTexture2">
                <feTurbulence baseFrequency="0.8" numOctaves="4" result="noise" seed="2"/>
                <feColorMatrix in="noise" type="saturate" values="0"/>
                <feComponentTransfer>
                  <feFuncA type="discrete" tableValues="0 .5 .5 .7 .7 .8 .9 1"/>
                </feComponentTransfer>
                <feComposite operator="multiply" in2="SourceGraphic" result="noisy"/>
                <feGaussianBlur stdDeviation="0.2" result="blur"/>
              </filter>
            </defs>
            
            <!-- Realistic female silhouette -->
            <g stroke="white" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round" filter="url(#pencilTexture2)">
              
              <!-- Head group with feminine features -->
              <g class="head-group">
                <!-- Head outline (softer) -->
                <path d="M43 15 Q43 8 50 8 Q57 8 57 15 Q57 22 55 27 Q53 31 50 31 Q47 31 45 27 Q43 22 43 15 Z"/>
                <!-- Hair (longer, flowing) -->
                <path d="M40 12 Q38 6 42 5 Q46 3 50 5 Q54 3 58 5 Q62 6 60 12"/>
                <path d="M41 18 Q38 15 39 25 Q40 30 43 28"/>
                <path d="M59 18 Q62 15 61 25 Q60 30 57 28"/>
                <path d="M45 8 Q43 4 45 2"/>
                <path d="M55 8 Q57 4 55 2"/>
                <!-- Neck (slender) -->
                <path d="M48.5 31 Q49 35 49 40 Q51 35 51 40"/>
                <!-- Facial features -->
                <path d="M46 18 Q47 17 48 18"/>
                <path d="M52 18 Q53 17 54 18"/>
                <path d="M48.5 22 Q50 24 51.5 22"/>
              </g>

              <!-- Torso group (feminine curves) -->
              <g class="torso-group">
                <!-- Shoulders (narrower) -->
                <path d="M42 50 Q46 46 50 48 Q54 46 58 50"/>
                <!-- Bust line -->
                <path d="M44 58 Q50 55 56 58"/>
                <!-- Waist (curved) -->
                <path d="M46 70 Q50 68 54 70"/>
                <path d="M45 80 Q50 77 55 80"/>
                <!-- Hips -->
                <path d="M44 90 Q40 95 42 100 Q46 105 50 105 Q54 105 58 100 Q60 95 56 90"/>
                <!-- Torso center -->
                <path d="M50 48 Q49 65 50 85 Q51 100 50 105"/>
              </g>

              <!-- Left arm group (slender) -->
              <g class="left-arm">
                <!-- Shoulder -->
                <path d="M42 50 Q37 54 34 60"/>
                <!-- Upper arm -->
                <path d="M34 60 Q30 70 28 80"/>
                <!-- Elbow -->
                <circle cx="28" cy="80" r="1"/>
                <!-- Forearm -->
                <path d="M28 80 Q26 90 30 100"/>
                <!-- Hand (delicate) -->
                <path d="M30 100 Q28 103 30 106 Q33 104 35 106"/>
                <!-- Fingers -->
                <path d="M30 102 L29 104 M31 102 L30 104 M32 102 L31 104 M33 102 L32 104"/>
                <!-- Bracelet -->
                <circle cx="30" cy="95" r="1.5" stroke-width="1"/>
              </g>

              <!-- Right arm group (slender) -->
              <g class="right-arm">
                <!-- Shoulder -->
                <path d="M58 50 Q63 54 66 60"/>
                <!-- Upper arm -->
                <path d="M66 60 Q70 70 72 80"/>
                <!-- Elbow -->
                <circle cx="72" cy="80" r="1"/>
                <!-- Forearm -->
                <path d="M72 80 Q74 90 70 100"/>
                <!-- Hand (delicate) -->
                <path d="M70 100 Q72 103 70 106 Q67 104 65 106"/>
                <!-- Fingers -->
                <path d="M70 102 L71 104 M69 102 L70 104 M68 102 L69 104 M67 102 L68 104"/>
                <!-- Bracelet -->
                <circle cx="70" cy="95" r="1.5" stroke-width="1"/>
              </g>

              <!-- Dress/skirt silhouette -->
              <path d="M42 100 Q38 115 35 130 Q40 140 45 145 Q50 148 55 145 Q60 140 65 130 Q62 115 58 100"/>
              <path d="M40 115 Q50 112 60 115"/>
              <path d="M38 125 Q50 122 62 125"/>

              <!-- Left leg group (feminine) -->
              <g class="left-leg">
                <!-- Leg -->
                <path d="M45 145 Q43 155 45 165"/>
                <!-- Calf -->
                <path d="M45 165 Q44 170 46 175"/>
                <!-- Foot with heel -->
                <path d="M46 175 L42 177 L48 179 L44 181"/>
                <!-- Shoe details -->
                <path d="M42 177 Q45 176 48 177"/>
                <path d="M46 179 Q47 178 48 179"/>
              </g>

              <!-- Right leg group (feminine) -->
              <g class="right-leg">
                <!-- Leg -->
                <path d="M55 145 Q57 155 55 165"/>
                <!-- Calf -->
                <path d="M55 165 Q56 170 54 175"/>
                <!-- Foot with heel -->
                <path d="M54 175 L50 177 L56 179 L52 181"/>
                <!-- Shoe details -->
                <path d="M50 177 Q53 176 56 177"/>
                <path d="M54 179 Q53 178 52 179"/>
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
      
      // Add heart particles with realistic timing
      for (let i = 0; i < 6; i++) {
        setTimeout(() => {
          const heart = document.createElement('div');
          heart.className = 'heart-particle';
          heart.textContent = '♥';
          heart.style.left = `${47 + Math.random() * 6}%`;
          heart.style.top = `${35 + Math.random() * 8}%`;
          overlay.appendChild(heart);
          
          setTimeout(() => heart.remove(), 4000);
        }, i * 600);
      }
    }, 7000);

    // 10s: Start fade out
    setTimeout(() => {
      overlay.classList.add('fade-out');
    }, 10000);

    // 11.5s: Remove overlay, clean up, resolve promise
    setTimeout(() => {
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
      
      const loadingStyles = document.getElementById('loading-styles');
      if (loadingStyles) {
        loadingStyles.remove();
      }
      
      resolve();
    }, 11500);
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
