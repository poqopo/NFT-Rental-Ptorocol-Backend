import express from "express"
import connection from "../connection";
const router = express.Router();


router.get("/:collectionddress/:tokenid", async (req, res) => {
    const client = await connection();
    const result = await client.query(
        `SELECT * FROM nft WHERE collection_address = '${req.params.collectionddress}' and token_id = ${req.params.tokenid}`
    )

    res.send(result);
    client.end()    
})

router.get("/:collectionddress/:tokenid/activity", async (req, res) => {
    const client = await connection();
    const result = await client.query(
        `SELECT tx_hash, "from", "to", block FROM nft_transaction 
        WHERE collection_address = '${req.params.collectionddress}' and token_id = ${req.params.tokenid}
        ORDER BY block desc limit 5`
    )

    res.send(result);
    client.end()    
})

router.get("/:collectionddress/:tokenid/rentinfo", async (req, res) => {
    const client = await connection();
    const result = await client.query(
        `SELECT * FROM rentinfo WHERE collection_address = '${req.params.collectionddress}' and token_id = ${req.params.tokenid}`
    )

    res.send(result);
    client.end()    
})



export default router;