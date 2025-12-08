import express from 'express';
import multer from 'multer';
import FormData from 'form-data';
import fs from 'fs';
import axios from 'axios';
import db from './db.js';
const articleRouter = express.Router();

const upload = multer({ dest: "uploads/" });

articleRouter.post("/uploads/featuredimage", upload.single("file"), async (req, res) => {
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

articleRouter.post('/save/new', async (req, res) => {
    const { user_id, article } = req.body;

    const newArticle = JSON.parse(article);
    console.log("Received:", user_id);
    console.log("Received:", newArticle.currentSlug);

    const { currentSlug, title, description, categories, tags, featuredImage, content} = newArticle;

    try {
        const tableName = `${user_id}` + '_articles';
        const values = [currentSlug, title, JSON.stringify(categories), description, JSON.stringify(content), JSON.stringify(tags), featuredImage];
        const query_insert_article = `INSERT INTO ${tableName} (slug, title, category, description, content, tags, thumbnail_url)
                                      VALUES (?,?,?,?,?,?,?)`;
        await db.execute(query_insert_article, values);
        
        res.status(200).json({ Saved: "Article saved successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error during saving"});
    }
});

articleRouter.post('/save/edit', async (req, res) => {
    const { prevSlug,user_id, article } = req.body;

    const newArticle = JSON.parse(article);
    console.log("Received:", user_id);
    console.log("Received:", newArticle.prevSlug);

    const { currentSlug, title, description, categories, tags, featuredImage, content} = newArticle;

    try {
        const tableName = `${user_id}` + '_articles';
        const values = [currentSlug, title, JSON.stringify(categories), description, JSON.stringify(content), JSON.stringify(tags), featuredImage, prevSlug];
        const query_insert_article = `UPDATE ${tableName}
                                      SET slug = ?,
                                          title = ?,
                                          category = ?,
                                          description =?,  
                                          content = ?,
                                          tags = ?,
                                          thumbnail_url = ?
                                      WHERE slug = ?`;
        await db.execute(query_insert_article, values);
        
        res.status(200).json({ Saved: "Article saved successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error during saving"});
    }
});

articleRouter.post('/send', async(req, res) => {
    const { slug,title, cont_id, author } = req.body;
    console.log("Send Request Received: ",slug);
    
    try {
        const check_query = `SELECT status FROM review_articles  WHERE slug = ?`;
        const results = await db.execute(check_query, [slug]);
        
        if (results[0].length === 0) {
            const review_query = `INSERT INTO review_articles (slug, title, author, cont_id) VALUES (?,?,?,?)`;
            await db.execute(review_query,[slug,title,author,cont_id]);
            const tableName = `${cont_id}` + '_articles';
            
            const update_query = `UPDATE ${tableName} SET article_status = 'Pending', pending_date=NOW() WHERE slug = ?`;
            await db.execute(update_query,[slug]);
            
            res.status(200).json({ Saved: "Article Sended for Review Successfully" });
        }
        else{

            if (results[0].status == 'Rejected') {
                const review_query = `UPDATE review_articles
                                        SET status = 'Pending',
                                            reject_reason = NULL,
                                            reject_at = NULL,
                                            slug = ?
                                        WHERE review_id = ?`;
                await db.execute(review_query,[slug, results[0].review_id]);
            }
            else{
                res.status(500).json({ message: "Title is already in use"});

            }
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error during Sending"});
    }
});
  
articleRouter.get('/view/:slug', async (req,res)=>{
    const { slug } = req.params;
    const userId = req.headers['user_id'];

    console.log("Slug: ",slug);
    try {
        const fetchArticleQuery = 'SELECT * FROM articles WHERE slug = ?';
        const results = await db.query(fetchArticleQuery, [slug]);
        if (results[0].length === 0) {
            return res.status(404).json({ error: 'Article not found' });
        }
        const article = results[0];
        article.tags = JSON.parse(article.tags || '[]');
        article.category = JSON.parse(article.category || '[]');
        article.content = JSON.parse(article.content || '[]');

        const fetchNameQuery = `SELECT username, profile_pic FROM contributor WHERE cont_id = ?`;
        const result2 = await db.query(fetchNameQuery,[article[0].cont_id]);

        const userName = result2[0][0].username;
        const userpic = result2[0][0].profile_pic;

        const fetchCommentsQuery = `SELECT id,user_id, username, content, created_at FROM comments WHERE article_id = ? AND status = 'Approved'`;
        const result3 = await db.query(fetchCommentsQuery,[article[0].article_id]);
        const comments = result3[0];

        if (userId) {
            const query = `SELECT CASE WHEN EXISTS (SELECT 1 FROM article_likes WHERE reader_id=? AND article_id=?) THEN 1 ELSE 0 END AS isLike`;
            
            const [likeResults] = await db.query(query,[userId,article[0].article_id]);
            const isLiked = likeResults[0].isLike === 1;

            return res.json({article, authName: userName, authPic: userpic, comments: comments, isLiked: isLiked});
        }

        res.json({article, authName: userName, authPic: userpic, comments: comments});
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error Fetching Article"});
    }
});

articleRouter.get('/preview/:slug', async (req,res)=>{
    const { slug } = req.params;
    const userId = req.headers['user_id'];
    const userRole = req.headers['user_role'];

    console.log("Slug: ",slug);
    console.log("preview: ",slug);
    console.log(userRole);

    try {
        if (userRole == 'Contributor') {
            const fetchArticleQuery = `SELECT * FROM ${userId+'_articles'} WHERE slug = ?`;
            const results = await db.query(fetchArticleQuery, [slug]);
            if (results[0].length === 0) {
                return res.status(404).json({ error: 'Article not found' });
            }
    
            const article = results[0];
            
            article.tags = JSON.parse(article.tags || '[]');
            article.category = JSON.parse(article.category || '[]');
            article.content = JSON.parse(article.content || '[]');
    
            const fetchNameQuery = `SELECT username, profile_pic FROM contributor WHERE cont_id = ?`;
            const result2 = await db.query(fetchNameQuery,[userId]);
            const userName = result2[0][0].username;
            const userpic = result2[0][0].profile_pic;
            console.log(result2[0]);
    
            res.json({article, authName: userName, authPic: userpic});
            
        }
        else if (userRole == 'Admin') {
            console.log("hello");
            const fetchQuery = `SELECT cont_id FROM review_articles WHERE slug = ?`;
            const results1 = await db.query(fetchQuery, [slug]);
            if (results1[0].length === 0) {
                return res.status(404).json({ error: 'Article not found' });
            }

            const cont_id = results1[0][0].cont_id;

            const fetchArticleQuery = `SELECT * FROM ${cont_id+'_articles'} WHERE slug = ?`;
            const results = await db.query(fetchArticleQuery, [slug]);

            const article = results[0];
            
            article.tags = JSON.parse(article.tags || '[]');
            article.category = JSON.parse(article.category || '[]');
            article.content = JSON.parse(article.content || '[]');
    
            const fetchNameQuery = `SELECT username, profile_pic FROM contributor WHERE cont_id = ?`;
            const result2 = await db.query(fetchNameQuery,[cont_id]);
            const userName = result2[0][0].username;
            const userpic = result2[0][0].profile_pic;
            console.log(result2[0]);
    
            res.json({article, authName: userName, authPic: userpic});
        }


    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error Fetching Article"});
        
    }
});

articleRouter.get('/fetch', async (req,res)=>{
    const userId = req.headers['user_id'];
    const slug = req.headers['slug'];

    console.log("Slug: ",slug);

    try {
        const fetchArticleQuery = `SELECT * FROM ${userId+'_articles'} WHERE slug = ?`;
        const results = await db.query(fetchArticleQuery, [slug]);
        if (results[0].length === 0) {
            return res.status(404).json({ error: 'Article not found' });
        }

        const article = results[0];
        
        article.tags = JSON.parse(article.tags || '[]');
        article.category = JSON.parse(article.category || '[]');
        article.content = JSON.parse(article.content || '[]');

        res.json(article);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error Fetching Article"});   
    }
});

articleRouter.get('/draft', async (req,res)=>{
    const userId = req.headers['user_id'];

    try {
        const fetchArticleQuery = `SELECT slug,title,updated_at FROM ${userId+'_articles'} WHERE article_status = 'Draft'`;
        const results = await db.query(fetchArticleQuery);

        const DraftArticles = results[0];

        res.json(DraftArticles);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error Fetching Article"});
        
    }
});

articleRouter.get('/pending', async (req,res)=>{
    const userId = req.headers['user_id'];

    try {
        const fetchArticleQuery = `SELECT slug,title,pending_date FROM ${userId+'_articles'} WHERE article_status = 'Pending'`;
        const results = await db.query(fetchArticleQuery);

        const PendingArticles = results[0];

        res.json(PendingArticles);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error Fetching Article"});
        
    }
});

articleRouter.get('/reject', async (req,res)=>{
    const userId = req.headers['user_id'];

    try {
        const fetchArticleQuery = `SELECT slug,title,reject_date,reject_reason FROM ${userId+'_articles'} WHERE article_status = 'Rejected'`;
        const results = await db.query(fetchArticleQuery);

        const RejectedArticles = results[0];

        res.json(RejectedArticles);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error Fetching Article"});
        
    }
});

articleRouter.get('/approve', async (req,res)=>{
    const userId = req.headers['user_id'];

    try {
        const fetchArticleQuery = `SELECT slug,title,category,approve_date,views FROM ${userId+'_articles'} WHERE article_status = 'Approved'`;
        const results = await db.query(fetchArticleQuery);

        const ApproveArticles = results[0];

        ApproveArticles.category = JSON.parse(ApproveArticles.category || '[]');

        res.json(ApproveArticles);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error Fetching Article"});
        
    }
});


export default articleRouter;