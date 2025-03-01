chrome.runtime.sendMessage({
    type: 'CHECK_URL',
    url: window.location.href
}, (response) => {
    if (response.is_phishing) {
        alert("Warning! This site might be a phishing site.");
    }
});
