const { Client } = require("pg");

const SQL = `
CREATE TABLE IF NOT EXISTS tvShows (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name VARCHAR(255),
  episodes INT,
  genre VARCHAR(255),
  status VARCHAR(255),
  image_url VARCHAR(255)
);
`;

async function main() {
  console.log("seeding...");
  const client = new Client({
    connectionString: "postgresql://postgres:211392@localhost:5432/favTvShows",
  });
  await client.connect();
  await client.query(SQL);
  await client.end();
  console.log("done");
}

main();
