import { Hono } from "hono";
import { handleUserRoute } from "./handle";
import { meUserRoute } from "./me";
import { tokenUserRoute } from "./token";

export const userRoute = new Hono()
    .route("/me", meUserRoute)
    .route("/", handleUserRoute)
    .route("/token", tokenUserRoute);
