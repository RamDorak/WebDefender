// Content script for PhishGuard extension

// This script runs in the context of web pages
// It can analyze page content and communicate with the background script

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "analyzePageContent") {
    // Analyze the current page content
    const contentAnalysis = analyzeContent();
    sendResponse(contentAnalysis);
  }
  return true; // Indicates we'll respond asynchronously
});

// Function to analyze page content
function analyzeContent() {
  // This is a placeholder - the actual content analysis happens in
  // the injected script from content-analyzer.js

  return {
    title: "Basic Content Check",
    description: "Basic page analysis completed.",
    severity: "safe",
  };
}

// Notify the background script that the content script is loaded
chrome.runtime.sendMessage({
  action: "contentScriptLoaded",
  url: window.location.href,
});

// Listen for requests to get DOM features
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getDOMFeatures") {
    // Get DOM features
    const domFeatures = {
      isFaviconDomainUnidentical: isFaviconDomainUnidentical(),
      isImgFromDifferentDomain: isImgFromDifferentDomain(),
      isAnchorFromDifferentDomain: isAnchorFromDifferentDomain(),
      isScLnkFromDifferentDomain: isScLnkFromDifferentDomain(),
      isFormActionInvalid: isFormActionInvalid(),
      isMailToAvailable: isMailToAvailable(),
      isStatusBarTampered: isStatusBarTampered(),
      isIframePresent: isIframePresent(),
      url: window.location.href
    };
    
    sendResponse(domFeatures);
  }
  return true; // Keep the message channel open for async response
});

function isFaviconDomainUnidentical() {
  var reg = /[a-zA-Z]\//;
  var url = window.location.href;
  if (document.querySelectorAll("link[rel*='shortcut icon']").length > 0) {
    var faviconurl = document.querySelector("link[rel*='icon']")?.href;
    if (
      url.substring(0, url.search(reg) + 1) ==
      faviconurl.substring(0, faviconurl.search(reg) + 1)
    ) {
      console.log("NP");
      return -1;
    } else {
      console.log("P");
      return 1;
    }
  } else {
    console.log("NP");
    return -1;
  }
}

function isImgFromDifferentDomain() {
  var totalCount = document.querySelectorAll("img").length;
  var identicalCount = getIdenticalDomainCount("img");
  if ((totalCount - identicalCount) / totalCount < 0.22) {
    console.log("NP");
    return -1;
  } else if (
    (totalCount - identicalCount) / totalCount >= 0.22 &&
    (totalCount - identicalCount) / totalCount <= 0.61
  ) {
    console.log("Maybe");
    return 0;
  } else {
    console.log("P");
    return 1;
  }
}

function isAnchorFromDifferentDomain() {
  var totalCount = document.querySelectorAll("a").length;
  var identicalCount = getIdenticalDomainCount("a");
  if ((totalCount - identicalCount) / totalCount < 0.31) {
    console.log("NP");
    return -1;
  } else if (
    (totalCount - identicalCount) / totalCount >= 0.31 &&
    (totalCount - identicalCount) / totalCount <= 0.67
  ) {
    console.log("Maybe");
    return 0;
  } else {
    console.log("P");
    return 1;
  }
}

function isScLnkFromDifferentDomain() {
  var totalCount =
    document.querySelectorAll("script").length +
    document.querySelectorAll("link").length;
  var identicalCount =
    getIdenticalDomainCount("script") + getIdenticalDomainCount("link");
  if ((totalCount - identicalCount) / totalCount < 0.17) {
    console.log("NP");
    return -1;
  } else if (
    (totalCount - identicalCount) / totalCount >= 0.17 &&
    (totalCount - identicalCount) / totalCount <= 0.81
  ) {
    console.log("Maybe");
    return 0;
  } else {
    console.log("P");
    return 1;
  }
}

function isFormActionInvalid() {
  var totalCount = document.querySelectorAll("form").length;
  var identicalCount = getIdenticalDomainCount("form");
  if (document.querySelectorAll("form[action]").length <= 0) {
    console.log("NP");
    return -1;
  } else if (identicalCount != totalCount) {
    console.log("Maybe");
    return 0;
  } else if (document.querySelectorAll('form[action*=""]').length > 0) {
    console.log("P");
    return 1;
  } else {
    console.log("NP");
    return -1;
  }
}

function isMailToAvailable() {
  if (document.querySelectorAll("a[href^=mailto]").length <= 0) {
    console.log("NP");
    return -1;
  } else {
    console.log("P");
    return 1;
  }
}

function isStatusBarTampered() {
  if (
    document.querySelectorAll("a[onmouseover*='window.status']").length <= 0 ||
    document.querySelectorAll("a[onclick*='location.href']").length <= 0
  ) {
    console.log("NP");
    return -1;
  } else {
    console.log("P");
    return 1;
  }
}

function isIframePresent() {
  if (document.querySelectorAll("iframe").length <= 0) {
    console.log("NP");
    return -1;
  } else {
    console.log("P");
    return 1;
  }
}

function getIdenticalDomainCount(tag) {
  var i;
  var identicalCount = 0;
  var reg = /[a-zA-Z]\//;
  var url = window.location.href;
  var mainDomain = url.substring(0, url.search(reg) + 1);
  var nodeList = document.querySelectorAll(tag);
  if (tag == "img" || tag == "script") {
    nodeList.forEach(function (element, index) {
      i = nodeList[index].src;
      if (mainDomain == i.substring(0, i.search(reg) + 1)) {
        identicalCount++;
      }
    });
  } else if (tag == "form") {
    nodeList.forEach(function (element, index) {
      i = nodeList[index].action;
      if (mainDomain == i.substring(0, i.search(reg) + 1)) {
        identicalCount++;
      }
    });
  } else if (tag == "a") {
    nodeList.forEach(function (element, index) {
      i = nodeList[index].href;
      if (
        mainDomain == i.substring(0, i.search(reg) + 1) &&
        i.substring(0, i.search(reg) + 1) != null &&
        i.substring(0, i.search(reg) + 1) != ""
      ) {
        identicalCount++;
      }
    });
  } else {
    nodeList.forEach(function (element, index) {
      i = nodeList[index].href;
      if (mainDomain == i.substring(0, i.search(reg) + 1)) {
        identicalCount++;
      }
    });
  }
  return identicalCount;
}

