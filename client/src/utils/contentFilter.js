/**
 * Content Filter
 * Uses TensorFlow.js MobileNet to validate flower drawings
 */

let model = null;
let isLoading = false;

// Keywords that indicate a flower-like image
const FLOWER_KEYWORDS = [
    'flower', 'daisy', 'rose', 'sunflower', 'tulip', 'plant', 'petal',
    'bouquet', 'floral', 'blossom', 'bloom', 'pot', 'vase', 'garden'
];

// Keywords that should be rejected
const REJECT_KEYWORDS = [
    'person', 'man', 'woman', 'face', 'body', 'nude', 'weapon',
    'gun', 'knife', 'violence', 'blood'
];

/**
 * Load the MobileNet model
 */
async function loadModel() {
    if (model) return model;
    if (isLoading) {
        // Wait for existing load to complete
        while (isLoading) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        return model;
    }

    isLoading = true;

    try {
        // Dynamic import of TensorFlow.js
        const tf = await import('@tensorflow/tfjs');
        const mobilenet = await import('@tensorflow-models/mobilenet');

        console.log('Loading MobileNet model...');
        model = await mobilenet.load({ version: 2, alpha: 0.5 });
        console.log('MobileNet model loaded');

        return model;
    } catch (error) {
        console.error('Failed to load model:', error);
        throw error;
    } finally {
        isLoading = false;
    }
}

/**
 * Validate that a drawing resembles a flower
 * @param {HTMLCanvasElement} canvas - The drawing canvas
 * @returns {Promise<boolean>} - True if the drawing appears to be a flower
 */
export async function validateFlowerDrawing(canvas) {
    try {
        const loadedModel = await loadModel();

        // Create an image from the canvas
        const predictions = await loadedModel.classify(canvas);

        console.log('Predictions:', predictions);

        // Check predictions for flower-related keywords
        for (const prediction of predictions) {
            const className = prediction.className.toLowerCase();

            // Reject if contains bad keywords
            for (const reject of REJECT_KEYWORDS) {
                if (className.includes(reject)) {
                    console.log('Rejected due to:', className);
                    return false;
                }
            }

            // Accept if contains flower keywords with reasonable confidence
            for (const keyword of FLOWER_KEYWORDS) {
                if (className.includes(keyword) && prediction.probability > 0.05) {
                    console.log('Accepted as flower:', className, prediction.probability);
                    return true;
                }
            }
        }

        // If no strong classification, check if it looks like an abstract/art piece
        // This is more lenient to allow creative drawings
        const topPrediction = predictions[0];
        if (topPrediction && topPrediction.probability < 0.3) {
            // Low confidence - likely an abstract drawing, allow it
            console.log('Abstract drawing detected, allowing');
            return true;
        }

        // Check if it's just a simple colorful drawing (not recognizable as anything bad)
        const allPredictionsLow = predictions.every(p => p.probability < 0.2);
        if (allPredictionsLow) {
            console.log('Unrecognized drawing, allowing as art');
            return true;
        }

        // Default to allowing if we can't determine
        return true;
    } catch (error) {
        console.error('Content filter error:', error);
        // If the filter fails, allow the drawing but log the error
        return true;
    }
}

/**
 * Preload the model for faster first use
 */
export async function preloadContentFilter() {
    try {
        await loadModel();
    } catch (error) {
        console.warn('Could not preload content filter:', error);
    }
}
