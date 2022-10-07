import pg from "pg";
import dotenv from "dotenv";
import {getTokenURI} from "./utils";
dotenv.config();

export default function query(result) {
  const config = {
    host: process.env.host,
    user: process.env.user,
    password: process.env.password,
    database: process.env.database,
    port: process.env.port,
  };

  const client = new pg.Client(config);

  client.connect((err) => {
    if (err) throw err;
    else {
      queryDatabase(result);
    }
  });

  const nftTransfer = async (data) => {
    const query = `INSERT INTO nft_transaction (tx_hash, "from", "to", "event", block, collection_address, token_id)VALUES($1, $2, $3, $4, %5, %6, %7)`

    const contents = await data.returnValues
    await client.query(query, [
      data.transactionHash,
      contents.from.toLowerCase(),
      contents.to.toLowerCase(),
      data.event,
      data.blockNumber,
      contents.collection_address,
      contents.token_id
    ])
    .then((res) => {
      console.log(`${contents.collection_address} ${contents.token_id} transfer event`)
      client.end(console.log('Closed client connection'));
    })
    .catch((e) => console.log(e))
  };

//   const getNFTmetadata = async (data) => {
//     const contents = await data.returnValues

//     const query = `INSERT INTO nft
//     (collection_address, token_id, nft_name, nft_description, nft_image, nft_property) VALUES($1, $2, $3, $4, $5, $6) ON CONFLICT (collection_address, token_id)
//     DO UPDATE SET nft_name=3, nft_description=$4, nft_image=$5, nft_property=$6`

//     const metadata = await getTokenURI(contents.collection_address, contents.token_id);



//     await client.query(query,[
//       contents.collection_address,
//       contents.token_id,
//     ])
//   }

//   const NFTlist = async (data) => {
//     const query =
//       'INSERT INTO public."ListedNFT" (collection_address, token_id, holder_account, collateral_token, collateral_amount, max_rent_duration, rent_fee_per_block, link) VALUES($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT ' +
//       "(collection_address, token_id) DO UPDATE SET collection_address=$1, token_id=$2, holder_account=$3, collateral_token=$4, collateral_amount=$5, max_rent_duration=$6, rent_fee_per_block=$7, link=$8";

//     const contents = await data.returnValues;

//     await client
//       .query(query, [
//         contents.collection_address,
//         contents.token_id,
//         contents.from_address.toLowerCase(),
//         contents.collateral_token,
//         contents.collateral_amount,
//         contents.max_rent_duration,
//         contents.rent_fee_per_block,
//         "Rent",
//       ])
//       .then((res) => {
//         console.log("LISTEDNFT UPSERT successfully!");
//         // client.end(console.log('Closed client connection'));
//       })
//       .catch((err) => console.log(err))
//       .then(() => {
//         console.log("Finished execution, exiting now");
//       });
//   };

//   const NFTModify = async (data) => {
//     console.log("find NFTmodify event");
//     const OPTIONS = [
//       "max_rent_duration",
//       "collateral_amount",
//       "rent_fee_per_block",
//     ];

//     const contents = await data.returnValues;

//     contents.parameter.map((i, index) => {
//       const query = `UPDATE public."ListedNFT" SET ${OPTIONS[i]} = $3 WHERE collection_address = $1 and token_id = $2`;

//       client
//         .query(query, [
//           contents.collection_address,
//           parseInt(contents.token_id),
//           parseInt(contents.input[index]),
//         ])
//         .then((res) => {
//           console.log("MODIFIEDNFT UPSERT successfully!");
//           // client.end(console.log('Closed client connection'));
//         })
//         .catch((err) => console.log(err))
//         .then(() => {
//           console.log("Finished execution, exiting now");
//         });
//     });
//   };

//   const NFTinfo = async (data) => {
//     console.log("Welcome to NFTinfo!");
//     const contents = data.returnValues;
//     const caver = await new Caver(process.env.caver);

//     const erc721 = await new caver.klay.Contract(
//       erc721json.abi,
//       contents.collection_address
//     );

//     const url = await erc721.methods.tokenURI(contents.token_id).call();

//     if (url.startsWith("ipfs://")) {
//       fetch("https://ipfs.io/ipfs/" + url.split("ipfs://")[1])
//         .then((response) => response.json())
//         .then((data) => {
//           const query =
//             'INSERT INTO public."NFT" (collection_address, token_id, nft_name, nft_image, description) VALUES($1,$2,$3,$4,$5) ON CONFLICT ' +
//             "(collection_address, token_id) DO UPDATE SET collection_address=$1, token_id=$2, nft_name=$3, nft_image=$4, description=$5";
//           client
//             .query(query, [
//               contents.collection_address,
//               parseInt(contents.token_id),
//               data.name,
//               "https://ipfs.io/ipfs/" + data.image.split("ipfs://")[1],
//               data.description,
//             ])
//             .then((res) => {
//               console.log("NFT UPSERT successfully!");
//             })
//             .catch((err) => console.log(err))
//             .then(() => {
//               console.log("Finished execution, exiting now");
//             });
//         });
//     } else {
//       fetch(url)
//         .then((response) => response.json())
//         .then((data) => {
//           const query =
//             'INSERT INTO public."NFT" (collection_address, token_id, nft_name, nft_image, description) VALUES($1,$2,$3,$4,$5) ON CONFLICT ' +
//             "(collection_address, token_id) DO UPDATE SET collection_address=$1, token_id=$2, nft_name=$3, nft_image=$4, description=$5";
//           client
//             .query(query, [
//               contents.collection_address,
//               parseInt(contents.token_id),
//               data.name,
//               data.image,
//               data.description,
//             ])
//             .then((res) => {
//               console.log("NFT UPSERT successfully!");
//             })
//             .catch((err) => console.log(err))
//             .then(() => {
//               console.log("Finished execution, exiting now");
//             });
//         });
//     }
//   };

//   const NFTcancel = (data) => {
//     console.log("find NFTcancel event");

//     const query =
//       'DELETE FROM public."ListedNFT" WHERE collection_address=$1 AND token_id=$2';
//     const contents = data.returnValues;

//     client
//       .query(query, [contents.collection_address, parseInt(contents.token_id)])
//       .then((res) => {
//         console.log("DELETE successfully!");
//       })
//       .catch((err) => console.log(err))
//       .then(() => {
//         console.log("Finished execution, exiting now");
//       });
//   };

//   const NFTrent = async (data) => {
//     console.log("find NFTrent event");

//     const query =
//       'INSERT INTO public."RentedNFT" (collection_address, token_id, renter_accounts, rent_block, rent_duration, rent_fee) VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT ' +
//       "(collection_address, token_id) DO UPDATE SET collection_address=$1, token_id=$2, renter_accounts=$3, rent_block=$4, rent_duration=$5, rent_fee=$6";
//     const contents = await data.returnValues;

//     await client
//       .query(query, [
//         contents.collection_address,
//         parseInt(contents.token_id),
//         contents.from_address.toLowerCase(),
//         parseInt(contents.rented_block),
//         parseInt(contents.rent_duration),
//         parseInt(contents.rent_fee),
//       ])
//       .then((res) => {
//         console.log("RENTED UPSERT successfully!");
//       })
//       .catch((err) => console.log(err))
//       .then(() => {
//         console.log("Finished execution, exiting now");
//       });

//     const query1 = `UPDATE public."ListedNFT" SET link='Kick' WHERE collection_address=$1 AND token_id=$2`;

//     client
//       .query(query1, [contents.collection_address, parseInt(contents.token_id)])
//       .then((res) => {
//         console.log("RENTED UPSERT successfully!");
//       })
//       .catch((err) => console.log(err))
//       .then(() => {
//         console.log("Finished execution, exiting now");
//       });
//   };

//   const Transaction = (data) => {
//     console.log("find transaction event");

//     const query =
//       'INSERT INTO public."transaction" (tx_hash, collection_address, token_id, from_address, event, transaction_block) VALUES($1,$2,$3,$4,$5,$6)';
//     const contents = data.returnValues;

//     client
//       .query(query, [
//         data.transactionHash,
//         contents.collection_address,
//         parseInt(contents.token_id),
//         contents.from_address,
//         data.event,
//         parseInt(data.blockNumber),
//       ])
//       .then((res) => {
//         console.log("INSERT transaction successfully!");
//       })
//       .catch((err) => console.log(err))
//       .then(() => {
//         console.log("Finished execution, exiting now");
//       });
//   };

//   const Endtransaction = (data) => {
//     console.log(`find ${data.event} event`);

//     const query =
//       'delete from public."RentedNFT" where collection_address =$1 and token_id=$2';
//     const contents = data.returnValues;

//     client
//       .query(query, [contents.collection_address, parseInt(contents.token_id)])
//       .then((res) => {
//         console.log("ReturnedNFT update successfully!");
//       })
//       .catch((err) => console.log(err))
//       .then(() => {
//         console.log("Finished execution, exiting now");
//       });

//     const query1 =
//       'DELETE FROM public."ListedNFT" WHERE collection_address=$1 AND token_id=$2';
//     client
//       .query(query1, [contents.collection_address, parseInt(contents.token_id)])
//       .then((res) => {
//         console.log("DELETE successfully!");
//       })
//       .catch((err) => console.log(err))
//       .then(() => {
//         console.log("Finished execution, exiting now");
//       });
//   };

//   async function queryDatabase(data) {
//     if (data.event === "NFTlist") {
//       NFTlist(data);
//       NFTinfo(data);
//     } else if (data.event === "NFTlistcancel") {
//       NFTcancel(data);
//     } else if (data.event === "NFTrented") {
//       NFTrent(data);
//     } else if (data.event === "NFTlistmodified") {
//       NFTModify(data);
//     } else {
//       Endtransaction(data);
//     }

//     Transaction(data);
//   }
// }
