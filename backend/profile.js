import express from 'express';
import db from './db.js';
const profileRouter = express.Router();

profileRouter.get('/cont/:slug', async (req, res) => {
    const { slug } = req.params;

    try {
        const fetchinfoQuery = `SELECT cont_id,username, email, bio, profile_pic, dob, expertise, links, city, country, followers, created_at FROM contributor WHERE slug = ? && status='Approved' || status='Block'`;
        const results = await db.query(fetchinfoQuery, [slug]);
        const profileInfo = results[0][0];

        if (!profileInfo) {
            return res.status(404).json({ message: "Contributor not found" });
        }

        const author = profileInfo.username;

        const fetchinfoQuery1 = `
                SELECT
                    a.article_id,
                    a.slug,
                    a.title,
                    a.description,
                    a.category_id,
                    c.name as category_name,
                    a.thumbnail_url,
                    a.cont_id,
                    a.views,
                    a.likes,
                    a.publish_at
                FROM articles a
                JOIN categories c
                    ON a.category_id = c.id
                WHERE a.author = ?
                ORDER BY a.publish_at DESC;`;
        const results1 = await db.query(fetchinfoQuery1, [author]);
        const articleInfo = results1[0];

        const fetchPopularQuery = `
                SELECT 
                    a.article_id, 
                    a.slug, 
                    a.title, 
                    a.description, 
                    c.name as category_name,
                    a.thumbnail_url, 
                    a.cont_id, 
                    a.views, 
                    a.likes, 
                    a.publish_at 
                FROM articles a
                JOIN categories c
                    ON a.category_id = c.id
                WHERE a.author=? 
                ORDER BY a.views DESC`;
        const popularResult = await db.query(fetchPopularQuery, [author]);
        const popularArticles = popularResult[0];

        const fetchlikeQuery = `
                SELECT 
                    a.article_id, 
                    a.slug, 
                    a.title, 
                    a.description, 
                    c.name as category_name, 
                    a.thumbnail_url, 
                    a.cont_id, 
                    a.views, 
                    a.likes, 
                    a.publish_at 
                FROM articles a
                JOIN categories c 
                    ON a.category_id = c.id
                WHERE a.author=? 
                ORDER BY a.likes DESC`;
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
        res.status(500).json({ message: "Error Fetching Profile Info" });

    }
});

profileRouter.get('/reader/:slug', async (req, res) => {
    const { slug } = req.params;

    try {
        const fetchinfoQuery = `SELECT sub_id, username, bio, profile_pic, created_at FROM reader WHERE username = ?`;
        const results = await db.query(fetchinfoQuery, [slug]);
        const profileInfo = results[0][0];

        if (!profileInfo) {
            return res.status(404).json({ message: "Profile not found" });
        }

        const fetchStatsQuery = `SELECT COUNT(*) AS total_following FROM reader_follows WHERE reader_id = ?`;
        const statsResults = await db.query(fetchStatsQuery, [profileInfo.sub_id]);
        const totalFollowing = statsResults[0][0].total_following;

        const fetchLikeStatsQuery = `SELECT COUNT(*) AS total_likes FROM article_likes WHERE reader_id = ?`;
        const likeStatsResults = await db.query(fetchLikeStatsQuery, [profileInfo.sub_id]);
        const totalLikes = likeStatsResults[0][0].total_likes;

        const fetchCommentStatsQuery = `SELECT COUNT(*) AS total_comments FROM comments WHERE user_id = ?`;
        const commentStatsResults = await db.query(fetchCommentStatsQuery, [profileInfo.sub_id]);
        const totalComments = commentStatsResults[0][0].total_comments;

        res.status(200).json({ profileInfo, totalFollowing, totalLikes, totalComments });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error Fetching Profile Info" });
    }
});

profileRouter.get('/reader/:name/:tab', async (req, res) => {
    const { name, tab } = req.params;

    try {
        if (tab === 'likes') {
            const fetchLikedArticlesQuery = `
                SELECT 
                    a.article_id,
                    a.slug,
                    a.title,
                    a.thumbnail_url,
                    c.name AS category_name,
                    a.author
                FROM articles a
                JOIN categories c 
                    ON a.category_id = c.id
                JOIN article_likes al 
                    ON a.article_id = al.article_id
                JOIN reader r 
                    ON al.reader_id = r.sub_id
                WHERE r.username = ?
                ORDER BY al.created_at DESC;
            `
            const likedArticlesResult = await db.query(fetchLikedArticlesQuery, [name]);

            const likedArticles = likedArticlesResult[0];

            res.status(200).json(likedArticles);
        }

        if (tab === 'following') {
            const fetchFollowingQuery = `
                SELECT
                    c.cont_id,
                    c.username,
                    c.bio,
                    c.profile_pic
                FROM contributor c
                JOIN reader_follows rf 
                    ON c.cont_id = rf.contributor_id
                WHERE rf.reader_id = (SELECT sub_id FROM reader WHERE username = ?)
                ORDER BY rf.created_at DESC;
            `
            const followingResult = await db.query(fetchFollowingQuery, [name]);
            const following = followingResult[0];

            res.status(200).json(following);
        }

        if (tab === 'comments') {
            const fetchCommentsQuery = `
                SELECT 
                    c.id,
                    c.content,
                    c.created_at,
                    a.title AS article_title,
                    a.slug AS article_slug
                FROM comments c
                JOIN articles a 
                    ON c.article_id = a.article_id
                JOIN reader r 
                    ON c.user_id = r.sub_id
                WHERE r.username = ?
                ORDER BY c.created_at DESC;
            `;
            const commentsResult = await db.query(fetchCommentsQuery, [name]);
            const comments = commentsResult[0];

            res.status(200).json(comments);
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error Fetching Tab Data" });

    }
})

export default profileRouter;