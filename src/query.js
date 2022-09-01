import pg from "pg";

export function connection() {
  const config = {
    host: "localhost",
    user: "test",
    password: "test",
    database: "postgres",
    port: 5432,
  };

  const client = new pg.Client(config);

  client.connect((err) => {
    if (err) throw err;
  });

  return client
}

