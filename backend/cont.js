import express from 'express';
import multer from 'multer';
import FormData from 'form-data';
import fs from 'fs';
import axios from 'axios';
import { authMiddleware, authorizeContri } from './middleware.js';
import db from './db.js';
const contriRouter = express.Router();

contriRouter.use(authMiddleware);
contriRouter.use(authorizeContri);

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
  const userId = req.user.id;

  try {
    const fetchinfoQuery = `SELECT username, bio, profile_pic, dob, expertise, links, city, country FROM contributor WHERE cont_id = ?`;
    const results = await db.query(fetchinfoQuery, [userId]);

    const profileInfo = results[0];

    res.json(profileInfo);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error Fetching Profile Info" });

  }
});

contriRouter.get('/status', async (req, res) => {
  const userId = req.user.id;

  try {
    const fetchinfoQuery = `SELECT status, reject_reason FROM contributor WHERE cont_id = ?`;
    const results = await db.query(fetchinfoQuery, [userId]);

    const status = results[0];
    console.log(status);

    res.json(status);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error Fetching Status" });

  }
});

contriRouter.post('/updateprofile', async (req, res) => {
  const { updatedProfile } = req.body;
  const user_id = req.user.id;

  console.log(user_id);
  console.log(updatedProfile);

  try {
    const fetchinfoQuery = `UPDATE contributor SET username = ?, bio = ?, profile_pic = ?, dob = ?, expertise = ?, links = ?, city = ?, country = ?  WHERE cont_id = ?`;
    const results = await db.query(fetchinfoQuery, [updatedProfile.username, updatedProfile.bio, updatedProfile.profile_pic, updatedProfile.dob, updatedProfile.expertise, updatedProfile.links, updatedProfile.city, updatedProfile.country, user_id]);

    res.status(200).json({ message: "Profile Updated Successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error Fetching Article" });

  }
});

contriRouter.post('/resend', async (req, res) => {
  const cont_id = req.user.id;
  try {
    const Query = `UPDATE contributor SET status='Pending', reject_reason='' WHERE cont_id = ?`;
    const results = await db.query(Query, [cont_id]);

    res.status(200).json({ message: "Request Resended Successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error sending request" });

  }
});


// Stats
contriRouter.get('/stat/posts', async (req, res) => {
  const userId = req.user.id;

  try {
    const tableName = `${userId}` + '_articles';
    const fetchinfoQuery = `SELECT COUNT(*) AS "Total_Posts" FROM ${tableName}`;
    const results = await db.query(fetchinfoQuery);

    const total_posts = results[0];
    res.status(200).json({ total_p: total_posts[0].Total_Posts });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error Fetching Data" });


  }
});

contriRouter.get('/stat/views', async (req, res) => {
  const userId = req.user.id;

  try {
    const tableName = `${userId}` + '_articles';
    const fetchinfoQuery = `SELECT SUM(views) AS "Total_Views" FROM ${tableName} WHERE article_status='Approved'`;
    const results = await db.query(fetchinfoQuery);

    const total_views = results[0];
    res.status(200).json({ total_v: total_views[0].Total_Views });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error Fetching Data" });


  }
});

contriRouter.get('/stat/likes', async (req, res) => {
  const userId = req.user.id;

  try {
    const tableName = `${userId}` + '_articles';
    const fetchinfoQuery = `SELECT SUM(likes) AS "Total_Likes" FROM ${tableName} WHERE article_status='Approved'`;
    const results = await db.query(fetchinfoQuery);

    const total_likes = results[0];
    res.status(200).json({ total_l: total_likes[0].Total_Likes });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error Fetching Data" });


  }
});

contriRouter.get('/stat/followers', async (req, res) => {
  const userId = req.user.id;

  try {

    const fetchinfoQuery = `SELECT followers AS "Total_Followers" FROM contributor WHERE cont_id=?`;
    const results = await db.query(fetchinfoQuery, userId);

    const followers = results[0];
    res.status(200).json({ total_f: followers[0].Total_Followers });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error Fetching Data" });


  }
});

