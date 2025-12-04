/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  // Download Chrome (default)
  chrome: {
    skipDownload: false,
  },
  // Download Firefox 
  firefox: {
    skipDownload: true,
  },
};
