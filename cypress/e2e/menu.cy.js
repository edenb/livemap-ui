// Define helper command outside of describe to prevent re-registration issues
Cypress.Commands.add("openMenu", () => {
  cy.get("[data-cy=navbar-menu-drawer-control]").should("be.visible").click();
  // Wait for the menu drawer/container to appear to handle CSS transitions/animations
  cy.get("[data-cy=menu-select-device-list], [data-cy=menu-select-logout]", {
    timeout: 5000,
  })
    .first()
    .should("be.visible");
});

describe("Menu Navigation", () => {
  const testUsers = [
    { name: "Alice", role: "admin", shouldSeeUserList: true },
    { name: "Bobby", role: "manager", shouldSeeUserList: false },
  ];

  testUsers.forEach(({ name, role, shouldSeeUserList }) => {
    describe(`For user ${name} with role ${role}`, () => {
      beforeEach(function () {
        // Setup: Login and navigate to worldmap
        cy.mockMapResponses(name);
        cy.login(name);
        cy.visit("/worldmap");
        cy.contains("Livemap").should("be.visible");
        // Wait for map to fully initialize and tiles to load
        cy.get("[data-cy=all-tiles-loaded]", { timeout: 10000 }).should(
          "exist",
        );
        cy.contains("Livemap").should("be.visible");
      });

      it("should navigate to device list", () => {
        cy.openMenu();
        cy.get("[data-cy=menu-select-device-list]")
          .should("be.visible")
          .click();
        cy.url().should("include", "/devices");
        cy.contains("Devices").should("be.visible");
      });

      it("should handle logout correctly", () => {
        cy.openMenu();
        cy.get("[data-cy=menu-select-logout]").should("be.visible").click();
        cy.url().should("include", "/login");
        cy.contains("Login").should("be.visible");
      });

      if (shouldSeeUserList) {
        it("should navigate to user list", () => {
          cy.openMenu();
          cy.get("[data-cy=menu-select-user-list]")
            .should("be.visible")
            .click();
          cy.url().should("include", "/users");
          cy.contains("Users").should("be.visible");
        });
      } else {
        it("should not show user list option", () => {
          cy.openMenu();
          cy.get("[data-cy=menu-select-user-list]", { timeout: 5000 }).should(
            "not.exist",
          );
        });
      }
    });
  });
});
