import express from 'express';
import db from './db.js';
const profileRouter = express.Router();

profileRouter.get('/cont/:slug', async (req, res) => {
    const { slug } = req.params;

    try {
            const fetchinfoQuery = `SELECT cont_id,username, email, bio, profile_pic, dob, expertise, links, city, country, followers, created_at FROM contributor WHERE slug = ? && status='Approved' || status='Block'`;
            const results = await db.query(fetchinfoQuery,[slug]);
            const profileInfo = results[0][0];

            if (!profileInfo) {
                return res.status(404).json({ message: "Contributor not found" });
            }

            const author=profileInfo.username;
            
            const fetchinfoQuery1 = `SELECT article_id, slug, title, description, category, thumbnail_url, cont_id, views, likes, publish_at  FROM articles WHERE author=? ORDER BY publish_at DESC`;
            const results1 = await db.query(fetchinfoQuery1,[author]);
            const articleInfo = results1[0];
            
            const fetchPopularQuery = `SELECT article_id, slug, title, description, category, thumbnail_url, cont_id, views, likes, publish_at FROM articles WHERE author=? ORDER BY views DESC`;
            const popularResult = await db.query(fetchPopularQuery, [author]);
            const popularArticles = popularResult[0];

            const fetchlikeQuery = `SELECT article_id, slug, title, description, category, thumbnail_url, cont_id, views, likes, publish_at FROM articles WHERE author=? ORDER BY likes DESC`;
            const likeResult = await db.query(fetchlikeQuery, [author]);
            const likeArticles = likeResult[0];

            res.json({
                profileInfo,
                articleInfo: articleInfo || [],
                popularArticles: popularArticles || [],
                likeArticles: likeArticles || []
            });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error Fetching Profile Info"});
            
    }
});

export default profileRouter;