contriRouter.get('/recent', async (req, res) => {
  const userId = req.user.id;

  try {
    const tableName = `${userId}` + '_articles';
    const fetchinfoQuery = `SELECT title, article_status FROM ${tableName} LIMIT 5`;
    const results = await db.query(fetchinfoQuery);

    const recents = results[0];

    console.log(recents);
    res.status(200).json({ recents: recents });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error Fetching Data" });


  }
});

contriRouter.get('/announcements', async (req, res) => {

  try {
    const fetchinfoQuery = `SELECT id, title, content, published_at FROM announcements WHERE status='Published' && audience='Contributors' || audience='All' ORDER BY published_at`;
    const results = await db.query(fetchinfoQuery);

    const recents = results[0];

    console.log(recents);
    res.status(200).json({ announce: recents });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error Fetching Data" });


  }
});

contriRouter.get('/fetch/comments', async (req, res) => {
  const cont_id = req.user.id;

  try {
    const fetchinfoQuery = `SELECT 
    comments.id, 
    comments.article_id, 
    comments.article_title, 
    comments.user_id, 
    comments.username, 
    comments.content, 
    comments.created_at, 
    articles.slug
FROM comments
JOIN articles ON comments.article_id = articles.article_id
WHERE comments.status = 'Approved' AND articles.cont_id=?`;
    const results = await db.query(fetchinfoQuery, [cont_id]);

    console.log(results);

    const recents = results[0];

    console.log(recents);
    res.status(200).json({ comments: recents });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error Fetching Data" });


  }
});

contriRouter.get('/delete', async (req, res) => {
  const userId = req.user.id;
  const username = req.user.username;

  try {
    const tableName = `${userId}` + '_articles';
    const dropQuery = `DROP TABLE IF EXISTS ${tableName}`;
    await db.query(dropQuery);

    const dropQuery2 = `DELETE FROM contributor WHERE cont_id=?`;
    await db.query(dropQuery2, userId);

    const dropQuery3 = `DELETE FROM articles WHERE author=?`;
    await db.query(dropQuery3, username);

    const dropQuery4 = `DELETE FROM users WHERE id=?`;
    await db.query(dropQuery4, username);

    const dropQuery5 = `DELETE FROM review_articles WHERE cont_id=?`;
    await db.query(dropQuery5, userId);

    res.status(200).json({ message: "Success" });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error Fetching Data" });
  }
});

// Articles APIs

// Fetch Articles by Status for contributor
contriRouter.get('/article/fetch/draft', async (req, res) => {
  const userId = req.user.id;

  try {
    const fetchArticleQuery = `SELECT slug,title,updated_at FROM ${userId + '_articles'} WHERE article_status = 'Draft'`;
    const results = await db.query(fetchArticleQuery);

    const DraftArticles = results[0];

    res.status(200).json(DraftArticles);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error Fetching Article" });

  }
});

// Fetch Articles by Status for contributor
contriRouter.get('/article/fetch/pending', async (req, res) => {
  const userId = req.user.id;

  try {
    const fetchArticleQuery = `SELECT slug,title,pending_date FROM ${userId + '_articles'} WHERE article_status = 'Pending'`;
    const results = await db.query(fetchArticleQuery);

    const PendingArticles = results[0];

    res.status(200).json(PendingArticles);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error Fetching Article" });

  }
});

// Fetch Articles by Status for contributor
contriRouter.get('/article/fetch/reject', async (req, res) => {
  const userId = req.user.id;

  try {
    const fetchArticleQuery = `SELECT slug,title,reject_date,reject_reason FROM ${userId + '_articles'} WHERE article_status = 'Rejected'`;
    const results = await db.query(fetchArticleQuery);

    const RejectedArticles = results[0];

    res.status(200).json(RejectedArticles);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error Fetching Article" });

  }
});

