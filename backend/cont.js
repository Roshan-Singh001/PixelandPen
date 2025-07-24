import express from 'express';
const contriRouter = express.Router();
import db from './db.js';

contriRouter.get('/profile', async (req, res) => {
    const userId = req.headers['user_id'];

    try {
            const fetchinfoQuery = `SELECT username, bio, profile_pic, dob FROM contributor WHERE cont_id = ?`;
            const results = await db.query(fetchinfoQuery,userId);
    
            const profileInfo = results[0];
    
            res.json(profileInfo);
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Error Fetching Article"});
            
        }
});


  
export default contriRouter;