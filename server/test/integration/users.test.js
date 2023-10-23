const chai = require("chai");
const userSchema = require("../fixtures/userSchema.js");
const chaiJsonSchema = require("chai-json-schema");
const { makeRequest } = require("../util/makeRequest.js");
chai.use(chaiJsonSchema);

const baseRoute = "/api/users";

describe("Users API", () => {
  let createdUserId;

  it("should return all users", (done) => {
    makeRequest({
      method: "get",
      endpoint: baseRoute,
      done,
      endCallback: (res) => {
        chai.expect(res.body.data).to.have.keys("users", "paging");
        chai.expect(res.body.data.users).to.be.an("array");
        chai.expect(res.body.data.paging).to.be.an("object");
        chai
          .expect(res.body.data.paging)
          .to.have.keys("totalItems", "totalPages", "currentPage");

        res.body.data.users.forEach((user) =>
          chai.expect(user).to.be.jsonSchema(userSchema)
        );
        done();
      },
    });
  });

  it("should create a user", (done) => {
    makeRequest({
      method: "post",
      endpoint: `${baseRoute}/create`,
      done,
      body: {
        username: "Barry White",
        email: "barryfr@example.com",
        password: "ASFtest!@#123",
        firstName: "Barry",
        lastName: "White",
        usage: "test",
      },
      endCallback: (res) => {
        createdUserId = res.body.data.user.id;

        chai.expect(res.body.data).to.be.have.key("user");
        chai.expect(res.body.data.user).to.be.an("object");
        chai.expect(res.body.data.user).to.be.jsonSchema(userSchema);
        done();
      },
    });
  });

  it("should return a user", (done) => {
    makeRequest({
      method: "get",
      endpoint: `${baseRoute}/${createdUserId}/`,
      done,
      endCallback: (res) => {
        chai.expect(res.body.data).to.be.have.key("user");
        chai.expect(res.body.data.user).to.be.an("object");
        chai.expect(res.body.data.user).to.be.jsonSchema(userSchema);
        done();
      },
    });
  });

  it("should update a user", (done) => {
    makeRequest({
      method: "put",
      endpoint: `${baseRoute}/${createdUserId}/`,
      done,
      body: {
        firstName: "Donna",
      },
      endCallback: (res) => {
        chai.expect(res.body.data).to.be.have.key("user");
        chai.expect(res.body.data.user).to.be.an("object");
        chai.expect(res.body.data.user).to.be.jsonSchema(userSchema);
        done();
      },
    });
  });

  it("should delete a user", (done) => {
    makeRequest({
      method: "delete",
      endpoint: `${baseRoute}/${createdUserId}/`,
      done,
      body: {
        firstName: "Donna",
      },
      endCallback: (res) => {
        chai
          .expect(res.body.message)
          .to.equal("User has been deleted successfully!");
        done();
      },
    });
  });
});
