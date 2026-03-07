import { Hono } from "hono";
import { handleUserRoute } from "./handle";
import { meUserRoute } from "./me";
import { tokenUserRoute } from "./token";

export const userRoute = new Hono();

userRoute.route("/me", meUserRoute);
userRoute.route("/", handleUserRoute);
userRoute.route("/token", tokenUserRoute)
