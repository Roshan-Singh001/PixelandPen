import express from 'express';
import multer from 'multer';
import FormData from 'form-data';
import fs from 'fs';
import axios from 'axios';
import { authMiddleware, authorizeContri } from './middleware.js';
import db from './db.js';
const contriRouter = express.Router();
import { passwordResetLimiter, deleteLimiter } from './rateLimitMiddleware.js';

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
  const user_id = req.user.id;
  const { updatedProfile } = req.body;
  const ALLOWED_PROFILE_FIELDS = ['username', 'bio', 'profile_pic', 'dob', 'expertise', 'links', 'city', 'country'];
  const JSON_PROFILE_FIELDS = ['expertise', 'links'];

  if (!updatedProfile || typeof updatedProfile !== 'object' || Array.isArray(updatedProfile)) {
    return res.status(400).json({ message: "Invalid request body" });
  }

  const setClauses = [];
  const values = [];

  for (const field of ALLOWED_PROFILE_FIELDS) {
    if (!Object.prototype.hasOwnProperty.call(updatedProfile, field)) continue;

    let value = updatedProfile[field];

    if (field === 'username') {
      if (typeof value !== 'string' || value.trim().length < 3) {
        return res.status(400).json({
          message: "Username must be at least 3 characters"
        });
      }

      value = value.trim();

      const [existingUser] = await db.query(
        'SELECT id FROM users WHERE username = ?',
        [value]
      );

      if (existingUser.length > 0) {
        return res.status(409).json({
          message: "Username is already taken"
        });
      }
    }

    if (field === 'bio' && typeof value === 'string' && value.length > 500) {
      return res.status(400).json({ message: "Bio must be less than 500 characters" });
    }

    if (JSON_PROFILE_FIELDS.includes(field)) {
      value = value == null ? null : JSON.stringify(value);
    }

    setClauses.push(`${field} = ?`);
    values.push(value ?? null);
  }

  if (setClauses.length === 0) {
    return res.status(400).json({ message: "No valid fields to update" });
  }

  values.push(user_id);

  try {
    const query = `UPDATE contributor SET ${setClauses.join(', ')} WHERE cont_id = ?`;
    await db.query(query, values);

    res.status(200).json({ message: "Profile updated successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error updating profile" });
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

// Recent Articles
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

// Announcements
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

// Comments
contriRouter.get('/comments', async (req, res) => {
  const cont_id = req.user.id;

  try {
    const fetchinfoQuery = `
      SELECT 
        c.id, 
        c.article_id, 
        c.article_title, 
        c.user_id, 
        r.username, 
        c.content, 
        c.created_at,
        c.status,
        r.profile_pic,
        a.slug
      FROM comments c
      JOIN articles a
        ON c.article_id = a.article_id
      JOIN reader r
        ON c.user_id = r.sub_id
      WHERE a.cont_id=?
    `;
    const results = await db.query(fetchinfoQuery, [cont_id]);
    const recents = results[0];

    const queryTotalComments = `SELECT COUNT(*) AS total_comments FROM comments c JOIN articles a ON c.article_id = a.article_id WHERE c.status = 'Approved' AND a.cont_id=?`;
    const totalResults = await db.query(queryTotalComments, [cont_id]);
    const totalComments = totalResults[0][0].total_comments;

    const queryPendingComments = `SELECT COUNT(*) AS pending_comments FROM comments JOIN articles ON comments.article_id = articles.article_id WHERE comments.status = 'Pending' AND articles.cont_id=?`;
    const pendingResults = await db.query(queryPendingComments, [cont_id]);
    const pendingComments = pendingResults[0][0].pending_comments;

    const queryDeletedComments = `SELECT COUNT(*) AS deleted_comments FROM comments JOIN articles ON comments.article_id = articles.article_id WHERE comments.status = 'Deleted' AND articles.cont_id=?`;
    const deletedResults = await db.query(queryDeletedComments, [cont_id]);
    const deletedComments = deletedResults[0][0].deleted_comments;

    const queryApprovedComments = `SELECT COUNT(*) AS approved_comments FROM comments JOIN articles ON comments.article_id = articles.article_id WHERE comments.status = 'Approved' AND articles.cont_id=?`;
    const approvedResults = await db.query(queryApprovedComments, [cont_id]);
    const approvedComments = approvedResults[0][0].approved_comments;

    res.status(200).json({
      comments: recents,
      stats: {
        totalComments,
        pendingComments,
        deletedComments,
        approvedComments
      }
    });

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
    const fetchArticleQuery = `SELECT a.slug, a.thumbnail_url, a.title, c.name as category, a.approve_date, a.views 
                                FROM ${userId + '_articles'} a
                                LEFT JOIN categories c ON a.category_id = c.id
                                WHERE a.article_status = 'Approved'`;
    const results = await db.query(fetchArticleQuery);

    const ApproveArticles = results[0];

    ApproveArticles.category = JSON.parse(ApproveArticles.category || '[]');

    res.status(200).json(ApproveArticles);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error Fetching Article" });

  }
});

// Fetch Article Stats by Slug for contributor
contriRouter.get('/article/stats/:slug', async (req, res) => {
  const slug = req.params.slug;

  try {
    const fetchArticleQuery = `
      SELECT a.views, a.likes, COUNT(c.id) as comments , COUNT(b.id) as bookmarks
      FROM articles a 
      LEFT JOIN comments c 
        ON a.article_id = c.article_id 
      LEFT JOIN bookmarks b 
        ON a.article_id = b.article_id 
      WHERE a.slug = ? 
      GROUP BY a.article_id`;

    const results = await db.query(fetchArticleQuery, [slug]);

    res.status(200).json(results[0]);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error Fetching Article Stats" });
  }
})

// Followers

contriRouter.get('/followers', async (req, res) => {
  const userId = req.user.id;

  try {
    const queryFollowers = `
      SELECT rf.reader_id, r.username, r.profile_pic, rf.created_at
      FROM reader_follows rf
      JOIN reader r 
        ON rf.reader_id = r.sub_id
      WHERE rf.contributor_id = ?
    `

    const results = await db.query(queryFollowers, [userId]);

    res.status(200).json({ followers: results[0] });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error Fetching Followers" });
  }
})

contriRouter.get('/follower/stat/:slug', async (req, res) => {
  const slug = req.params.slug;

  try {
    const queryFollowerStats = `
      SELECT 
        r.created_at,
        COUNT(DISTINCT a.article_id) AS articles_read,
        COUNT(DISTINCT b.id) AS bookmarks_added
      FROM reader r
      LEFT JOIN article_views a
        ON r.sub_id = a.reader_id
      LEFT JOIN bookmarks b
        ON r.sub_id = b.reader_id
      WHERE r.username = 'reader'
      GROUP BY r.sub_id, r.created_at;
    `;

    const results = await db.query(queryFollowerStats, [slug]);

    res.status(200).json(results[0]);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error Fetching Follower Stats" });
  }
})


// Article Editor

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
    const values = [currentSlug, title, categories, description, JSON.stringify(content), JSON.stringify(tags), featuredImage];
    const query_insert_article = `INSERT INTO ${tableName} (slug, title, category_id, description, content, tags, thumbnail_url)
                                      VALUES (?,?,?,?,?,?,?)`;
    await db.execute(query_insert_article, values);

    res.status(200).json({ Saved: "Article saved successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error during saving" });
  }
});

