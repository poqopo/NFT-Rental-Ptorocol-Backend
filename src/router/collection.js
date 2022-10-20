import express from "express";
import connection from "../connection.js";
const router = express.Router();

router.get("/collections", async (req, res) => {
  const client = await connection();
  const result = await client.query(
    `SELECT * FROM collection`
  );

  res.send(result.rows);
  client.end();
});

router.get("/nfts/:collectionddress", async (req, res) => {
  const client = await connection();
  const result = await client.query(
    `SELECT * FROM nft WHERE nft.collection_address = '${req.params.collectionddress}' ORDER BY token_id ASC`
  );

  res.send(result.rows);
  client.end();
});

router.get("/listed/:collectionddress", async (req, res) => {
  const client = await connection();
  const result = await client.query(
    `SELECT * FROM collection 
        INNER JOIN rentinfo ON collection.collection_address = rentinfo.collection_address
        WHERE collection.collection_address = '${req.params.collectionddress}' and rentinfo.renter_address is NULL`
  );

  res.send(result.rows);
  client.end();
});

router.get("/rented/:collectionddress", async (req, res) => {
  const client = await connection();
  const result = await client.query(
    `SELECT * FROM collection 
        INNER JOIN rentinfo ON collection.collection_address = rentinfo.collection_address
        WHERE collection.collection_address = '${req.params.collectionddress}' and rentinfo.renter_address is NOT NULL`
  );

  res.send(result.rows);
  client.end();
});

router.get("/:collectionddress", async (req, res) => {
  const client = await connection();
  const result = await client.query(
    `SELECT * FROM collection WHERE collection_address = '${req.params.collectionddress}';`
  );

  res.send(result.rows[0]);
  client.end();
});


router.post("/:collectionddress", async (req, res) => {
  const client = await connection()
  const query = `UPDATE collection SET, collection_name=$1, collection_description=$2, collection_image=$3, website=$4, discord=$5, twitter=$6;
        `;
  await client
    .query(query, [
      contents.collection_address,
      contents.token_id,
      contents.input,
    ])
    .catch((err) => console.log(err));

  res.send(result); //뭘 보내야해?
  client.end();
});

export default router;
