import express from "express";
import connection from "../connection.js";
const router = express.Router();

router.get("/activity/:useraddress", async (req, res) => {
  const client = await connection();
  const result = await client.query(
    `SELECT * FROM transaction WHERE transaction.from = '${req.params.useraddress}'`
  );

  res.send(result.rows);
  client.end();
});

router.get("/nfts/:useraddress", async (req, res) => {
  const client = await connection();
  const view = req.query.view;
  const sort = req.query.sort;
  const query = `SELECT * FROM nft 
    INNER JOIN rentinfo ON nft.collection_address = rentinfo.collection_address and nft.token_id = rentinfo.token_id
    WHERE ${
      view !== ""
        ? `${view} = '${req.params.useraddress}'`
        : `lender_address = '${req.params.useraddress}' or renter_address = '${req.params.useraddress}' or owner = '${req.params.useraddress}'`
    } 
     ${sort !== "" ? sort : ""} LIMIT ${req.query.size} offset ${
    (parseInt(req.query.page) - 1) * req.query.size
  }`;

  const result = await client.query(query);

  res.send(result.rows);
  client.end();
});

router.get("/:useraddress", async (req, res) => {
  const client = await connection();
  const result = await client.query(
    `SELECT user_address, image, nickname FROM "user" WHERE user_address = '${req.params.useraddress}'`
  );
  res.send(result.rows[0]);
  client.end();
});

// router.post('/:collectionddress', (req, res) => {

//     const course = {
//         id: courses.length + 1,
//         name: req.body.name
//     };
//     courses.push(course);
//     res.send(course);
// });

// router.put('/:collectionddress', (req, res) => {
//     const course = courses.find(c => c.id === parseInt(req.params.id))
//     if(!course) return res.status(404).send('The course with the given ID was not found');

//     const { error } = validateCourse(req.body); //result.error
//     if(error) return res.status(400).send(error.details[0].message);

//     course.name = req.body.name;
//     res.send(course);
// });

export default router;
