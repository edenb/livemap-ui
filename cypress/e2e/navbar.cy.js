describe("Navigation bar", () => {
  beforeEach(function () {
    cy.mockMapResponses("Bobby");
    // Login and go to the main page
    cy.login("Bobby");
    cy.visit("/worldmap");
    cy.contains("Livemap");
  });

  it("should show menu drawer control", () => {
    cy.get("[data-cy=navbar-menu-drawer-control]").should("be.visible");
  });
  it("should show disconnected status", () => {
    cy.get("[data-cy=navbar-connection-status]").should(
      "have.class",
      "text-red",
    );
  });
  it("should show account dialog control", () => {
    cy.get("[data-cy=navbar-account-dialog-control]").should("be.visible");
  });
});
