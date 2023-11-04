describe("Worldmap", () => {
  beforeEach(() => {
    // Stub responses
    cy.intercept("GET", "/api/v1/staticlayers", (req) => {
      req.reply({
        statusCode: 200,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify([]),
      });
    }).as("getStaticlayers");

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
