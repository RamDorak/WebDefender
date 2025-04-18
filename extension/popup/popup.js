document.addEventListener('DOMContentLoaded', function() {
    const currentUrlElement = document.getElementById('currentUrl');
    const siteStatusElement = document.getElementById('siteStatus');
    const riskScoreElement = document.getElementById('riskScore');
    const riskScoreCircle = document.getElementById('riskScoreCircle');
    const resultsContainer = document.getElementById('resultsContainer');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const reportBtn = document.getElementById('reportBtn');
    
    let currentTabId = null;
    let currentUrl = null;
    
    // Get the current tab and start analysis
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      if (tabs.length > 0) {
        const activeTab = tabs[0];
        currentTabId = activeTab.id;
        currentUrl = activeTab.url;
        
        // Display the current URL
        currentUrlElement.textContent = currentUrl;
        
        // Start the analysis process
        startAnalysis(currentUrl, currentTabId);
      }
    });
    
    // Event listeners
    analyzeBtn.addEventListener('click', function() {
      if (currentUrl) {
        resetUI();
        startAnalysis(currentUrl, currentTabId);
      }
    });
    
    reportBtn.addEventListener('click', function() {
      // Open a new tab with detailed report
      chrome.tabs.create({ url: chrome.runtime.getURL('report/report.html') });
    });
    
    function resetUI() {
      siteStatusElement.textContent = 'Analyzing...';
      riskScoreElement.textContent = '...';
      riskScoreCircle.className = 'score-circle';
      resultsContainer.innerHTML = '<div class="loading-indicator">Analyzing website...</div>';
    }
    
    function startAnalysis(url, tabId) {
      // Send message to the background script to start analysis
      chrome.runtime.sendMessage({
        action: 'analyzeUrl',
        url: url,
        tabId: tabId
      }, function(response) {
        if (response && response.success) {
          updateUI(response.results);
        } else {
          handleError(response ? response.error : 'Unknown error');
        }
      });
    }
    
    function updateUI(results) {
      const { riskScore, status, analysisItems } = results;
      
      // Update risk score
      riskScoreElement.textContent = riskScore;
      
      // Update status
      siteStatusElement.textContent = status;
      
      // Apply appropriate class to risk score circle
      if (riskScore < 30) {
        riskScoreCircle.className = 'score-circle safe-score';
      } else if (riskScore < 70) {
        riskScoreCircle.className = 'score-circle warning-score';
      } else {
        riskScoreCircle.className = 'score-circle danger-score';
      }
      
      // Clear results container
      resultsContainer.innerHTML = '';
      
      // Add analysis results
      analysisItems.forEach(item => {
        const resultItem = document.createElement('div');
        resultItem.className = `result-item ${item.severity}`;
        
        resultItem.innerHTML = `
          <div class="result-title">
            ${item.title}
          </div>
          <div class="result-description">
            ${item.description}
          </div>
        `;
        
        resultsContainer.appendChild(resultItem);
      });
    }
    
    function handleError(errorMessage) {
      siteStatusElement.textContent = 'Analysis failed';
      resultsContainer.innerHTML = `
        <div class="result-item danger">
          <div class="result-title">Error</div>
          <div class="result-description">${errorMessage}</div>
        </div>
      `;
    }
  });