document.addEventListener('DOMContentLoaded', () => {
  const urlTextEl = document.getElementById('urlText');
  const checkBtn = document.getElementById('checkBtn');

  let currentUrl = '';

  // Get Current Tab URL
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];

    if (tab && tab.url) {
      currentUrl = tab.url;
      urlTextEl.textContent = currentUrl;
      checkBtn.disabled = false;
    } else {
      urlTextEl.textContent = "Unable to read current tab";
      checkBtn.disabled = true;
    }
  });

  // Open the second popup (result.html) and pass the URL to it
  if (checkBtn) {
    checkBtn.addEventListener('click', () => {
      if (!currentUrl) return;

      const resultUrl =
        chrome.runtime.getURL('result.html') +
        '?url=' + encodeURIComponent(currentUrl);

      console.log("Opening result:", resultUrl);

chrome.windows.create({
  url: resultUrl,
  type: "popup",
  width: 380,
  height: 600,
  focused: true
});

      // Close the first popup now that the result popup has taken over
      window.close();
    });
  }
});