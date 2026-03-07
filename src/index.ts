import "dotenv/config";

import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { authRoute } from "./features/auth/index";
import { userRoute } from "./features/users";
import { serverRoute } from "./features/server";

const app = new Hono();

app.get("/", (c) => {
    return c.json({
        status: "alive",
    });
});

app.route("/auth", authRoute);
app.route("/user", userRoute);
app.route("/server", serverRoute)

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
