import express from 'express';
import db from './db.js';
import { authMiddleware, authMiddleware2 } from './middleware.js';
const articleRouter = express.Router();

// Fetch Article by Slug
articleRouter.get('/view/:slug', authMiddleware2, async (req,res)=>{
    const { slug } = req.params;
    const userId = req?.user?.id || null;

    console.log("Slug: ",slug);
    try {
        const fetchArticleQuery = `
        SELECT a.*, c.name AS category
        FROM articles a
        JOIN categories c ON a.category_id = c.id
        WHERE a.slug = ?`;
        const results = await db.query(fetchArticleQuery, [slug]);
        if (results[0].length === 0) {
            return res.status(404).json({ error: 'Article not found' });
        }
        const article = results[0];
        article.tags = JSON.parse(article.tags || '[]');
        article.content = JSON.parse(article.content || '[]');

        const fetchNameQuery = `SELECT username, profile_pic FROM contributor WHERE cont_id = ?`;
        const result2 = await db.query(fetchNameQuery,[article[0].cont_id]);

        const userName = result2[0][0].username;
        const userpic = result2[0][0].profile_pic;

        const fetchCommentsQuery = `
            SELECT c.id , c.user_id, r.profile_pic, r.username, c.content, c.created_at 
            FROM comments c 
            JOIN reader r ON c.user_id = r.sub_id
            WHERE c.article_id = ? 
            AND c.status = 'Approved'`;
        const result3 = await db.query(fetchCommentsQuery,[article[0].article_id]);
        const comments = result3[0];

        if (userId) {
            const query = `SELECT CASE WHEN EXISTS (SELECT 1 FROM article_likes WHERE reader_id=? AND article_id=?) THEN 1 ELSE 0 END AS isLike`;
            
            const [likeResults] = await db.query(query,[userId,article[0].article_id]);
            const isLiked = likeResults[0].isLike === 1;

            const queryBookmark = `SELECT CASE WHEN EXISTS (SELECT 1 FROM bookmarks WHERE reader_id=? AND article_id=?) THEN 1 ELSE 0 END AS isBookmarked`;
            const [bookmarkResults] = await db.query(queryBookmark,[userId,article[0].article_id]);
            const isBookmarked = bookmarkResults[0].isBookmarked === 1;

            return res.status(200).json({article, authName: userName, authPic: userpic, comments: comments, isLiked: isLiked, isBookmarked: isBookmarked, likes_count: article.likes});
        }

        res.status(200).json({article, authName: userName, authPic: userpic, comments: comments, likes_count: article.likes});
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
            const fetchArticleQuery = `
            SELECT a.*, c.name AS category 
            FROM ${userId+'_articles'} a
            JOIN categories c ON a.category_id = c.id
            WHERE a.slug = ?`;
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

            const fetchArticleQuery = `
            SELECT a.*, c.name AS category 
            FROM ${cont_id+'_articles'} a
            JOIN categories c ON a.category_id = c.id
            WHERE a.slug = ?`;
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

// Featured Articles
articleRouter.get('/featured', async (req, res) => {
    try {
        const queryFeatured = `
            SELECT a.article_id, a.title, a.description, a.slug, a.thumbnail_url, a.views, a.author, cont.profile_pic, c.name AS category_name, a.publish_at
            FROM articles a
            JOIN categories c ON a.category_id = c.id
            JOIN contributor cont ON a.cont_id = cont.cont_id
            WHERE a.is_featured = 1
            ORDER BY a.publish_at DESC
        `;
        const results = await db.query(queryFeatured);
        res.status(200).json({articles: results[0]});

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error Fetching Featured Articles" });
    }
})

// Latest Articles (5)
articleRouter.get('/latest', async (req, res) => {

    try {
        const queryLatest = `
            SELECT a.article_id, a.title, a.description, a.slug, a.thumbnail_url, a.views, a.author, cont.profile_pic, c.name AS category_name, a.publish_at
            FROM articles a
            JOIN categories c ON a.category_id = c.id
            JOIN contributor cont ON a.cont_id = cont.cont_id
            ORDER BY a.publish_at DESC
            LIMIT 5
        `;
        const results = await db.query(queryLatest);
        res.status(200).json({articles: results[0]});
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error Fetching Latest Articles" });
    }
})

// Trending Articles (5)
articleRouter.get('/trending', async (req, res) => {

    try {
        const queryTrending = `
            SELECT a.article_id, a.title, a.description, a.slug, a.thumbnail_url, a.views, a.author, cont.profile_pic, c.name AS category_name, a.publish_at
            FROM articles a
            JOIN categories c ON a.category_id = c.id
            JOIN contributor cont ON a.cont_id = cont.cont_id
            ORDER BY a.views DESC
            LIMIT 5
        `;
        const results = await db.query(queryTrending);
        res.status(200).json({articles: results[0]});
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error Fetching Trending Articles" });
    }
})

// Search Articles
articleRouter.get('/search', async (req, res) => {
    const { q } = req.query;
    console.log("Search Query: ", q);

    try {
        const searchQuery = `
            SELECT a.article_id, a.title, a.description, a.slug, a.thumbnail_url, a.views, a.author, cont.profile_pic, c.name AS category_name, a.publish_at
            FROM articles a
            JOIN categories c ON a.category_id = c.id
            JOIN contributor cont ON a.cont_id = cont.cont_id
            WHERE a.title LIKE ? OR a.description LIKE ? OR a.author LIKE ? OR c.name LIKE ?
            ORDER BY a.publish_at DESC
        `;
        const results = await db.query(searchQuery, [`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`]);
        console.log("Search Results: ", results[0]);
        res.status(200).json({articles: results[0]});
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error Fetching Search Results" });
    }
});

// Categories
articleRouter.get('/categories', async (req, res) => {
    try {
        const queryCategories = `
        SELECT c.id, c.name, c.slug, COUNT(a.article_id) AS article_count 
        FROM categories c
        LEFT JOIN articles a ON c.id = a.category_id 
        GROUP BY c.id, c.name, c.slug`;
        const results = await db.query(queryCategories);
        res.status(200).json({categories: results[0]});
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error Fetching Categories" });
    }
});

export default articleRouter;