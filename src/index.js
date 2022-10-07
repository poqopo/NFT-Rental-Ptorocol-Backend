import rentjson from "../RentERC721.json" assert { type: "json" };
import Caver from "caver-js";
import query from "./query.js";
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


rentcontract.events.allEvents({}, (err, result) => {
  query(result)
});
