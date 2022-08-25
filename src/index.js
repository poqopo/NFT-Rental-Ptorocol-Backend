import rentjson from "../RentERC721.json" assert { type: "json" };
import Caver from "caver-js";
import query from "./db/query.js";

const websocketProvider = new Caver.providers.WebsocketProvider(
  "wss://public-node-api.klaytnapi.com/v1/baobab/ws"
);

const caver = new Caver(websocketProvider);


setInterval(async () => {
  const block = await caver.rpc.klay.getBlockNumber();
  console.log(block);
}, "59000");

const rentcontract = new caver.klay.Contract(
  rentjson.abi,
  "0x1c496f3cE52534238bee5E6E18Ac230BBe5530ff"
);


rentcontract.events.allEvents({}, (err, result) => {
  console.log("send data to database")
  query(result)
  // console.log(result.returnValues)
});
