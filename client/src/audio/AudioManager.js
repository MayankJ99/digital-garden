/**
 * Audio Manager - Background Music and Sound Effects
 * Manages lofi background music and cat sounds
 */

// Import the local music file
import lofiMusic from '../assets/lofi-music.mp3';

class AudioManager {
    constructor() {
        this.bgMusic = null;
        this.isMuted = false;
        this.isInitialized = false;
        this.volume = 0.3;

        // Use local asset for reliable playback
        this.musicUrl = lofiMusic;
    }

    /**
     * Initialize audio (must be called after user interaction)
     */
    async init() {
        if (this.isInitialized) return;

        try {
            this.bgMusic = new Audio(this.musicUrl);
            this.bgMusic.loop = true;
            this.bgMusic.volume = this.volume;
            this.isInitialized = true;

            // Handle loading errors gracefully
            this.bgMusic.onerror = () => {
                console.warn('Could not load background music');
                this.isInitialized = false;
            };
        } catch (e) {
            console.warn('Audio initialization failed:', e);
        }
    }

    /**
     * Start playing background music
     */
    async play() {
        if (!this.isInitialized) {
            await this.init();
        }

        if (this.bgMusic && !this.isMuted) {
            try {
                await this.bgMusic.play();
            } catch (e) {
                // Autoplay may be blocked, will retry on user interaction
                console.log('Autoplay blocked, click to enable music');
            }
        }
    }

    /**
     * Toggle mute/unmute
     */
    toggle() {
        this.isMuted = !this.isMuted;

        if (this.bgMusic) {
            if (this.isMuted) {
                this.bgMusic.pause();
            } else {
                this.bgMusic.play().catch(() => { });
            }
        }

        return !this.isMuted;
    }

    /**
     * Set volume (0-1)
     */
    setVolume(vol) {
        this.volume = Math.max(0, Math.min(1, vol));
        if (this.bgMusic) {
            this.bgMusic.volume = this.volume;
        }
    }

    /**
     * Get current state
     */
    isPlaying() {
        return this.bgMusic && !this.bgMusic.paused && !this.isMuted;
    }
}

// Singleton instance
let audioManagerInstance = null;

export function getAudioManager() {
    if (!audioManagerInstance) {
        audioManagerInstance = new AudioManager();
    }
    return audioManagerInstance;
}

export { AudioManager };
