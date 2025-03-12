// background.js (Manifest V3-compatible)

// Import ONNX InferenceSession
import { InferenceSession } from "./scripts/onnx.min.js"; 

// ONNX Model Path (Stored inside extension)
const MODEL_PATH = chrome.runtime.getURL("models/phishing_model.onnx");

// ONNX Model (Loaded in memory)
let modelSession = null;

// Load ONNX Model on Extension Install/Startup
chrome.runtime.onInstalled.addListener(async () => {
    try {
        modelSession = await InferenceSession.create(MODEL_PATH);
        console.log("✅ ONNX model loaded successfully!");
    } catch (error) {
        console.error("❌ ONNX model failed to load:", error);
    }
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message.action === "predictPhishing") {
        if (!modelSession) {
            sendResponse({ error: "ONNX model not loaded" });
            return true; // Keep the response channel open
        }

        try {
            const inputTensor = new ort.Tensor("float32", new Float32Array(message.features), [1, message.features.length]);
            const feeds = { input: inputTensor };

            const results = await modelSession.run(feeds);
            const prediction = results.output.data[0];

            sendResponse({ result: prediction > 0.5 ? "phishing" : "safe" });
        } catch (error) {
            console.error("❌ ONNX inference error:", error);
            sendResponse({ error: error.message });
        }

        return true; // Required for async responses
    }
});
