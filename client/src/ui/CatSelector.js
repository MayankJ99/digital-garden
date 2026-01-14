/**
 * Cat Selector Component
 * Modal for selecting and naming a cat companion
 */

import { Modal } from './Modal.js';

export class CatSelector {
    constructor(onCatSelected) {
        this.modal = new Modal('cat-modal');
        this.onCatSelected = onCatSelected;

        this.selectedCat = null;

        this.setupEvents();
    }

    /**
     * Setup event listeners
     */
    setupEvents() {
        // Cat option selection
        const catOptions = document.querySelectorAll('.cat-option');
        catOptions.forEach(option => {
            option.addEventListener('click', () => {
                catOptions.forEach(o => o.classList.remove('selected'));
                option.classList.add('selected');
                this.selectedCat = option.dataset.cat;

                // Show name section and adopt button
                document.getElementById('cat-name-section')?.classList.remove('hidden');
                document.getElementById('adopt-cat')?.classList.remove('hidden');

                // Focus name input
                document.getElementById('cat-name-input')?.focus();
            });
        });

        // Adopt button
        document.getElementById('adopt-cat')?.addEventListener('click', () => {
            this.adoptCat();
        });

        // Cancel button
        document.getElementById('cancel-cat')?.addEventListener('click', () => {
            this.hide();
        });

        // Enter key on name input
        document.getElementById('cat-name-input')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.adoptCat();
            }
        });
    }

    /**
     * Adopt the selected cat
     */
    adoptCat() {
        if (!this.selectedCat) return;

        const nameInput = document.getElementById('cat-name-input');
        const catName = nameInput?.value.trim() || this.getDefaultName(this.selectedCat);

        if (this.onCatSelected) {
            this.onCatSelected(this.selectedCat, catName);
        }

        this.hide();
        this.reset();
    }

    /**
     * Get default name for cat type
     */
    getDefaultName(catType) {
        const defaults = {
            tabby: 'Whiskers',
            black: 'Shadow',
            orange: 'Ginger',
            calico: 'Patches',
            siamese: 'Cream'
        };
        return defaults[catType] || 'Kitty';
    }

    /**
     * Reset selection
     */
    reset() {
        this.selectedCat = null;

        // Reset UI
        document.querySelectorAll('.cat-option').forEach(o => o.classList.remove('selected'));
        document.getElementById('cat-name-section')?.classList.add('hidden');
        document.getElementById('adopt-cat')?.classList.add('hidden');

        const nameInput = document.getElementById('cat-name-input');
        if (nameInput) nameInput.value = '';
    }

    /**
     * Show the modal
     */
    show() {
        this.reset();
        this.modal.show();
    }

    /**
     * Hide the modal
     */
    hide() {
        this.modal.hide();
    }
}
