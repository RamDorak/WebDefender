// Background service worker for PhishGuard extension

// Import analyzer modules
importScripts('../libs/url-analyzer.js', '../libs/content-analyzer.js', '../libs/report-generator.js', '../libs/api-service.js');

// Cache for analysis results
const analysisCache = {};

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'logMLResults') {
    console.log("ML Analysis Results:", message.results);
    sendResponse({ success: true });
  } else if (message.action === 'logMLError') {
    console.error("ML Analysis Error:", message.error);
    sendResponse({ success: true });
  } else if (message.action === 'analyzeUrl') {
    analyzeWebsite(message.url, message.tabId)
      .then(results => {
        // Cache the results
        analysisCache[message.url] = {
          results: results,
          timestamp: Date.now()
        };
        
        // Store in chrome storage for report page access
        chrome.storage.local.set({
          'lastAnalysis': {
            url: message.url,
            results: results,
            timestamp: Date.now()
          }
        });
        
        sendResponse({ success: true, results: results });
      })
      .catch(error => {
        console.error('Analysis error:', error);
        sendResponse({ success: false, error: error.message });
      });
    
    // Return true to indicate we will respond asynchronously
    return true;
  }
});

// Function to analyze a website
async function analyzeWebsite(url, tabId) {
  // Check cache first (valid for 5 minutes)
  const cachedData = analysisCache[url];
  if (cachedData && (Date.now() - cachedData.timestamp < 5 * 60 * 1000)) {
    return cachedData.results;
  }
  
  try {
    // Step 1: Analyze the URL
    const urlAnalysis = await analyzeUrl(url, tabId);
    
    // Step 2: Get and analyze the page content
    const contentAnalysis = await analyzeContent(tabId);
    
    // Step 3: Check external APIs for security information
    const apiAnalysis = await checkExternalApis(url);
    
    // Step 4: Generate final report
    const finalResults = generateReport(url, urlAnalysis, contentAnalysis, apiAnalysis);
    
    return finalResults;
  } catch (error) {
    console.error('Analysis failed:', error);
    throw new Error('Website analysis failed. Please try again.');
  }
}

// Listen for web navigation to reset UI on page load
chrome.webNavigation.onCompleted.addListener((details) => {
  if (details.frameId === 0) { // Main frame only
    // Notify any open popup that the page has changed
    chrome.runtime.sendMessage({
      action: 'pageChanged',
      url: details.url,
      tabId: details.tabId
    });
  }
});