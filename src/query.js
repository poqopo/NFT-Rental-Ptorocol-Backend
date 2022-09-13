import pg from "pg";

export function connection() {
  const config = {
    // host: "ls-b24c2551f8052c71c0c44d92efc079203b9c0789.c9wknlpud9ss.us-east-1.rds.amazonaws.com",
    // user: "test",
    // password: "12341234",
    // database: "postgres",
    // port: 5432,

    host: 'localhost',
    user: 'test',
    password: 'test',
    database: 'postgres',
    port: 5432,
  };

  const client = new pg.Client(config);

  client.connect((err) => {
    if (err) throw err;
  });

  return client
}

