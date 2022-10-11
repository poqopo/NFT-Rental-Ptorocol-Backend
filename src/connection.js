import pg from 'pg'

export default function connect() {
    const config = {
      host: process.env.host,
      user: process.env.user,
      password: process.env.password,
      database: process.env.database,
      port: process.env.port,
    };
  
    const client = new pg.Client(config);
  
    client.connect((err) => {
      if (err) throw err;
    })

    return client
}