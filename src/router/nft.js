import express, { query } from "express";
import connection from "../connection.js";
import { getTokenURI } from "../utils.js";
const nftrouter = express.Router();

async function getNFTmetadata(collection, token_id, client) {
  let url = await getTokenURI(collection, token_id)
  fetch(url)
    .then((response) => response.json())
    .then(async (data) => {
      const attributes = await JSON.stringify(data.attributes)
      const query =
        `INSERT INTO nft (collection_address, token_id, name, description, image, property) VALUES($1, $2, $3, $4, $5, $6) ON CONFLICT` +
        `(collection_address, token_id) DO UPDATE SET name=$3, description=$4, image=$5, property=$6`;
      await client
        .query(query, [
          collection,
          token_id,
          data.name,
          data.description,
          data.image,
          attributes,
        ])
        .catch((err) => console.log(err));

      await client.end()
    });
}

nftrouter.get("/kicklist", async (req, res) => {
  const client = await connection();
  const query = `SELECT * FROM nft 
  INNER JOIN rentinfo ON nft.collection_address = rentinfo.collection_address and nft.token_id = rentinfo.token_id
  WHERE rentinfo.renter_address is NOT NULL
  ORDER by rentinfo.rent_block+rentinfo.rent_duration  asc
  LIMIT ${req.query.size} offset ${
    (parseInt(req.query.page) - 1) * req.query.size
  }`;
  const result = await client.query(query);

  res.send(result.rows);
  client.end();
});

nftrouter.get("/:collectionaddress/:tokenid", async (req, res) => {
  const client = await connection();
  const result = await client.query(
    `SELECT nft.collection_address, token_id, nft.name, nft.description, nft.image, nft.property, "owner", website, discord, twitter FROM nft
    LEFT JOIN collection ON nft.collection_address = '${req.params.collectionaddress}'
    WHERE nft.collection_address = '${req.params.collectionaddress}' and nft.token_id = ${req.params.tokenid}`
  );

  res.send(result.rows[0]);
  client.end();
});

nftrouter.get("/:collectionaddress/:tokenid/activity", async (req, res) => {
  const client = await connection();
  const result = await client.query(
    `SELECT tx_hash, "from", "event", block, collateral_amount, fee_amount FROM transaction 
            WHERE collection_address = '${req.params.collectionaddress}' and token_id = ${req.params.tokenid}
            ORDER BY block desc limit 5`
  );

  res.send(result.rows);
  client.end();
});

nftrouter.get("/:collectionaddress/:tokenid/rentinfo", async (req, res) => {
  const client = await connection();
  const result = await client.query(
    `SELECT * FROM rentinfo WHERE collection_address = '${req.params.collectionaddress}' and token_id = ${req.params.tokenid}`
  );
  res.send(result.rows[0]);
  client.end();
});
nftrouter.get(
  "/:collectionaddress/:tokenid/getNFTmetadata",
  async (req, res) => {
    const client = await connection();
    await getNFTmetadata(req.params.collectionaddress, req.params.tokenid, client)
    await res.send("Success");
  }
);

export default nftrouter;
