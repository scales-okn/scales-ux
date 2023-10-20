const chai = require("chai");
const app = require("../../build/index.js");
const request = require("supertest")(app.default);
const userSchema = require("../fixtures/userSchema.js");
const chaiJsonSchema = require("chai-json-schema");
const token = require("../fixtures/token.js");
chai.use(chaiJsonSchema);

describe("Users API", () => {
  let createdUserId;

  it("should return all users", (done) => {
    request
      .get("/api/users")
      .set("Accept", "application/json")
      .set("Authorization", token)
      .expect("Content-Type", /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
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
      });
  });

  it("should create a user", (done) => {
    request
      .post("/api/users/create")
      .set("Accept", "application/json")
      .set("Authorization", token)
      .send({
        username: "Barry White",
        email: "barryf@example.com",
        password: "TESTtest!@#123",
        firstName: "Barry",
        lastName: "White",
        usage: "test",
      })
      .expect("Content-Type", /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        createdUserId = res.body.data.user.id;

        chai.expect(res.body.data).to.be.have.key("user");
        chai.expect(res.body.data.user).to.be.an("object");
        chai.expect(res.body.data.user).to.be.jsonSchema(userSchema);
        done();
      });
  });

  it("should return a user", (done) => {
    request
      .get(`/api/users/${createdUserId}/`)
      .set("Accept", "application/json")
      .set("Authorization", token)
      .expect("Content-Type", /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        chai.expect(res.body.data).to.be.have.key("user");
        chai.expect(res.body.data.user).to.be.an("object");
        chai.expect(res.body.data.user).to.be.jsonSchema(userSchema);
        done();
      });
  });

  it("should update a user", (done) => {
    request
      .put(`/api/users/${createdUserId}/`)
      .set("Accept", "application/json")
      .set("Authorization", token)
      .send({
        firstName: "Donna",
      })
      .expect("Content-Type", /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        chai.expect(res.body.data).to.be.have.key("user");
        chai.expect(res.body.data.user).to.be.an("object");
        chai.expect(res.body.data.user).to.be.jsonSchema(userSchema);
        done();
      });
  });

  it("should delete a user", (done) => {
    request
      .delete(`/api/users/${createdUserId}/`)
      .set("Accept", "application/json")
      .set("Authorization", token)
      .expect("Content-Type", /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        chai
          .expect(res.body.message)
          .to.equal("User has been deleted successfully!");
        done();
      });
  });
});
