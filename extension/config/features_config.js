// Feature configuration
export const featureConfig = {
    enabledFeatures: {
        urlFeatures: true,
        contentFeatures: true,
        googleSafeSearch: true
    },
    weights: (() => {
        const weights = {
            urlFeatures: 0.2,
            contentFeatures: 0.2,
            googleSafeSearch: 0.6
        };
        const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
        if (totalWeight !== 1) {
            console.warn("Feature weights do not sum up to 1. Adjusting weights.");
            const scale = 1 / totalWeight;
            Object.keys(weights).forEach(key => weights[key] *= scale);
        }
        return weights;
    })(),
    thresholds: {
        phishing: 0.5,
        suspicious: 0.3
    },
    googleSafeSearch: {
        apiKey: "AIzaSyDI434kekTZIvkr8DcDqNHwzQU_H2aw1EU",
        threatTypes: [
            "MALWARE",
            "SOCIAL_ENGINEERING",
            "UNWANTED_SOFTWARE",
            "POTENTIALLY_HARMFUL_APPLICATION"
        ],
        checkInterval: 3600,
        cacheDuration: 86400
    },
    cache: {
        enabled: true,
        maxSize: 1000,
        expirationTime: 86400
    }
};
