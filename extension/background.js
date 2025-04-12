// Initialize ONNX Runtime and load config
import * as ort from './libs/ort.min.js';
import { featureConfig } from './config/features_config.js';

// --- Enhanced Logging ---
const logPrefix = "[PhishingDetector BG]";
console.info(`${logPrefix} Background script loading...`);
console.debug(`${logPrefix} ORT imported:`, !!ort);
console.debug(`${logPrefix} FeatureConfig imported:`, !!featureConfig);
// -----------------------

// Model manager
class ModelManager {
    constructor() {
        this.model = null;
        console.info(`${logPrefix} [ModelManager] Initialized.`);
    }

    async loadModel() {
        const logPrefixMM = `${logPrefix} [ModelManager loadModel]`; // Prefix for this method
        try {
            if (!this.model) {
                console.info(`${logPrefixMM} Model not loaded yet. Attempting to load...`);
                const modelUrl = chrome.runtime.getURL("../models/phishing_model.onnx");
                console.debug(`${logPrefixMM} Model URL: ${modelUrl}`);
                this.model = await ort.InferenceSession.create(modelUrl);
                console.info(`${logPrefixMM} ONNX model loaded successfully.`);
            } else {
                console.debug(`${logPrefixMM} Returning cached model.`);
            }
            return this.model;
        } catch (error) {
            console.error(`${logPrefixMM} Model loading error:`, error);
            this.model = null; // Reset model state on error
            return null;
        }
    }

    async predict(features) {
        const logPrefixMM = `${logPrefix} [ModelManager predict]`; // Prefix for this method
        console.debug(`${logPrefixMM} Received features array of length: ${features?.length}`);
        if (!features || features.length === 0) {
             console.warn(`${logPrefixMM} Predict called with empty or invalid features.`);
             return 0; // Return neutral score if features are missing
        }
        try {
            const model = await this.loadModel();
            if (!model) {
                console.error(`${logPrefixMM} Cannot predict, model is not loaded.`);
                throw new Error("Failed to load model for prediction");
            }

            console.debug(`${logPrefixMM} Creating ONNX Tensor...`);
            // Ensure features are Float32
            const float32Features = Float32Array.from(features);
            const tensor = new ort.Tensor("float32", float32Features, [1, float32Features.length]);
            const feeds = { input: tensor };

            console.info(`${logPrefixMM} Running model inference...`);
            const results = await model.run(feeds);
            const prediction = results?.output?.data?.[0];
            console.info(`${logPrefixMM} Model prediction result: ${prediction}`);

            if (typeof prediction !== 'number') {
                 console.warn(`${logPrefixMM} Prediction result is not a number:`, prediction);
                 return 0; // Return neutral if result is unexpected
            }
            return prediction;

        } catch (error) {
            console.error(`${logPrefixMM} ONNX Prediction Error:`, error);
            return 0; // Return neutral score on ML model failure
        }
    }
}

// Detection manager
class DetectionManager {
    constructor() {
        this.modelManager = new ModelManager();
        this.featureConfig = featureConfig; // Store featureConfig reference
        console.info(`${logPrefix} [DetectionManager] Initialized.`);
        console.debug(`${logPrefix} [DetectionManager] Using feature config:`, this.featureConfig);
    }

    calculateFeatureScore(features) {
        const logPrefixDM = `${logPrefix} [DetectionManager calculateFeatureScore]`;
        console.debug(`${logPrefixDM} Calculating score for features:`, features); // Debug log for detailed features

        // Calculate weighted score from URL and content features
        let urlScore = 0;
        let contentScore = 0;
        let urlFeatureCount = 0;
        let contentFeatureCount = 0;

        // Calculate URL features score (first 9 features)
        for (let i = 0; i < 9 && i < features.length; i++) {
            if (features[i] !== undefined && typeof features[i] === 'number') {
                urlScore += features[i];
                urlFeatureCount++;
            } else {
                 console.warn(`${logPrefixDM} Invalid or missing URL feature at index ${i}:`, features[i]);
            }
        }
        urlScore = urlFeatureCount > 0 ? urlScore / urlFeatureCount : 0;
        console.debug(`${logPrefixDM} Raw URL Score: ${urlScore} (from ${urlFeatureCount} features)`);


        // Calculate content features score (remaining features)
        contentScore = 0;
        // Make sure to account for the Google Safe Search feature at the end if it's included here
        const endIndex = features.length -1; // Assuming last feature might be Google score, adjust if needed
        for (let i = 9; i < endIndex && i < features.length; i++) {
            if (features[i] !== undefined && typeof features[i] === 'number') {
                contentScore += features[i];
                contentFeatureCount++;
            } else {
                 console.warn(`${logPrefixDM} Invalid or missing Content feature at index ${i}:`, features[i]);
            }
        }
        contentScore = contentFeatureCount > 0 ? contentScore / contentFeatureCount : 0;
        console.debug(`${logPrefixDM} Raw Content Score: ${contentScore} (from ${contentFeatureCount} features)`);


        // Apply weights from featureConfig
        const finalFeatureScore = (urlScore * this.featureConfig.weights.urlFeatures +
                                 contentScore * this.featureConfig.weights.contentFeatures);

        console.info(`${logPrefixDM} Calculated final feature-based score: ${finalFeatureScore}`);
        return finalFeatureScore;
    }

