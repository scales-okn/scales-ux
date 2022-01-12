import "../support/commands";

describe("home page", () => {
  beforeEach(() => {
    // cy.restoreLocalStorage();
  });

  afterEach(() => {
    // cy.saveLocalStorage();
  });

  it("should display the sign-in page title", () => {
    cy.get("h4").should("contain", "Home Page");
  });
});
