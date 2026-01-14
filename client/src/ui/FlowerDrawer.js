/**
 * Flower Drawer Component
 * Canvas-based drawing interface for creating flowers with transparency
 */

import { Modal } from './Modal.js';
import { validateFlowerDrawing } from '../utils/contentFilter.js';

export class FlowerDrawer {
    constructor(onFlowerCreated) {
        this.modal = new Modal('flower-modal');
        this.canvas = document.getElementById('drawing-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.onFlowerCreated = onFlowerCreated;

        // Drawing state
        this.isDrawing = false;
        this.currentColor = '#FF6B6B';
        this.brushSize = 10;
        this.lastX = 0;
        this.lastY = 0;

        // Status element
        this.statusEl = document.getElementById('filter-status');

        this.setupEvents();
        this.clearCanvas();
    }

    /**
     * Setup event listeners
     */
    setupEvents() {
        // Canvas drawing events
        this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        this.canvas.addEventListener('mousemove', (e) => this.draw(e));
        this.canvas.addEventListener('mouseup', () => this.stopDrawing());
        this.canvas.addEventListener('mouseout', () => this.stopDrawing());

        // Touch support
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.startDrawing(touch);
        });
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.draw(touch);
        });
        this.canvas.addEventListener('touchend', () => this.stopDrawing());

        // Color palette
        const colorButtons = document.querySelectorAll('.color-btn');
        colorButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                colorButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentColor = btn.dataset.color;
            });
        });

        // Set initial active color
        colorButtons[0]?.classList.add('active');

        // Brush size slider
        const brushSlider = document.getElementById('brush-slider');
        if (brushSlider) {
            brushSlider.addEventListener('input', (e) => {
                this.brushSize = parseInt(e.target.value);
            });
        }

        // Buttons
        document.getElementById('clear-drawing')?.addEventListener('click', () => {
            this.clearCanvas();
        });

        document.getElementById('submit-flower')?.addEventListener('click', () => {
            this.submitFlower();
        });

        document.getElementById('cancel-flower')?.addEventListener('click', () => {
            this.hide();
        });
    }

    /**
     * Start drawing
     */
    startDrawing(e) {
        this.isDrawing = true;
        const rect = this.canvas.getBoundingClientRect();
        this.lastX = e.clientX - rect.left;
        this.lastY = e.clientY - rect.top;
    }

    /**
     * Draw on canvas with crayon-style brush
     */
    draw(e) {
        if (!this.isDrawing) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Crayon-style brush with texture
        this.ctx.beginPath();
        this.ctx.strokeStyle = this.currentColor;
        this.ctx.lineWidth = this.brushSize;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';

        // Add some roughness for crayon effect
        const jitter = this.brushSize * 0.15;
        this.ctx.moveTo(this.lastX + (Math.random() - 0.5) * jitter, this.lastY + (Math.random() - 0.5) * jitter);
        this.ctx.lineTo(x + (Math.random() - 0.5) * jitter, y + (Math.random() - 0.5) * jitter);
        this.ctx.stroke();

        // Add texture dots for crayon effect
        for (let i = 0; i < 3; i++) {
            const dotX = x + (Math.random() - 0.5) * this.brushSize;
            const dotY = y + (Math.random() - 0.5) * this.brushSize;
            this.ctx.fillStyle = this.currentColor;
            this.ctx.globalAlpha = 0.3;
            this.ctx.fillRect(dotX, dotY, 2, 2);
        }
        this.ctx.globalAlpha = 1;

        this.lastX = x;
        this.lastY = y;
    }

    /**
     * Stop drawing
     */
    stopDrawing() {
        this.isDrawing = false;
    }

    /**
     * Clear the canvas - use checkerboard to show transparency
     */
    clearCanvas() {
        // Clear to fully transparent
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw a light checkerboard pattern to indicate transparency
        const size = 10;
        for (let y = 0; y < this.canvas.height; y += size) {
            for (let x = 0; x < this.canvas.width; x += size) {
                const isLight = (Math.floor(x / size) + Math.floor(y / size)) % 2 === 0;
                this.ctx.fillStyle = isLight ? '#f0f0f0' : '#e0e0e0';
                this.ctx.fillRect(x, y, size, size);
            }
        }

        this.setStatus('Draw on transparent background!', '');
    }

    /**
     * Set status message
     */
    setStatus(message, type) {
        if (this.statusEl) {
            this.statusEl.textContent = message;
            this.statusEl.className = type;
        }
    }

    /**
     * Convert drawing to transparent PNG (remove checkerboard background)
     */
    createTransparentPNG() {
        // Create a new canvas for the final output
        const outputCanvas = document.createElement('canvas');
        outputCanvas.width = this.canvas.width;
        outputCanvas.height = this.canvas.height;
        const outputCtx = outputCanvas.getContext('2d');

        // Get the original image data
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const pixels = imageData.data;

        // Create output image data (transparent)
        const outputData = outputCtx.createImageData(this.canvas.width, this.canvas.height);
        const outPixels = outputData.data;

        // Checkerboard colors to detect
        const lightGray = [240, 240, 240]; // #f0f0f0
        const darkGray = [224, 224, 224];  // #e0e0e0

        for (let i = 0; i < pixels.length; i += 4) {
            const r = pixels[i];
            const g = pixels[i + 1];
            const b = pixels[i + 2];

            // Check if this pixel is part of the checkerboard background
            const isLightGray = Math.abs(r - lightGray[0]) < 5 &&
                Math.abs(g - lightGray[1]) < 5 &&
                Math.abs(b - lightGray[2]) < 5;
            const isDarkGray = Math.abs(r - darkGray[0]) < 5 &&
                Math.abs(g - darkGray[1]) < 5 &&
                Math.abs(b - darkGray[2]) < 5;

            if (isLightGray || isDarkGray) {
                // Make transparent
                outPixels[i] = 0;
                outPixels[i + 1] = 0;
                outPixels[i + 2] = 0;
                outPixels[i + 3] = 0;
            } else {
                // Keep the drawn color
                outPixels[i] = r;
                outPixels[i + 1] = g;
                outPixels[i + 2] = b;
                outPixels[i + 3] = 255;
            }
        }

        outputCtx.putImageData(outputData, 0, 0);
        return outputCanvas.toDataURL('image/png');
    }

    /**
     * Submit the flower drawing
     */
    async submitFlower() {
        this.setStatus('Checking your drawing...', 'warning');

        try {
            // Check if canvas has enough drawing
            const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
            const pixels = imageData.data;
            let coloredPixels = 0;

            // Check for non-checkerboard pixels
            for (let i = 0; i < pixels.length; i += 4) {
                const r = pixels[i];
                const g = pixels[i + 1];
                const b = pixels[i + 2];

                // Skip gray checkerboard colors
                const isGray = (r > 220 && g > 220 && b > 220) &&
                    Math.abs(r - g) < 10 && Math.abs(g - b) < 10;

                if (!isGray) {
                    coloredPixels++;
                }
            }

            const coverage = coloredPixels / (this.canvas.width * this.canvas.height);

            if (coverage < 0.03) {
                this.setStatus('Please draw something first!', 'error');
                return;
            }

            // Validate with TensorFlow.js
            const isValidFlower = await validateFlowerDrawing(this.canvas);

            if (isValidFlower) {
                this.setStatus('Beautiful flower! 🌸', 'success');

                // Export as transparent PNG
                const flowerImageData = this.createTransparentPNG();

                // Callback with the flower image
                if (this.onFlowerCreated) {
                    this.onFlowerCreated(flowerImageData);
                }

                // Hide after short delay
                setTimeout(() => {
                    this.hide();
                    this.clearCanvas();
                }, 500);
            } else {
                this.setStatus('That doesn\'t look like a flower. Try again!', 'error');
            }
        } catch (error) {
            console.error('Error validating flower:', error);
            // Allow submission anyway if filter fails
            this.setStatus('Verification unavailable, placing flower...', 'warning');
            const flowerImageData = this.createTransparentPNG();
            if (this.onFlowerCreated) {
                this.onFlowerCreated(flowerImageData);
            }
            setTimeout(() => {
                this.hide();
                this.clearCanvas();
            }, 500);
        }
    }

    /**
     * Show the modal
     */
    show() {
        this.modal.show();
        this.clearCanvas();
    }

    /**
     * Hide the modal
     */
    hide() {
        this.modal.hide();
    }
}
