import { Hono } from "hono";
import { accountRoute } from "./account";
import { loginRoute } from "./login";
import { sessionsRoute } from "./sessions";
import { userRoute } from "./user";

export const authRoute = new Hono();

authRoute.route("/login", loginRoute);
authRoute.route("/account", accountRoute);
authRoute.route("/sessions", sessionsRoute);
authRoute.route("/user", userRoute);
