/**
 * Modal Base Component
 * Utility for modal management
 */

export class Modal {
    constructor(elementId) {
        this.element = document.getElementById(elementId);
        this.isOpen = false;
    }

    /**
     * Show the modal
     */
    show() {
        if (this.element) {
            this.element.classList.remove('hidden');
            this.isOpen = true;
        }
    }

    /**
     * Hide the modal
     */
    hide() {
        if (this.element) {
            this.element.classList.add('hidden');
            this.isOpen = false;
        }
    }

    /**
     * Toggle modal visibility
     */
    toggle() {
        if (this.isOpen) {
            this.hide();
        } else {
            this.show();
        }
    }
}
