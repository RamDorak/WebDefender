// API Service Module

/**
 * Checks external APIs for information about the URL
 * @param {string} url - The URL to check
 * @return {Promise<Object>} Analysis results
 */
async function checkExternalApis(url) {
    try {
      // Results array
      const results = [];
      
      // 1. Check domain age (simulated)
      const domainAgeCheck = await checkDomainAge(url);
      results.push(domainAgeCheck);
      
      // 2. Check if URL is in blacklists (simulated)
      const blacklistCheck = await checkBlacklists(url);
      results.push(blacklistCheck);
      
      // 3. Check SSL certificate (simulated)
      const sslCheck = await checkSslCertificate(url);
      results.push(sslCheck);
  
      // Calculate risk score for API checks (0-100)
      const riskScore = calculateApiRiskScore(results);
      
      return {
        results: results,
        riskScore: riskScore
      };
    } catch (error) { // error handling
      console.error('API check error:', error);
      return {
        results: [{
          title: 'External API Checks',
          description: 'Could not complete external security checks.',
          severity: 'warning',
          riskFactor: 10
        }],
        riskScore: 50 // Default
      };
    }
  }
  
  /**
   * Simulates checking domain age
   * In a real extension, this would call a WHOIS API
   */
  async function checkDomainAge(domain) {
      const response = await fetch('http://192.168.1.3:3000/domain-age', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ domain })
      });

      const data = await response.json();
      if (response.ok) {
          console.log(`${domain} is ${data.months} months old`);
          // return data.months;
      } else {
          console.warn('Error:', data.error);
          // return null;
      }

      if (data.months < 1) {
        severity = 'danger';
        description = `This domain was registered very recently (less than 1 month ago). New domains are frequently used for phishing.`;
        riskFactor = 30;
      } else if (data.months < 6) {
        severity = 'warning';
        description = `This domain was registered ${data.months} months ago. Relatively new domains should be treated with caution.`;
        riskFactor = 15;
      } else {
        severity = 'safe';
        description = `This domain was registered ${data.months} months ago. Well-established domains are generally more trustworthy.`;
        riskFactor = 0;
      }

      return {
        title: 'Domain Age',
        description,
        severity,
        riskFactor
      };

  }

  
  /**
   * Simulates checking various blacklists
   * In a real extension, this would call APIs like Google Safe Browsing
   */
  async function checkBlacklists(url) {
    // Simulate API call with a delay
    await new Promise(resolve => setTimeout(resolve, 500));

    console.log(`checkBlacklists: Checking URL: ${url} with Safe Browse API`); // Log the URL being checked

    
    // For demo purposes: use a hash of the domain to determine if it's "blacklisted"
    const domain = new URL(url).hostname;
    // Use Google Safe Browsing API to check if the URL is blacklisted
    
    const API_KEY = 'AIzaSyDjy9RKHT_krjCwx5xR60wJXMsgc2Gw9Eo';
    const apiUrl = 'https://safebrowsing.googleapis.com/v4/threatMatches:find?key=' + API_KEY;

    const requestBody = {
      client: {
        clientId: "webdefender-extension",
        clientVersion: "1.0"
      },
      threatInfo: {
        threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION"],
        platformTypes: ["ANY_PLATFORM"],
        threatEntryTypes: ["URL"],
        threatEntries: [
          { "url":url }
        ]
      }
    };

    let isBlacklisted = false;
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        isBlacklisted = !!(data && data.matches && data.matches.length > 0);
      } else {
      // If API fails, treat as not blacklisted (or handle as warning)
        isBlacklisted = false;
      }
    } catch (e) {
      // Network/API error, treat as not blacklisted (or handle as warning)
        isBlacklisted = false;
    }
    
    console.log(isBlacklisted);

    if (isBlacklisted) {
      return {
        title: 'Security Databases',
        description: 'This URL appears on security blacklists as potentially malicious.',
        severity: 'danger',
        riskFactor: 40
      };
    } else {
      return {
        title: 'Security Databases',
        description: 'This URL is not found on major security blacklists.',
        severity: 'safe',
        riskFactor: 0
      };
    }
  }
  
  /**
   * Simulates checking SSL certificate validity
   * In a real extension, this would use more sophisticated checks
   */
  async function checkSslCertificate(url) {
    try {
      const response = await fetch('http://192.168.1.3:3000/check-ssl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });

      const data = await response.json();

      if (!data.hasSSL) {
        return {
          title: 'SSL Certificate',
          description: 'No SSL certificate detected or HTTPS connection failed.',
          severity: 'warning',
          riskFactor: 20
        };
      }

      if (data.expired) {
        return {
          title: 'SSL Certificate',
          description: `SSL certificate is expired (Valid To: ${data.validTo}).`,
          severity: 'danger',
          riskFactor: 25
        };
      }

      return {
        title: 'SSL Certificate',
        description: `Valid SSL certificate issued by ${data.issuer}.`,
        severity: 'safe',
        riskFactor: 0
      };
    } catch (err) {
      return {
        title: 'SSL Certificate',
        description: 'Error checking SSL certificate: ' + err.message,
        severity: 'danger',
        riskFactor: 15
      };
    }
  }
  
  /**
   * Calculates overall API check risk score
   */
  function calculateApiRiskScore(results) {
    let totalRiskFactor = 0;
    let maxPossibleRisk = 0;
    
    // Sum up risk factors
    results.forEach(result => {
      totalRiskFactor += result.riskFactor || 0;
      // Each API check has max risk factor of about 40
      maxPossibleRisk += 40;
    });
    
    // Convert to a 0-100 scale
    const riskPercentage = Math.min(100, Math.round((totalRiskFactor / maxPossibleRisk) * 100));
    
    return riskPercentage;
  }