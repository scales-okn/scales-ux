import express from "express";
import requestProxy from "express-request-proxy";

const router = express.Router();

router.all(
  "*",
  requestProxy({
    url: `${process.env.PROXY_API_URL}/*`,
    headers: {
      Cookie: process.env.PROXY_COOKIE,
      // Authorization: `Bearer ${process.env.PROXY_API_AUTH_BEARER_TOKEN}`,
    },
  })
);

export default router;

// TODO: API PROXY ROUTES
// TODO: TOKEN
