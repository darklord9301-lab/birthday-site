// /modules/loading.js

/**
 * Displays a cinematic loading overlay with a video that plays for a specified duration
 * @param {number} duration - Target duration in seconds for the loading sequence
 * @returns {Promise} Resolves when the loading overlay is completely removed
 */
export function showLoading(duration = 10) {
    return new Promise((resolve, reject) => {
        // Create and inject CSS styles
        const styleElement = document.createElement('style');
        styleElement.id = 'loading-styles';
        styleElement.textContent = `
            #loading-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: #000000;
                z-index: 9999;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 1;
                transition: opacity 1.5s ease-out;
                overflow: hidden;
            }

            #loading-video {
                height: 100vh;
                width: auto;
                max-width: 100vw;
                object-fit: contain;
                display: block;
                image-rendering: -webkit-optimize-contrast;
                image-rendering: crisp-edges;
                image-rendering: pixelated;
            }

            #loading-progress {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 8px;
                background: rgba(0, 0, 0, 0.3);
                overflow: hidden;
                z-index: 10000;
            }

            #loading-progress-bar {
                height: 100%;
                width: 0%;
                background: linear-gradient(90deg, #ff6b6b, #4ecdc4, #45b7d1, #f39c12, #e74c3c);
                background-size: 300% 100%;
                animation: gradient-shift 1.5s ease-in-out infinite;
                transition: width 0.1s ease-out;
                box-shadow: 0 0 20px rgba(255, 107, 107, 0.8), 0 0 40px rgba(78, 205, 196, 0.6);
                position: relative;
            }

            #loading-progress-bar::after {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
                animation: shimmer 2s ease-in-out infinite;
            }

            @keyframes gradient-shift {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
            }

            @keyframes shimmer {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(400%); }
            }

            .fade-out {
                opacity: 0 !important;
            }

            /* Responsive adjustments for mobile */
            @media (max-width: 768px) {
                #loading-video {
                    width: 100vw;
                    height: auto;
                    max-height: 100vh;
                }
            }

            @media (orientation: landscape) and (max-height: 500px) {
                #loading-video {
                    height: 100vh;
                    width: auto;
                }
            }
        `;
        document.head.appendChild(styleElement);

        // Create overlay HTML
        const overlay = document.createElement('div');
        overlay.id = 'loading-overlay';
        
        const video = document.createElement('video');
        video.id = 'loading-video';
        video.src = '/birthday-site/assets/videos/loading.mp4';
        video.autoplay = true;
        video.muted = true;
        video.playsInline = true;
        video.loop = false;
        video.controls = false;
        video.disablePictureInPicture = true;
        video.setAttribute('webkit-playsinline', 'true');
        
        // Create loading progress bar
        const progressContainer = document.createElement('div');
        progressContainer.id = 'loading-progress';
        
        const progressBar = document.createElement('div');
        progressBar.id = 'loading-progress-bar';
        
        progressContainer.appendChild(progressBar);
        
        overlay.appendChild(video);
        overlay.appendChild(progressContainer);
        document.body.appendChild(overlay);

        let fadeTimeout;
        let cleanupTimeout;
        let progressInterval;

        // Cleanup function
        const cleanup = () => {
            if (fadeTimeout) clearTimeout(fadeTimeout);
            if (cleanupTimeout) clearTimeout(cleanupTimeout);
            if (progressInterval) clearInterval(progressInterval);
            
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
            
            const loadingStyles = document.getElementById('loading-styles');
            if (loadingStyles) {
                loadingStyles.remove();
            }
        };

        // Error handler
        const handleError = (error) => {
            console.error('Loading video error:', error);
            cleanup();
            reject(error);
        };

        // Success handler - starts fade out process
        const startFadeOut = () => {
            overlay.classList.add('fade-out');
            
            cleanupTimeout = setTimeout(() => {
                cleanup();
                resolve();
            }, 1500); // Match CSS transition duration
        };

        // Video load handler
        const onVideoLoaded = () => {
            try {
                const videoDuration = video.duration;
                
                if (!videoDuration || videoDuration <= 0) {
                    handleError(new Error('Invalid video duration'));
                    return;
                }

                // Calculate playback rate to match target duration
                const playbackRate = videoDuration / duration;
                video.playbackRate = Math.max(0.25, Math.min(4.0, playbackRate)); // Clamp between 0.25x and 4x

                console.log(`Video duration: ${videoDuration}s, Target: ${duration}s, Playback rate: ${video.playbackRate}`);

                // Start progress bar animation
                let startTime = Date.now();
                const targetDurationMs = duration * 1000;
                
                progressInterval = setInterval(() => {
                    const elapsed = Date.now() - startTime;
                    const progress = Math.min((elapsed / targetDurationMs) * 100, 100);
                    progressBar.style.width = `${progress}%`;
                    
                    if (progress >= 100) {
                        clearInterval(progressInterval);
                    }
                }, 16); // ~60fps updates

                // Set fade out timer
                fadeTimeout = setTimeout(startFadeOut, duration * 1000);

            } catch (error) {
                handleError(error);
            }
        };

        // Video end handler (fallback)
        const onVideoEnded = () => {
            if (fadeTimeout) {
                clearTimeout(fadeTimeout);
            }
            if (progressInterval) {
                clearInterval(progressInterval);
                progressBar.style.width = '100%';
            }
            startFadeOut();
        };

        // Set up event listeners
        video.addEventListener('loadedmetadata', onVideoLoaded, { once: true });
        video.addEventListener('ended', onVideoEnded, { once: true });
        video.addEventListener('error', () => {
            handleError(new Error('Failed to load video'));
        }, { once: true });

        // Fallback timeout in case video never loads
        const fallbackTimeout = setTimeout(() => {
            handleError(new Error('Video loading timeout'));
        }, 10000);

        // Clear fallback timeout when video loads
        video.addEventListener('loadedmetadata', () => {
            clearTimeout(fallbackTimeout);
        }, { once: true });

        // Try to play the video
        const playPromise = video.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.warn('Autoplay was prevented:', error);
                // Video might still work, so don't reject immediately
                // The user might need to interact with the page first
            });
        }
    });
}

/**
 * Check if loading overlay is currently active
 * @returns {boolean} True if loading overlay exists in DOM
 */
export function isLoadingActive() {
    return document.getElementById('loading-overlay') !== null;
}

/**
 * Force stop loading and remove overlay immediately
 * Useful for development or error recovery
 */
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
