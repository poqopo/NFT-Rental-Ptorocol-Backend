import express from "express";
import connection from "../connection.js";
const nftrouter = express.Router();

nftrouter.get("/kicklist", async (req, res) => {
  const client = await connection();
  const result = await client.query(
    `SELECT * FROM nft 
    INNER JOIN rentinfo ON nft.collection_address = rentinfo.collection_address and nft.token_id = rentinfo.token_id
    WHERE rentinfo.renter_address is NOT NULL
    ORDER by rentinfo.rent_block+rentinfo.rent_duration  asc`
  );

  res.send(result.rows);
  client.end();
});

nftrouter.get("/:collectionddress/:tokenid", async (req, res) => {
  const client = await connection();
  const result = await client.query(
    `SELECT * FROM nft WHERE collection_address = '${req.params.collectionddress}' and token_id = ${req.params.tokenid}`
  );

  res.send(result.rows[0]);
  client.end();
});

nftrouter.get("/:collectionddress/:tokenid/activity", async (req, res) => {
  const client = await connection();
  const result = await client.query(
    `SELECT tx_hash, "from", "event", block, collateral_amount, fee_amount FROM transaction 
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

  res.send(result.rows[0]);
  client.end();
});
nftrouter.get("/:collectionddress/:tokenid/getNFTmetadata", async (req, res) => {
  const client = await connection();
  const result = await client.query(
    `SELECT * FROM rentinfo WHERE collection_address = '${req.params.collectionddress}' and token_id = ${req.params.tokenid}`
  );

  res.send(result.rows[0]);
  client.end();
});





export default nftrouter;
