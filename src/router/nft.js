import express from "express";
import connection from "../connection.js";
const nftrouter = express.Router();

nftrouter.get("/:collectionddress/:tokenid", async (req, res) => {
  const client = await connection();
  const result = await client.query(
    `SELECT * FROM nft WHERE collection_address = '${req.params.collectionddress}' and token_id = ${req.params.tokenid}`
  );

  res.send(result.rows);
  client.end();
});

nftrouter.get("/:collectionddress/:tokenid/activity", async (req, res) => {
  const client = await connection();
  const result = await client.query(
    `SELECT tx_hash, "from", "to", block FROM nft_transaction 
            WHERE collection_address = '${req.params.collectionddress}' and token_id = ${req.params.tokenid}
            ORDER BY block desc limit 5`
  );

  res.send(result.rows);
  client.end();
});

nftrouter.get("/:collectionddress/:tokenid/rentinfo", async (req, res) => {
  const client = await connection();
  const result = await client.query(
    `SELECT * FROM rentinfo WHERE collection_address = '${req.params.collectionddress}' and token_id = ${req.params.tokenid}`
  );

  res.send(result.rows);
  client.end();
});

export default nftrouter;
