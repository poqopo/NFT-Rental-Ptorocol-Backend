import dotenv from "dotenv";
import connect from "./connection.js";
import { getTokenURI, checkIPFS, getContractURI } from "./utils.js";

export async function transferEvent(result) {
  const client = await connect();
  const contents = await result.returnValues;
  const ownerquery = `UPDATE nft SET "owner"=$3 WHERE collection_address=$1 AND token_id=$2;`;
  await client
    .query(ownerquery, [
      result.address.toLowerCase(),
      contents.tokenId,
      contents.to.toLowerCase(),
    ])
    .then((res) => {
      client.end(console.log("Closed client connection"));
    })
    .catch((e) => console.log(e));
}

export async function listEvent(result) {
  const client = await connect();
  const query =
    `INSERT INTO rentinfo (lender_address, collateral_token, collection_address, token_id, maxrent_duration, collateral_amount, rent_fee_per_block) VALUES($1,$2,$3,$4,$5,$6,$7) ON CONFLICT` +
    `(collection_address, token_id) DO UPDATE SET lender_address=$1, collateral_token=$2, maxrent_duration=$5, collateral_amount=$6, rent_fee_per_block=$7`;

  const contents = await result.returnValues;
  await client
    .query(query, [
      contents.from_address.toLowerCase(),
      contents.collateral_token.toLowerCase(),
      contents.collection_address.toLowerCase(),
      contents.token_id,
      contents.max_rent_duration,
      contents.collateral_amount,
      contents.rent_fee_per_block,
    ])

    .then((res) => {
      transaction(result);
    })
    .catch((e) => console.log(e));
}

export async function cancelEvent(result) {
  const client = await connect();
  const query =
    "DELETE FROM rentinfo WHERE collection_address = $1 AND token_id = $2";
  const contents = await result.returnValues;
  client
    .query(query, [contents.collection_address.toLowerCase(), contents.token_id])
    .then((res) => {
      transaction(result);
    })
    .catch((err) => console.log(err));
}

export async function modifyEvent(result) {
  const client = await connect();
  const contents = await result.returnValues;
  const OPTIONS = [
    "collateral_token",
    "maxrent_duration",
    "collateral_amount",
    "rent_fee_per_block",
  ];
  const query = `UPDATE rentinfo SET ${
    OPTIONS[contents.parameter]
  } = $3 WHERE collection_address = $1 and token_id = $2`;

  client
    .query(query, [
      contents.collection_address.toLowerCase(),
      contents.token_id,
      contents.input,
    ])
    .then((res) => {
      transaction(result);
    })
    .catch((err) => console.log(err));
}

export async function rentEvent(result) {
  const client = await connect();
  const contents = await result.returnValues;

  const query = `UPDATE rentinfo
  SET renter_address=$1, rent_duration=$4, rent_block=$5
  WHERE collection_address=$2 AND token_id=$3;
  `;
  client
    .query(query, [
      contents.from_address.toLowerCase(),
      contents.collection_address.toLowerCase(),
      contents.token_id,
      contents.rent_duration,
      result.blockNumber,
    ])
    .then((res) => {
      transaction(result);
    })
    .catch((err) => console.log(err));
}

export async function endingEvent(result) {
  const client = await connect();
  const contents = await result.returnValues;

  const deletequery =
    "DELETE FROM rentinfo WHERE collection_address=$1 AND token_id=$2";

  client
    .query(deletequery, [contents.collection_address.toLowerCase(), contents.token_id])
    .catch((err) => console.log(err));
  const insertquery = `INSERT INTO "transaction"
  (tx_hash, "from", "event", block, collection_address, token_id, collateral_amount, fee_amount) VALUES($1, $2, $3, $4, $5, $6, $7, $8)`;
  client
    .query(insertquery, [
      result.transactionHash,
      contents.from_address.toLowerCase(),
      result.event,
      result.blockNumber,
      contents.collection_address.toLowerCase(),
      contents.token_id,
      contents.collateral_amount,
      contents.rent_fee,
    ])
    .then((res) => {
      client.end(console.log("Closed client connection"));
    })
    .catch((err) => console.log(err));
}

export async function transaction(result) {
  const client = await connect();
  const contents = await result.returnValues;
  const query = 
    `INSERT INTO "transaction" (tx_hash, "from", "event", block, collection_address, token_id) VALUES($1,$2,$3,$4,$5,$6)`;
  client
    .query(query, [
      result.transactionHash,
      contents.from_address.toLowerCase(),
      result.event,
      result.blockNumber,
      contents.collection_address.toLowerCase(),
      contents.token_id,
    ])
    .then((res) => {
      client.end(console.log("Closed client connection"));
    })
    .catch((err) => console.log(err));
}

export async function contractEvent(result) {
  if (result.event === "NFTlisted") {
    listEvent(result);
  } else if (result.event === "NFTlistcancel") {
    cancelEvent(result);
  } else if (result.event === "NFTlistmodified") {
    modifyEvent(result);
  } else if (result.event === "NFTrented") {
    rentEvent(result);
  } else {
    endingEvent(result);
  }
}
