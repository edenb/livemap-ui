describe("Login", () => {
  describe("Login user Alice with role admin", () => {
    beforeEach(() => {
      // Login and go to the main page
      cy.login("Alice");
      cy.visit("/worldmap");
      cy.contains("Livemap");
    });

    Cypress.config("screenSizes").forEach((screenSize) => {
      it(`takes a screenshot on ${screenSize} screen`, () => {
        cy.viewport(screenSize);
        cy.get("[data-cy=zoom-animation-end]", { timeout: 10000 });
        cy.get(".leaflet-marker-icon").should("have.length", 3);
        cy.screenshot();
      });
    });
  });

  describe("Login user Bobby with role manager", () => {
    beforeEach(() => {
      // Login and go to the main page
      cy.login("Bobby");
      cy.visit("/worldmap");
      cy.contains("Livemap");
    });

    Cypress.config("screenSizes").forEach((screenSize) => {
      it(`takes a screenshot on ${screenSize} screen`, () => {
        cy.viewport(screenSize);
        cy.get("[data-cy=zoom-animation-end]", { timeout: 10000 });
        cy.get(".leaflet-marker-icon").should("have.length", 3);
        cy.screenshot();
      });
    });
  });
});
