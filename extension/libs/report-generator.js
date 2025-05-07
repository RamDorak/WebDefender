// Report Generator Module

/**
 * Generates a comprehensive security report from all analysis results
 * @param {string} url - The analyzed URL
 * @param {Object} urlAnalysis - URL analysis results
 * @param {Object} contentAnalysis - Content analysis results
 * @param {Object} apiAnalysis - External API check results
 * @return {Object} Final report
 */
function generateReport(url, urlAnalysis, contentAnalysis, apiAnalysis) {
    try {
      // Combine all analysis items
      const allAnalysisItems = [
        ...urlAnalysis.results,
        ...contentAnalysis.results,
        ...apiAnalysis.results
      ];
      
      // Find ML result if it exists
      const mlResult = allAnalysisItems.find(item => item.isMLResult);
      
      // Calculate overall risk score based on ML result
      let overallRiskScore;
      if (mlResult && mlResult.prediction === 1) {
        // If ML predicts phishing, use high risk score
        overallRiskScore = 85;
      } else {
        // Otherwise calculate weighted average
        overallRiskScore = Math.round(
          (urlAnalysis.riskScore * 0.3) + 
          (contentAnalysis.riskScore * 0.4) + 
          (apiAnalysis.riskScore * 0.3)
        );
      }
      
      // Determine overall status based on risk score
      let status;
      if (mlResult && mlResult.prediction === 1) {
        status = 'High Risk - Phishing Detected';
      } else if (overallRiskScore < 20) {
        status = 'Likely Safe';
      } else if (overallRiskScore < 50) {
        status = 'Exercise Caution';
      } else if (overallRiskScore < 70) {
        status = 'Potentially Unsafe';
      } else {
        status = 'High Risk - Avoid';
      }
      
      // Sort analysis items by severity and ML results first
      const sortedItems = allAnalysisItems.sort((a, b) => {
        // ML results always come first
        if (a.isMLResult && !b.isMLResult) return -1;
        if (!a.isMLResult && b.isMLResult) return 1;
        
        // Then sort by severity
        const severityOrder = { danger: 0, warning: 1, safe: 2 };
        return severityOrder[a.severity] - severityOrder[b.severity];
      });
      
      return {
        url: url,
        riskScore: overallRiskScore,
        status: status,
        analysisItems: sortedItems,
        timestamp: new Date().toISOString(),
        isMLPhishing: mlResult && mlResult.prediction === 1
      };
    } catch (error) {
      console.error('Report generation error:', error);
      return {
        url: url,
        riskScore: 50,
        status: 'Analysis Incomplete',
        analysisItems: [{
          title: 'Error',
          description: 'Could not generate complete security report.',
          severity: 'warning'
        }],
        timestamp: new Date().toISOString()
      };
    }
}