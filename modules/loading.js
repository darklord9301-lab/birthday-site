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
        
        overlay.appendChild(video);
        document.body.appendChild(overlay);

        let fadeTimeout;
        let cleanupTimeout;

        // Cleanup function
        const cleanup = () => {
            if (fadeTimeout) clearTimeout(fadeTimeout);
            if (cleanupTimeout) clearTimeout(cleanupTimeout);
            
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
