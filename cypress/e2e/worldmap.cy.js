describe("Worldmap", () => {
  beforeEach(() => {
    // Login and go to the main page
    cy.login("Bobby");
    cy.visit("/worldmap");
    cy.contains("Livemap");
  });

  it("takes a screenshot", () => {
    cy.get("[data-cy=zoom-animation-end]");
    cy.screenshot();
  });

  it("should show 3 markers", () => {
    cy.get(".leaflet-marker-icon").should("have.length", 3);
  });
});
