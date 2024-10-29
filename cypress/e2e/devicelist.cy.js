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

    it("should open the dialog to create a new device", () => {
      cy.visit("/devices");
      cy.contains("button", "Add a device manually").click();
      cy.get("[data-cy=edit-device-dialog]")
        .should("be.visible")
        .and("contain", "New Device");
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
      cy.get(".v-toolbar-title").contains("Devices");
      // Shows 4 rows (1 header and 3 devices)
      cy.get("tr").should("have.length", 4);
    });

    it("should open the dialog to create a new device", () => {
      cy.visit("/devices");
      cy.get(".mdi-plus").click();
      cy.get("[data-cy=edit-device-dialog]")
        .should("be.visible")
        .and("contain", "New Device");
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
