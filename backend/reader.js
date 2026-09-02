import express from "express";
import db from "./db.js"

import { authMiddleware, authorizeReader } from './middleware.js';

const readRouter = express.Router();

readRouter.use(authMiddleware);
readRouter.use(authorizeReader);

// Stats

readRouter.get("/stat/reads/total", async (req, res) => {
    const userId = req.user.id;

    try {
        const queryTotalReads = "SELECT COUNT(*) AS total_reads FROM article_views WHERE reader_id = ?";
        const [totalReadsResult] = await db.query(queryTotalReads, [userId]);
        const totalReads = totalReadsResult[0].total_reads || 0;

        res.status(200).json({ total_reads: totalReads });
    } catch (error) {
        console.error("Error fetching reader stats:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

readRouter.get("/stat/likes", async (req, res) => {
    const userId = req.user.id;

    try {
        const queryTotalLikes = "SELECT COUNT(*) AS total_likes FROM article_likes WHERE reader_id = ?";
        const [totalLikesResult] = await db.query(queryTotalLikes, [userId]);
        const totalLikes = totalLikesResult[0].total_likes || 0;

        res.status(200).json({ total_likes: totalLikes });
    } catch (error) {
        console.error("Error fetching reader stats:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

readRouter.get("/stat/likes/week", async (req, res) => {
    const userId = req.user.id;

    try {
        const queryWeek = `
            SELECT COUNT(*) AS week_likes
            FROM article_likes
            WHERE reader_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 1 WEEK)
        `;

        const [weekLikesResult] = await db.query(queryWeek, [userId]);
        const weekLikes = weekLikesResult[0].week_likes || 0;
        res.status(200).json({ week_likes: weekLikes });

    } catch (error) {
        console.error("Error fetching weekly likes:", error);
        res.status(500).json({ message: "Internal server error" });
    }
})

readRouter.get("/stat/likes/month", async (req, res) => {
    const userId = req.user.id;

    try {
        const queryMonth = `
            SELECT COUNT(*) AS month_likes
            FROM article_likes
            WHERE reader_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)
        `;

        const [monthLikesResult] = await db.query(queryMonth, [userId]);
        const monthLikes = monthLikesResult[0].month_likes || 0;
        res.status(200).json({ month_likes: monthLikes });

    } catch (error) {
        console.error("Error fetching monthly likes:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

readRouter.get("/stat/bookmarks", async (req, res) => {
    const userId = req.user.id;

    try {
        const queryTotalBookmarks = "SELECT COUNT(*) AS total_bookmarks FROM bookmarks WHERE reader_id = ?";
        const [totalBookmarksResult] = await db.query(queryTotalBookmarks, [userId]);
        const totalBookmarks = totalBookmarksResult[0].total_bookmarks || 0;

        res.status(200).json({ total_bookmarks: totalBookmarks });
    } catch (error) {
        console.error("Error fetching reader stats:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

readRouter.get("/stat/reads/week", async (req, res) => {
    const userId = req.user.id;

    try {
        const queryWeekReads = `
            SELECT COUNT(*) AS week_reads 
            FROM article_views
            WHERE reader_id = ? AND viewed_at >= DATE_SUB(NOW(), INTERVAL 1 WEEK)
        `;
        const [weekReadsResult] = await db.query(queryWeekReads, [userId]);
        const weekReads = weekReadsResult[0].week_reads || 0;

        res.status(200).json({ week: weekReads });
    } catch (error) {
        console.error("Error fetching weekly reads:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

readRouter.get("/stat/reads/month", async (req, res) => {
    const userId = req.user.id;

    try {
        const queryMonthReads = `
            SELECT COUNT(*) AS month_reads 
            FROM article_views
            WHERE reader_id = ? AND viewed_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)
        `;
        const [monthReadsResult] = await db.query(queryMonthReads, [userId]);
        const monthReads = monthReadsResult[0].month_reads || 0;

        res.status(200).json({ month: monthReads });
    } catch (error) {
        console.error("Error fetching monthly reads:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

readRouter.get("/stat/comments", async (req, res) => {
    const userId = req.user.id;

    try {
        const queryCommentsStats = `
            SELECT 
                COUNT(*) AS total,
                SUM(CASE WHEN status = 'Approved' THEN 1 ELSE 0 END) AS approved,
                SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) AS pending
            FROM comments
            WHERE user_id = ?
        `;
        const [commentsStats] = await db.query(queryCommentsStats, [userId]);
        res.status(200).json(commentsStats[0]);

    } catch (error) {
        console.error("Error fetching comment stats:", error);
        res.status(500).json({ message: "Internal server error" });
    }
})


// Announcements
readRouter.get("/announcements", async (req, res) => {
    try {
        const queryAnnouncements = "SELECT * FROM announcements WHERE audience = ? OR audience = ? ORDER BY created_at DESC LIMIT 5";
        const [announcements] = await db.query(queryAnnouncements, ["All", "Readers"]);
        res.status(200).json({ announce: announcements });

    } catch (error) {
        console.error("Error fetching announcements:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

readRouter.get("/recent/published", async (req, res) => {
    try {
        const queryRecentPublished = "SELECT article_id, slug, title FROM articles ORDER BY publish_at DESC LIMIT 5";
        const [recentPublished] = await db.query(queryRecentPublished);
        res.status(200).json({ recents: recentPublished });

    } catch (error) {
        console.error("Error fetching recent published articles:", error);
        res.status(500).json({ message: "Internal server error" });
    }
})

// My Reads
readRouter.get("/recent/reads", async (req, res) => {
    const userId = req.user.id;

    try {
        const queryRecentReads = `
        SELECT a.article_id, a.slug, a.title, a.thumbnail_url, c.name AS category_name, a.author, a.views, a.likes, a.created_at
        FROM articles a
        JOIN article_views av ON a.article_id = av.article_id
        JOIN categories c ON a.category_id = c.id
        WHERE av.reader_id = ?
        ORDER BY av.created_at DESC
        `;
        const [recentReads] = await db.query(queryRecentReads, [userId]);
        res.status(200).json({ recents: recentReads });

    } catch (error) {
        console.error("Error fetching recent reads:", error);
        res.status(500).json({ message: "Internal server error" });
    }
})

// Bookmarks

readRouter.get("/bookmarks", async (req, res) => {
    const userId = req.user.id;

    try {
        const queryBookmarks = `
            SELECT a.article_id, a.slug, a.title, a.thumbnail_url, c.name AS category_name, a.author, a.views, a.likes, b.created_at
            FROM articles a
            JOIN bookmarks b ON a.article_id = b.article_id
            JOIN categories c ON a.category_id = c.id
            WHERE b.reader_id = ?
            ORDER BY b.created_at DESC
        `;
        const [bookmarks] = await db.query(queryBookmarks, [userId]);
        res.status(200).json(bookmarks);
    } catch (error) {
        console.error("Error fetching bookmarks:", error);
        res.status(500).json({ message: "Internal server error" });
    }
})

readRouter.delete("/bookmark/:articleId", async (req, res) => {
    const userId = req.user.id;
    const { articleId } = req.params;
    try {
        const deleteQuery = `
            DELETE FROM bookmarks
            WHERE reader_id = ? AND article_id = ?
        `;

        const [result] = await db.query(deleteQuery, [userId, articleId]);
        if (result.affectedRows > 0) {
            res.status(200).json({ message: "Bookmark removed successfully" });
        } else {
            res.status(404).json({ message: "Bookmark not found" });
        }
    } catch (error) {
        console.error("Error removing bookmark:", error);
        res.status(500).json({ message: "Internal server error" });
    }
})

// Likes

readRouter.get("/likes", async (req, res) => {
    const userId = req.user.id;

    try {
        const queryLikes = `
            SELECT a.article_id, a.slug, a.title, a.thumbnail_url, c.name AS category_name, a.author, a.views, a.likes, al.created_at
            FROM articles a
            JOIN article_likes al ON a.article_id = al.article_id
            JOIN categories c ON a.category_id = c.id
            WHERE al.reader_id = ?
            ORDER BY al.created_at DESC
        `;
        const [likes] = await db.query(queryLikes, [userId]);
        res.status(200).json({ likes: likes });

    } catch (error) {
        console.error("Error fetching likes:", error);
        res.status(500).json({ message: "Internal server error" });
    }
})

readRouter.delete("/like/:articleId", async (req, res) => {
    const userId = req.user.id;
    const { articleId } = req.params;

    try {
        const deleteQuery = `
            DELETE FROM article_likes
            WHERE reader_id = ? AND article_id = ?
        `;

        const [result] = await db.query(deleteQuery, [userId, articleId]);
        if (result.affectedRows > 0) {
            res.status(200).json({ message: "Like removed successfully" });
        } else {
            res.status(404).json({ message: "Like not found" });
        }

    } catch (error) {
        console.error("Error removing like:", error);
        res.status(500).json({ message: "Internal server error" });
    }
})

// Following

readRouter.get("/following", async (req, res) => {
    const userId = req.user.id;

    try {
        const queryFollowing = `
            SELECT c.cont_id, c.username, c.bio, c.slug, c.profile_pic, f.created_at, COUNT(a.article_id) AS article_count
            FROM contributor c
            JOIN reader_follows f 
                ON c.cont_id = f.contributor_id
            LEFT JOIN articles a 
                ON c.cont_id = a.cont_id
            WHERE f.reader_id = ?
            GROUP BY 
                c.cont_id, c.username, c.bio, c.slug, c.profile_pic, f.created_at
            ORDER BY f.created_at DESC;
        `;
        const [following] = await db.query(queryFollowing, [userId]);
        res.status(200).json(following);

    } catch (error) {
        console.error("Error fetching following:", error);
        res.status(500).json({ message: "Internal server error" });
    }
})

readRouter.delete("/follow/:contId", async (req, res) => {
    const userId = req.user.id;
    const { contId } = req.params;

    try {
        const deleteQuery = `
            DELETE FROM reader_follows
            WHERE reader_id = ? AND contributor_id = ?
        `;
        const [result] = await db.query(deleteQuery, [userId, contId]);
        if (result.affectedRows > 0) {
            res.status(200).json({ message: "Follow relationship removed successfully" });
        } else {
            res.status(404).json({ message: "Follow relationship not found" });
        }
    } catch (error) {
        console.error("Error removing follow relationship:", error);
        res.status(500).json({ message: "Internal server error" });
    }
})

// Comments

readRouter.get("/comments", async (req, res) => {
    const userId = req.user.id;

    try {
        const queryComments = `
            SELECT c.id, c.article_id, c.content, c.status, c.created_at, a.title AS article_title, a.slug AS article_slug
            FROM comments c
            JOIN articles a ON c.article_id = a.article_id
            WHERE c.user_id = ?
            ORDER BY c.created_at DESC
        `;
        const [comments] = await db.query(queryComments, [userId]);
        res.status(200).json({ comments: comments });

    } catch (error) {
        console.error("Error fetching comments:", error);
        res.status(500).json({ message: "Internal server error" });
    }
})


export default readRouter;
