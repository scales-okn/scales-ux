// @ts-nocheck
import express from "express";
var redis = require("redis");
import requestProxy from "express-request-proxy";

// require("redis-streams")(redis);

// require('redis-streams')(redis);
// const redisClient = redis.createClient();

const router = express.Router();

router.all(
  "*",
  requestProxy({
    // cache: redis.createClient(),
    // cacheMaxAge: 60,
    url: `${process.env.PROXY_API_URL}/*`,
    headers: {
      Cookie: process.env.PROXY_COOKIE
      // Authorization: `Bearer ${process.env.PROXY_API_AUTH_BEARER_TOKEN}`,
    },
  })
);

export default router;

// TODO: API PROXY ROUTES
// TODO: TOKEN
