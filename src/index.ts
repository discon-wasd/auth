import "dotenv/config";

import { serve } from "@hono/node-server";
import { swaggerUI } from "@hono/swagger-ui";
import { Hono } from "hono";
import { openAPIRouteHandler } from "hono-openapi";
import { authRoute } from "./features/auth/index";
import { healthRoute } from "./features/health";
import { serverRoute } from "./features/server";
import { userRoute } from "./features/users";

const app = new Hono()
    .route("/health", healthRoute)
    .route("/auth", authRoute)
    .route("/user", userRoute)
    .route("/server", serverRoute);

app.get(
    "/openapi",
    openAPIRouteHandler(app, {
        documentation: {
            info: {
                title: "Discon Auth",
                version: "1.0.0",
                description:
                    "A lightweight REST API built with Hono. Handles auth and lets servers verify user identity.",
            },
            components: {
                securitySchemes: {
                    bearerAuth: {
                        type: "http",
                        scheme: "bearer",
                        bearerFormat: "base64",
                        description:
                            "Session token returned from POST /auth/login",
                    },
                },
            },
            tags: [
                {
                    name: "Health",
                    description: "API health check",
                },
                {
                    name: "Auth",
                    description:
                        "Authentication, session management, and login via Google, Github or Email",
                },
                {
                    name: "Users",
                    description: "User profile management and lookup",
                },
                {
                    name: "Servers",
                    description: "Server registration and token management",
                },
            ],
        },
    }),
).get("/swagger", swaggerUI({ url: "/openapi" }));

if (process.env.NODE_ENV === "dev") {
    serve(
        {
            fetch: app.fetch,
            port: 3000,
        },
        (info) => {
            console.log(`Server is running on http://localhost:${info.port}`);
        },
    );
}

export default app;
