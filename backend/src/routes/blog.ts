import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { env } from "../.env";
import { sign, verify } from "hono/jwt";

import {
  CreatePostType,
  createPostInput,
  updatePostInput,
} from "@suvamjyoti/common-app";
import { useId } from "hono/jsx";
export const bookRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
  Variables: {
    userId: string;
  };
}>();

bookRouter.use(async (c, next) => {
  const jwt = c.req.header("Authorization");

  if (!jwt) {
    c.status(401);
    return c.json({ error: "Unauthorized" });
  }
  const token = jwt.split(" ")[1];
  const payload = await verify(token, c.env.JWT_SECRET);
  if (!payload) {
    c.status(401);
    return c.json({ error: "Unauthorized" });
  }
  c.set("userId", payload.id);

  await next();
});

bookRouter.post("/blog", async (c) => {
  const userId = c.get("userId");
  const body = await c.req.json();

  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
  }).$extends(withAccelerate());
  const { success } = createPostInput.safeParse(body);

  if (!success) {
    c.status(400);
    return c.json({
      error: "Invalid Input",
    });
  }
  const post = await prisma.post.create({
    data: {
      title: body.title,
      content: body.content,
      authorId: userId,
    },
  });

  return c.json({
    id: post.id,
  });
});
bookRouter.put("/blog", (c) => {
  const userId = c.get("userId");
  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
  }).$extends(withAccelerate());
  const body = c.req.json();
  const { success } = updatePostInput.safeParse(body);
  if (!success) {
    c.status(400);
    return c.json({
      error: "Invalid Input",
    });
  }
  prisma.post.update({
    where: {
      id: body.id,
      authorId: userId,
    },
    data: {
      title: body.title,
      content: body.content,
    },
  });

  return c.json({
    msg: "Post updated successfully",
  });
});
bookRouter.get("blogs/blog/:id", async (c) => {
  const id = c.req.param("id");

  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
  }).$extends(withAccelerate());
  const post = await prisma.post.findUnique({
    where: {
      id,
    },
    select: {
      content: true,
      title: true,
      author: {
        select: {
          name: true,
        },
      },
    },
  });
  return c.json(post);
});
bookRouter.get("blog/bulk", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
  }).$extends(withAccelerate());
  const post = await prisma.post.findMany({
    select: {
      id: true,
      content: true,
      title: true,
      author: {
        select: {
          name: true,
        },
      },
    },
  });
  return c.json(post);
});
