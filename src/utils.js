import Caver from "caver-js";
import erc721json from "../ERC721.json" assert { type: "json" };

export async function getTokenURI(collection_address, token_id) {
    const caver = await new Caver(process.env.caver);

    const erc721 = await new caver.klay.Contract(
      erc721json.abi,
      contents.collection_address
    );

    const url = await erc721.methods.tokenURI(contents.token_id).call();
    return url;
}