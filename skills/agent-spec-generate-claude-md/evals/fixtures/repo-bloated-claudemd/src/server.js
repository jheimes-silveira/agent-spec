const express = require("express");
const pino = require("pino")();
const { usersRouter } = require("./routes/users");

const app = express();
app.use(express.json());

// Toda rota nova mora em src/routes e é montada aqui. Validação com zod na entrada.
app.use("/users", usersRouter);

app.use((err, _req, res, _next) => {
  pino.error(err);
  res.status(500).json({ error: "internal" });
});

const port = process.env.PORT || 3000;
app.listen(port, () => pino.info(`atlas up on ${port}`));