// Fetch Articles by Status for contributor
contriRouter.get('/article/fetch/approve', async (req, res) => {
  const userId = req.user.id;

  try {
    const fetchArticleQuery = `SELECT slug,title,category,approve_date,views FROM ${userId + '_articles'} WHERE article_status = 'Approved'`;
    const results = await db.query(fetchArticleQuery);

    const ApproveArticles = results[0];

    ApproveArticles.category = JSON.parse(ApproveArticles.category || '[]');

    res.status(200).json(ApproveArticles);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error Fetching Article" });

  }
});



// Upload Featured Image for Article
contriRouter.post("/article/uploads/featuredimage", upload.single("file"), async (req, res) => {
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

    res.status(200).json({ success: true, imageUrl });
  } catch (err) {
    console.error("Pinata v3 Upload Error:", err?.response?.data || err.message);
    res.status(500).json({ success: false, error: "Upload failed" });
  }
});

// Draft Article Save
contriRouter.post('/article/save/new', async (req, res) => {
  const { article } = req.body;
  const user_id = req.user.id;

  const newArticle = JSON.parse(article);
  console.log("Received:", user_id);
  console.log("Received:", newArticle.currentSlug);

  const { currentSlug, title, description, categories, tags, featuredImage, content } = newArticle;

  try {
    const tableName = `${user_id}` + '_articles';
    const values = [currentSlug, title, JSON.stringify(categories), description, JSON.stringify(content), JSON.stringify(tags), featuredImage];
    const query_insert_article = `INSERT INTO ${tableName} (slug, title, category, description, content, tags, thumbnail_url)
                                      VALUES (?,?,?,?,?,?,?)`;
    await db.execute(query_insert_article, values);

    res.status(200).json({ Saved: "Article saved successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error during saving" });
  }
});

// Edit Article Save
contriRouter.post('/save/edit', async (req, res) => {
  const { prevSlug, article } = req.body;
  const user_id = req.user.id;

  const newArticle = JSON.parse(article);
  console.log("Received:", user_id);
  console.log("Received:", newArticle.prevSlug);

  const { currentSlug, title, description, categories, tags, featuredImage, content } = newArticle;

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
    res.status(500).json({ message: "Error during saving" });
  }
});

// Send Article for Review
contriRouter.post('/send', async (req, res) => {
  const { slug, title, author } = req.body;
  const cont_id = req.user.id;
  console.log("Send Request Received: ", slug);

  try {
    const check_query = `SELECT status FROM review_articles  WHERE slug = ?`;
    const results = await db.execute(check_query, [slug]);

    if (results[0].length === 0) {
      const review_query = `INSERT INTO review_articles (slug, title, author, cont_id) VALUES (?,?,?,?)`;
      await db.execute(review_query, [slug, title, author, cont_id]);
      const tableName = `${cont_id}` + '_articles';

      const update_query = `UPDATE ${tableName} SET article_status = 'Pending', pending_date=NOW() WHERE slug = ?`;
      await db.execute(update_query, [slug]);

      res.status(200).json({ Saved: "Article Sended for Review Successfully" });
    }
    else {
      if (results[0].status == 'Rejected') {
        const review_query = `UPDATE review_articles
                                        SET status = 'Pending',
                                            reject_reason = NULL,
                                            reject_at = NULL,
                                            slug = ?
                                        WHERE review_id = ?`;
        await db.execute(review_query, [slug, results[0].review_id]);

        res.status(200).json({ Saved: "Article Sended for Review Successfully" });
      }
      else {
        res.status(500).json({ message: "Title is already in use" });

      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error during Sending" });
  }
});

// Fetch Article by Slug for Contributor
contriRouter.get('/article/fetch', async (req, res) => {
  const userId = req.user.id;
  const slug = req.headers['slug'];

  console.log("Slug: ", slug);

  try {
    const fetchArticleQuery = `SELECT * FROM ${userId + '_articles'} WHERE slug = ?`;
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
    res.status(500).json({ message: "Error Fetching Article" });
  }
});


export default contriRouter;