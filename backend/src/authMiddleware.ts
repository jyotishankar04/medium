// // import { Hono } from "hono";
// import { verify } from "hono/jwt";

// // const app = new Hono<{
// //   Bindings: {
// //     DATABASE_URL: string;
// //     JWT_SECRET: string;
// //   };
// // }>();
// export function authMiddleware(app) {
//   app.use("/api/v1/blog/*", async (c, next) => {
//     const jwt = c.req.header("Authorization");
//     if (!jwt) {
//       c.status(401);
//       return c.json({ error: "Unauthorized" });
//     }
//     const token = jwt.split(" ")[1];
//     const payload = await verify(token, c.env.JWT_SECRET);
//     if (!payload) {
//       c.status(401);
//       return c.json({ error: "Unauthorized" });
//     }
//     c.set("userId", payload.id);
//     await next();
//   });
// }
