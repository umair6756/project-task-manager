// WHAT: Generates the OpenAPI spec from @openapi JSDoc comments on route
// files. WHY: this is the frontend contract (CLAUDE.md §3) — must stay in
// sync with real behavior, so it's generated from the code, not hand-written.
import swaggerJsdoc from "swagger-jsdoc";

export const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.3",
    info: {
      title: "FlowForge API",
      version: "0.1.0",
      description: "Personal productivity super-app — REST API",
    },
    servers: [{ url: "/api" }],
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      },
    },
  },
  apis: ["./src/modules/**/*.routes.ts", "./dist/modules/**/*.routes.js"],
});
