const knex = require("knex");

// Pool singleton. NUNCA recriar — recriar estoura "too many connections" no Postgres.
const db = knex({
  client: "pg",
  connection: process.env.DATABASE_URL,
  pool: { min: 2, max: 10 },
});

module.exports = { db };
