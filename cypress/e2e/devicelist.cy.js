describe("Device List", () => {
  describe("For user Alice with role admin", () => {
    beforeEach(function () {
      cy.mockMapResponses("Alice");
      cy.login("Alice");
    });

    it("should show a message that no devices are available", () => {
      cy.visit("/devices");
      // Spinner should be visible during loading
      cy.get("[data-cy=device-list-state-loading]").should("be.visible");
      cy.get("[data-cy=device-list-state-empty]").should("be.visible");
    });

    it("should show an error message if loading fails", () => {
      cy.intercept("GET", "/api/v1/users/**", (req) => {
        req.reply({
          statusCode: 500,
        });
      });
      cy.visit("/devices");
      // Spinner should be visible during loading
      cy.get("[data-cy=device-list-state-loading]").should("be.visible");
      cy.get("[data-cy=device-list-state-failed]").should("be.visible");
    });
  });

  describe("For user Bobby with role manager", () => {
    beforeEach(function () {
      cy.mockMapResponses("Bobby");
      cy.login("Bobby");
    });

    it("should show a device list with 3 devices", () => {
      cy.visit("/devices");
      // Spinner should be visible during loading
      cy.get("[data-cy=device-list-state-loading]").should("be.visible");
      cy.get("[data-cy=device-list-state-loaded]").should("be.visible");
      cy.get("[class=v-toolbar-title]").contains("Devices");
      // Shows 4 rows (1 header and 3 devices)
      cy.get("tr").should("have.length", 4);
    });

    it("should show an error message if loading fails", () => {
      cy.intercept("GET", "/api/v1/users/**", (req) => {
        req.reply({
          statusCode: 500,
        });
      });
      cy.visit("/devices");
      // Spinner should be visible during loading
      cy.get("[data-cy=device-list-state-loading]").should("be.visible");
      cy.get("[data-cy=device-list-state-failed]").should("be.visible");
    });
  });
});
