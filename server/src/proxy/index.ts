import express from "express";
import requestProxy from "express-request-proxy";
import checkAuth from "../middlewares/checkAuth";

const router = express.Router();

router.all(
  "*",
  checkAuth,
  (req, res, next) => {

    // whoever's fault it is that multi-value query params were getting lost en route to the API...I want a word with them >:(
    var rewrittenParams = {};
    var urlParamStrings = req.url.split("?").slice(-1)[0].split("&");
    for (const paramString of urlParamStrings) {
      if (paramString.includes("[]=")) { // this must be an array-style param, so we'll manually pass it via requestProxy's "query" argument
        var [param, value] = paramString.split("[]=");
        if (!(param in rewrittenParams)) {
          rewrittenParams[param] = [decodeURI(value)];
        }
        else {
          rewrittenParams[param].push(decodeURI(value));
        }
      }
    }

    return requestProxy({
      url: `${process.env.CORE_API_ENDPOINT}/*`,
      query: rewrittenParams,
      timeout: 30000,
      headers: {
        "Allow-Control-Allow-Origin": "*",
        "x-api-key": process.env.CORE_API_KEY,
      },
    })(req, res, next)
  }
);

export default router;
