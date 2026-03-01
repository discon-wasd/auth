import "dotenv/config";

import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { loginRoute } from "./routes/login.js";
import { verifyRoute } from "./routes/verify.js";
import { createTokenRoute } from "./routes/create-token.js";

const app = new Hono();

app.get("/", (c) => {
    return c.json({
        status: "alive",
    });
});

app.route("/login", loginRoute);
app.route("/verify", verifyRoute);
app.route("/create-token", createTokenRoute);

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
