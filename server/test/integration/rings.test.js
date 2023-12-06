const chai = require("chai");
const ringSchema = require("../fixtures/ringSchema.js");
const chaiJsonSchema = require("chai-json-schema");
const { makeRequest } = require("../util/makeRequest.js");
const { loginUser } = require("../util/loginUser.js");
chai.use(chaiJsonSchema);

const baseRoute = "/api/rings";
let token;

before(async () => {
  token = await loginUser();
});

describe("Rings API", () => {
  let createdRing;

  it("should return all rings", async () => {
    try {
      const res = await makeRequest({
        method: "get",
        endpoint: baseRoute,
        token,
      });

      chai.expect(res.body.data).to.have.key("rings");
      chai.expect(res.body.data.rings).to.be.an("array");
      res.body.data.rings.forEach((ring) => chai.expect(ring).to.be.jsonSchema(ringSchema));
    } catch (error) {
      throw error;
    }
  });

  it("should create a ring", async () => {
    try {
      const res = await makeRequest({
        method: "post",
        endpoint: `${baseRoute}`,
        token,
        body: {
          userId: 1,
          name: "Test Ring",
          description: "This is a test ring",
          schemaVersion: "1.0",
          dataSource: {},
          ontology: {},
          visibility: "public",
        },
      });

      createdRing = res.body.data.versions[0];

      chai.expect(res.body.data).to.have.key("versions");
      chai.expect(res.body.data.versions).to.be.an("array");
      res.body.data.versions.forEach((ring) => {
        chai.expect(ring).to.be.jsonSchema(ringSchema);
      });
    } catch (error) {
      throw error;
    }
  });

  it("should return a ring by rid", async () => {
    try {
      const res = await makeRequest({
        method: "get",
        endpoint: `${baseRoute}/${createdRing.rid}`,
        token,
      });

      chai.expect(res.body.data).to.have.key("versions");
      chai.expect(res.body.data.versions).to.be.an("array");
      res.body.data.versions.forEach((ring) => {
        chai.expect(ring).to.be.jsonSchema(ringSchema);
      });
    } catch (error) {
      throw error;
    }
  });

  it("should delete a ring", async () => {
    try {
      const res = await makeRequest({
        method: "delete",
        endpoint: `${baseRoute}/${createdRing.rid}`,
        token,
      });

      chai.expect(res.body.message).to.equal("Ring has been deleted successfully!");
    } catch (error) {
      throw error;
    }
  });
});
