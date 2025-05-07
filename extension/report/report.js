// Report rendering script

document.addEventListener('DOMContentLoaded', async () => {
    // Get the last analysis results from storage
    const data = await chrome.storage.local.get('lastAnalysis');
    if (!data.lastAnalysis) {
        showError('No analysis data available. Please run an analysis first.');
        return;
    }

    const report = data.lastAnalysis.results;
    
    // Update basic information
    document.getElementById('website-url').textContent = report.url;
    document.getElementById('analysis-date').textContent = new Date(report.timestamp).toLocaleString();
    
    // Update risk score and gauge
    updateRiskGauge(report.riskScore);
    updateStatusBadge(report.status);
    
    // Update summary statistics
    updateSummaryStats(report.analysisItems);
    
    // Render analysis items
    renderAnalysisItems(report.analysisItems);
    
    // Setup tab switching
    setupTabs();
    
    // Setup export buttons
    setupExportButtons(report);
});

function updateRiskGauge(score) {
    const gaugeFill = document.getElementById('gauge-fill');
    const riskScore = document.getElementById('risk-score');
    
    // Convert score to degrees (0-180)
    const degrees = (score / 100) * 180;
    gaugeFill.style.transform = `rotate(${degrees}deg)`;
    riskScore.textContent = score;
    
    // Update gauge color based on score
    if (score >= 85) {
        gaugeFill.style.background = 'var(--danger-color)';
    } else if (score >= 50) {
        gaugeFill.style.background = 'var(--warning-color)';
    } else {
        gaugeFill.style.background = 'var(--safe-color)';
    }
}

function updateStatusBadge(status) {
    const badge = document.getElementById('status-badge');
    badge.textContent = status;
    
    // Set appropriate class based on status
    badge.className = 'status-badge';
    if (status.includes('Phishing Detected') || status.includes('High Risk')) {
        badge.classList.add('danger');
    } else if (status.includes('Safe')) {
        badge.classList.add('safe');
    } else {
        badge.classList.add('warning');
    }
}

function updateSummaryStats(items) {
    const highRisk = items.filter(item => item.severity === 'danger').length;
    const warnings = items.filter(item => item.severity === 'warning').length;
    const safe = items.filter(item => item.severity === 'safe').length;
    
    document.getElementById('high-risk-count').textContent = highRisk;
    document.getElementById('warning-count').textContent = warnings;
    document.getElementById('safe-count').textContent = safe;
}

function renderAnalysisItems(items) {
    const allList = document.getElementById('all-findings-list');
    const urlList = document.getElementById('url-findings-list');
    const contentList = document.getElementById('content-findings-list');
    const apiList = document.getElementById('api-findings-list');
    
    // Clear loading messages
    [allList, urlList, contentList, apiList].forEach(list => {
        list.innerHTML = '';
    });
    
    // Render items in appropriate lists
    items.forEach(item => {
        const element = createAnalysisItemElement(item);
        
        // Add to all findings
        allList.appendChild(element.cloneNode(true));
        
        // Add to specific category
        switch(item.category) {
            case 'url':
                urlList.appendChild(element.cloneNode(true));
                break;
            case 'content':
                contentList.appendChild(element.cloneNode(true));
                break;
            case 'api':
                apiList.appendChild(element.cloneNode(true));
                break;
        }
    });
}

function createAnalysisItemElement(item) {
    const div = document.createElement('div');
    div.className = `analysis-item ${item.severity}`;
    
    if (item.isCritical) {
        div.classList.add('critical');
    }
    
    const severityIndicator = document.createElement('div');
    severityIndicator.className = `severity-indicator ${item.severity}`;
    
    const title = document.createElement('h3');
    title.appendChild(severityIndicator);
    title.appendChild(document.createTextNode(item.title));
    
    const description = document.createElement('p');
    description.textContent = item.description;
    
    if (item.isMLResult) {
        const mlBadge = document.createElement('span');
        mlBadge.className = 'ml-badge';
        mlBadge.textContent = 'ML Analysis';
        title.appendChild(mlBadge);
    }
    
    div.appendChild(title);
    div.appendChild(description);
    
    return div;
}

function setupTabs() {
    const tabs = document.querySelectorAll('.tab');
    const contents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs and contents
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            tab.classList.add('active');
            const contentId = `${tab.dataset.tab}-tab`;
            document.getElementById(contentId).classList.add('active');
        });
    });
}

function setupExportButtons(report) {
    document.getElementById('export-pdf').addEventListener('click', () => {
        // TODO: Implement PDF export
        alert('PDF export functionality coming soon!');
    });
    
    document.getElementById('export-json').addEventListener('click', () => {
        const jsonStr = JSON.stringify(report, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `security-report-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
}

function showError(message) {
    const container = document.querySelector('.container');
    container.innerHTML = `
        <div class="card">
            <div class="card-header">Error</div>
            <div class="card-body">
                <p style="color: var(--danger-color);">${message}</p>
            </div>
        </div>
    `;
} 