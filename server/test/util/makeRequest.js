const app = require("../../build/index.js");
const request = require("supertest")(app.default);
const token = require("./token.js");

// type makeRequestT = {
//   endpoint: string;
//   body: Record<string, any>;
//   endCallback: (err: any, res: any) => void;
//   method: "get" | "post" | "put" | "delete";
// };

const makeRequest = ({ endpoint, body, endCallback, method, done }) => {
  const req = request[method](endpoint)
    .set("Authorization", token)
    .send(body)
    .end((err, res) => {
      if (err) return done(err);
      endCallback(res);
    });

  return req;
};

module.exports = { makeRequest };
