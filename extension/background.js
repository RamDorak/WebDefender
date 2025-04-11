console.log('Service worker registered.');

chrome.runtime.onMessage.addListener(function(request) {
    const prediction = request.prediction;
    console.log(prediction);
  
    if (prediction === 1) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icon.png',
        title: 'WebDefender Warning!',
        message: 'Phishing detected on this page!',
        priority: 2
      });
    } else if (prediction === -1) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icon.png',
        title: 'WebDefender Info',
        message: 'No phishing detected on this page.',
        priority: 0
      });
    }
  
});