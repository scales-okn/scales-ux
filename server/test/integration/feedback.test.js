const chai = require("chai");
const app = require("../../build/index.js");
const feedbackSchema = require("../fixtures/feedbackSchema.js");
const chaiJsonSchema = require("chai-json-schema");
const { makeRequest } = require("../util/makeRequest.js");
chai.use(chaiJsonSchema);

const baseRoute = "/api/feedback";

describe("Feedback API", () => {
  let createdFeedbackId;

  it("should create feedback", (done) => {
    makeRequest({
      method: "post",
      endpoint: baseRoute,
      done,
      body: {
        body: "This is a test feedback.",
      },
      endCallback: (res) => {
        createdFeedbackId = res.body.data.feedback.id;

        chai.expect(res.body.data).to.have.key("feedback");
        chai.expect(res.body.data.feedback).to.be.an("object");
        chai.expect(res.body.data.feedback).to.be.jsonSchema(feedbackSchema);
        done();
      },
    });
  });

  it("should return all feedback", (done) => {
    makeRequest({
      method: "get",
      endpoint: baseRoute,
      done,
      body: {
        body: "This is a test feedback.",
      },
      endCallback: (res) => {
        chai.expect(res.body.data).to.have.key("feedback");
        chai.expect(res.body.data.feedback).to.be.an("array");
        chai.expect(res.body.data.feedback).to.not.be.empty;

        res.body.data.feedback.forEach((feedback) =>
          chai.expect(feedback).to.be.jsonSchema(feedbackSchema)
        );
        done();
      },
    });
  });

  it("should delete feedback", (done) => {
    makeRequest({
      method: "delete",
      endpoint: `/api/feedback/${createdFeedbackId}/`,
      done,
      body: {
        body: "This is a test feedback.",
      },
      endCallback: (res) => {
        chai
          .expect(res.body.message)
          .to.equal("Feedback has been deleted successfully!");
        done();
      },
    });
  });
});
