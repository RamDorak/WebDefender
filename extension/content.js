console.log("Content script running"); // Added for debugging

var testdata;
var prediction;

function predict(data, weight) {
  var f = 0;
  weight = [3.33346292e-01, -1.11200396e-01, -7.77821806e-01, 1.11058590e-01, 3.89430647e-01, 1.99992062e+00, 4.44366975e-01, -2.77951957e-01, -6.00531647e-05, 3.33200243e-01, 2.66644002e+00, 6.66735991e-01, 5.55496098e-01, 5.57022408e-02, 2.22225591e-01, -1.66678858e-01];
  for (var j = 0; j < data.length; j++) {
    f += data[j] * weight[j];
  }
  return f > 0 ? 1 : -1;
}

function isIPInURL() {
  var reg = /\d{1,3}[\.]{1}\d{1,3}[\.]{1}\d{1,3}[\.]{1}\d{1,3}/;
  var url = window.location.href;
  return reg.exec(url) == null ? -1 : 1;
}

function isLongURL() {
  var url = window.location.href;
  if (url.length < 54) return -1;
  if (url.length <= 75) return 0;
  return 1;
}

function isTinyURL() {
  var url = window.location.href;
  return url.length > 20 ? -1 : 1;
}

function isAlphaNumericURL() {
  var search = "@";
  var url = window.location.href;
  return url.match(search) == null ? -1 : 1;
}

function isRedirectingURL() {
  var reg1 = /^http:/;
  var reg2 = /^https:/;
  var srch = "//";
  var url = window.location.href;
  if ((url.search(srch) == 5 && reg1.exec(url) != null && (url.substring(7)).match(srch) == null) || (url.search(srch) == 6 && reg2.exec(url) != null && (url.substring(8)).match(srch) == null)) {
    return -1;
  } else {
    return 1;
  }
}

function isHypenURL() {
  var reg = /[a-zA-Z]\//;
  var srch = "-";
  var url = window.location.href;
  return ((url.substring(0, url.search(reg) + 1)).match(srch)) == null ? -1 : 1;
}

function isMultiDomainURL() {
  var reg = /[a-zA-Z]\//;
  var url = window.location.href;
  return (url.substring(0, url.search(reg) + 1)).split('.').length < 5 ? -1 : 1;
}

function isFaviconDomainUnidentical() {
  var reg = /[a-zA-Z]\//;
  var url = window.location.href;
  const faviconLinks = document.querySelectorAll("link[rel*='shortcut icon']");
  if (faviconLinks.length > 0) {
    const faviconurl = faviconLinks[0].href;
    return (url.substring(0, url.search(reg) + 1)) == (faviconurl.substring(0, faviconurl.search(reg) + 1)) ? -1 : 1;
  }
  return -1;
}

function isIllegalHttpsURL() {
  var srch1 = "//";
  var srch2 = "https";
  var url = window.location.href;
  return ((url.substring(url.search(srch1))).match(srch2)) == null ? -1 : 1;
}

function isImgFromDifferentDomain() {
  var totalCount = document.querySelectorAll("img").length;
  var identicalCount = getIdenticalDomainCount("img");
  const ratio = (totalCount - identicalCount) / totalCount;
  if (ratio < 0.22) return -1;
  if (ratio <= 0.61) return 0;
  return 1;
}

function isAnchorFromDifferentDomain() {
  var totalCount = document.querySelectorAll("a").length;
  var identicalCount = getIdenticalDomainCount("a");
  const ratio = (totalCount - identicalCount) / totalCount;
  if (ratio < 0.31) return -1;
  if (ratio <= 0.67) return 0;
  return 1;
}

function isScLnkFromDifferentDomain() {
  var totalCount = document.querySelectorAll("script").length + document.querySelectorAll("link").length;
  var identicalCount = getIdenticalDomainCount("script") + getIdenticalDomainCount("link");
  const ratio = (totalCount - identicalCount) / totalCount;
  if (ratio < 0.17) return -1;
  if (ratio <= 0.81) return 0;
  return 1;
}

function isFormActionInvalid() {
  const formElements = document.querySelectorAll("form");
  const totalCount = formElements.length;
  const identicalCount = getIdenticalDomainCount("form");
  if (formElements.length <= 0 || document.querySelectorAll('form[action]').length <= 0) return -1;
  if (identicalCount != totalCount) return 0;
  if (document.querySelectorAll('form[action*=""]').length > 0) return 1;
  return -1;
}

function isMailToAvailable() {
  return document.querySelectorAll('a[href^=mailto]').length <= 0 ? -1 : 1;
}

function isStatusBarTampered() {
  return (document.querySelectorAll("a[onmouseover*='window.status']").length <= 0) || (document.querySelectorAll("a[onclick*='location.href']").length <= 0) ? -1 : 1;
}

function isIframePresent() {
  return document.querySelectorAll('iframe').length <= 0 ? -1 : 1;
}

function getIdenticalDomainCount(tag) {
  var identicalCount = 0;
  var reg = /[a-zA-Z]\//;
  var url = window.location.href;
  const mainDomain = url.substring(0, url.search(reg) + 1);
  const nodeList = document.querySelectorAll(tag);
  nodeList.forEach(element => {
    let elementSrcOrHref;
    if (tag === "img" || tag === "script") {
      elementSrcOrHref = element.src;
    } else if (tag === "form") {
      elementSrcOrHref = element.action;
    } else {
      elementSrcOrHref = element.href;
    }
    if (elementSrcOrHref && mainDomain === elementSrcOrHref.substring(0, elementSrcOrHref.search(reg) + 1)) {
      identicalCount++;
    }
  });
  return identicalCount;
}

testdata = [isIPInURL(), isLongURL(), isTinyURL(), isAlphaNumericURL(), isRedirectingURL(), isHypenURL(), isMultiDomainURL(), isFaviconDomainUnidentical(), isIllegalHttpsURL(), isImgFromDifferentDomain(), isAnchorFromDifferentDomain(), isScLnkFromDifferentDomain(), isFormActionInvalid(), isMailToAvailable(), isStatusBarTampered(), isIframePresent()];

prediction = predict(testdata);
console.log("Prediction:", prediction); // Added for debugging

if (prediction === 1) {
  alert("Warning: Phishing detected on this page!");
}