const chai = require("chai");
const userSchema = require("../fixtures/userSchema.js");
const chaiJsonSchema = require("chai-json-schema");
const { makeRequest } = require("../util/makeRequest.js");
const { loginUser } = require("../util/loginUser.js");
chai.use(chaiJsonSchema);

const baseRoute = "/api/users";
let token;

before(async () => {
  token = await loginUser();
});

describe("Users API", () => {
  let createdUserId;

  it("should return all users", async () => {
    try {
      const res = await makeRequest({
        method: "get",
        endpoint: baseRoute,
        token,
      });

      chai.expect(res.body.data).to.have.keys("users", "paging");
      chai.expect(res.body.data.users).to.be.an("array");
      chai.expect(res.body.data.paging).to.be.an("object");
      chai.expect(res.body.data.paging).to.have.keys("totalCount", "totalPages", "currentPage", "pageSize");

      res.body.data.users.forEach((user) => chai.expect(user).to.be.jsonSchema(userSchema));
    } catch (error) {
      throw error;
    }
  });

  it("should create a user", async () => {
    try {
      const res = await makeRequest({
        method: "post",
        endpoint: `${baseRoute}/create`,
        token,
        body: {
          username: "Barry White",
          email: "barry@example.com",
          password: "ASFtest!@#123",
          firstName: "Barry",
          lastName: "White",
          usage: "test",
        },
      });

      createdUserId = res.body.data.user.id;

      chai.expect(res.body.data).to.be.have.key("user");
      chai.expect(res.body.data.user).to.be.an("object");
      chai.expect(res.body.data.user).to.be.jsonSchema(userSchema);
    } catch (error) {
      throw error;
    }
  });

  it("should return a user", async () => {
    try {
      const res = await makeRequest({
        method: "get",
        endpoint: `${baseRoute}/${createdUserId}/`,
        token,
      });

      chai.expect(res.body.data).to.be.have.key("user");
      chai.expect(res.body.data.user).to.be.an("object");
      chai.expect(res.body.data.user).to.be.jsonSchema(userSchema);
    } catch (error) {
      throw error;
    }
  });

  it("should update a user", async () => {
    try {
      const res = await makeRequest({
        method: "put",
        endpoint: `${baseRoute}/${createdUserId}/`,
        token,
        body: {
          firstName: "Donna",
        },
      });

      chai.expect(res.body.data).to.be.have.key("user");
      chai.expect(res.body.data.user).to.be.an("object");
      chai.expect(res.body.data.user).to.be.jsonSchema(userSchema);
    } catch (error) {
      throw error;
    }
  });

  it("should delete a user", async () => {
    try {
      const res = await makeRequest({
        method: "delete",
        endpoint: `${baseRoute}/${createdUserId}/`,
        token,
        body: {
          firstName: "Donna",
        },
      });

      chai.expect(res.body.message).to.equal("User has been deleted successfully!");
    } catch (error) {
      throw error;
    }
  });
});
