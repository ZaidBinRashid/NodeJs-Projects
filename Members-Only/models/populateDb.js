const { Client } = require("pg");

const SQL = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  firstname VARCHAR(255) NOT NULL UNIQUE,
  lastname VARCHAR(255) NOT NULL,
  username VARCHAR(255),
  password VARCHAR(255) NOT NULL,
  ismember BOOLEAN DEFAULT false
);

CREATE TABLE post (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255),
    content TEXT
);

`;

async function main() {
  console.log("seeding...");
  const client = new Client({
    connectionString: "postgresql://postgres:211392@localhost:5432/members",
  });
  await client.connect();
  await client.query(SQL);
  await client.end();
  console.log("done");
}

main();
