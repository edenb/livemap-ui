describe("User List", () => {
  describe("For user Alice with role admin", () => {
    beforeEach(function () {
      cy.mockMapResponses("Alice");
      cy.login("Alice");
    });

    it("should show a user list with 2 users", () => {
      cy.visit("/users");
      // Spinner should be visible during loading
      cy.get("[data-cy=user-list-state-loading]").should("be.visible");
      cy.get("[data-cy=user-list-state-loaded]").should("be.visible");
      cy.get(".v-toolbar-title").contains("Users");
      // Shows 3 rows (1 header and 2 users)
      cy.get("tr").should("have.length", 3);
    });

    it("should show an error message if loading fails", () => {
      cy.intercept("GET", "/api/v1/users", (req) => {
        req.reply({
          statusCode: 500,
        });
      });
      cy.visit("/users");
      // Spinner should be visible during loading
      cy.get("[data-cy=user-list-state-loading]").should("be.visible");
      cy.get("[data-cy=user-list-state-failed]").should("be.visible");
    });
  });

  describe("For user Bobby with role manager", () => {
    beforeEach(function () {
      cy.mockMapResponses("Bobby");
      cy.login("Bobby");
    });

    it("should show an error message if loading fails (auth error)", () => {
      cy.visit("/users");
      // Spinner should be visible during loading
      cy.get("[data-cy=user-list-state-loading]").should("be.visible");
      cy.get("[data-cy=user-list-state-failed]").should("be.visible");
    });

    it("should show an error message if loading fails (server error)", () => {
      cy.intercept("GET", "/api/v1/users", (req) => {
        req.reply({
          statusCode: 500,
        });
      });
      cy.visit("/users");
      // Spinner should be visible during loading
      cy.get("[data-cy=user-list-state-loading]").should("be.visible");
      cy.get("[data-cy=user-list-state-failed]").should("be.visible");
    });
  });
});
