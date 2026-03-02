import { Hono } from "hono";
import { createTokenRoute } from "./create";
import { verifyTokenRoute } from "./verify";

export const tokenRoute = new Hono();

tokenRoute.route("/verify", verifyTokenRoute);
tokenRoute.route("/create", createTokenRoute);
