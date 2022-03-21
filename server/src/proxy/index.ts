import express from "express";
import requestProxy from "express-request-proxy";

const router = express.Router();

router.all(
  "*",
  requestProxy({
    url: `${process.env.PROXY_API_URL}/*`,
    timeout: 30000,
    headers: {
      "Allow-Control-Allow-Origin": "*",
      "x-api-key": process.env.PROXY_API_KEY,
    },
  })
);

export default router;
