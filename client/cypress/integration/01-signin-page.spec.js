import "../support/commands";

describe("sign-in page", () => {
  before(() => {
    cy.clearLocalStorageSnapshot();
  });

  beforeEach(() => {
    // cy.restoreLocalStorage();
    cy.visit("http://localhost:5000");
  });

  afterEach(() => {
    cy.saveLocalStorage();
  });

  it("should display the sign-in page title", () => {
    cy.get("h1").should("contain", "Please sign in");
  });

  it("should have the sign-in form", () => {
    cy.get("form").should("have.length", 1);
  });

  it("the form should be submitted succesfully with real data", () => {
    cy.get("input[name='email']").type("user@testing.test");
    cy.get("input[name='password']").type("Pass-word-25");
    cy.get("[type=submit]").click();

    cy.window().then((win) => {
      console.log(win.store);
      if (win.store) {
        win.store.dispatch("persist/PERSIST");
      }
    });
  });
});
