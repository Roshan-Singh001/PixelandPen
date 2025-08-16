import express from 'express';
import { v4 as uuidv4 } from 'uuid';
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
        const fetchinfoQuery = `SELECT article_id,slug,title,category,author,cont_id,views,is_featured,publish_at FROM articles`;
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

      const query2 = `UPDATE ${cont_id+'_articles'} SET article_status='Rejected',reject_reason=?,reject_date=NOW() WHERE slug=?`;
      await db.query(query2,[rejectReason, slug]);

      res.status(200).json({message: "Rejected Successfully"});
      
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error in Rejecting"});
    }
});

adminRouter.post('/article/approve', async (req,res)=>{
  const {slug,author,cont_id,review_id, publish_At} = req.body;

  try {
    const query1 = `UPDATE review_articles SET status='Approved' WHERE review_id=?`;
    await db.query(query1,[review_id]);

    const fetchArticleQuery = `SELECT * FROM ${cont_id+'_articles'} WHERE slug = ?`;
    const results = await db.query(fetchArticleQuery, [slug]);
    const article = results[0];

    let a_id = uuidv4().replaceAll("-", "_");
    const article_id = `article_${a_id}`;

    const query2 = `INSERT INTO articles (article_id,slug,title,category,description,content, tags,thumbnail_url,author,cont_id,publish_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)`;
    await db.query(query2,[article_id, article[0].slug, article[0].title, JSON.stringify(article[0].category), article[0].description, JSON.stringify(article[0].content), JSON.stringify(article[0].tags || []), article[0].thumbnail_url, author, cont_id, publish_At]);

    const query3 = `UPDATE ${cont_id+'_articles'} SET article_status='Approved',approve_date=NOW() WHERE slug=?`;
    await db.query(query3,[slug]);

    res.status(200).json({message: "Approved Successfully"});
    
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error in Approving"});
    
  }
});

adminRouter.post('/article/feature', async (req,res)=>{
  const {slug,article_id, is_featured} = req.body;

  try {
    const query1 = `UPDATE articles SET is_featured=? WHERE article_id=?`;
    await db.query(query1,[is_featured,article_id]);

    const query2 = `UPDATE review_articles SET is_featured=? WHERE slug=?`;
    await db.query(query2,[is_featured,slug]);

    if (is_featured) res.status(200).json({message: "Article is set to featured"});
    else res.status(200).json({message: "Article is removed from featured"});
    
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error in Approving"});
    
  }
});

adminRouter.delete('/article/delete', async (req,res)=>{
  const {slug,article_id,cont_id,review_id} = req.body;

  try {
    const query1 = `DELETE FROM review_articles WHERE review_id=?`;
    await db.query(query1,[review_id]);

    const query2 = `DELETE FROM articles WHERE article_id=?`;
    await db.query(query2,[article_id]);

    const query3 = `DELETE FROM ${cont_id+'_articles'} WHERE slug=?`;
    await db.query(query3,[slug]);

    res.status(200).json({message: "Deleted Successfully"});
    
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error in Deleting"});
    
  }
});

adminRouter.get('/fetch/cont/pending',async (req, res) => {
  try {
      const fetchinfoQuery = `SELECT cont_id, username, email, bio, profile_pic, dob, expertise, links, city, country, created_at FROM contributor WHERE status="Pending"`;
      const results = await db.query(fetchinfoQuery);
  
      const recents = results[0];

      recents.expertise = JSON.parse(recents.expertise || '[]');
      recents.links = JSON.parse(recents.links || '[]');

      res.status(200).json({pending: recents});
      
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error Fetching Data"});
    }
});

adminRouter.get('/fetch/cont/approved',async (req, res) => {
  try {
      const fetchinfoQuery = `SELECT cont_id, username, email, profile_pic, created_at, status FROM contributor WHERE status="Approved" OR status="Block"`;
      const results = await db.query(fetchinfoQuery);
  
      const recents = results[0];

      res.status(200).json({approved: recents});
      
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error Fetching Data"});
    }
});

adminRouter.get('/fetch/cont/rejected',async (req, res) => {
  try {
      const fetchinfoQuery = `SELECT cont_id, username, email, profile_pic, reject_reason, status FROM contributor WHERE status="Rejected"`;
      const results = await db.query(fetchinfoQuery);
  
      const recents = results[0];

      res.status(200).json({rejected: recents});
      
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error Fetching Data"});
    }
});

adminRouter.post('/cont/approve',async (req, res) => {
  const {cont_id} = req.body;
  try {
      const Query = `UPDATE contributor SET status='Approved' WHERE cont_id=?`;
      await db.query(Query,[cont_id]);

      res.status(200).json({message: 'Contributor is approved successfully'});
      
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error in approving contributor"});
    }
});

adminRouter.post('/cont/reject',async (req, res) => {
  const {cont_id, reject_reason} = req.body;
  try {
      const Query = `UPDATE contributor SET status='Rejected', reject_reason=? WHERE cont_id=?`;
      await db.query(Query,[reject_reason,cont_id]);

      res.status(200).json({message: 'Contributor is Rejected successfully'});
      
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error in Rejecting contributor"});
    }
});

adminRouter.post('/cont/delete',async (req, res) => {
  const {cont_id} = req.body;
  try {
    const tableName = `${cont_id}` + '_articles';
    const dropQuery = `DROP TABLE IF EXISTS ${tableName}`;
    await db.query(dropQuery);

    const dropQuery2 = `DELETE FROM contributor WHERE cont_id=?`;
    await db.query(dropQuery2,cont_id);

    const dropQuery4 = `DELETE FROM users WHERE username=?`;
    await db.query(dropQuery4,cont_id);

    const dropQuery5 = `DELETE FROM review_articles WHERE cont_id=?`;
    await db.query(dropQuery5,cont_id);

    res.status(200).json({message: "Success"});
      
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error in Rejecting contributor"});
    }
});

adminRouter.post('/cont/status',async (req, res) => {
  const {cont_id, set_status} = req.body;
  try {
      const Query = `UPDATE contributor SET status=? WHERE cont_id=?`;
      await db.query(Query,[set_status,cont_id]);

      res.status(200).json({message: 'Contributor status changes successfully'});
      
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error in status change of contributor"});
    }
});


  
export default adminRouter;