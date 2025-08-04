import express from 'express';
import multer from 'multer';
import FormData from 'form-data';
import fs from 'fs';
import axios from 'axios';
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
  
export default adminRouter;