import express from 'express';
import { v4 as uuidv4 } from 'uuid';
const articleRouter = express.Router();

articleRouter.post('/save', (req, res) => {
    const { user_id, article } = req.body;
    console.log("Received:", user_id, article);
    res.status(200).json({ Saved: "Article saved successfully" });
});

articleRouter.get('/article/send', (req, res) => {
    res.send('Admin Dashboard');
});
  
export default articleRouter;