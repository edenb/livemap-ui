Cypress.Commands.add("login", (username) => {
  // Mock responses
  cy.fixture("tokens.json").then((data) => {
    cy.intercept("POST", "/api/v1/login", (req) => {
      req.reply({
        statusCode: 200,
        headers: data[username].headers,
        body: JSON.stringify(data[username].body),
      });
    }).as("loginUser");
  });

  cy.fixture("users.json").then((data) => {
    cy.intercept("GET", "/api/v1/account", (req) => {
      req.reply({
        statusCode: 200,
        headers: data[username].headers,
        body: JSON.stringify(data[username].body),
      });
    }).as("getAccount");
  });

  cy.session([username], () => {
    const log = Cypress.log({
      name: "login",
      displayName: "LOGIN",
      message: [`🔐 Authenticating | ${username}`],
      autoEnd: false,
    });

    log.snapshot("before");

    cy.visit("/login");
    cy.get("[data-cy=username]").type(username);
    cy.get("[data-cy=password]").type("s3cr3t");
    cy.get("[data-cy=login]").click();
    cy.url().should("contain", "/worldmap");

    cy.wait("@loginUser");

    log.snapshot("after");
    log.end();
  });
});

Cypress.Commands.add("mockMapResponses", (username) => {
  cy.fixture("positions.json").then((data) => {
    cy.intercept("GET", "/api/v1/positions", (req) => {
      req.reply({
        statusCode: 200,
        headers: data[username].headers,
        body: JSON.stringify(data[username].body),
      });
    }).as("getPositions");
  });

  cy.intercept("GET", "/api/v1/staticlayers", (req) => {
    req.reply({
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify([]),
    });
  }).as("getStaticlayers");

  cy.intercept("GET", "/socket.io/*", (req) => {
    req.reply({
      statusCode: 200,
    });
  }).as("getSocketIO");
});
