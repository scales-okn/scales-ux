const chai = require("chai");
const feedbackSchema = require("../fixtures/feedbackSchema.js");
const chaiJsonSchema = require("chai-json-schema");
const { makeRequest } = require("../util/makeRequest.js");
const { loginUser } = require("../util/loginUser.js");
chai.use(chaiJsonSchema);

const baseRoute = "/api/feedback";
let token;

before(async () => {
  token = await loginUser();
});

describe("Feedback API", () => {
  let createdFeedbackId;

  it("should create feedback", async () => {
    const res = await makeRequest({
      method: "post",
      endpoint: baseRoute,
      token,
      body: {
        body: "This is a test feedback.",
      },
    });

    createdFeedbackId = res.body.data.feedback.id;

    chai.expect(res.body.data).to.have.key("feedback");
    chai.expect(res.body.data.feedback).to.be.an("object");
    chai.expect(res.body.data.feedback).to.be.jsonSchema(feedbackSchema);
  });

  it("should return all feedback", async () => {
    const res = await makeRequest({
      method: "get",
      endpoint: baseRoute,
      token,
    });

    chai.expect(res.body.data).to.have.key("feedback");
    chai.expect(res.body.data.feedback).to.be.an("array");
    chai.expect(res.body.data.feedback).to.not.be.empty;

    res.body.data.feedback.forEach((feedback) => chai.expect(feedback).to.be.jsonSchema(feedbackSchema));
  });

  it("should delete feedback", async () => {
    const res = await makeRequest({
      method: "delete",
      endpoint: `/api/feedback/${createdFeedbackId}/`,
      token,
    });

    chai.expect(res.body.message).to.equal("Feedback has been deleted successfully!");
  });
});
