describe("Menu", () => {
  describe("For user Alice with role admin", () => {
    beforeEach(function () {
      cy.mockMapResponses("cleanMap");
      // Login and go to the main page
      cy.login("Alice");
      cy.visit("/worldmap");
      cy.contains("Livemap");
    });

    it("should select device list", () => {
      cy.get("[data-cy=navbar-menu-drawer-control]").click();
      cy.get("[data-cy=menu-select-device-list]").click();
      cy.url().should("contain", "/devices");
    });

    it("should select user list", () => {
      cy.get("[data-cy=navbar-menu-drawer-control]").click();
      cy.get("[data-cy=menu-select-user-list]").click();
      cy.url().should("contain", "/users");
    });

    it("should select logout", () => {
      cy.get("[data-cy=navbar-menu-drawer-control]").click();
      cy.get("[data-cy=menu-select-logout]").click();
      cy.url().should("contain", "/login");
    });
  });

  describe("For user Bobby with role manager", () => {
    beforeEach(function () {
      cy.mockMapResponses("cleanMap");
      // Login and go to the main page
      cy.login("Bobby");
      cy.visit("/worldmap");
      cy.contains("Livemap");
    });

    it("should select device list", () => {
      cy.get("[data-cy=navbar-menu-drawer-control]").click();
      cy.get("[data-cy=menu-select-device-list]").click();
      cy.url().should("contain", "/devices");
    });

    it("should not show user list selection", () => {
      cy.get("[data-cy=navbar-menu-drawer-control]").click();
      cy.get("[data-cy=menu-select-user-list]").should("have.length", 0);
    });

    it("should select logout", () => {
      cy.get("[data-cy=navbar-menu-drawer-control]").click();
      cy.get("[data-cy=menu-select-logout]").click();
      cy.url().should("contain", "/login");
    });
  });
});
