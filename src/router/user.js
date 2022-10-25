import express from "express";
import connection from "../connection.js";
const router = express.Router();

router.get("/activity/:useraddress", async (req, res) => {
  const client = await connection();
  const result = await client.query(
    `SELECT * FROM transaction WHERE transaction.from = '${req.params.useraddress}'`
  );

  res.send(result.rows);
  client.end();
});

router.get("/nfts/:useraddress", async (req, res) => {
  const client = await connection();
  const view = req.query.view;
  const sort = req.query.sort;
  const query = `SELECT * FROM nft 
    INNER JOIN rentinfo ON nft.collection_address = rentinfo.collection_address and nft.token_id = rentinfo.token_id
    WHERE ${
      view !== ""
        ? `${view} = '${req.params.useraddress}'`
        : `lender_address = '${req.params.useraddress}' or renter_address = '${req.params.useraddress}' or owner = '${req.params.useraddress}'`
    } 
     ${sort !== "" ? sort : ""} LIMIT ${req.query.size} offset ${
    (parseInt(req.query.page) - 1) * req.query.size
  }`;

  const result = await client.query(query);

  res.send(result.rows);
  client.end();
});

router.get("/:useraddress", async (req, res) => {
  const client = await connection();
  const result = await client.query(
    `SELECT user_address, image, nickname FROM "user" WHERE user_address = '${req.params.useraddress}'`
  );
  res.send(result.rows[0]);
  client.end();
});

router.get("/changeInfo/:useraddress", async (req, res) => {
  const client = await connection();
  const query = `INSERT INTO "user" (user_address, ${req.query.type}) VALUES($1, $2) ON CONFLICT (user_address) DO UPDATE SET ${req.query.type} = '${req.query.value}';
`;
  await client.query(query, [req.params.useraddress, req.query.value]);

  res.send("Success");
  client.end();
});

export default router;
