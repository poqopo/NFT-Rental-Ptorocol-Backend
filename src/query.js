import dotenv from "dotenv";
import connect from "./connection.js";
import { getTokenURI, checkIPFS, getContractURI } from "./utils.js";

export async function transferEvent(result) {
  const client = await connect();
  const query = `INSERT INTO nft_transaction (tx_hash, "from", "to", "event", block, collection_address, token_id)VALUES($1, $2, $3, $4, $5, $6, $7)`;

  const contents = await result.returnValues;
  await client
    .query(query, [
      result.transactionHash,
      contents.from.toLowerCase(),
      contents.to.toLowerCase(),
      result.event,
      result.blockNumber,
      result.address,
      contents.tokenId,
    ])
    .catch((e) => console.log(e));

  const ownerquery = `UPDATE nft "owner"=$3 WHERE collection_address=$1 AND token_id=$2;`;
  await client
    .query(ownerquery, [
      result.address,
      contents.tokenId,
      contents.to.toLowerCase(),
    ])
    .catch((e) => console.log(e));
}

export async function batchTransferEvent(result) {
  const client = await connect();
  const query = `INSERT INTO nft_transaction (tx_hash, "from", "to", "event", block, collection_address, token_id)VALUES($1, $2, $3, $4, $5, $6, $7)`;
  const ownerquery = `UPDATE nft "owner"=$3 WHERE collection_address=$1 AND token_id=$2;`;
  let counter = result.length;

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

export async function getNFTmetadata(collection, token_id) {
  const client = await connect();
  fetch(await checkIPFS(await getTokenURI(collection, token_id)))
    .then((response) => response.json())
    .then(async (data) => {
      const query =
        `INSERT INTO nft (collection_address, token_id, nft_name, nft_description, nft_image, nft_property) VALUES($1, $2, $3, $4, $5, $6) ON CONFLICT` +
        `(collection_address, token_id) DO UPDATE SET nft_name=$3, nft_description=$4, nft_image=$5, nft_property=$6`;
      await client
        .query(query, [
          collection,
          token_id,
          data.name,
          data.description,
          await checkIPFS(data.image),
          data.attributes,
        ])
        .catch((err) => console.log(err));
    });
}

export async function getContractmetadata(collection) {
  const client = await connect();
  fetch(await checkIPFS(await getContractURI(collection)))
    .then((response) => response.json())
    .then(async (data) => {
      const query =
        `INSERT INTO collection (collection_address, collection_name, collection_description, collection_image, website, discord, twitter) VALUES($1,$2,$3,$4,$5,$6,$7) ` +
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

export async function listEvent(result) {
  const client = await connect();
  const query =
    `INSERT INTO rentinfo (lender_address, collateral_token, collection_address, token_id, maxrent_duration, collateral_amount, rent_fee_per_block) VALUES($1,$2,$3,$4,$5,$6,$7) ON CONFLICT` +
    `(collection_address, token_id) DO UPDATE SET lender_address=$1, collateral_token=$2, maxrent_duration=$5, collateral_amount=$6, rent_fee_per_block=$7`;

  const contents = await result.returnValues;
  await client
    .query(query, [
      contents.from_address.toLowerCase(),
      contents.collateral_token,
      contents.collection_address,
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
    "DELETE FROM rentinfo WHERE collection_address=$1 AND token_id=$2";
  const contents = await result.returnValues;

  client
    .query(query, [contents.collection_address, contents.token_id])
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
      contents.collection_address,
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
      contents.collection_address,
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
    .query(deletequery, [contents.collection_address, contents.token_id])
    .catch((err) => console.log(err));
  const insertquery = `INSERT INTO "transaction"
  (tx_hash, from_address, "event", transaction_block, collection_address, token_id, collateral_amount, fee_amount) VALUES($1, $2, $3, $4, $5, $6, $7, $8)`;
  client
    .query(insertquery, [
      result.transactionHash,
      contents.from_address.toLowerCase(),
      result.event,
      result.blockNumber,
      contents.collection_address,
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
    'INSERT INTO public."transaction" (tx_hash, collection_address, token_id, from_address, event, transaction_block) VALUES($1,$2,$3,$4,$5,$6)';
  client
    .query(query, [
      result.transactionHash,
      contents.collection_address,
      contents.token_id,
      contents.from_address.toLowerCase(),
      result.event,
      result.blockNumber,
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
