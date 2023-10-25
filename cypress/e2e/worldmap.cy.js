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

    cy.intercept("GET", "/api/v1/positions", (req) => {
      req.reply({
        statusCode: 200,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify([]),
      });
    }).as("getPositions");

    // Login and go to the main page
    cy.login("Bobby");
    cy.visit("/worldmap");
    cy.contains("Livemap");
  });

  it("takes a screenshot", () => {
    // When all map tiles are loaded wait for leaflet fadeAnimation to finish (250ms)
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.get("[data-cy=all-tiles-loaded]").wait(300);
    cy.screenshot();
  });
});
