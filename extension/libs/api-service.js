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
    } catch (error) {
      console.error('API check error:', error);
      return {
        results: [{
          title: 'External API Checks',
          description: 'Could not complete external security checks.',
          severity: 'warning',
          riskFactor: 10
        }],
        riskScore: 50 // Default moderate risk due to analysis failure
      };
    }
  }
  
  /**
   * Simulates checking domain age
   * In a real extension, this would call a WHOIS API
   */
  async function checkDomainAge(url) {
    // Extract domain from URL
    const domain = new URL(url).hostname;
    
    // Simulate API call with a delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // For demo purposes, we'll use a deterministic "random" value based on domain name
    const domainSum = domain.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const simulatedDomainAgeMonths = domainSum % 60; // 0-59 months
    
    let severity, description, riskFactor;
    
    if (simulatedDomainAgeMonths < 1) {
      severity = 'danger';
      description = `This domain was registered very recently (less than 1 month ago). New domains are frequently used for phishing.`;
      riskFactor = 30;
    } else if (simulatedDomainAgeMonths < 6) {
      severity = 'warning';
      description = `This domain was registered ${simulatedDomainAgeMonths} months ago. Relatively new domains should be treated with caution.`;
      riskFactor = 15;
    } else {
      severity = 'safe';
      description = `This domain was registered ${simulatedDomainAgeMonths} months ago. Well-established domains are generally more trustworthy.`;
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
    
    // For demo purposes: use a hash of the domain to determine if it's "blacklisted"
    const domain = new URL(url).hostname;
    const domainHash = domain.split('').reduce((hash, char) => {
      return ((hash << 5) - hash) + char.charCodeAt(0);
    }, 0);
    
    // Determine if "blacklisted" based on hash
    // This gives about 10% of domains showing as blacklisted for demo purposes
    const isBlacklisted = Math.abs(domainHash % 10) === 0;
    
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
    // Only check SSL for HTTPS URLs
    if (!url.startsWith('https://')) {
      return {
        title: 'SSL Certificate',
        description: 'No SSL certificate (site uses HTTP, not HTTPS).',
        severity: 'warning',
        riskFactor: 20
      };
    }
    
    // Simulate API call with a delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // For demo purposes, simulate different certificate statuses
    const domain = new URL(url).hostname;
    const domainSum = domain.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const certificateStatus = domainSum % 10; // 0-9
    
    if (certificateStatus < 7) {
      return {
        title: 'SSL Certificate',
        description: 'Valid SSL certificate detected. Connection is encrypted.',
        severity: 'safe',
        riskFactor: 0
      };
    } else if (certificateStatus < 9) {
      return {
        title: 'SSL Certificate',
        description: 'SSL certificate has issues (self-signed or not from trusted authority).',
        severity: 'warning',
        riskFactor: 15
      };
    } else {
      return {
        title: 'SSL Certificate',
        description: 'Invalid or expired SSL certificate detected. Connection may not be secure.',
        severity: 'danger',
        riskFactor: 25
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