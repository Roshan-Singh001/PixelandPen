import express from 'express';
import multer from 'multer';
import FormData from 'form-data';
import fs from 'fs';
import axios from 'axios';
import db from './db.js';
const contriRouter = express.Router();

const upload = multer({ dest: "uploads/" });

contriRouter.post("/uploads/profileimage", upload.single("file"), async (req, res) => {
    try {
      const fileStream = fs.createReadStream(req.file.path);

  
      const form = new FormData();
      form.append("file", fileStream);
      form.append("name", req.file.originalname);
      form.append("network", "public");
      const pinataRes = await axios.post("https://uploads.pinata.cloud/v3/files", form, {
        headers: {
          Authorization: `Bearer ${process.env.PINATA_BEARER_TOKEN}`,
          ...form.getHeaders(),
        },
      });
  
      fs.unlinkSync(req.file.path);
  
      const imageUrl = pinataRes.data?.data?.preview || `https://gateway.pinata.cloud/ipfs/${pinataRes.data?.data?.cid}`;
  
      res.json({ success: true, imageUrl });
    } catch (err) {
      console.error("Pinata v3 Upload Error:", err?.response?.data || err.message);
      res.status(500).json({ success: false, error: "Upload failed" });
    }
});

contriRouter.get('/profile', async (req, res) => {
    const userId = req.headers['user_id'];

    try {
            const fetchinfoQuery = `SELECT username, bio, profile_pic, dob, expertise, links, city, country FROM contributor WHERE cont_id = ?`;
            const results = await db.query(fetchinfoQuery,userId);
    
            const profileInfo = results[0];
    
            res.json(profileInfo);
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Error Fetching Profile Info"});
            
        }
});

contriRouter.get('/status', async (req, res) => {
    const userId = req.headers['user_id'];

    try {
            const fetchinfoQuery = `SELECT status, reject_reason FROM contributor WHERE cont_id = ?`;
            const results = await db.query(fetchinfoQuery,userId);
    
            const status = results[0];
            console.log(status);
    
            res.json(status);
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Error Fetching Status"});
            
        }
});

contriRouter.post('/updateprofile', async (req, res) => {
    const {user_id, updatedProfile} = req.body

    console.log(user_id);
    console.log(updatedProfile);

    try {
            const fetchinfoQuery = `UPDATE contributor SET username = ?, bio = ?, profile_pic = ?, dob = ?, expertise = ?, links = ?, city = ?, country = ?  WHERE cont_id = ?`;
            const results = await db.query(fetchinfoQuery,[updatedProfile.username, updatedProfile.bio, updatedProfile.profile_pic, updatedProfile.dob, updatedProfile.expertise, updatedProfile.links, updatedProfile.city, updatedProfile.country, user_id]);
    
            res.status(200).json({message: "Profile Updated Successfully"});
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Error Fetching Article"});
            
        }
});

contriRouter.post('/resend', async (req, res) => {
    const {cont_id} = req.body;
    try {
            const Query = `UPDATE contributor SET status='Pending', reject_reason='' WHERE cont_id = ?`;
            const results = await db.query(Query,[cont_id]);
    
            res.status(200).json({message: "Request Resended Successfully"});
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Error sending request"});
            
        }
});

contriRouter.get('/stat/posts', async (req, res)=>{
  const userId = req.headers['user_id'];

  try {
    const tableName = `${userId}` + '_articles';
    const fetchinfoQuery = `SELECT COUNT(*) AS "Total_Posts" FROM ${tableName}`;
    const results = await db.query(fetchinfoQuery);

    const total_posts = results[0];
    res.status(200).json({total_p: total_posts[0].Total_Posts});
    
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error Fetching Data"});

    
  }


});

contriRouter.get('/stat/views', async (req, res)=>{
  const userId = req.headers['user_id'];

  try {
    const tableName = `${userId}` + '_articles';
    const fetchinfoQuery = `SELECT SUM(views) AS "Total_Views" FROM ${tableName} WHERE article_status='Approved'`;
    const results = await db.query(fetchinfoQuery);

    const total_views = results[0];
    res.status(200).json({total_v: total_views[0].Total_Views});
    
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error Fetching Data"});

    
  }
});

contriRouter.get('/stat/likes', async (req, res)=>{
  const userId = req.headers['user_id'];

  try {
    const tableName = `${userId}` + '_articles';
    const fetchinfoQuery = `SELECT SUM(likes) AS "Total_Likes" FROM ${tableName} WHERE article_status='Approved'`;
    const results = await db.query(fetchinfoQuery);

    const total_likes = results[0];
    res.status(200).json({total_l: total_likes[0].Total_Likes});
    
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error Fetching Data"});

    
  }
});

contriRouter.get('/stat/followers', async (req, res)=>{
  const userId = req.headers['user_id'];

  try {
    
    const fetchinfoQuery = `SELECT followers AS "Total_Followers" FROM contributor WHERE cont_id=?`;
    const results = await db.query(fetchinfoQuery,userId);

    const followers = results[0];
    res.status(200).json({total_f: followers[0].Total_Followers});
    
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error Fetching Data"});

    
  }
});

contriRouter.get('/recent', async (req, res)=>{
  const userId = req.headers['user_id'];

  try {
    const tableName = `${userId}` + '_articles';
    const fetchinfoQuery = `SELECT title, article_status FROM ${tableName} LIMIT 5`;
    const results = await db.query(fetchinfoQuery);

    const recents = results[0];

    console.log(recents);
    res.status(200).json({recents: recents});
    
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error Fetching Data"});

    
  }
});

contriRouter.get('/delete', async (req, res)=>{
  const userId = req.headers['user_id'];
  const username = req.headers['username'];

  try {
    const tableName = `${userId}` + '_articles';
    const dropQuery = `DROP TABLE IF EXISTS ${tableName}`;
    await db.query(dropQuery);

    const dropQuery2 = `DELETE FROM contributor WHERE cont_id=?`;
    await db.query(dropQuery2,userId);

    const dropQuery3 = `DELETE FROM articles WHERE author=?`;
    await db.query(dropQuery3,username);

    const dropQuery4 = `DELETE FROM users WHERE id=?`;
    await db.query(dropQuery4,username);

    const dropQuery5 = `DELETE FROM review_articles WHERE cont_id=?`;
    await db.query(dropQuery5,userId);

    res.status(200).json({message: "Success"});
    
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error Fetching Data"});
  }
});


  
export default contriRouter;