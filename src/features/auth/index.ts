import { Hono } from "hono";
import { loginRoute } from "./login";
import { sessionsRoute } from "./sessions";
import { userRoute } from "../users";
import { logoutRoute } from "./logout";

export const authRoute = new Hono();

authRoute.route("/login", loginRoute);
authRoute.route("/logout", logoutRoute);
authRoute.route("/sessions", sessionsRoute);
authRoute.route("/user", userRoute);
