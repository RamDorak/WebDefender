// Extract Features for ML model
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
    return -1;
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
  
  const prediction = predict(features);

  return {
    prediction: prediction,
    extraChecks: domFeatures,
  };
}
