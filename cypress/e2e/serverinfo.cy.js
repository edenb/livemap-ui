describe("Server Info Dialog", () => {
  beforeEach(function () {
    cy.mockMapResponses("Bobby");
    // Login and go to the main page
    cy.login("Bobby");
    cy.visit("/worldmap");
    cy.contains("Livemap");
  });

  it("should show the server info dialog", () => {
    cy.intercept("GET", "/api/v1/server/info", (req) => {
      req.reply({
        statusCode: 200,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          application: {
            name: "Livemap",
            about: "About",
            license: "MIT",
          },
        }),
      });
    });
    cy.get("[data-cy=navbar-info-dialog-control]").click();
    cy.get("[data-cy=server-info-dialog]")
      .should("be.visible")
      .and("contain", "Livemap")
      .and("contain", "About")
      .and("contain", "MIT");
    cy.get("[data-cy=snackbar]").should("not.exist");
  });

  it("should show a snackbar when the server and/or network is down", () => {
    cy.intercept("GET", "/api/v1/server/info", (req) => {
      req.destroy();
    });
    cy.get("[data-cy=navbar-info-dialog-control]").click();
    cy.get("[data-cy=snackbar]").should("exist");
    cy.contains("No server connection").should("be.visible");
    cy.get("[data-cy=server-info-dialog]").should("not.exist");
  });

  it("should show a snackbar when the server has an internal error", () => {
    cy.intercept("GET", "/api/v1/server/info", (req) => {
      req.reply({
        statusCode: 500,
      });
    });
    cy.get("[data-cy=navbar-info-dialog-control]").click();
    cy.get("[data-cy=snackbar]").should("exist");
    cy.contains("Internal Server Error").should("be.visible");
    cy.get("[data-cy=server-info-dialog]").should("not.exist");
  });
});
