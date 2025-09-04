// /modules/scene2_background.js
// Scene 2 Background - Fullscreen looping nebula video

let videoElement = null;
let isInitialized = false;

/**
 * Initializes the fullscreen nebula video background
 */
export function initScene2Background() {
  if (isInitialized) return;

  try {
    // Create video element
    videoElement = document.createElement("video");
    videoElement.src = "/birthday-site/assets/videos/background.mp4";
    videoElement.autoplay = true;
    videoElement.muted = true;
    videoElement.loop = true;
    videoElement.playsInline = true;
    videoElement.preload = "auto";
    videoElement.playbackRate = 0.6;

    // Style it to cover entire screen
    Object.assign(videoElement.style, {
      position: "fixed",
      top: "0",
      left: "0",
      width: "100%",
      height: "100%",
      objectFit: "cover",
      zIndex: "-1",
      pointerEvents: "none",
      opacity: "0",
      transition: "opacity 0.5s ease-in"
    });

    // Append to body
    document.body.appendChild(videoElement);

    // Fade in once video starts
    videoElement.addEventListener("playing", () => {
      videoElement.style.opacity = "1";
    });

    isInitialized = true;
  } catch (err) {
    console.error("Failed to initialize Scene 2 background:", err);
  }
}

/**
 * Disposes the nebula video background
 */
export function disposeScene2Background() {
  if (!isInitialized || !videoElement) return;

  try {
    videoElement.pause();
    videoElement.removeAttribute("src"); // Unload
    videoElement.load(); // Release memory

    if (videoElement.parentNode) {
      videoElement.parentNode.removeChild(videoElement);
    }

    videoElement = null;
    isInitialized = false;
  } catch (err) {
    console.error("Failed to dispose Scene 2 background:", err);
  }
}
