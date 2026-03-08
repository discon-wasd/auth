import { Hono } from "hono";
import { loginRoute } from "./login";
import { logoutRoute } from "./logout";
import { sessionsRoute } from "./sessions";

export const authRoute = new Hono()
    .route("/login", loginRoute)
    .route("/logout", logoutRoute)
    .route("/sessions", sessionsRoute);
