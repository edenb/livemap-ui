describe("Device List", () => {
  describe("For user Alice with role admin", () => {
    beforeEach(function () {
      cy.mockMapResponses("Alice");
      cy.login("Alice");
      cy.visit("/devices");
      cy.contains("Devices");
    });

    it("should show a spinner in the loading state", () => {
      cy.get("[data-cy=device-list-state-loading]").should("be.visible");
    });

    it("should show a message that no devices are available", () => {
      cy.get("[data-cy=device-list-state-empty]").should("be.visible");
    });
  });

  describe("For user Bobby with role manager", () => {
    beforeEach(function () {
      cy.mockMapResponses("Bobby");
      cy.login("Bobby");
      cy.visit("/devices");
      cy.contains("Devices");
    });

    it("should show a spinner in the loading state", () => {
      cy.get("[data-cy=device-list-state-loading]").should("be.visible");
    });

    it("should show the device list", () => {
      cy.get("[data-cy=device-list-state-loaded]").should("be.visible");
    });

    it("should show 4 rows (1 header and 3 devices)", () => {
      cy.get("tr").should("have.length", 4);
    });
  });
});
