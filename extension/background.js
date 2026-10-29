// =============================================
// WebGuard Background Service Worker
// =============================================

const BACKEND_URL =
  "https://web-guard-qtkt-psi.vercel.app/check-url";

// Keep track of URLs currently being checked
const checkingTabs = new Map();


// =============================================
// CHECK WHETHER URL SHOULD BE SCANNED
// =============================================

function shouldCheckUrl(url) {

  if (!url) {
    return false;
  }

  const ignoredProtocols = [
    "chrome://",
    "chrome-extension://",
    "edge://",
    "about:",
    "file:"
  ];

  return !ignoredProtocols.some(protocol =>
    url.startsWith(protocol)
  );
}


// =============================================
// SEND URL TO BACKEND
// =============================================

async function checkUrl(url) {

  try {

    console.log(
      "WebGuard checking:",
      url
    );

    const response = await fetch(
      BACKEND_URL,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          url: url
        })
      }
    );


    // ---------------------------------------------
    // READ RESPONSE
    // ---------------------------------------------

    const responseText =
      await response.text();


    console.log(
      "WebGuard HTTP status:",
      response.status
    );

    console.log(
      "WebGuard raw backend response:",
      responseText
    );


    // ---------------------------------------------
    // BACKEND RETURNED ERROR
    // ---------------------------------------------

    if (!response.ok) {

      throw new Error(
        `Backend returned HTTP ${response.status}: ${responseText}`
      );

    }


    // ---------------------------------------------
    // CONVERT RESPONSE TO JSON
    // ---------------------------------------------

    let result;

    try {

      result =
        JSON.parse(responseText);

    } catch (error) {

      throw new Error(
        "Backend returned invalid JSON: " +
        responseText
      );

    }


    console.log(
      "WebGuard backend result:",
      result
    );


    return result;

  } catch (error) {

    console.error(
      "WebGuard backend error:",
      error
    );


    return {
      error: true,
      message: error.message
    };

  }

}


// =============================================
// AUTOMATIC WEBSITE NAVIGATION CHECK
// =============================================

chrome.webNavigation.onBeforeNavigate.addListener(

  async (details) => {

    // ---------------------------------------------
    // ONLY CHECK MAIN FRAME
    // ---------------------------------------------

    if (details.frameId !== 0) {
      return;
    }


    const url =
      details.url;

    const tabId =
      details.tabId;


    // ---------------------------------------------
    // IGNORE CHROME / INTERNAL PAGES
    // ---------------------------------------------

    if (!shouldCheckUrl(url)) {

      console.log(
        "WebGuard ignored URL:",
        url
      );

      return;
    }


    // ---------------------------------------------
    // IGNORE WEBGUARD RESULT PAGE
    // ---------------------------------------------

    if (
      url.startsWith(
        chrome.runtime.getURL("")
      )
    ) {

      return;
    }


    // =============================================
    // CONTINUE TO WEBSITE
    // =============================================

    const stored =
      await chrome.storage.local.get(
        "allowedUrl"
      );


    if (
      stored.allowedUrl === url
    ) {

      console.log(
        "WebGuard: User chose Continue:",
        url
      );


      // Remove permission after one use
      await chrome.storage.local.remove(
        "allowedUrl"
      );


      // Do not scan this URL again
      return;
    }


    // =============================================
    // START CHECK
    // =============================================

    console.log(
      "Navigation detected:",
      url,
      "Tab:",
      tabId
    );


    // ---------------------------------------------
    // PREVENT DUPLICATE CHECKS
    // ---------------------------------------------

    if (
      checkingTabs.has(tabId)
    ) {

      console.log(
        "WebGuard: Already checking this tab."
      );

      return;
    }


    checkingTabs.set(
      tabId,
      url
    );


    try {

      // ===========================================
      // CHECK URL WITH BACKEND
      // ===========================================

      const result =
        await checkUrl(url);


      // ===========================================
      // CHECK WHETHER TAB STILL EXISTS
      // ===========================================

      let tab;

      try {

        tab =
          await chrome.tabs.get(tabId);

      } catch (error) {

        console.log(
          "WebGuard: Tab no longer exists."
        );

        return;
      }


      if (!tab) {
        return;
      }


      // ===========================================
      // BACKEND ERROR
      // ===========================================

      if (result.error) {

        console.error(
          "WebGuard backend error:",
          result.message
        );

        return;
      }


      // ===========================================
      // GET STATUS
      // ===========================================

      const status =
        String(
          result.status || ""
        ).toLowerCase();


      console.log(
        "WebGuard status:",
        status
      );


      console.log(
        "WebGuard score:",
        result.score
      );


      console.log(
        "WebGuard reasons:",
        result.reasons
      );


      // ===========================================
      // CREATE RESULT PAGE
      // ===========================================

      const resultPage =
        chrome.runtime.getURL(
          "result.html"
        ) +

        "?url=" +
        encodeURIComponent(url) +

        "&status=" +
        encodeURIComponent(status) +

        "&score=" +
        encodeURIComponent(
          result.score || 0
        ) +

        "&reasons=" +
        encodeURIComponent(
          JSON.stringify(
            result.reasons || []
          )
        );


      // ===========================================
      // DANGEROUS / SUSPICIOUS WEBSITE
      // ===========================================

      if (
        status === "dangerous" ||
        status === "suspicious"
      ) {

        console.log(
          "WebGuard: Suspicious/Dangerous website detected."
        );


        try {

          await chrome.tabs.update(
            tabId,
            {
              url: resultPage
            }
          );


          console.log(
            "WebGuard: Redirected to warning page."
          );

        } catch (error) {

          console.error(
            "WebGuard: Could not redirect to warning page:",
            error
          );

        }

      }


      // ===========================================
      // SAFE WEBSITE
      // ===========================================

      else {

        console.log(
          "WebGuard: Website is safe."
        );


        try {

          await chrome.tabs.update(
            tabId,
            {
              url: resultPage
            }
          );


          console.log(
            "WebGuard: Showing safe result page."
          );

        } catch (error) {

          console.error(
            "WebGuard: Could not show safe result page:",
            error
          );

        }

      }

    } catch (error) {

      console.error(
        "WebGuard navigation error:",
        error
      );

    } finally {

      // -------------------------------------------
      // REMOVE TAB FROM CHECKING LIST
      // -------------------------------------------

      checkingTabs.delete(
        tabId
      );

    }

  },

  {
    url: [
      {
        schemes: [
          "http",
          "https"
        ]
      }
    ]
  }

);


// =============================================
// REMOVE CLOSED TABS
// =============================================

chrome.tabs.onRemoved.addListener(
  (tabId) => {

    checkingTabs.delete(
      tabId
    );

  }
);