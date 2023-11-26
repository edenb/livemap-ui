describe("Login", () => {
  describe("For user Alice with role admin", () => {
    beforeEach(function () {
      cy.mockMapResponses("Alice");
      // Login and go to the main page
      cy.login("Alice");
      cy.visit("/worldmap");
      cy.contains("Livemap");
    });

    Cypress.config("screenSizes").forEach((screenSize) => {
      it(`takes a screenshot on a ${screenSize} screen`, () => {
        cy.viewport(screenSize);
        cy.get("[data-cy=zoom-animation-end]", { timeout: 10000 });
        cy.get(".leaflet-marker-icon").should("have.length", 3);
        cy.screenshot();
      });
    });
  });

  describe("For user Bobby with role manager", () => {
    beforeEach(function () {
      cy.mockMapResponses("Bobby");
      // Login and go to the main page
      cy.login("Bobby");
      cy.visit("/worldmap");
      cy.contains("Livemap");
    });

    Cypress.config("screenSizes").forEach((screenSize) => {
      it(`takes a screenshot on a ${screenSize} screen`, () => {
        cy.viewport(screenSize);
        cy.get("[data-cy=zoom-animation-end]", { timeout: 10000 });
        cy.get(".leaflet-marker-icon").should("have.length", 3);
        cy.screenshot();
      });
    });
  });
});
