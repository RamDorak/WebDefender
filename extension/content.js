// Feature extraction manager
console.log("Content script injected!");

class FeatureExtractor {
    constructor() {
        this.features = [];
    }

    async extractFeatures() {
        // Wait for featureConfig to be available
        if (typeof featureConfig === 'undefined') {
            console.error("featureConfig is not available");
            return [];
        }

        const extractedFeatures = [];
        
        // Extract URL features
        if (featureConfig.enabledFeatures.urlFeatures) {
            for (const [name, feature] of Object.entries(urlFeatures)) {
                if (name === 'checkGoogleSafeSearch') {
                    // Handle async Google SafeSearch feature
                    const result = await feature();
                    extractedFeatures.push(result);
                } else {
                    extractedFeatures.push(feature());
                }
                // Log the feature name and value for debugging
                console.log(`Feature: ${name}, Value: ${result}`);
            }
        }
        
        // Extract content features
        if (featureConfig.enabledFeatures.contentFeatures) {
            Object.values(contentFeatures).forEach(feature => {
                extractedFeatures.push(feature());
                // Log the feature name and value for debugging
                console.log(`Content Feature: ${feature.name}, Value: ${feature()}`);
            });
        }
        // Ensure the features array has the same length as the model input size
        console.log("Extracted Features:", extractedFeatures);
        return extractedFeatures;
    }
}

// Main phishing detection function
async function checkPhishing() {
    // Wait for featureConfig to be available
    if (typeof featureConfig === 'undefined') {
        console.error("featureConfig is not available");
        return [];
    }

    const extractor = new FeatureExtractor();
    const features = await extractor.extractFeatures();
    console.log("Extracted Features:", features);

    // Send features to background script for prediction
    // if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
        chrome.runtime.sendMessage(
            { action: "predictPhishing", features: features },
            (response) => {
                if (chrome.runtime.lastError) {
                    console.error("Message sending error:", chrome.runtime.lastError.message);
                    return;
                }
                if (response.error) {
                    console.error("Prediction error:", response.error);
                    return;
                }
    
                // Handle different threat levels with detailed messages
                let message = "";
                let icon = "";
                
                if (response.result === "phishing") {
                    icon = "⚠️";
                    message = "Phishing Website Detected!";
                } else if (response.result === "suspicious") {
                    icon = "⚠️";
                    message = "Suspicious Website Detected!";
                } else {
                    icon = "✅";
                    message = "This site appears to be safe.";
                }

                // Add fallback detection notice if applicable
                if (response.fallback) {
                    message += "\n(Using fallback detection method)";
                }

                // Add confidence score
                message += `\nConfidence: ${(response.score * 100).toFixed(1)}%`;

                // Display the alert
                alert(`${icon} ${message}`);

                // Log detailed results to console
                console.group("WebDefender Detection Results");
                console.log("Status:", response.result.toUpperCase());
                console.log("Confidence Score:", (response.score * 100).toFixed(1) + "%");
                console.log("Detection Method:", response.fallback ? "Fallback (Feature-based + Google SafeSearch)" : "Full (ML + Features + Google SafeSearch)");
                console.log("URL:", window.location.href);
                console.log("Features Analysis:");
                console.log("- URL Features:", features.slice(0, 9));
                console.log("- Content Features:", features.slice(9, -1));
                console.log("- Google SafeSearch:", features[features.length - 1]);
                console.groupEnd();
            }
        );
    // } else {
    //     console.error("chrome.runtime is not available");
    // }
}

// Wait for DOM to be ready and featureConfig to be available
function initialize(retryCount = 0) {
    if (retryCount > 10) {
        console.error("Failed to initialize after multiple retries.");
        return;
    }
    if (typeof featureConfig === 'undefined') {
        setTimeout(() => initialize(retryCount + 1), 100);
        return;
    }
    checkPhishing();
}

// Start initialization when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
}

// Feature Extraction Functions
function isIPInURL() {
    var reg = /\d{1,3}[.]\d{1,3}[.]\d{1,3}[.]\d{1,3}/;
    return reg.test(window.location.href) ? 1 : -1;
}

function getURLLength() {
    var url = window.location.href.length;
    return url < 54 ? -1 : url <= 75 ? 0 : 1;
}

function isShortenedURL() {
    return window.location.href.length > 20 ? -1 : 1;
}

function hasAtSymbol() {
    return window.location.href.includes("@") ? 1 : -1;
}

function hasPrefixSuffix() {
    return window.location.href.includes("-") ? 1 : -1;
}

function getSubDomainLevel() {
    return window.location.hostname.split(".").length - 2;
}

function getSSLState() {
    return window.location.protocol === "https:" ? -1 : 1;
}

function getDomainRegistrationLength() {
    return document.location.hostname.length > 1 ? 1 : -1;
}

function hasHTTPSInURL() {
    return window.location.href.includes("https") ? 1 : -1;
}

function hasRequestURL() {
    return document.querySelectorAll("img[src*='http']").length > 0 ? 1 : -1;
}

function hasURLAnchor() {
    return document.querySelectorAll("a[href*='http']").length > 0 ? 1 : -1;
}

function hasLinksInTags() {
    return document.querySelectorAll("link[href*='http']").length > 0 ? 1 : -1;
}

function hasSFH() {
    return document.querySelectorAll("form[action='']").length > 0 ? 1 : -1;
}

function hasSubmittingToEmail() {
    return document.querySelectorAll("a[href^=mailto]").length > 0 ? 1 : -1;
}

function isAbnormalURL() {
    return window.location.hostname.includes("-") ? 1 : -1;
}

function hasMouseoverEffect() {
    return document.querySelectorAll("a[onmouseover]").length > 0 ? 1 : -1;
}

function hasRightClickDisabled() {
    return document.oncontextmenu === null ? -1 : 1;
}

function hasPopupWindow() {
    return document.querySelectorAll("script[popup]").length > 0 ? 1 : -1;
}

function hasIframeRedirection() {
    return document.querySelectorAll("iframe").length > 0 ? 1 : -1;
}

function getAgeOfDomain() {
    return document.location.hostname.length > 1 ? 1 : -1;
}

function hasDNSRecord() {
    return document.location.hostname.length > 1 ? 1 : -1;
}

function getWebTraffic() {
    return document.referrer ? 1 : -1;
}

function isGoogleIndexed() {
    return window.location.hostname.includes("google") ? 1 : -1;
}

function hasLinksPointingToPage() {
    return document.querySelectorAll("a").length > 5 ? 1 : -1;
}

function hasStatisticalReport() {
    return document.querySelectorAll("script").length > 5 ? 1 : -1;
}
