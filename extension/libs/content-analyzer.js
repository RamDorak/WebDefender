// Content Analysis Module

/**
 * Analyzes webpage content by injecting a content script
 * @param {number} tabId - The tab ID to analyze
 * @return {Promise<Object>} Analysis results
 */
async function analyzeContent(tabId) {
    try {
      // Execute content script in the tab to analyze page content
      const contentResults = await chrome.tabs.executeScript(tabId, {
        code: `(${contentAnalysisScript})();`
      });
      
      // The content script returns an array with a single item
      return contentResults[0];
    } catch (error) {
      console.error('Content analysis error:', error);
      return {
        results: [{
          title: 'Content Analysis',
          description: 'Could not analyze page content. The page may be restricted.',
          severity: 'warning',
          riskFactor: 10
        }],
        riskScore: 50 // Default moderate risk due to analysis failure
      };
    }
  }
  
  // Content analysis script - will be executed in the context of the page
  function contentAnalysisScript() {
    // Results array
    const results = [];
    
    // 1. Check for login forms
    const loginFormCheck = checkLoginForms();
    results.push(loginFormCheck);
    
    // 2. Check for brand impersonation
    const brandCheck = checkBrandImpersonation();
    results.push(brandCheck);
    
    // 3. Check for hidden elements
    const hiddenElementsCheck = checkHiddenElements();
    results.push(hiddenElementsCheck);
    
    // 4. Check for grammar and spelling issues
    const grammarCheck = checkGrammarAndSpelling();
    results.push(grammarCheck);
    
    // Calculate risk score for content (0-100)
    const riskScore = calculateContentRiskScore(results);
    
    return {
      results: results,
      riskScore: riskScore
    };
    
    // Internal functions for content analysis
    
    function checkLoginForms() {
      const forms = document.querySelectorAll('form');
      let hasLoginForm = false;
      let hasSecureFormAction = true;
      let hasPasswordField = false;
      
      forms.forEach(form => {
        const inputs = form.querySelectorAll('input');
        const passwordInputs = form.querySelectorAll('input[type="password"]');
        
        if (passwordInputs.length > 0) {
          hasLoginForm = true;
          hasPasswordField = true;
          
          // Check if form submits to HTTPS
          const action = form.getAttribute('action') || '';
          if (action.startsWith('http:') || 
              (action === '' && window.location.protocol !== 'https:')) {
            hasSecureFormAction = false;
          }
        }
      });
      
      if (!hasLoginForm) {
        return {
          title: 'Login Form Detection',
          description: 'No login forms detected on this page.',
          severity: 'safe',
          riskFactor: 0
        };
      } else if (!hasSecureFormAction) {
        return {
          title: 'Login Form Security',
          description: 'Login form detected that submits data over an insecure connection. Your credentials could be at risk.',
          severity: 'danger',
          riskFactor: 30
        };
      } else {
        return {
          title: 'Login Form Security',
          description: 'Login form detected with secure submission method.',
          severity: 'safe',
          riskFactor: 5
        };
      }
    }
    
    function checkBrandImpersonation() {
      // Look for common trusted brand names in the page title or content
      const pageTitle = document.title.toLowerCase();
      const bodyText = document.body.innerText.toLowerCase();
      
      const commonBrands = [
        'paypal', 'apple', 'microsoft', 'google', 'facebook', 'amazon', 
        'netflix', 'bank of america', 'chase', 'wells fargo', 'citibank'
      ];
      
      // Check if brand name is in the title or body
      const detectedBrands = commonBrands.filter(brand => 
        pageTitle.includes(brand) || bodyText.includes(brand)
      );
      
      if (detectedBrands.length === 0) {
        return {
          title: 'Brand Impersonation',
          description: 'No detected attempts to impersonate well-known brands.',
          severity: 'safe',
          riskFactor: 0
        };
      }
      
      // Check for image elements that might be brand logos
      const imgElements = document.querySelectorAll('img');
      const hasLogo = Array.from(imgElements).some(img => {
        const altText = (img.alt || '').toLowerCase();
        const src = (img.src || '').toLowerCase();
        return detectedBrands.some(brand => 
          altText.includes(brand) || src.includes(brand) || 
          altText.includes('logo') || src.includes('logo')
        );
      });
      
      // If we found a brand reference and logos, this could be brand impersonation
      // Note: This is a simplified detection and would need domain verification for accuracy
      if (hasLogo) {
        return {
          title: 'Brand Impersonation Check',
          description: `This site references ${detectedBrands.join(', ')}. Verify you're on the official website.`,
          severity: 'warning',
          riskFactor: 20
        };
      } else {
        return {
          title: 'Brand References',
          description: `This site mentions ${detectedBrands.join(', ')} but doesn't appear to be impersonating them.`,
          severity: 'safe', 
          riskFactor: 5
        };
      }
    }
    
    function checkHiddenElements() {
      // Look for hidden elements that might contain malicious content
      const allElements = document.querySelectorAll('*');
      const hiddenElements = Array.from(allElements).filter(el => {
        const style = window.getComputedStyle(el);
        return (style.display === 'none' || style.visibility === 'hidden' || 
                style.opacity === '0' || parseInt(style.opacity) === 0 ||
                el.getAttribute('hidden') !== null);
      });
      
      // Check for suspicious hidden iframes specifically
      const hiddenIframes = hiddenElements.filter(el => el.tagName.toLowerCase() === 'iframe');
      
      if (hiddenIframes.length > 0) {
        return {
          title: 'Hidden Content',
          description: `Found ${hiddenIframes.length} hidden iframe(s). This is often associated with malicious behavior.`,
          severity: 'danger',
          riskFactor: 25
        };
      } else if (hiddenElements.length > 20) {
        // Many hidden elements could be suspicious
        return {
          title: 'Hidden Content',
          description: `Found an unusually high number of hidden elements (${hiddenElements.length}). This may be suspicious.`,
          severity: 'warning',
          riskFactor: 15
        };
      } else {
        return {
          title: 'Hidden Content',
          description: 'No suspicious hidden elements detected.',
          severity: 'safe',
          riskFactor: 0
        };
      }
    }
    
    function checkGrammarAndSpelling() {
      // Get all text nodes in the document
      const textContent = document.body.innerText;
      
      // Simple heuristics for poor grammar/spelling
      // This is highly simplified - real implementation would use more sophisticated NLP
      
      // Check for common phishing text patterns
      const phishingPhrases = [
        'verify your account',
        'confirm your information',
        'account has been suspended',
        'unusual activity',
        'click here to verify',
        'update your information',
        'limited time offer',
        'urgent action required'
      ];
      
      const detectedPhrases = phishingPhrases.filter(phrase => 
        textContent.toLowerCase().includes(phrase)
      );
      
      // Check for grammar
// Grammar check continued
    
    // Simple check for multiple exclamation marks (often in scam sites)
    const excessiveExclamations = (textContent.match(/!{2,}/g) || []).length;
    
    // Check for ALL CAPS text (often used in scams)
    const allCapsWords = (textContent.match(/\b[A-Z]{4,}\b/g) || []).length;
    
    // Check for misspellings of common words (very simplified)
    const commonMisspellings = [
      { correct: 'account', misspelled: ['acount', 'accunt', 'acct'] },
      { correct: 'verify', misspelled: ['verfy', 'verfiy', 'verrify'] },
      { correct: 'password', misspelled: ['pasword', 'passord', 'passwrd'] },
      { correct: 'secure', misspelled: ['secre', 'secur', 'securre'] },
      { correct: 'confirm', misspelled: ['confrim', 'comfirm', 'conferm'] }
    ];
    
    let misspellingCount = 0;
    commonMisspellings.forEach(item => {
      item.misspelled.forEach(misspelling => {
        const regex = new RegExp('\\b' + misspelling + '\\b', 'gi');
        misspellingCount += (textContent.match(regex) || []).length;
      });
    });
    
    // Calculate a simple "poor language quality" score
    const languageIssueScore = excessiveExclamations + (allCapsWords * 2) + (misspellingCount * 3) + (detectedPhrases.length * 5);
    
    if (languageIssueScore > 20) {
      return {
        title: 'Content Quality',
        description: 'Poor grammar, excessive formatting or phishing phrases detected. This is common in scam websites.',
        severity: 'danger',
        riskFactor: 25
      };
    } else if (languageIssueScore > 10) {
      return {
        title: 'Content Quality',
        description: 'Some indicators of poor content quality or suspicious phrasing detected.',
        severity: 'warning',
        riskFactor: 15
      };
    } else if (detectedPhrases.length > 0) {
      return {
        title: 'Content Phrasing',
        description: `Contains phrases often used in phishing: "${detectedPhrases.join('", "')}"`,
        severity: 'warning',
        riskFactor: 10
      };
    } else {
      return {
        title: 'Content Quality',
        description: 'Content appears to have normal quality with no suspicious patterns.',
        severity: 'safe',
        riskFactor: 0
      };
    }
  }
  
  function calculateContentRiskScore(results) {
    let totalRiskFactor = 0;
    let maxPossibleRisk = 0;
    
    // Sum up risk factors
    results.forEach(result => {
      totalRiskFactor += result.riskFactor || 0;
      // Each check has max risk factor of about 30
      maxPossibleRisk += 30;
    });
    
    // Convert to a 0-100 scale
    const riskPercentage = Math.min(100, Math.round((totalRiskFactor / maxPossibleRisk) * 100));
    
    return riskPercentage;
  }
}