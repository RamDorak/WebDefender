chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'CHECK_URL') {
        fetch('http://localhost:5000/api/check_url', {
            method: 'POST',
            body: JSON.stringify({url: message.url}),
            headers: {'Content-Type': 'application/json'}
        })
        .then(res => res.json())
        .then(data => sendResponse(data))
        .catch(err => sendResponse({status: 'error', error: err}));
        return true; // Keeps sendResponse valid for async fetch
    }
});
