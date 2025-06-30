import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from './db.js';
const articleRouter = express.Router();

articleRouter.post('/save/new', async (req, res) => {
    const { user_id, article } = req.body;

    const newArticle = JSON.parse(article);
    console.log("Received:", user_id);
    console.log("Received:", newArticle.currentSlug);

    const { currentSlug, title, description, categories, tags, featuredImage, content} = newArticle;

    console.log(currentSlug);
    console.log(title);
    console.log(description);
    console.log(categories);
    console.log(tags);
    console.log(featuredImage);
    console.log(content);

    try {
        const tableName = `${user_id}` + '_draft_articles';
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
    const { user_id, article } = req.body;

    const newArticle = JSON.parse(article);
    console.log("Received:", user_id);
    console.log("Received:", newArticle.currentSlug);

    const { currentSlug, title, description, categories, tags, featuredImage, content} = newArticle;

    console.log(currentSlug);
    console.log(title);
    console.log(description);
    console.log(categories);
    console.log(tags);
    console.log(featuredImage);
    console.log(content);

    try {
        const tableName = `${user_id}` + '_draft_articles';
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

articleRouter.post('/article/send', (req, res) => {
    res.send('Admin Dashboard');
});
  
articleRouter.get('/view/:slug', async (req,res)=>{
    const { slug } = req.params;

    console.log("Slug: ",slug);
    try {
        const fetchArticleQuery = 'SELECT * FROM cont_99414393_581d_4f71_bf0d_3497019b40d5_draft_articles WHERE slug = ? LIMIT 1';
        const results = await db.query(fetchArticleQuery, [slug]);
        if (results.length === 0) {
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


    // const fetchArticleQuery = 'SELECT * FROM articles WHERE slug = ? LIMIT 1';
    // db.query(fetchArticleQuery, [slug], (err, results) => {
    //     if (err) return res.status(500).json({ error: err.message });
    
    //     if (results.length === 0) {
    //       return res.status(404).json({ error: 'Article not found' });
    //     }
    
    //     const article = results[0];
    
    //     try {
    //       article.tags = JSON.parse(article.tags || '[]');
    //       article.category = JSON.parse(article.category || '[]');
    //       article.content = JSON.parse(article.content || '[]');
    //     } catch (err) {
    //       return res.status(500).json({ error: 'Invalid JSON in database' });
    //     }
    
    //     res.json(article);
    // });

    

});

articleRouter.get('/preview/:slug', (req,res)=>{
    res.send('Preview Article');


});


export default articleRouter;