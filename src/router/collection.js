import express from "express";
import connect from "../connection.js";
import erc721json from "../../ERC721.json" assert { type: "json" };
import dotenv from "dotenv";
import Caver from "caver-js";
import { getTokenURI, checkIPFS, getContractURI, getNFTowner } from "../utils.js";
dotenv.config();

const router = express.Router();

async function getNFTmetadata(collection, token_id, client) {
  let url = await getTokenURI(collection, token_id)
  fetch(await checkIPFS(url))
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
    });
}

async function getOwner(collection, token_id, client) {
  
  let owner = await getNFTowner(collection, token_id)
  const query = `UPDATE nft SET "owner"=$3 WHERE collection_address=$1 AND token_id=$2;`;
  await client
  .query(query, [
    collection,
    token_id,
    owner.toLowerCase(),
  ])
}

router.get(
  "/getNFTmetadata/:collectionaddress/:starttokenid/:endtokenid",
  async (req, res) => {
    const client = await connect();
    for (let i = req.params.starttokenid; i <= req.params.endtokenid; i++) {
      await getNFTmetadata(req.params.collectionaddress, i, client)
      await getOwner(req.params.collectionaddress, i, client)
    }
    res.send('Success');
  }

);

router.get(
  "/getContractmetadata/:collectionaddress/:name/:decription/:image/:website/:discord/:twitter/:banner",
  async (req, res) => {
    const client = await connect()
      const query = `INSERT INTO collection
      (collection_address, "name", description, image, website, discord, twitter, banner)
      VALUES($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (collection_address) DO UPDATE SET
      "name" = $2, description=$3, image=$4, website=$5, discord=$6, twitter=$7, banner=$8;
      `
      await client.query(query, [
        req.params.collectionaddress,
        req.params.name,
        req.params.decription,
        req.params.image,
        req.params.website,
        req.params.discord,
        req.params.twitter,
        req.params.banner
      ])

      res.send("Sucess")
      client.end();
  }
);


export default router;
