const modInfo = require("../modInfo.json"); // SVR.JS mod information
const parseURL = require("./utils/urlParser.js"); // URL parser from SVR.JS

let handler = null;
let handlerError = null;
try {
  handler = require(process.cwd() + "/dist/handler.js");
} catch (err) {
  handlerError = err;
}

// Exported SVR.JS mod callback
module.exports = (req, res, logFacilities, config, next) => {
  if (handlerError) {
    // Respond with 500 Internal Server Error code, if MERNMail fails to load
    res.error(500, "mernmail-integration", handlerError);
  } else if (req.parsedURL.pathname.match(/^\/api(?:$|[/?#])/)) {
    // Use MERNMail handler
    handler(req, res);
  } else {
    // Rewrite the URL and use SVR.JS built-in static file serving functionality
    try {
      const rewrittenAgainURL =
        "/frontend/dist" +
        req.parsedURL.pathname +
        (req.parsedURL.search ? req.parsedURL.search : "") +
        (req.parsedURL.hash ? req.parsedURL.hash : "");
      req.url = rewrittenAgainURL;
      req.parsedURL = parseURL(
        req.url,
        `http${req.socket.encrypted ? "s" : ""}://${
          req.headers.host
            ? req.headers.host
            : config.domain
              ? config.domain
              : "unknown.invalid"
        }`,
      );
      next();
    } catch (err) {
      res.error(500, "mernmail-integration", err);
      return;
    }
  }
};

module.exports.modInfo = modInfo;
