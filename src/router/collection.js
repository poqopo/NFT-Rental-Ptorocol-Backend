import express from "express";
import connection from "../connection.js";
const router = express.Router();

router.get("/collections", async (req, res) => {
  const client = await connection();
  const result = await client.query(
    `SELECT * FROM collection LIMIT ${req.query.size} offset ${(parseInt(req.query.page) -1) * req.query.size}`
  );
// 
  res.send(result.rows);
  client.end();
});

router.get("/nfts/:collectionAddress/", async (req, res) => {
  const client = await connection();
  const result = await client.query(
    `SELECT * FROM nft WHERE nft.collection_address = '${req.params.collectionAddress}' ORDER BY token_id ASC LIMIT ${req.query.size} offset ${(parseInt(req.query.page) -1) * req.query.size}`
  );

  res.send(result.rows);
  client.end();
});

router.get("/nfts/:collectionAddress/view/listed", async (req, res) => {
  const client = await connection();
  const result = await client.query(
    `SELECT * FROM nft 
        INNER JOIN rentinfo ON nft.collection_address = rentinfo.collection_address and nft.token_id = rentinfo.token_id
        WHERE nft.collection_address = '${req.params.collectionAddress}' and rentinfo.renter_address is NULL LIMIT ${req.query.size} offset ${(parseInt(req.query.page) -1) * req.query.size}`
  );

  res.send(result.rows);
  client.end();
});

router.get("/nfts/:collectionAddress/view/rented", async (req, res) => {
  const client = await connection();
  const result = await client.query(
    `SELECT * FROM nft 
        INNER JOIN rentinfo ON nft.collection_address = rentinfo.collection_address and nft.token_id = rentinfo.token_id
        WHERE nft.collection_address = '${req.params.collectionAddress}' and rentinfo.renter_address is NOT NULL LIMIT ${req.query.size} offset ${(parseInt(req.query.page) -1) * req.query.size}`
  );

  res.send(result.rows);
  client.end();
});

router.get("/nfts/:collectionAddress/sort/:sort", async (req, res) => {
  const client = await connection();
  const result = await client.query(
      `SELECT * FROM nft 
      INNER JOIN rentinfo ON nft.collection_address = rentinfo.collection_address and nft.token_id = rentinfo.token_id
      WHERE nft.collection_address = '${req.params.collectionAddress}'
      ORDER BY rentinfo.${req.params.sort} ASC LIMIT ${req.query.size} offset ${(parseInt(req.query.page) -1) * req.query.size}`
  )

  res.send(result.rows);
  client.end()    
})
router.get("/nfts/:collectionAddress/view/listed/sort/:sort", async (req, res) => {
  const client = await connection();
  const result = await client.query(
      `SELECT * FROM nft 
      INNER JOIN rentinfo ON nft.collection_address = rentinfo.collection_address and nft.token_id = rentinfo.token_id
      WHERE nft.collection_address = '${req.params.collectionAddress}' and rentinfo.renter_address is NULL
      ORDER BY rentinfo.${req.params.sort} ASC LIMIT ${req.query.size} offset ${(parseInt(req.query.page) -1) * req.query.size}`
  )

  res.send(result.rows);
  client.end()    
})
router.get("/nfts/:collectionAddress/view/rented/sort/:sort", async (req, res) => {
  const client = await connection();
  const result = await client.query(
      `SELECT * FROM nft 
      INNER JOIN rentinfo ON nft.collection_address = rentinfo.collection_address and nft.token_id = rentinfo.token_id
      WHERE nft.collection_address = '${req.params.collectionAddress}' and rentinfo.renter_address is NOT NULL
      ORDER BY rentinfo.${req.params.sort} ASC LIMIT ${req.query.size} offset ${(parseInt(req.query.page) -1) * req.query.size}`
  )

  res.send(result.rows);
  client.end()    
})



router.get("/:collectionAddress", async (req, res) => {
  const client = await connection();
  const result = await client.query(
    `SELECT * FROM collection WHERE collection_address = '${req.params.collectionAddress}';`
  );

  res.send(result.rows[0]);
  client.end();
});


router.post("/:collectionAddress", async (req, res) => {
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
