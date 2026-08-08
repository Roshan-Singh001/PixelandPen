import express from 'express';
import db from './db.js';
import { authMiddleware, authMiddleware2 } from './middleware.js';
const articleRouter = express.Router();

// Fetch Article by Slug
articleRouter.get('/view/:slug', authMiddleware2, async (req,res)=>{
    const { slug } = req.params;
    const userId = req.user.id || null;

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

            return res.json({article, authName: userName, authPic: userpic, comments: comments, isLiked: isLiked, likes_count: article.likes});
        }

        res.json({article, authName: userName, authPic: userpic, comments: comments, likes_count: article.likes});
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error Fetching Article"});
    }
});

// Fetch Article by Slug for Preview
articleRouter.get('/preview/:slug', authMiddleware, async (req,res)=>{
    const { slug } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

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

// Fetch Categories
articleRouter.get('/fetch/categories', async (req, res)=>{
    try {
        const fetchCategoriesQuery = `SELECT id,name FROM categories;`;
        const results = await db.query(fetchCategoriesQuery);
        res.json(results[0]);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error Fetching Categories"});
    }
})

export default articleRouter;