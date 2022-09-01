import express from 'express'
//express 사용
const app = express(); 

//Express 4.16.0버전 부터 body-parser의 일부 기능이 익스프레스에 내장 body-parser 연결 
app.use(express.json());
app.use(express.urlencoded({ extended: true}));

app.get("/", (req, res) => {
    res.send("Hello World");
});
  
// http listen port 생성 서버 실행
app.listen(4000, () => console.log("개발이 취미인 남자 :)"));