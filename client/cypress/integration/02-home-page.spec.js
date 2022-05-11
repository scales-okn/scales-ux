import "../support/commands";

describe("home page", () => {
  it("should display the sign-in page title", () => {
    cy.get("h4").should("contain", "Home Page");
  });
});
