// Initialize ONNX Runtime
import * as ort from './libs/ort.min.js';

async function loadModel() {
    try {
        return await ort.InferenceSession.create(chrome.runtime.getURL("../models/phishing_model.onnx"));
    } catch (error) {
        console.error("Model loading error:", error);
        return null;
    }
}

async function predict(features) {
    try {
        const model = await loadModel();
        if (!model) {
            throw new Error("Failed to load model");
        }
        const tensor = new ort.Tensor("float32", new Float32Array(features), [1, features.length]);
        const feeds = { input: tensor };
        const results = await model.run(feeds);
        return results.output.data[0];
    } catch (error) {
        console.error("ONNX Prediction Error:", error);
        return null;
    }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "predictPhishing") {
        predict(request.features).then(result => {
            sendResponse({ result: result > 0.5 ? "phishing" : "safe" });
        }).catch(error => {
            sendResponse({ error: error.message });
        });
        return true;
    }
});
