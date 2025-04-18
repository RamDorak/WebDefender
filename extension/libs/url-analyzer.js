// URL Analysis Module

/**
 * Analyzes a URL for phishing indicators
 * @param {string} url - The URL to analyze
 * @return {Promise<Object>} Analysis results
 */
async function analyzeUrl(url) {
    try {
      // Create URL object for parsing
      const urlObj = new URL(url);
      
      // Results array
      const results = [];
      
      // 1. Check protocol (HTTPS vs HTTP)
      const protocolCheck = checkProtocol(urlObj);
      results.push(protocolCheck);
      
      // 2. Analyze domain and subdomain
      const domainCheck = analyzeDomain(urlObj);
      results.push(domainCheck);
      
      // 3. Check for suspicious URL patterns
      const patternCheck = checkSuspiciousPatterns(url);
      results.push(patternCheck);
      
      // 4. Check URL length (excessively long URLs can be suspicious)
      const lengthCheck = checkUrlLength(url);
      results.push(lengthCheck);
      
      // Calculate risk score for URL (0-100)
      const riskScore = calculateUrlRiskScore(results);
      
      return {
        results: results,
        riskScore: riskScore
      };
    } catch (error) {
      console.error('URL analysis error:', error);
      throw new Error('Failed to analyze URL');
    }
  }
  
  /**
   * Checks if the URL uses secure protocol
   */
  function checkProtocol(urlObj) {
    const isHttps = urlObj.protocol === 'https:';
    
    return {
      title: 'Connection Security',
      description: isHttps 
        ? 'This website uses a secure connection (HTTPS).'
        : 'This website uses an insecure connection (HTTP). Sensitive information may be at risk.',
      severity: isHttps ? 'safe' : 'danger',
      riskFactor: isHttps ? 0 : 25
    };
  }
  
  /**
   * Analyzes domain for suspicious characteristics
   */
  function analyzeDomain(urlObj) {
    const domain = urlObj.hostname;
    
    // Simple check for suspicious patterns
    // In a real extension, this would be more sophisticated with checking
    // against known brand names, etc.
    const hasSuspiciousWords = /secure|login|account|banking|paypal|google|apple|microsoft|verify/i.test(domain);
    const excessiveSubdomains = domain.split('.').length > 3;
    const hasRandomLookingSubdomain = /[a-z0-9]{8,}\./.test(domain);
    
    let suspiciousFactors = [];
    if (hasSuspiciousWords) suspiciousFactors.push('contains sensitive terms');
    if (excessiveSubdomains) suspiciousFactors.push('has excessive subdomains');
    if (hasRandomLookingSubdomain) suspiciousFactors.push('contains random-looking characters');
    
    const isSuspicious = suspiciousFactors.length > 0;
    
    return {
      title: 'Domain Analysis',
      description: isSuspicious 
        ? `The domain ${domain} appears suspicious: ${suspiciousFactors.join(', ')}.`
        : `No obvious suspicious patterns detected in the domain ${domain}.`,
      severity: isSuspicious ? 'warning' : 'safe',
      riskFactor: suspiciousFactors.length * 15
    };
  }
  
  /**
   * Checks for suspicious patterns in URL
   */
  function checkSuspiciousPatterns(url) {
    // Check for IP address as hostname
    const ipAddressPattern = /https?:\/\/\d+\.\d+\.\d+\.\d+/i;
    
    // Check for URL encoding abuse
    const encodingAbusePattern = /%[0-9a-f]{2}/i;
    
    // Check for excessive number of dots
    const excessiveDotsPattern = /\.{5,}/;
    
    // Check for redirects in URL
    const redirectPattern = /url=|redirect=|to=|link=|goto=/i;
    
    let suspiciousPatterns = [];
    if (ipAddressPattern.test(url)) suspiciousPatterns.push('uses IP address instead of domain name');
    if (encodingAbusePattern.test(url)) suspiciousPatterns.push('contains suspicious URL encoding');
    if (excessiveDotsPattern.test(url)) suspiciousPatterns.push('contains excessive dots');
    if (redirectPattern.test(url)) suspiciousPatterns.push('contains redirect parameters');
    
    const isSuspicious = suspiciousPatterns.length > 0;
    
    return {
      title: 'URL Pattern Analysis',
      description: isSuspicious 
        ? `Suspicious URL patterns detected: ${suspiciousPatterns.join(', ')}.`
        : 'No suspicious URL patterns detected.',
      severity: isSuspicious ? 'warning' : 'safe',
      riskFactor: suspiciousPatterns.length * 10
    };
  }
  
  /**
   * Checks URL length
   */
  function checkUrlLength(url) {
    const length = url.length;
    
    let severity = 'safe';
    let description = 'URL length is normal.';
    let riskFactor = 0;
    
    if (length > 100) {
      if (length > 200) {
        severity = 'warning';
        description = 'URL is excessively long, which can be a characteristic of phishing URLs.';
        riskFactor = 15;
      } else {
        severity = 'safe';
        description = 'URL is somewhat long, but still within reasonable limits.';
        riskFactor = 5;
      }
    }
    
    return {
      title: 'URL Length',
      description: description,
      severity: severity,
      riskFactor: riskFactor
    };
  }
  
  /**
   * Calculates overall URL risk score
   */
  function calculateUrlRiskScore(results) {
    let totalRiskFactor = 0;
    let maxPossibleRisk = 0;
    
    // Sum up risk factors
    results.forEach(result => {
      totalRiskFactor += result.riskFactor || 0;
      // Estimate max possible risk based on check type
      // This is a simplified approach
      maxPossibleRisk += 25;
    });
    
    // Convert to a 0-100 scale
    const riskPercentage = Math.min(100, Math.round((totalRiskFactor / maxPossibleRisk) * 100));
    
    return riskPercentage;
  }