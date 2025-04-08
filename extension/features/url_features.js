// URL-based feature extractors
const urlFeatures = {
    isIPInURL: () => {
        const reg = /\d{1,3}[.]\d{1,3}[.]\d{1,3}[.]\d{1,3}/;
        return reg.test(window.location.href) ? 1 : -1;
    },
    
    getURLLength: () => {
        const url = window.location.href.length;
        return url < 54 ? -1 : url <= 75 ? 0 : 1;
    },
    
    isShortenedURL: () => {
        return window.location.href.length > 20 ? -1 : 1;
    },
    
    hasAtSymbol: () => {
        return window.location.href.includes("@") ? 1 : -1;
    },
    
    hasPrefixSuffix: () => {
        return window.location.href.includes("-") ? 1 : -1;
    },
    
    getSubDomainLevel: () => {
        return window.location.hostname.split(".").length - 2;
    },
    
    getSSLState: () => {
        return window.location.protocol === "https:" ? -1 : 1;
    },
    
    getDomainRegistrationLength: () => {
        return document.location.hostname.length > 1 ? 1 : -1;
    },
    
    hasHTTPSInURL: () => {
        return window.location.href.includes("https") ? 1 : -1;
    },

    // New Google SafeSearch feature
    checkGoogleSafeSearch: async () => {
        try {
            const url = window.location.href;
            const response = await fetch(`https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${featureConfig.googleSafeSearch.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    client: {
                        clientId: "WebDefender",
                        clientVersion: "1.0.0"
                    },
                    threatInfo: {
                        threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION"],
                        platformTypes: ["ANY_PLATFORM"],
                        threatEntryTypes: ["URL"],
                        threatEntries: [{ url: url }]
                    }
                })
            });

            const data = await response.json();
            return data.matches ? 1 : -1; // 1 if threat found, -1 if safe
        } catch (error) {
            console.error("Google SafeSearch check failed:", error);
            return 0; // Neutral score if check fails
        }
    }
}; 