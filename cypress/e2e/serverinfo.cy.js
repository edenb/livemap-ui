describe("Information Drawer", () => {
  beforeEach(function () {
    cy.mockMapResponses("Bobby");
    // Login and go to the main page
    cy.login("Bobby");
    cy.visit("/worldmap");
    cy.contains("Livemap");
  });

  it("should show the information drawer", () => {
    cy.intercept("GET", "/api/v1/server/info", (req) => {
      req.reply({
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          application: { name: "Livemap", about: "About text", license: "MIT" },
        }),
      });
    });
    cy.get("[data-cy=map-drawer-info-control]").click();
    cy.get("[data-cy=map-drawer-info]")
      .should("be.visible")
      .and("contain", "http://localhost:3000")
      .and("contain", "About text")
      .and("contain", "MIT");
    cy.get("[data-cy=snackbar]").should("not.exist");
  });

  it("should show a snackbar when the server and/or network is down", () => {
    cy.intercept("GET", "/api/v1/server/info", (req) => {
      req.destroy();
    });
    cy.get("[data-cy=map-drawer-info-control]").click();
    cy.get("[data-cy=map-drawer-info]")
      .should("be.visible")
      .and("contain", "http://localhost:3000");
    cy.get("[data-cy=snackbar]").should("exist");
    cy.contains("No server connection").should("be.visible");
  });

  it("should show a snackbar when the server has an internal error", () => {
    cy.intercept("GET", "/api/v1/server/info", (req) => {
      req.reply({
        statusCode: 500,
        body: {
          success: false,
          statusCode: 500,
          statusText: "Internal Server Error",
          message: "",
          errors: [],
          stack: {},
        },
      });
    });
    cy.get("[data-cy=map-drawer-info-control]").click();
    cy.get("[data-cy=map-drawer-info]")
      .should("be.visible")
      .and("contain", "http://localhost:3000");
    cy.get("[data-cy=snackbar]").should("exist");
    cy.contains("Internal Server Error").should("be.visible");
  });
});