    async analyzeFeatures(features) {
         const logPrefixDM = `${logPrefix} [DetectionManager analyzeFeatures]`;
         console.info(`${logPrefixDM} Starting feature analysis for ${features?.length} features.`);
         console.debug(`${logPrefixDM} Input features:`, features); // Use debug for potentially large array

         if (!features || features.length === 0) {
             console.warn(`${logPrefixDM} Analysis called with empty or invalid features.`);
             return { result: "safe", score: 0, error: "No features provided" };
         }

        try {
            // Get ML model prediction
            console.debug(`${logPrefixDM} Getting ML model prediction...`);
            const mlScore = await this.modelManager.predict(features);
            console.info(`${logPrefixDM} Received ML Score: ${mlScore}`);

            // Calculate feature-based score
            console.debug(`${logPrefixDM} Calculating feature-based score...`);
            const featureScore = this.calculateFeatureScore(features);
            console.info(`${logPrefixDM} Received Feature Score: ${featureScore}`);

            // Get Google SafeSearch score (assuming it's the last feature)
            const googleScore = typeof features[features.length - 1] === 'number' ? features[features.length - 1] : 0;
            console.info(`${logPrefixDM} Received Google SafeSearch Score: ${googleScore}`);

            // Combine all scores with their respective weights
            const mlWeight = this.featureConfig?.weights?.mlModel ?? 0.3; // Default weight
            const featureWeight = this.featureConfig?.weights?.featureBased ?? 0.4; // Default weight
            const googleWeight = this.featureConfig?.weights?.googleSafeSearch ?? 0.3; // Default weight

            console.debug(`${logPrefixDM} Using weights - ML: ${mlWeight}, Feature: ${featureWeight}, Google: ${googleWeight}`);

            const finalScore = (
                mlScore * mlWeight +
                featureScore * featureWeight +
                googleScore * googleWeight
            );
            console.info(`${logPrefixDM} Calculated Final Score: ${finalScore}`);

            // Determine result based on final score
            let result = "safe";
            if (finalScore > this.featureConfig.thresholds.phishing) {
                result = "phishing";
            } else if (finalScore > this.featureConfig.thresholds.suspicious) {
                result = "suspicious";
            }
            console.info(`${logPrefixDM} Determined Result: ${result} (Score: ${finalScore})`);
            return { result: result, score: finalScore };

        } catch (error) {
            console.error(`${logPrefixDM} Analysis error:`, error);
            console.warn(`${logPrefixDM} Analysis failed. Falling back to feature-based detection only.`);

            // Fallback logic
            try {
                const featureScore = this.calculateFeatureScore(features);
                const googleScore = typeof features[features.length - 1] === 'number' ? features[features.length - 1] : 0;
                const featureWeightFallback = this.featureConfig?.weights?.featureBasedFallback ?? 0.6; // Default fallback weight
                const googleWeightFallback = this.featureConfig?.weights?.googleSafeSearch ?? 0.4; // Default fallback weight

                console.debug(`${logPrefixDM} Fallback using weights - Feature: ${featureWeightFallback}, Google: ${googleWeightFallback}`);

                const fallbackScore = (
                    featureScore * featureWeightFallback +
                    googleScore * googleWeightFallback
                );
                console.info(`${logPrefixDM} Calculated Fallback Score: ${fallbackScore}`);

                let fallbackResult = "safe";
                if (fallbackScore > this.featureConfig.thresholds.phishing) {
                    fallbackResult = "phishing";
                } else if (fallbackScore > this.featureConfig.thresholds.suspicious) {
                    fallbackResult = "suspicious";
                }
                 console.info(`${logPrefixDM} Determined Fallback Result: ${fallbackResult} (Score: ${fallbackScore})`);
                return { result: fallbackResult, score: fallbackScore, fallback: true };

            } catch (fallbackError) {
                 console.error(`${logPrefixDM} Error during fallback calculation:`, fallbackError);
                 // Absolute fallback if even feature calculation fails
                 return { result: "safe", score: 0, fallback: true, error: "Fallback calculation failed" };
            }
        }
    }
}

// Initialize detection manager
let detectionManager;
try {
    detectionManager = new DetectionManager();
    console.info(`${logPrefix} DetectionManager instance created successfully.`);
} catch (initError) {
     console.error(`${logPrefix} Failed to initialize DetectionManager:`, initError);
     // Handle critical initialization failure if necessary
}


// Message listener
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const logPrefixMsg = `${logPrefix} [onMessage]`;
    console.info(`${logPrefixMsg} Received message:`, request);
    console.debug(`${logPrefixMsg} Sender details:`, sender);

    if (request.action === "predictPhishing") {
         console.info(`${logPrefixMsg} Handling action 'predictPhishing'.`);
         if (!detectionManager) {
              console.error(`${logPrefixMsg} DetectionManager not initialized. Cannot process request.`);
              sendResponse({ error: "Background service not ready."});
              return false; // Indicate sync response or no response
         }
        detectionManager.analyzeFeatures(request.features)
            .then(result => {
                console.info(`${logPrefixMsg} Sending response for 'predictPhishing':`, result);
                sendResponse(result);
            })
            .catch(error => {
                console.error(`${logPrefixMsg} Error during feature analysis promise chain:`, error);
                sendResponse({ error: error.message || "Unknown error during analysis", result: "safe", score: 0 }); // Send error back
            });
        return true; // Required for async response - IMPORTANT!
    } else {
        console.warn(`${logPrefixMsg} Received unknown action: ${request.action}`);
        // Optionally send a response for unknown actions
        // sendResponse({ error: "Unknown action" });
        // return false; // Or true if you sendResponse
    }
    // If no specific action matched and no async response needed
    // return false; // (Implicitly false if no return true)
});

console.info(`${logPrefix} Background script fully initialized and listener attached.`);