function extractFeatures() {
    return [
        isIPInURL(),
        getURLLength(),
        isShortenedURL(),
        hasAtSymbol(),
        hasPrefixSuffix(),
        getSubDomainLevel(),
        getSSLState(),
        getDomainRegistrationLength(),
        hasHTTPSInURL(),
        hasRequestURL(),
        hasURLAnchor(),
        hasLinksInTags(),
        hasSFH(),
        hasSubmittingToEmail(),
        isAbnormalURL(),
        hasMouseoverEffect(),
        hasRightClickDisabled(),
        hasPopupWindow(),
        hasIframeRedirection(),
        getAgeOfDomain(),
        hasDNSRecord(),
        getWebTraffic(),
        isGoogleIndexed(),
        hasLinksPointingToPage(),
        hasStatisticalReport()
    ];
}

// Extract features and predict phishing status
async function checkPhishing() {
    const features = extractFeatures();
    console.log("Extracted Features:", features);

    // Send features to background script for prediction
    chrome.runtime.sendMessage(
        { action: "predictPhishing", features: features },
        (response) => {
            if (response.error) {
                console.error("Prediction error:", response.error);
                return;
            }
            if (response.result === "phishing") {
                alert("⚠️ Phishing Website Detected!");
            } else {
                console.log("✅ This site seems legit.");
            }
        }
    );
}

// Run when page loads
window.addEventListener("load", checkPhishing);

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
