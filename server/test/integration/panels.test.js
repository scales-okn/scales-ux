const chai = require("chai");
const panelSchema = require("../fixtures/panelSchema.js");
const chaiJsonSchema = require("chai-json-schema");
const { makeRequest } = require("../util/makeRequest.js");
chai.use(chaiJsonSchema);

const baseRoute = "/api/panels";

describe("Panels API", () => {
  let createdPanelId;

  it("should return all panels", (done) => {
    makeRequest({
      method: "get",
      endpoint: baseRoute,
      done,
      endCallback: (res) => {
        chai.expect(res.body.data).to.be.have.key("panels");
        chai.expect(res.body.data.panels).to.be.an("array");
        res.body.data.panels.forEach((panel) =>
          chai.expect(panel).to.be.jsonSchema(panelSchema)
        );
        done();
      },
    });
  });

  it("should create a panel", (done) => {
    makeRequest({
      method: "post",
      endpoint: baseRoute,
      done,
      body: {
        title: "Test Panel",
        description: "This is a test panel",
        collaborators: [],
        visibility: "public",
        notebookId: 1,
      },
      endCallback: (res) => {
        createdPanelId = res.body.data.panel.id;
        chai.expect(res.body.data).to.be.have.key("panel");
        chai.expect(res.body.data.panel).to.be.an("object");
        chai.expect(res.body.data.panel).to.be.jsonSchema(panelSchema);
        done();
      },
    });
  });

  it("should return a panel by id", (done) => {
    makeRequest({
      method: "get",
      endpoint: `${baseRoute}/${createdPanelId}/`,
      done,
      endCallback: (res) => {
        chai.expect(res.body.data).to.be.have.key("panel");
        chai.expect(res.body.data.panel).to.be.an("object");
        chai.expect(res.body.data.panel).to.be.jsonSchema(panelSchema);
        done();
      },
    });
  });

  it("should update a panel", (done) => {
    makeRequest({
      method: "put",
      endpoint: `${baseRoute}/${createdPanelId}/`,
      done,
      body: {
        title: "Test Panel",
        description: "This is a test panel",
        collaborators: [],
        visibility: "public",
      },
      endCallback: (res) => {
        chai.expect(res.body.data).to.be.have.key("panel");
        chai.expect(res.body.data.panel).to.be.an("object");
        chai.expect(res.body.data.panel).to.be.jsonSchema(panelSchema);
        done();
      },
    });
  });

  it("should delete a panel", (done) => {
    makeRequest({
      method: "delete",
      endpoint: `${baseRoute}/${createdPanelId}/`,
      done,
      endCallback: (res) => {
        chai.expect(res.body.message).to.equal("Panel deleted successfully");
        done();
      },
    });
  });
});
