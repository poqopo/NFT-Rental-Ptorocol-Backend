import express from "express";
import cors from "cors";
import bodyParser from "body-parser"
import user from "./router/user.js"
import nftrouter from "./router/nft.js"
import collection from "./router/collection.js"

//express 사용
const app = express();
app.use(cors());
//Express 4.16.0버전 부터 body-parser의 일부 기능이 익스프레스에 내장 body-parser 연결
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/nft', nftrouter)
app.use('/collection', collection)
app.use('/user', user)

app.get('/', (req, res)=>{
  res.send('hello aws!')
})

// http listen port 생성 서버 실행
app.listen(8000, () => console.log("제발 돼라"));
