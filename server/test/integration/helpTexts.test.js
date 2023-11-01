const chai = require("chai");
const helpTextSchema = require("../fixtures/helpTextSchema.js");
const chaiJsonSchema = require("chai-json-schema");
const { makeRequest } = require("../util/makeRequest.js");
chai.use(chaiJsonSchema);

const baseRoute = "/api/helpTexts";

describe("HelpText API", () => {
  let createdHelpTextSlug;

  it("should create HelpText", (done) => {
    makeRequest({
      method: "post",
      endpoint: baseRoute,
      done,
      body: {
        slug: "test-slug",
        description: "Test description",
        examples: "Test examples",
        options: "Test options",
        links: "Test links",
      },
      endCallback: (res) => {
        createdHelpTextSlug = res.body.data.helpText.slug;

        chai.expect(res.body.data).to.have.key("helpText");
        chai.expect(res.body.data.helpText).to.be.an("object");
        chai.expect(res.body.data.helpText).to.be.jsonSchema(helpTextSchema);
        done();
      },
    });
  });

  it("should return all HelpText", (done) => {
    makeRequest({
      method: "get",
      endpoint: baseRoute,
      done,
      endCallback: (res) => {
        chai.expect(res.body.data).to.have.keys("helpTexts");
        chai.expect(res.body.data.helpTexts).to.be.an("array");
        chai
          .expect(res.body.data.helpTexts[0])
          .to.be.jsonSchema(helpTextSchema);
        done();
      },
    });
  });

  it("should update HelpText", (done) => {
    makeRequest({
      method: "patch",
      endpoint: `${baseRoute}/${createdHelpTextSlug}`,
      done,
      body: {
        description: "Updated description",
        examples: "Updated examples",
        options: "Updated options",
        links: "Updated links",
      },
      endCallback: (res) => {
        chai.expect(res.body.data).to.have.key("helpText");
        chai.expect(res.body.data.helpText).to.be.an("object");
        chai.expect(res.body.data.helpText).to.be.jsonSchema(helpTextSchema);
        done();
      },
    });
  });

  it("should delete HelpText", (done) => {
    makeRequest({
      method: "delete",
      endpoint: `${baseRoute}/${createdHelpTextSlug}`,
      done,
      endCallback: (res) => {
        chai
          .expect(res.body.message)
          .to.equal("Help Text has been deleted successfully!");
        done();
      },
    });
  });
});
