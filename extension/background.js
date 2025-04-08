// Initialize ONNX Runtime and load config
import * as ort from './libs/ort.min.js';
import { featureConfig } from './config/features_config.js';

// Model manager
class ModelManager {
    constructor() {
        this.model = null;
    }

    async loadModel() {
        try {
            if (!this.model) {
                const modelUrl = chrome.runtime.getURL("../models/phishing_model.onnx");
                this.model = await ort.InferenceSession.create(modelUrl);
            }
            return this.model;
        } catch (error) {
            console.error("Model loading error:", error);
            return null;
        }
    }

    async predict(features) {
        try {
            const model = await this.loadModel();
            if (!model) {
                throw new Error("Failed to load model");
            }
            const tensor = new ort.Tensor("float32", new Float32Array(features), [1, features.length]);
            const feeds = { input: tensor };
            const results = await model.run(feeds);
            return results.output.data[0];
        } catch (error) {
            console.error("ONNX Prediction Error:", error);
            return 0; // Return neutral score on ML model failure
        }
    }
}

// Detection manager
class DetectionManager {
    constructor() {
        this.modelManager = new ModelManager();
        this.featureConfig = featureConfig; // Store featureConfig reference
    }

    calculateFeatureScore(features) {
        // Calculate weighted score from URL and content features
        let urlScore = 0;
        let contentScore = 0;
        let featureCount = 0;

        // Calculate URL features score (first 9 features)
        for (let i = 0; i < 9; i++) {
            if (features[i] !== undefined) {
                urlScore += features[i];
                featureCount++;
            }
        }
        urlScore = featureCount > 0 ? urlScore / featureCount : 0;

        // Calculate content features score (remaining features)
        contentScore = 0;
        featureCount = 0;
        for (let i = 9; i < features.length; i++) {
            if (features[i] !== undefined) {
                contentScore += features[i];
                featureCount++;
            }
        }
        contentScore = featureCount > 0 ? contentScore / featureCount : 0;

        // Apply weights from featureConfig
        return (urlScore * this.featureConfig.weights.urlFeatures + 
                contentScore * this.featureConfig.weights.contentFeatures);
    }

    async analyzeFeatures(features) {
        try {
            // Get ML model prediction
            const mlScore = await this.modelManager.predict(features);
            
            // Calculate feature-based score
            const featureScore = this.calculateFeatureScore(features);
            
            // Get Google SafeSearch score (last feature)
            const googleScore = features[features.length - 1] || 0;
            
            // Combine all scores with their respective weights
            const finalScore = (
                mlScore * 0.3 + // ML model weight
                featureScore * 0.4 + // Feature-based weight
                googleScore * this.featureConfig.weights.googleSafeSearch // Google SafeSearch weight
            );

            // Determine result based on final score
            if (finalScore > this.featureConfig.thresholds.phishing) {
                return { result: "phishing", score: finalScore };
            } else if (finalScore > this.featureConfig.thresholds.suspicious) {
                return { result: "suspicious", score: finalScore };
            } else {
                return { result: "safe", score: finalScore };
            }
        } catch (error) {
            console.error("Analysis error:", error);
            // Fallback to feature-based detection only
            const featureScore = this.calculateFeatureScore(features);
            const googleScore = features[features.length - 1] || 0;
            
            const fallbackScore = (
                featureScore * 0.6 + // Increased weight for feature-based detection
                googleScore * this.featureConfig.weights.googleSafeSearch
            );

            if (fallbackScore > this.featureConfig.thresholds.phishing) {
                return { result: "phishing", score: fallbackScore, fallback: true };
            } else if (fallbackScore > this.featureConfig.thresholds.suspicious) {
                return { result: "suspicious", score: fallbackScore, fallback: true };
            } else {
                return { result: "safe", score: fallbackScore, fallback: true };
            }
        }
    }
}

// Initialize detection manager
const detectionManager = new DetectionManager();

// Message listener
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "predictPhishing") {
        detectionManager.analyzeFeatures(request.features)
            .then(result => sendResponse(result))
            .catch(error => sendResponse({ error: error.message }));
        return true; // Required for async response
    }
});
