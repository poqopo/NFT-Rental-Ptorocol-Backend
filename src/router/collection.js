import express from "express";
import connect from "../connection.js";
import erc721json from "../../ERC721.json" assert { type: "json" };
import dotenv from "dotenv";
import Caver from "caver-js";
import { getTokenURI, checkIPFS, getContractURI } from "../utils.js";
dotenv.config();

const websocketProvider = new Caver.providers.WebsocketProvider(
  process.env.websocket
);

const caver = new Caver(websocketProvider);
const router = express.Router();

async function batchTransferEvent(result) {
  const client = await connect();
  const query = `INSERT INTO nft_transaction (tx_hash, "from", "to", "event", block, collection_address, token_id)VALUES($1, $2, $3, $4, $5, $6, $7)`;
  const ownerquery = `UPDATE nft SET "owner"=$3 WHERE collection_address=$1 AND token_id=$2;`;
  let counter = await result.length;

  await result.forEach(async function (data) {
    const contents = await data.returnValues;
    await client
      .query(query, [
        data.transactionHash,
        contents.from.toLowerCase(),
        contents.to.toLowerCase(),
        data.event,
        data.blockNumber,
        data.address,
        contents.tokenId,
      ])
      .catch((e) => console.log(e));
    await client
      .query(ownerquery, [
        result.address,
        contents.tokenId,
        contents.to.toLowerCase(),
      ])
      .catch((e) => console.log(e));
    counter--;
    if (counter == 0) {
      await console.log("Done!");
      await client.end(console.log("Closed client connection"));
    }
  });
}

async function getNFTmetadata(collection, token_id) {
  const client = await connect();
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

async function getContractmetadata(collection) {
  const client = await connect();
  fetch(await checkIPFS(await getContractURI(collection)))
    .then((response) => response.json())
    .then(async (data) => {
      const query =
        `INSERT INTO collection (collection_address, "name", collection_description, image, website, discord, twitter, banner) VALUES($1,$2,$3,$4,$5,$6,$7) ` +
        `ON CONFLICT (collection_address) DO UPDATE SET collection_name=$2, collection_description=$3, collection_image=$4, website=$5, discord=$6, twitter=$7`;
      await client
        .query(query, [
          collection,
          data.name,
          data.description,
          await checkIPFS(data.image),
          data.website,
          data.discord,
          data.twitter,
        ])
        .catch((err) => console.log(err));
    });
}


router.get("/collections", async (req, res) => {
  const client = await connect();
  const result = await client.query(`SELECT * FROM collection`);

  res.send(result.rows);
  client.end();
});

router.get(
  "/getBatchtransfer/:collectionaddress/:startblock",
  async (req, res) => {
    const NFTcontract = await new caver.klay.Contract(
      erc721json.abi,
      `${req.params.collectionaddress}`
    );
    await NFTcontract.getPastEvents(
      "Transfer",
      { fromBlock: `${req.params.startblock}`, toBlock: "latest" },
      (err, result) => {
        batchTransferEvent(result);
      }
    );
    res.send('Success');
  }
);

router.get(
  "/getNFTmetadata/:collectionaddress/:starttokenid/:endtokenid",
  async (req, res) => {
    for (let i = req.params.starttokenid; i <= req.params.endtokenid; i++) {
      await getNFTmetadata(req.params.collectionaddress, i)
    }
    res.send('Success');
  }
);

router.get(
  "/getContractmetadata/:collectionaddress",
  async (req, res) => {
      await getContractmetadata(req.params.collectionaddress)
      res.send('Success');
  }
);


export default router;
