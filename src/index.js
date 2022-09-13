import rentjson from "../RentERC721.json" assert { type: "json" };
import Caver from "caver-js";
import query from "./db/query.js";

const websocketProvider = new Caver.providers.WebsocketProvider(
  "wss://KASKLSEBOUNN9ZOB6LTNJY2K:nEVH0IteI8xRfgktkbjjsSTBN0onuqgLSsHvZazH@node-api.klaytnapi.com/v1/ws/open?chain-id=1001"
);

const caver = new Caver(websocketProvider);


setInterval(async () => {
  const block = await caver.rpc.klay.getBlockNumber();
  console.log(block);
}, "59000");

const rentcontract = new caver.klay.Contract(
  rentjson.abi,
  "0x208291a2279882Cb6aC238977735eddd5d6e283C"
);


rentcontract.events.allEvents({}, (err, result) => {
  query(result)
});
