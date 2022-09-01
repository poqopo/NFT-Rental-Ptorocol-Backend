import express from 'express'
import { connection } from './query.js';
import cors from "cors"
//express 사용
const app = express(); 
app.use(cors())
//Express 4.16.0버전 부터 body-parser의 일부 기능이 익스프레스에 내장 body-parser 연결 
app.use(express.json());
app.use(express.urlencoded({ extended: true}));


app.get("/api/NFTinfo", async (req, res) => {
  const client =  await connection();
  client.query('SELECT * FROM public."NFT"', (err, rows, fields) => {
    if (err) {
      console.log("데이터 가져오기 실패");
    } else {
      res.send(rows.rows)
    }
  });
});

app.get("/api/NFTinfo", async (req, res) => {
  const client =  await connection();
  client.query('SELECT * FROM public."NFT"', (err, rows, fields) => {
    if (err) {
      console.log("데이터 가져오기 실패");
    } else {
      res.send(rows.rows)
    }
  });
});
  
// http listen port 생성 서버 실행
app.listen(4000, () => console.log("제발 돼라"));