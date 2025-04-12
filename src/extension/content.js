import * as urlFeatures from './features/url_features.js';
import * as contentFeatures from './features/content_features.js';


// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'CHECK_URL') {  // Check for the correct message type
        (async () => { // Create an async IIFE to handle the feature extraction and sending the message to the background script.
            try {
                const featureExtractor = new FeatureExtractor(featureConfig); //featureConfig is available here
                const features = await featureExtractor.extractFeatures();
                // Send the extracted features to the background script.
                chrome.runtime.sendMessage({ action: "predictPhishing", features: features }, (response) => {
                    sendResponse(response); // send the response from background script to popup script
                });
            } catch (error) {
                console.error("Error during feature extraction:", error);
                sendResponse({ error: error.message });
            }
        })();

        return true; // Required for async sendResponse
    }
});




class FeatureExtractor {
    constructor(featureConfig) {
        this.features = [];
        this.featureConfig = featureConfig; // store featureConfig as an instance variable
    }
    async extractFeatures() {
        const extractedFeatures = [];

        try {
            if (this.featureConfig.enabledFeatures.urlFeatures) { // use this.featureConfig instead of featureConfig

                for (const [name, feature] of Object.entries(urlFeatures)) {
                    let result;
                    if (name === 'checkGoogleSafeSearch') {
                        result = await feature(); // Make sure to await asynchronous operations
                    } else {
                        result = feature();
                    }
                    extractedFeatures.push(result);
                    console.log(`Feature: ${name}, Value: ${result}`);
                }
            }

            if (this.featureConfig.enabledFeatures.contentFeatures) {
                Object.values(contentFeatures).forEach(feature => {
                    extractedFeatures.push(feature());
                    console.log(`Content Feature: ${feature.name}, Value: ${feature()}`); // fix this log if needed
                });
            }
        } catch (error) {
            console.error("Error during feature extraction:", error);
            // Handle error as needed, e.g., send an error message to the popup
        }


        console.log("Extracted Features:", extractedFeatures);
        return extractedFeatures;
    }
}




