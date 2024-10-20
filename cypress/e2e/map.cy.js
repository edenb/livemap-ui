describe("Map", () => {
  beforeEach(function () {
    cy.mockMapResponses("Bobby");
    // Login and go to the main page
    cy.login("Bobby");
  });

  it("should show 3 markers", () => {
    cy.visit("/worldmap");
    cy.contains("Livemap");
    cy.get(".leaflet-marker-icon").should("have.length", 3);
  });

  it("should show a snackbar when fetching the device layer fails", () => {
    cy.intercept("GET", "/api/v1/positions", (req) => {
      req.destroy();
    });
    cy.visit("/worldmap");
    cy.contains("Livemap");
    cy.get("[data-cy=snackbar]").should("exist");
    cy.contains("No server connection").should("be.visible");
  });

  it("should show a snackbar when fetching the staticlayers fails", () => {
    cy.intercept("GET", "/api/v1/staticlayers", (req) => {
      req.destroy();
    });
    cy.visit("/worldmap");
    cy.contains("Livemap");
    cy.get("[data-cy=snackbar]").should("exist");
    cy.contains("No server connection").should("be.visible");
  });

  it("should show a snackbar when the staticlayers geojson is not valid", () => {
    cy.intercept("GET", "/api/v1/staticlayers", (req) => {
      req.reply({
        statusCode: 200,
        headers: {
          "Content-Type": "application/json",
        },
        body: "This is not valid geojson",
      });
    });
    cy.visit("/worldmap");
    cy.contains("Livemap");
    cy.get("[data-cy=snackbar]").should("exist");
    cy.contains("Error: Invalid GeoJSON object.").should("be.visible");
  });
});
