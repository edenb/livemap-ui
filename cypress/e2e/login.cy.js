describe("Login", () => {
  describe("For user Alice with role admin", () => {
    beforeEach(function () {
      cy.mockMapResponses("Alice");
      cy.login("Alice");
    });

    Cypress.config("screenSizes").forEach((screenSize) => {
      it(`takes a screenshot on a ${screenSize} screen`, () => {
        cy.viewport(screenSize);
        // Go to the main page
        cy.visit("/worldmap");
        cy.contains("Livemap");
        // Wait for all tiles loaded and visible
        cy.get("[data-cy=all-tiles-loaded]", { timeout: 10000 });
        cy.get("img").each(($el, k) => {
          expect($el, `image ${k + 1}`)
            .to.have.prop("naturalWidth")
            .be.greaterThan(0);
        });
        // Wait for animation to finish
        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.wait(200);

        cy.get(".leaflet-marker-icon").should("not.exist");
        cy.screenshot();
      });
    });
  });

  describe("For user Bobby with role manager", () => {
    beforeEach(function () {
      cy.mockMapResponses("Bobby");
      cy.login("Bobby");
    });

    Cypress.config("screenSizes").forEach((screenSize) => {
      it(`takes a screenshot on a ${screenSize} screen`, () => {
        cy.viewport(screenSize);
        // Go to the main page
        cy.visit("/worldmap");
        cy.contains("Livemap");
        // Wait for zoom/panning to finish
        cy.get("[data-cy=zoom-animation-end]", { timeout: 10000 });
        // Wait for animation to finish
        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.wait(200);

        cy.get(".leaflet-marker-icon").should("have.length", 3);
        cy.screenshot();
      });
    });
  });
});
