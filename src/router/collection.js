import express from "express";
import connection from "../connection.js";
const router = express.Router();

router.get("/collections", async (req, res) => {
  const client = await connection();
  const result = await client.query(
    `SELECT * FROM collection LIMIT ${req.query.size} offset ${
      (parseInt(req.query.page) - 1) * req.query.size
    }`
  );
  res.send(result.rows);
  client.end();
});

router.get("/nfts/:collectionAddress", async (req, res) => {
  const view = req.query.view;
  const sort = req.query.sort;
  const client = await connection();
  const query = `SELECT nft.collection_address, nft.token_id, name, image FROM nft
  ${view !== "" ? "INNER" : "LEFT"} JOIN rentinfo ON nft.collection_address = rentinfo.collection_address and nft.token_id = rentinfo.token_id
  WHERE ${view !== "" ? view + " and" : ""} nft.collection_address = '${
    req.params.collectionAddress
  }' ${sort !== "" ? sort : ""} LIMIT ${req.query.size} offset ${
    (parseInt(req.query.page) - 1) * req.query.size
  }`;
  const result = await client.query(query);
  res.send(result.rows);
  client.end();
});

router.get("/:collectionAddress", async (req, res) => {
  const client = await connection();
  const result = await client.query(
    `SELECT * FROM collection WHERE collection_address = '${req.params.collectionAddress}';`
  );

  res.send(result.rows[0]);
  client.end();
});

router.post("/:collectionAddress", async (req, res) => {
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

export default router;
