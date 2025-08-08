import express from 'express';
import db from './db.js';
const adminRouter = express.Router();

adminRouter.get('/stat/posts',async (req, res) => {
  try {
    const fetchinfoQuery = `SELECT COUNT(*) AS "Total_Posts" FROM articles`;
    const results = await db.query(fetchinfoQuery);

    const total_posts = results[0];
    res.status(200).json({total_p: total_posts[0].Total_Posts});
    
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error Fetching Data"});
  }
});

adminRouter.get('/stat/views',async (req, res) => {
  try {
      const fetchinfoQuery = `SELECT SUM(views) AS "Total_Views" FROM articles`;
      const results = await db.query(fetchinfoQuery);
  
      const total_views = results[0];
      res.status(200).json({total_v: total_views[0].Total_Views});
      
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error Fetching Data"});
    }
});

adminRouter.get('/stat/contributors',async (req, res) => {
    try {
        const fetchinfoQuery = `SELECT COUNT(cont_id) AS "Total_Contributors" FROM contributor WHERE status='Approved' OR status='Block'`;
        const results = await db.query(fetchinfoQuery);
    
        const contributor = results[0];
        res.status(200).json({total_c: contributor[0].Total_Contributors});
        
      } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error Fetching Data"});
      }
});

adminRouter.get('/stat/readers',async (req, res) => {
    try {
        const fetchinfoQuery = `SELECT COUNT(sub_id) AS "Total_Readers" FROM reader`;
        const results = await db.query(fetchinfoQuery);
    
        const readers = results[0];
        res.status(200).json({total_r: readers[0].Readers});
        
      } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error Fetching Data"});
      }
});

adminRouter.get('/recent/article',async (req, res) => {
    try {
        const fetchinfoQuery = `SELECT slug,title,author,status FROM review_articles LIMIT 5`;
        const results = await db.query(fetchinfoQuery);
    
        const recents = results[0];
        res.status(200).json({recents: recents});
        
      } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error Fetching Data"});
      }
});

adminRouter.get('/recent/contributor',async (req, res) => {
    try {
        const fetchinfoQuery = `SELECT cont_id,username,email,status FROM contributor LIMIT 5`;
        const results = await db.query(fetchinfoQuery);
    
        const recents = results[0];
        res.status(200).json({recents: recents});
        
      } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error Fetching Data"});
      }
});

adminRouter.get('/fetch/article/pending',async (req, res) => {
    try {
        const fetchinfoQuery = `SELECT review_id,slug,title,author,cont_id,created_at FROM review_articles WHERE status="Pending"`;
        const results = await db.query(fetchinfoQuery);
    
        const recents = results[0];
        res.status(200).json({pending: recents});
        
      } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error Fetching Data"});
      }
});

adminRouter.get('/fetch/article/rejected',async (req, res) => {
    try {
        const fetchinfoQuery = `SELECT review_id,slug,title,author,cont_id,reject_reason,reject_at FROM review_articles WHERE status="Rejected"`;
        const results = await db.query(fetchinfoQuery);
    
        const recents = results[0];
        res.status(200).json({rejected: recents});
        
      } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error Fetching Data"});
      }
});

adminRouter.get('/fetch/article/published',async (req, res) => {
    try {
        const fetchinfoQuery = `SELECT article_id,slug,title,category,author,cont_id,views FROM articles`;
        const results = await db.query(fetchinfoQuery);
    
        const recents = results[0];
        res.status(200).json({published: recents});
        
      } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error Fetching Data"});
      }
});

adminRouter.post('/article/reject',async (req, res) => {
  const {slug,cont_id,review_id,rejectReason, rejectAt} = req.body;

  try {
      const query1 = `UPDATE review_articles SET status='Rejected',reject_reason=?,reject_at=? WHERE review_id=?`;
      await db.query(query1,[rejectReason, rejectAt, review_id]);

      const rejectDate = rejectAt.split(' ')[0];

      const query2 = `UPDATE ${cont_id+'_articles'} SET article_status='Rejected',reject_reason=?,reject_date=? WHERE slug=?`;
      await db.query(query2,[rejectReason, rejectDate, slug]);

      res.status(200).json({message: "Rejected Successfully"});
      
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error in Rejecting"});
    }
});

adminRouter.post('/article/approve', async (req,res)=>{
  const {slug,cont_id,review_id, publish_at} = req.body;

  try {
    const query1 = `UPDATE review_articles SET status='Approved' WHERE review_id=?`;
    await db.query(query1,[review_id]);

    const query2 = `INSERT INTO articles`; // Pause
    await db.query(query2,[review_id]);

    
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error in Approving"});
    
  }



});
  
export default adminRouter;