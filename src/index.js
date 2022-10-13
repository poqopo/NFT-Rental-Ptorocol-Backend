import rentjson from "../RentERC721.json" assert { type: "json" };
import erc721json from "../ERC721.json" assert { type: "json" };
import Caver from "caver-js";
import {batchTransferEvent, getNFTmetadata, contractEvent, transferEvent} from "./query.js";
import dotenv from "dotenv";

dotenv.config();

const websocketProvider = new Caver.providers.WebsocketProvider(
  process.env.websocket
);

const caver = new Caver(websocketProvider);


setInterval(async () => {
  const block = await caver.rpc.klay.getBlockNumber();
  console.log(block);
}, "50000");

const rentcontract = new caver.klay.Contract(
  rentjson.abi,
  process.env.contract_address
);
const NFTcontract = new caver.klay.Contract(
  erc721json.abi,
  process.env.nft_address
)



rentcontract.events.allEvents({}, (err, result) => {
  contractEvent(result)
});
// NFTcontract.events.Transfer({}, (err, result) => {
//   transferEvent(result)
// });

// NFTcontract.getPastEvents('Transfer' , {fromBlock : 103532662, toBlock: 'latest'}, (err, result) => {
//   batchTransferEvent(result)
// })