// Edit Article Save
contriRouter.post('/article/save/edit', async (req, res) => {
  const { prevSlug, article } = req.body;
  const user_id = req.user.id;

  const newArticle = JSON.parse(article);
  console.log("Received:", user_id);
  console.log("Received:", newArticle.prevSlug);

  const { currentSlug, title, description, categories, tags, featuredImage, content } = newArticle;

  try {
    const tableName = `${user_id}` + '_articles';
    const values = [currentSlug, title, categories, description, JSON.stringify(content), JSON.stringify(tags), featuredImage, prevSlug];
    const query_insert_article = `UPDATE ${tableName}
                                      SET slug = ?,
                                          title = ?,
                                          category_id = ?,
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
contriRouter.post('/article/send', async (req, res) => {
  const { slug, title } = req.body;
  const cont_id = req.user.id;
  const author = req.user.username;
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
    article.content = JSON.parse(article.content || '[]');

    res.json(article);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error Fetching Article" });
  }
});

// Analytics

contriRouter.get('/analytics', async (req, res) => {
  const userId = req.user.id;
  const { range, granularity } = req.query;
  const validRanges = {
    '7d': '7',
    '30d': '30',
    '3m': '90',
  };

  try {
    // Overview Metrics
    const queryOverview = `
      SELECT
        (
          SELECT COALESCE(SUM(a.views), 0)
          FROM articles a
          WHERE a.cont_id = ?
        ) AS total_views,

        (
          SELECT COALESCE(SUM(a.likes), 0)
          FROM articles a
          WHERE a.cont_id = ?
        ) AS total_likes,

        (
          SELECT COUNT(*)
          FROM comments cm
          JOIN articles a
            ON cm.article_id = a.article_id
          WHERE a.cont_id = ?
            AND cm.status = 'Approved'
        ) AS total_comments,

        (
          SELECT COALESCE(followers, 0)
          FROM contributor
          WHERE cont_id = ?
        ) AS total_followers,

        (
          SELECT COUNT(*)
          FROM bookmarks b
          JOIN articles a
            ON b.article_id = a.article_id
          WHERE a.cont_id = ?
        ) AS total_bookmarks
    `;

    const [overviewRows] = await db.query(
      queryOverview,
      [userId, userId, userId, userId, userId]
    );
    const overview = overviewRows[0];

    // Engagement Metric
    const engageCalculation = Number(overview.total_likes) + Number(overview.total_comments) + Number(overview.total_bookmarks);
    const totalViews = Number(overview.total_views);
    const engagementRate = totalViews > 0 ? (engageCalculation / totalViews) * 100 : 0;

    // Content Summary
    const tableName = `${userId}_articles`;
    const queryContentSummary = `
      SELECT
        SUM(CASE
          WHEN a.article_status = 'Approved' THEN 1
          ELSE 0
        END) AS published,

        SUM(CASE
          WHEN a.article_status = 'Draft' THEN 1
          ELSE 0
        END) AS draft,

        SUM(CASE
          WHEN a.article_status = 'Pending' THEN 1
          ELSE 0
        END) AS pending,

        SUM(CASE
          WHEN a.article_status = 'Rejected' THEN 1
          ELSE 0
        END) AS rejected

      FROM ${tableName} a
    `;

    const [contentSummaryRows] = await db.query(queryContentSummary);
    const contentSummary = contentSummaryRows[0];

    // Time Series Data

    let dateCondition = '';

    if (range !== 'all') {
      if (!validRanges[range]) {
        return res.status(400).json({
          message: 'Invalid range'
        });
      }
      dateCondition = `
        AND av.created_at >= NOW() - INTERVAL ${validRanges[range]} DAY
      `;
    }
    let viewTimeSeries = [];

    if (granularity === 'daily') {

      const queryViewTimeSeries = `
        SELECT
          DATE(av.created_at) AS date,
          COUNT(*) AS views

        FROM article_views av

        JOIN articles a
          ON av.article_id = a.article_id

        WHERE a.cont_id = ?
          ${dateCondition}

        GROUP BY DATE(av.created_at)

        ORDER BY date ASC
      `;

      const [rows] = await db.query(
        queryViewTimeSeries,
        [userId]
      );

      viewTimeSeries = rows;
    }
    else if (granularity === 'weekly') {
      const queryViewTimeSeries = `
        SELECT
          DATE_SUB(
            DATE(av.created_at),
            INTERVAL WEEKDAY(av.created_at) DAY
          ) AS date,

          COUNT(*) AS views

        FROM article_views av

        JOIN articles a
          ON av.article_id = a.article_id

        WHERE a.cont_id = ?
          ${dateCondition}

        GROUP BY
          DATE_SUB(
            DATE(av.created_at),
            INTERVAL WEEKDAY(av.created_at) DAY
          )

        ORDER BY date ASC
      `;

      const [rows] = await db.query(
        queryViewTimeSeries,
        [userId]
      );

      viewTimeSeries = rows;
    }
    else {
      return res.status(400).json({
        message: 'Invalid granularity'
      });
    }

    // Top Performing Articles

    const queryTopArticles = `
      SELECT
        a.article_id,
        a.slug,
        a.title,
        a.views,
        a.likes,
        (
          SELECT COUNT(*)
          FROM comments c
          WHERE c.article_id = a.article_id
            AND c.status = 'Approved'
        ) AS comments
      FROM articles a
      WHERE a.cont_id = ?
      ORDER BY a.views DESC
      LIMIT 5;
    `;

    const [topArticlesRows] = await db.query(
      queryTopArticles,
      [userId]
    );
    const topArticles = topArticlesRows;

    // Engagement Series
    let likesDateCondition = '';
    let commentsDateCondition = '';
    let bookmarksDateCondition = '';

    if (range !== 'all') {
      if (!validRanges[range]) {
        return res.status(400).json({
          message: 'Invalid range'
        });
      }
      likesDateCondition = `AND al.created_at >= NOW() - INTERVAL ${validRanges[range]} DAY`;
      commentsDateCondition = `AND c.created_at >= NOW() - INTERVAL ${validRanges[range]} DAY`;
      bookmarksDateCondition = `AND b.created_at >= NOW() - INTERVAL ${validRanges[range]} DAY`;
    }

    const queryEngagementSeries = `
      SELECT
        date,
        SUM(likes) AS likes,
        SUM(comments) AS comments,
        SUM(bookmarks) AS bookmarks
      FROM (
        -- Likes
        SELECT
          DATE(al.created_at) AS date,
          COUNT(*) AS likes,
          0 AS comments,
          0 AS bookmarks
        FROM article_likes al
        JOIN articles a
          ON al.article_id = a.article_id
        WHERE a.cont_id = ?
          ${likesDateCondition}
        GROUP BY DATE(al.created_at)
        UNION ALL

        -- Comments
        SELECT
          DATE(c.created_at) AS date,
          0 AS likes,
          COUNT(*) AS comments,
          0 AS bookmarks
        FROM comments c
        JOIN articles a
          ON c.article_id = a.article_id
        WHERE a.cont_id = ?
          AND c.status = 'Approved'
          ${commentsDateCondition}
        GROUP BY DATE(c.created_at)
        UNION ALL

        -- Bookmarks
        SELECT
          DATE(b.created_at) AS date,
          0 AS likes,
          0 AS comments,
          COUNT(*) AS bookmarks
        FROM bookmarks b
        JOIN articles a
          ON b.article_id = a.article_id
        WHERE a.cont_id = ?
          ${bookmarksDateCondition}
          GROUP BY DATE(b.created_at)
      ) AS engagement
      GROUP BY date
      ORDER BY date ASC;
    `
    const [rows] = await db.query(queryEngagementSeries, [userId, userId, userId]);

    const engagementSeries = rows.map(row => ({
      date: row.date,
      likes: Number(row.likes),
      comments: Number(row.comments),
      bookmarks: Number(row.bookmarks)
    }));

    // Followers Series
    let followerGrowth = [];
    let startDate = null;
    if (range === '7d') {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);

    } else if (range === '30d') {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);

    } else if (range === '3m') {
      startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 3);
    }


    // Followers existing before selected range
    let startingFollowers = 0;
    if (startDate) {
      const queryStartingFollowers = `
        SELECT COUNT(*) AS followers
        FROM reader_follows
        WHERE contributor_id = ?
          AND created_at < ?
      `;

      const [startingRows] = await db.query(
        queryStartingFollowers,
        [userId, startDate]
      );

      startingFollowers = Number(
        startingRows[0].followers
      );
    }


    // Determine grouping
    let followerDateExpression = '';
    if (granularity === 'daily') {
      followerDateExpression = `
        DATE(rf.created_at)
      `;

    } else {
      followerDateExpression = `
        DATE_SUB(
          DATE(rf.created_at),
          INTERVAL WEEKDAY(rf.created_at) DAY
        )
      `;
    }


    let followerDateCondition = '';
    if (startDate) {
      followerDateCondition = `
        AND rf.created_at >= ?
      `;
    }
    const queryFollowerGrowth = `
      SELECT
        ${followerDateExpression} AS date,
        COUNT(*) AS new_followers
      FROM reader_follows rf
      WHERE rf.contributor_id = ?
        ${followerDateCondition}
      GROUP BY ${followerDateExpression}
      ORDER BY date ASC
    `;


    const followerParams = startDate
      ? [userId, startDate]
      : [userId];


    const [followerRows] = await db.query(
      queryFollowerGrowth,
      followerParams
    );


    // Convert new followers → cumulative followers
    let currentFollowers = startingFollowers;
    followerGrowth = followerRows.map(row => {
      currentFollowers += Number(
        row.new_followers
      );
      return {
        date: row.date,
        followers: currentFollowers
      };
    });


    res.status(200).json({
      overview,
      contentSummary,
      engagementRate,
      viewTimeSeries,
      topArticles,
      engagementSeries,
      followerGrowth
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Error Fetching Analytics'
    });
  }
});


// Settings

contriRouter.put("/settings/password", passwordResetLimiter, async (req, res) => {
  const userId = req.user.id;
  const { current_password, new_password } = req.body;

  try {
    const oldHashedPassword = await bcrypt.hash(current_password, 10);

    const queryGetPassword = "SELECT password FROM users WHERE id = ?";
    const [user] = await db.query(queryGetPassword, [userId]);

    const isPasswordCorrect = await bcrypt.compare(oldHashedPassword, user[0].password);

    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    const newHashedPassword = await bcrypt.hash(new_password, 10);
    const updatePasswordQuery = "UPDATE users SET password = ? WHERE id = ?";
    await db.query(updatePasswordQuery, [newHashedPassword, userId]);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Password update failed",
    });
  }
});

contriRouter.get('/delete', deleteLimiter, async (req, res) => {
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


export default contriRouter;