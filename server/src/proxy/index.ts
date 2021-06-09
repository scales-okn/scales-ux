// @ts-nocheck
import express from "express";
import redis from "redis";
import requestProxy from "express-request-proxy";
import redisStreams from "redis-streams";

const enhancedRedis = redisStreams(redis);
const redisClient = enhancedRedis.createClient();

const router = express.Router();

router.all(
  "/proxy/*",
  requestProxy({
    cache: redisClient,
    cacheMaxAge: 60,
    url: `${process.env.PROXY_API_URL}/*`,
    headers: {
      Authorization: `Bearer ${process.env.PROXY_API_AUTH_BEARER_TOKEN}`,
    },
  })
);

export default router;

// TODO: API PROXY ROUTES
// TODO: TOKEN
