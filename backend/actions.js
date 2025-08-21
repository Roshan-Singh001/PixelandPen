import express from 'express';
import db from './db.js';
const actionRouter = express.Router();

actionRouter.get('/isfollow/cont/', async (req,res)=>{
    const userId = req.headers['user_id'];
    const cont_id = req.headers['cont_id'];

    try {
        const query = `SELECT id FROM reader_follows WHERE contributor_id=? AND reader_id=?`;
        const [results] = await db.query(query,[cont_id,userId]);
        const isFollow = results.length > 0; 

        res.json({isFollow});
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error Fetching Profile Info"});
        
    }

});

actionRouter.post('/follow/cont',async (req,res)=>{
    const {cont_id,user_id,follow} = req.body;

    console.log(cont_id);
    console.log(user_id);
    console.log(follow);

    try {
        if (follow) {
            const query = `UPDATE contributor SET followers=followers+1 WHERE cont_id=?`;
            await db.query(query,[cont_id]);

            const query1 = `INSERT INTO reader_follows (reader_id,contributor_id) VALUES (?,?)`;
            await db.query(query1,[user_id,cont_id]);
            
            res.json({message: "Followed"});
        }
        else{
            const query = `UPDATE contributor SET followers=followers-1 WHERE cont_id=?`;
            await db.query(query,[cont_id]);
            const query1 = `DELETE FROM reader_follows WHERE reader_id=? AND contributor_id=?`;
            await db.query(query1,[user_id,cont_id]);
                
            res.json({message: "Unfollowed"});

        }
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error Fetching Profile Info"});
        
    }
});



export default actionRouter;