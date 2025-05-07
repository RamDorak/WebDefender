// Content script for PhishGuard extension

// This script runs in the context of web pages
// It can analyze page content and communicate with the background script

// ML Feature Extraction Functions
function isIPInURL(url) {
  var reg = /\d{1,3}[\.]{1}\d{1,3}[\.]{1}\d{1,3}[\.]{1}\d{1,3}/;
  if (reg.exec(url) == null) {
    console.log("NP");
    return -1;
  } else {
    console.log("P");
    return 1;
  }
}

function isLongURL(url) {
  if (url.length < 54) {
    console.log("NP");
    return -1;
  } else if (url.length >= 54 && url.length <= 75) {
    console.log("Maybe");
    return 0;
  } else {
    console.log("P");
    return 1;
  }
}

function isTinyURL(url) {
  if (url.length > 20) {
    console.log("NP");
    return -1;
  } else {
    console.log("P");
    return 1;
  }
}

function isAlphaNumericURL(url) {
  var reg = /^[a-zA-Z0-9]+$/;
  if (reg.exec(url) == null) {
    console.log("NP");
    return -1;
  } else {
    console.log("P");
    return 1;
  }
}

function isRedirectingURL(url) {
  if (url.indexOf("//") > 7) {
    console.log("P");
    return 1;
  } else {
    console.log("NP");
    return -1;
  }
}

function isHypenURL(url) {
  if (url.indexOf("-") > 0) {
    console.log("P");
    return 1;
  } else {
    console.log("NP");
    return -1;
  }
}

function isMultiDomainURL(url) {
  if (url.split(".").length > 3) {
    console.log("P");
    return 1;
  } else {
    console.log("NP");
    return 1;
  }
}

function isIllegalHttpsURL(url) {
  if (url.indexOf("https") == 0) {
    console.log("NP");
    return -1;
  } else {
    console.log("P");
    return 1;
  }
}

// ML MODEL
function predict(data) {
  let f = 0;
  const weight = [
    3.33346292e-1, -1.11200396e-1, -7.77821806e-1, 1.1105859e-1, 3.89430647e-1,
    1.99992062, 4.44366975e-1, -2.77951957e-1, -6.00531647e-5, 3.33200243e-1,
    2.66644002, 6.66735991e-1, 5.55496098e-1, 5.57022408e-2, 2.22225591e-1,
    -1.66678858e-1,
  ];
  for (let j = 0; j < data.length; j++) {
    f += data[j] * weight[j];
  }
  return f > 0 ? 1 : -1;
}

function ml_results(url, domFeatures) {
  console.log("Running ML analysis for URL:", url);
  console.log("DOM Features:", domFeatures);
  
  const features = [
    isIPInURL(url),
    isLongURL(url),
    isTinyURL(url),
    isAlphaNumericURL(url),
    isRedirectingURL(url),
    isHypenURL(url),
    isMultiDomainURL(url),
    domFeatures.isFaviconDomainUnidentical,
    isIllegalHttpsURL(url),
    domFeatures.isImgFromDifferentDomain,
    domFeatures.isAnchorFromDifferentDomain,
    domFeatures.isScLnkFromDifferentDomain,
    domFeatures.isFormActionInvalid,
    domFeatures.isMailToAvailable,
    domFeatures.isStatusBarTampered,
    domFeatures.isIframePresent,
  ];
  
  console.log("Extracted Features:", features);
  const prediction = predict(features);
  console.log("ML Prediction:", prediction);

  return {
    prediction: prediction,
    extraChecks: domFeatures,
  };
}

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Content script received message:", message);
  
  if (message.action === "analyzePageContent") {
    // Analyze the current page content
    const contentAnalysis = analyzeContent();
    sendResponse(contentAnalysis);
  } else if (message.action === "getDOMFeatures") {
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
  } else if (message.action === "runMLAnalysis") {
    // Run ML analysis
    const mlResult = ml_results(message.url, message.domFeatures);
    console.log("ML Analysis Result:", mlResult);
    sendResponse(mlResult);
  }
  return true; // Keep the message channel open for async response
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

