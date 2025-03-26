const { URL } = require('url');

function havingIP(url) {
    return /\b(?:\d{1,3}\.){3}\d{1,3}\b/.test(url) ? 1 : -1;
}

function haveAtSign(url) {
    return url.includes('@') ? 1 : -1;
}

function getLength(url) {
    return url.length < 54 ? -1 : url <= 75 ? 0 : 1;
}

function getDepth(url) {
    return (new URL(url).pathname.match(/\//g) || []).length;
}

function redirection(url) {
    let pos = url.lastIndexOf('//');
    return pos > 6 ? (pos > 7 ? 1 : -1) : -1;
}

function httpDomain(url) {
    return new URL(url).hostname.includes('https') ? 1 : -1;
}

const shorteningServices = [
    "bit.ly", "goo.gl", "shorte.st", "go2l.ink", "x.co", "ow.ly", "t.co", "tinyurl.com",
    "tr.im", "is.gd", "cli.gs", "yfrog.com", "migre.me", "ff.im", "tiny.cc", "url4.eu"
];

function tinyURL(url) {
    return shorteningServices.some(service => url.includes(service)) ? 1 : -1;
}

function prefixSuffix(url) {
    return new URL(url).hostname.includes('-') ? 1 : -1;
}

function getSubDomainLevel(url) {
    return new URL(url).hostname.split('.').length - 2;
}

function hasRequestURL(url) {
    return url.includes('img[src*=\'http\']') ? 1 : -1;
}

function hasURLAnchor(url) {
    return url.includes('a[href*=\'http\']') ? 1 : -1;
}

function hasLinksInTags(url) {
    return url.includes('link[href*=\'http\']') ? 1 : -1;
}

function hasSubmittingToEmail(url) {
    return url.includes('a[href^=mailto]') ? 1 : -1;
}

function hasMouseoverEffect(url) {
    return url.includes('a[onmouseover]') ? 1 : -1;
}

function hasRightClickDisabled(url) {
    return url.includes('document.oncontextmenu=null') ? -1 : 1;
}

function hasIframeRedirection(url) {
    return url.includes('iframe') ? 1 : -1;
}

function extractURLFeatures(url) {
    return [
        havingIP(url),
        haveAtSign(url),
        getLength(url),
        getDepth(url),
        redirection(url),
        httpDomain(url),
        tinyURL(url),
        prefixSuffix(url),
        getSubDomainLevel(url),
        hasRequestURL(url),
        hasURLAnchor(url),
        hasLinksInTags(url),
        hasSubmittingToEmail(url),
        hasMouseoverEffect(url),
        hasRightClickDisabled(url),
        hasIframeRedirection(url)
    ];
}

// Extract features and predict phishing status
async function checkPhishing() {
    const url = window.location.href;
    const features = extractURLFeatures(url);
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

// Example Usage
const exampleUrl = "http://www.example.com/test/page.html";
console.log(extractURLFeatures(exampleUrl));
