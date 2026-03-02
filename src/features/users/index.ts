import { Hono } from "hono";
import { handleUserRoute } from "./handle";
import { meUserRoute } from "./me";

export const userRoute = new Hono();

userRoute.route("/me", meUserRoute);
userRoute.route("/", handleUserRoute);
