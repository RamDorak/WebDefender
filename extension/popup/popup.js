document.addEventListener('DOMContentLoaded', () => {
    const checkButton = document.getElementById('checkButton');
    const resultText = document.getElementById('resultText');

    // When popup loads, automatically get current tab URL
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        const currentUrl = tabs[0].url;
        document.getElementById('urlDisplay').textContent = currentUrl;

        // Optional: auto-check on popup open (you can also just show "Click to Check" button)
        checkURL(currentUrl);
    });

    // Button click handler (manual recheck)
    checkButton.addEventListener('click', () => {
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            const currentUrl = tabs[0].url;
            checkURL(currentUrl);
        });
    });

    // Function to ask background.js to check the URL via backend
    function checkURL(url) {
        resultText.textContent = "Checking...";
        chrome.runtime.sendMessage({
            type: 'CHECK_URL',
            url: url
        }, (response) => {
            if (response && response.is_phishing) {
                resultText.textContent = `⚠️ This site may be phishing!`;
                resultText.style.color = 'red';
                if (response.reasons && response.reasons.length) {
                    resultText.innerHTML += `<br><small>Reasons: ${response.reasons.join(', ')}</small>`;
                }
            } else {
                resultText.textContent = "✅ This site seems safe.";
                resultText.style.color = 'green';
            }
        });
    }
});
