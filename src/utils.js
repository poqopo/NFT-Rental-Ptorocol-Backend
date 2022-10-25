import Caver from "caver-js";
import erc721json from "../ERC721.json" assert { type: "json" };

export async function getTokenURI(collection_address, token_id) {
  const caver = await new Caver(process.env.caver);

  const erc721 = await new caver.klay.Contract(
    erc721json.abi,
    collection_address
  );
  return await erc721.methods.tokenURI(token_id).call();
}
export async function getNFTowner(collection_address, token_id) {
  const caver = await new Caver(process.env.caver);

  const erc721 = await new caver.klay.Contract(
    erc721json.abi,
    collection_address
  );
  return await erc721.methods.ownerOf(token_id).call();
}

export async function getContractURI(collection_address) {
  const caver = await new Caver(process.env.caver);

  const erc721 = await new caver.klay.Contract(
    erc721json.abi,
    collection_address
  );
  return await erc721.methods.contractURI().call();
}

export async function checkIPFS(url) {
  if (url.startsWith("ipfs://")) {
    return "https://ipfs.io/ipfs/" + url("ipfs://")[1];
  } else {
    return url;
  }
}
