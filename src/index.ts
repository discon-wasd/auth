import "dotenv/config";

import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { authRoute } from "./features/auth/index";
import { tokenRoute } from "./features/token/index";

const app = new Hono();

app.get("/", (c) => {
    return c.json({
        status: "alive",
    });
});

app.route("/auth", authRoute);
app.route("/token", tokenRoute);

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
