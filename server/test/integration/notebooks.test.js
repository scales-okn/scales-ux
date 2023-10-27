const chai = require("chai");
const app = require("../../build/index.js");
const notebookSchema = require("../fixtures/notebookSchema.js");
const panelSchema = require("../fixtures/panelSchema.js");
const chaiJsonSchema = require("chai-json-schema");
const { makeRequest } = require("../util/makeRequest.js");
chai.use(chaiJsonSchema);

const baseRoute = "/api/notebooks";

describe("Notebooks API", () => {
  let createdNotebookId;

  it("should return all notebooks", (done) => {
    makeRequest({
      method: "get",
      endpoint: baseRoute,
      done,
      endCallback: (res) => {
        chai.expect(res.body.data).to.have.keys("notebooks", "paging");
        chai.expect(res.body.data.notebooks).to.be.an("array");
        res.body.data.notebooks.forEach((notebook) =>
          chai.expect(notebook).to.be.jsonSchema(notebookSchema)
        );
        done();
      },
    });
  });

  it("should create a notebook", (done) => {
    makeRequest({
      method: "post",
      endpoint: baseRoute,
      done,
      body: {
        title: "Test Notebook",
        description: "This is a test notebook",
        collaborators: [],
        visibility: "public",
      },
      endCallback: (res) => {
        createdNotebookId = res.body.data.notebook.id;

        chai.expect(res.body.data).to.be.have.key("notebook");
        chai.expect(res.body.data.notebook).to.be.an("object");
        chai.expect(res.body.data.notebook).to.be.jsonSchema(notebookSchema);
        done();
      },
    });
  });

  it("should return a notebook", (done) => {
    makeRequest({
      method: "get",
      endpoint: `${baseRoute}/${createdNotebookId}/`,
      done,
      endCallback: (res) => {
        chai.expect(res.body.data).to.be.have.key("notebook");
        chai.expect(res.body.data.notebook).to.be.an("object");
        chai.expect(res.body.data.notebook).to.be.jsonSchema(notebookSchema);
        done();
      },
    });
  });

  it("should update a notebook", (done) => {
    makeRequest({
      method: "put",
      endpoint: `${baseRoute}/${createdNotebookId}/`,
      done,
      body: {
        title: "Test Notebook",
        description: "This is a test notebook",
        collaborators: [],
        visibility: "public",
      },
      endCallback: (res) => {
        chai.expect(res.body.data).to.be.jsonSchema(notebookSchema);
        chai.expect(res.body.data.title).to.equal("Test Notebook");
        done();
      },
    });
  });

  it("should return panels for a notebook", (done) => {
    makeRequest({
      method: "get",
      endpoint: `${baseRoute}/${createdNotebookId}/panels`,
      done,
      body: {
        title: "Test Notebook",
        description: "This is a test notebook",
        collaborators: [],
        visibility: "public",
      },
      endCallback: (res) => {
        chai.expect(res.body.data).to.have.key("panels");
        chai.expect(res.body.data.panels).to.be.an("array");
        res.body.data.panels.forEach((panel) => {
          chai.expect(panel).to.be.jsonSchema(panelSchema);
        });
        done();
      },
    });
  });

  it("should delete a notebook", (done) => {
    makeRequest({
      method: "delete",
      endpoint: `${baseRoute}/${createdNotebookId}/`,
      done,
      endCallback: (res) => {
        chai.expect(res.body.message).to.equal("Notebook deleted successfully");
        done();
      },
    });
  });
});
