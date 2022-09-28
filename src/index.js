import express from "express";
import { connection } from "./query.js";
import cors from "cors";
//express 사용
const app = express();
app.use(cors());
//Express 4.16.0버전 부터 body-parser의 일부 기능이 익스프레스에 내장 body-parser 연결
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res)=>{
  res.json({test:'1'})
})

app.get("/api/NFT/listed", async (req, res) => {
  const client = await connection();
  client.query(
    `SELECT LIST.*, NFT.nft_name, NFT.nft_image, NFT.description FROM public."ListedNFT" as LIST INNER JOIN  public."NFT" as NFT ON LIST.collection_address = NFT.collection_address and LIST.token_id = NFT.token_id WHERE link='Rent'`,
    (err, rows, fields) => {
      if (err) {
        console.log("데이터 가져오기 실패");
      } else {
        res.send(rows.rows);
        client.end()
      }
    }
  );
});

app.get("/api/NFT/rented", async (req, res) => {
  const client = await connection();
  client.query(
    'SELECT RENT.*, NFT.nft_name, NFT.nft_image, NFT.description FROM public."RentedNFT" as RENT INNER JOIN  public."NFT" as NFT ON RENT.collection_address = NFT.collection_address and RENT.token_id = NFT.token_id',
    (err, rows, fields) => {
      if (err) {
        console.log("데이터 가져오기 실패");
      } else {
        res.send(rows.rows);
        client.end()
      }
    }
  );
});
app.get("/api/NFT/search/:collectionname", async (req, res) => {

  const client = await connection();

  const iteminfo = await client.query(
    `SELECT LIST.*, NFT.nft_name, NFT.nft_image
    FROM public."ListedNFT" as LIST
    INNER JOIN  public."NFT" as NFT ON LIST.collection_address = NFT.collection_address and LIST.token_id = NFT.token_id
    WHERE NFT.nft_name = '${req.params.collectionname}'`
  )
    const result = iteminfo.rows
  res.send(result);
  client.end()
});

app.get("/api/:contractaddress/:tokenid/:detail", async (req, res) => {
  if (req.params.detail === "Rent") {
    const client = await connection();

    const listinfo = await client.query(
      `select * FROM public."ListedNFT" as LIST WHERE collection_address = '${req.params.contractaddress}' and token_id = ${req.params.tokenid}`
    );
    const nftinfo = await client.query(
      `select * FROM public."NFT" as NFT WHERE collection_address = '${req.params.contractaddress}' and token_id = ${req.params.tokenid}`
    );

    const result = await Object.assign(nftinfo.rows[0], listinfo.rows[0])
    res.send(result);
    client.end()


  }
   else {
    const client = await connection();

    const listinfo = await client.query(
      `select * FROM public."ListedNFT" as LIST WHERE collection_address = '${req.params.contractaddress}' and token_id = ${req.params.tokenid}`
    );
    const nftinfo = await client.query(
      `select * FROM public."NFT" as NFT WHERE collection_address = '${req.params.contractaddress}' and token_id = ${req.params.tokenid}`
    );
    const rentinfo = await client.query(
      `select * FROM public."RentedNFT" WHERE collection_address = '${req.params.contractaddress}' and token_id = ${req.params.tokenid}`
    );

    const result = await Object.assign(nftinfo.rows[0], listinfo.rows[0], rentinfo.rows[0])
    res.send(result);
    client.end()
  }
});
app.get("/api/NFT/:UserAddress", async (req, res) => {

  // console.log(req.params)
  const client = await connection();
  const rentinfo = await client.query(
    `SELECT RENT.*, NFT.nft_name, NFT.nft_image, NFT.description 
     FROM public."RentedNFT" as RENT 
     INNER JOIN  public."NFT" as NFT ON RENT.collection_address = NFT.collection_address and RENT.token_id = NFT.token_id
      WHERE RENT.renter_accounts = '${req.params.UserAddress}'`
  );
  const listinfo = await client.query(
    `SELECT 
      LIST.*, NFT.nft_name, NFT.nft_image, NFT.description 
    FROM public."ListedNFT" as LIST 
      INNER JOIN  public."NFT" as NFT ON (LIST.collection_address = NFT.collection_address and LIST.token_id = NFT.token_id)
    WHERE LIST.holder_account = '${req.params.UserAddress}'`
  )
    
  res.send([...rentinfo.rows, ...listinfo.rows]);
  client.end()
});



// http listen port 생성 서버 실행
app.listen(4000, () => console.log("제발 돼라"));
