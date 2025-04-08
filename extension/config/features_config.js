// Feature configuration
export const featureConfig = {
    enabledFeatures: {
        urlFeatures: true,
        contentFeatures: true,
        googleSafeSearch: true
    },
    weights: {
        urlFeatures: 0.2,
        contentFeatures: 0.2,
        googleSafeSearch: 0.6
    },
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
