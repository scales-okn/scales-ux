const app = require("../../build/index.js").default;
const request = require("supertest")(app);

app.on("ready", () => {
    run();
});

const makeRequest = async ({ endpoint, body, method, token }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const req = request[method](endpoint);

      if (token) {
        req.set("Authorization", token);
      }

      const res = await req.send(body);

      if (res.body.code !== 200) {
        return reject(new Error(`Request failed: ${res.body.message}`));
      }

      resolve(res);
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = { makeRequest };
