import express from "express"
import connection from "../connection.js";
const router = express.Router();


router.get("/:useraddress", async (req, res) => {
    const client = await connection();
    const result = await client.query(
        `SELECT * FROM "user";`
    )
    res.send(result.rows);
    client.end()    
})

router.get("/:useraddress/activity", async (req, res) => {
    const client = await connection();
    const result = await client.query(
        `SELECT * FROM transaction WHERE transaction.from_address = '${req.params.useraddress}'`
    )

    res.send(result.rows);
    client.end()    
})

router.get("/:useraddress/NFTs", async (req, res) => {
    const client = await connection();
    const result = await client.query(
        `SELECT * FROM nft WHERE owner = '${req.params.useraddress}'`
    )

    res.send(result.rows);
    client.end()    
})

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