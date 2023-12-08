const chai = require("chai");
const panelSchema = require("../fixtures/panelSchema.js");
const chaiJsonSchema = require("chai-json-schema");
const { makeRequest } = require("../util/makeRequest.js");
const { loginUser } = require("../util/loginUser.js");
chai.use(chaiJsonSchema);

const baseRoute = "/api/panels";
let token;

before(async () => {
  token = await loginUser();
});

describe("Panels API", () => {
  let createdPanelId;

  it("should return all panels", async () => {
    try {
      const res = await makeRequest({
        method: "get",
        endpoint: baseRoute,
        token,
      });

      chai.expect(res.body.data).to.have.key("panels");
      chai.expect(res.body.data.panels).to.be.an("array");
      res.body.data.panels.forEach((panel) => chai.expect(panel).to.be.jsonSchema(panelSchema));
    } catch (error) {
      throw error;
    }
  });

  it("should create a panel", async () => {
    try {
      const res = await makeRequest({
        method: "post",
        endpoint: baseRoute,
        token,
        body: {
          title: "Test Panel",
          description: "This is a test panel",
          collaborators: [],
          sharedWith: [],
          visibility: "public",
          notebookId: 1,
        },
      });

      createdPanelId = res.body.data.panel.id;
      chai.expect(res.body.data).to.have.key("panel");
      chai.expect(res.body.data.panel).to.be.an("object");
      chai.expect(res.body.data.panel).to.be.jsonSchema(panelSchema);
    } catch (error) {
      throw error;
    }
  });

  it("should return a panel by id", async () => {
    try {
      const res = await makeRequest({
        method: "get",
        endpoint: `${baseRoute}/${createdPanelId}/`,
        token,
      });

      chai.expect(res.body.data).to.have.key("panel");
      chai.expect(res.body.data.panel).to.be.an("object");
      chai.expect(res.body.data.panel).to.be.jsonSchema(panelSchema);
    } catch (error) {
      throw error;
    }
  });

  it("should update a panel", async () => {
    try {
      const res = await makeRequest({
        method: "put",
        endpoint: `${baseRoute}/${createdPanelId}/`,
        token,
        body: {
          title: "Updated Panel Title",
          description: "Updated panel description",
          collaborators: [],
          sharedWith: [],
          visibility: "private",
        },
      });

      chai.expect(res.body.data).to.have.key("panel");
      chai.expect(res.body.data.panel).to.be.an("object");
      chai.expect(res.body.data.panel).to.be.jsonSchema(panelSchema);
    } catch (error) {
      throw error;
    }
  });

  it("should delete a panel", async () => {
    try {
      const res = await makeRequest({
        method: "delete",
        endpoint: `${baseRoute}/${createdPanelId}/`,
        token,
      });

      chai.expect(res.body.message).to.equal("Panel deleted successfully");
    } catch (error) {
      throw error;
    }
  });
});
