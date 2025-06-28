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

articleRouter.get('/article/send', (req, res) => {
    res.send('Admin Dashboard');
});
  
export default articleRouter;