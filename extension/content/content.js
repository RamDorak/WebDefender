// Content script for PhishGuard extension

// This script runs in the context of web pages
// It can analyze page content and communicate with the background script

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'analyzePageContent') {
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
      title: 'Basic Content Check',
      description: 'Basic page analysis completed.',
      severity: 'safe'
    };
  }
  
  // Optionally notify the background script that the content script is loaded
  chrome.runtime.sendMessage({
    action: 'contentScriptLoaded',
    url: window.location.href
  });