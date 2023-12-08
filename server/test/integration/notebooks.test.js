const chai = require("chai");
const app = require("../../build/index.js");
const notebookSchema = require("../fixtures/notebookSchema.js");
const panelSchema = require("../fixtures/panelSchema.js");
const chaiJsonSchema = require("chai-json-schema");
const { makeRequest } = require("../util/makeRequest.js");
const { loginUser } = require("../util/loginUser.js");
chai.use(chaiJsonSchema);

const baseRoute = "/api/notebooks";
let token;

before(async () => {
  token = await loginUser();
});

describe("Notebooks API", () => {
  let createdNotebookId;

  it("should return all notebooks", async () => {
    const res = await makeRequest({
      method: "get",
      endpoint: baseRoute,
      token,
    });

    chai.expect(res.body.data).to.have.keys("notebooks", "paging");
    chai.expect(res.body.data.notebooks).to.be.an("array");
    res.body.data.notebooks.forEach((notebook) => chai.expect(notebook).to.be.jsonSchema(notebookSchema));
  });

  it("should create a notebook", async () => {
    const res = await makeRequest({
      method: "post",
      endpoint: baseRoute,
      token,
      body: {
        title: "Test Notebook",
        description: "This is a test notebook",
        collaborators: [],
        sharedWith: [],
        visibility: "public",
      },
    });

    createdNotebookId = res.body.data.notebook.id;

    chai.expect(res.body.data).to.have.key("notebook");
    chai.expect(res.body.data.notebook).to.be.an("object");
    chai.expect(res.body.data.notebook).to.be.jsonSchema(notebookSchema);
  });

  it("should return a notebook", async () => {
    const res = await makeRequest({
      method: "get",
      endpoint: `${baseRoute}/${createdNotebookId}/`,
      token,
    });

    chai.expect(res.body.data).to.have.key("notebook");
    chai.expect(res.body.data.notebook).to.be.an("object");
    chai.expect(res.body.data.notebook).to.be.jsonSchema(notebookSchema);
  });

  it("should update a notebook", async () => {
    const res = await makeRequest({
      method: "put",
      endpoint: `${baseRoute}/${createdNotebookId}/`,
      token,
      body: {
        title: "Test Notebook",
        description: "This is a test notebook",
        collaborators: [],
        sharedWith: [],
        visibility: "public",
      },
    });

    chai.expect(res.body.data).to.be.jsonSchema(notebookSchema);
    chai.expect(res.body.data.title).to.equal("Test Notebook");
  });

  it("should return panels for a notebook", async () => {
    const res = await makeRequest({
      method: "get",
      endpoint: `${baseRoute}/${createdNotebookId}/panels`,
      token,
    });

    chai.expect(res.body.data).to.have.key("panels");
    chai.expect(res.body.data.panels).to.be.an("array");
    res.body.data.panels.forEach((panel) => {
      chai.expect(panel).to.be.jsonSchema(panelSchema);
    });
  });

  it("should delete a notebook", async () => {
    const res = await makeRequest({
      method: "delete",
      endpoint: `${baseRoute}/${createdNotebookId}/`,
      token,
    });

    chai.expect(res.body.message).to.equal("Notebook deleted successfully");
  });
});
