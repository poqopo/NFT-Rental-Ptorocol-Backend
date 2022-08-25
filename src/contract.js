import Caver from "caver-js";
import rentjson from "./RentERC721.json"


const caver = new Caver(window.klaytn)
const rentcontract = new caver.klay.Contract(rentjson.abi, "0x7F68f9A977C7E6aC7d4B25Af301c88f2AC4D74F0")

export async function rent(collection, tokenid, rentduration){
    try {
        await rentcontract.methods.rent(collection, tokenid, rentduration)
        .send({
          from: window.klaytn.selectedAddress,
          gas: 3000000
        })
    } catch(e) {console.log(e)} 
}

export async function listNFT(collection, collat, tokenid, maxrentduration, collatamount, rentfeeperblock){
    try {
        await rentcontract.methods.listNFT(collection, collat, tokenid, maxrentduration, collatamount, rentfeeperblock)
        .send({
          from: window.klaytn.selectedAddress,
          gas: 3000000
        })
    } catch(e) {console.log(e)} 
}

export async function kickNFT(collection, tokenid){
    try {
        await rentcontract.methods.kick(collection, tokenid)
        .send({
          from: window.klaytn.selectedAddress,
          gas: 3000000
        })
    } catch(e) {console.log(e)} 
}



export async function daytoblock(day){
    return day * 60*60*24
}

export async function blocktoday(block){
    return block /60 /60 /24
}