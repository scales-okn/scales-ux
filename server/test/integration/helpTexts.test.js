const chai = require("chai");
const helpTextSchema = require("../fixtures/helpTextSchema.js");
const chaiJsonSchema = require("chai-json-schema");
const { makeRequest } = require("../util/makeRequest.js");
const { loginUser } = require("../util/loginUser.js");
chai.use(chaiJsonSchema);

const baseRoute = "/api/helpTexts";
let token;

before(async () => {
  token = await loginUser();
});

describe("HelpText API", () => {
  let createdHelpTextSlug;

  it("should create HelpText", async () => {
    const res = await makeRequest({
      method: "post",
      endpoint: baseRoute,
      token,
      body: {
        slug: "test-slug",
        description: "Test description",
        examples: "Test examples",
        options: "Test options",
        links: "Test links",
      },
    });

    createdHelpTextSlug = res.body.data.helpText.slug;

    chai.expect(res.body.data).to.have.key("helpText");
    chai.expect(res.body.data.helpText).to.be.an("object");
    chai.expect(res.body.data.helpText).to.be.jsonSchema(helpTextSchema);
  });

  it("should return all HelpText", async () => {
    const res = await makeRequest({
      method: "get",
      endpoint: baseRoute,
      token,
    });

    chai.expect(res.body.data).to.have.keys("helpTexts");
    chai.expect(res.body.data.helpTexts).to.be.an("array");
    chai.expect(res.body.data.helpTexts[0]).to.be.jsonSchema(helpTextSchema);
  });

  it("should update HelpText", async () => {
    const res = await makeRequest({
      method: "patch",
      endpoint: `${baseRoute}/${createdHelpTextSlug}`,
      token,
      body: {
        description: "Updated description",
        examples: "Updated examples",
        options: "Updated options",
        links: "Updated links",
      },
    });

    chai.expect(res.body.data).to.have.key("helpText");
    chai.expect(res.body.data.helpText).to.be.an("object");
    chai.expect(res.body.data.helpText).to.be.jsonSchema(helpTextSchema);
  });

  it("should delete HelpText", async () => {
    const res = await makeRequest({
      method: "delete",
      endpoint: `${baseRoute}/${createdHelpTextSlug}`,
      token,
    });

    chai.expect(res.body.message).to.equal("Help Text has been deleted successfully!");
  });
});
