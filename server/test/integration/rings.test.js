const chai = require("chai");
const ringSchema = require("../fixtures/ringSchema.js");
const chaiJsonSchema = require("chai-json-schema");
const { makeRequest } = require("../util/makeRequest.ts");
chai.use(chaiJsonSchema);

const baseRoute = "/api/rings";

describe("Rings API", () => {
  let createdRing;

  it("should return all rings", (done) => {
    makeRequest({
      method: "get",
      endpoint: baseRoute,
      done,
      endCallback: (res) => {
        chai.expect(res.body.data).to.have.key("rings");
        chai.expect(res.body.data.rings).to.be.an("array");
        res.body.data.rings.forEach((ring) =>
          chai.expect(ring).to.be.jsonSchema(ringSchema)
        );
        done();
      },
    });
  });

  it("should create a ring", (done) => {
    makeRequest({
      method: "post",
      endpoint: `${baseRoute}/create`,
      done,
      body: {
        userId: 1,
        rid: 5555,
        name: "Test Ring",
        description: "This is a test ring",
        schemaVersion: "1.0",
        dataSource: {},
        ontology: {},
        visibility: "public",
        version: 1,
      },
      endCallback: (res) => {
        createdRing = res.body.data.ring;

        chai.expect(res.body.data).to.have.key("ring");
        chai.expect(res.body.data.ring).to.be.an("object");
        chai.expect(res.body.data.ring).to.be.jsonSchema(ringSchema);
        done();
      },
    });
  });

  it("should return a ring by rid", (done) => {
    makeRequest({
      method: "get",
      endpoint: `${baseRoute}/${createdRing.rid}`,
      done,
      endCallback: (res) => {
        chai.expect(res.body.data).to.have.key("ring");
        chai.expect(res.body.data.ring).to.be.an("object");
        chai.expect(res.body.data.ring).to.be.jsonSchema(ringSchema);
        done();
      },
    });
  });

  it("should return a ring by version", (done) => {
    makeRequest({
      method: "get",
      endpoint: `${baseRoute}/${createdRing.rid}/${createdRing.version}`,
      done,
      endCallback: (res) => {
        chai.expect(res.body.data).to.have.key("ring");
        chai.expect(res.body.data.ring).to.be.an("object");
        chai.expect(res.body.data.ring).to.be.jsonSchema(ringSchema);
        done();
      },
    });
  });

  it("should update a ring", (done) => {
    makeRequest({
      method: "put",
      endpoint: `${baseRoute}/${createdRing.id}`,
      done,
      body: {
        name: "Updated",
      },
      endCallback: (res) => {
        chai.expect(res.body.data).to.have.key("ring");
        chai.expect(res.body.data.ring).to.be.an("object");
        chai.expect(res.body.data.ring.name).to.equal("Updated");
        chai.expect(res.body.data.ring).to.be.jsonSchema(ringSchema);
        done();
      },
    });
  });

  it("should delete a ring", (done) => {
    makeRequest({
      method: "delete",
      endpoint: `${baseRoute}/${createdRing.rid}`,
      done,
      endCallback: (res) => {
        chai
          .expect(res.body.message)
          .to.equal("Ring has been deleted successfully!");

        done();
      },
    });
  });
});
