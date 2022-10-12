import express from "express";
import connection from "../connection";
const router = express.Router();

router.get("/:collectionddress", async (req, res) => {
  const client = await connection();
  const result = await client.query(
    `SELECT * FROM collection WHERE collection_address = '${req.params.collectionddress}';`
  );

  res.send(result);
  client.end();
});

//POST 문제

router.post("/:collectionddress", async (req, res) => {
  const client = await connection();
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

router.get("/:collectionddress/nfts", async (req, res) => {
  const client = await connection();
  const result = await client.query(
    `SELECT * FROM collection 
        INNER JOIN rentinfo ON collection.collection_address = rentinfo.collection_address
        WHERE collection.collection_address = '${req.params.collectionddress}'`
  );

  res.send(result);
  client.end();
});

router.get("/:collectionddress/listed", async (req, res) => {
  const client = await connection();
  const result = await client.query(
    `SELECT * FROM collection 
        INNER JOIN rentinfo ON collection.collection_address = rentinfo.collection_address
        WHERE collection.collection_address = '${req.params.collectionddress}' and rentinfo.renter_address is NULL`
  );

  res.send(result);
  client.end();
});

router.get("/:collectionddress/rented", async (req, res) => {
  const client = await connection();
  const result = await client.query(
    `SELECT * FROM collection 
        INNER JOIN rentinfo ON collection.collection_address = rentinfo.collection_address
        WHERE collection.collection_address = '${req.params.collectionddress}' and rentinfo.renter_address is NOT NULL`
  );

  res.send(result);
  client.end();
});

export default router;
