import "../support/commands";

describe("profile menu", () => {
  it("should display the profile menu", () => {
    cy.get(".profile-toggler").should("have.length", 1);
  });

  it("should display the profile menu", () => {
    cy.get(".profile-toggler").click();
    cy.get(".dropdown-item").should("have.length", 2);
  });

  it("should logout, when clicking on Sign Out and the user to be redirected to Sign In Page", () => {
    cy.get(".dropdown-item").contains("Sign Out").click();
  });
});
