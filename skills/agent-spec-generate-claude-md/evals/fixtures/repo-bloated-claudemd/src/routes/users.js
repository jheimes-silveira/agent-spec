const { Router } = require("express");
const { z } = require("zod");
const { db } = require("../db");

const usersRouter = Router();

const CreateUser = z.object({ email: z.string().email(), name: z.string().min(1) });

usersRouter.post("/", async (req, res) => {
  const parsed = CreateUser.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const [user] = await db("users").insert(parsed.data).returning("*");
  res.status(201).json(user);
});

module.exports = { usersRouter };
