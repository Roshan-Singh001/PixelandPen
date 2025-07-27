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
            const fetchinfoQuery = `SELECT username, bio, profile_pic, dob FROM contributor WHERE cont_id = ?`;
            const results = await db.query(fetchinfoQuery,userId);
    
            const profileInfo = results[0];
    
            res.json(profileInfo);
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Error Fetching Article"});
            
        }
});

contriRouter.post('/updateprofile', async (req, res) => {
    const {user_id, updatedProfile} = req.body

    console.log(user_id);
    console.log(updatedProfile);

    try {
            const fetchinfoQuery = `UPDATE contributor SET username = ?, bio = ?, profile_pic = ?, dob = ?  WHERE cont_id = ?`;
            const results = await db.query(fetchinfoQuery,[updatedProfile.username, updatedProfile.bio, updatedProfile.profile_pic, updatedProfile.dob ,user_id]);
    
            res.status(200).json({message: "Profile Updated Successfully"});
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Error Fetching Article"});
            
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


})


  
export default contriRouter;