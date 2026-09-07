import express from "express";
import db from "./db.js";
import axios from 'axios';
import multer from "multer";
import fs from "fs";
import FormData from 'form-data';
import bcrypt from "bcryptjs";
import { authMiddleware, authorizeReader } from './middleware.js';

const readRouter = express.Router();

readRouter.use(authMiddleware);
readRouter.use(authorizeReader);
const upload = multer({ dest: "uploads/" });

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

readRouter.get("/stat/following", async (req, res) => {
    const userId = req.user.id;

    try {
        const queryFollowing = "SELECT COUNT(*) AS following FROM reader_follows WHERE reader_id = ?";
        const [followingResult] = await db.query(queryFollowing, [userId]);
        const following = followingResult[0].following || 0;

        res.status(200).json({ total_following: following });
    } catch (error) {
        console.error("Error fetching following stats:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

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

readRouter.delete("/comment/:commentId", async (req, res) => {
    const userId = req.user.id;
    const { commentId } = req.params;

    try {
        const deleteQuery = `
            DELETE FROM comments
            WHERE id = ? AND user_id = ?
        `;
        const [result] = await db.query(deleteQuery, [commentId, userId]);
        if (result.affectedRows > 0) {
            res.status(200).json({ message: "Comment deleted successfully" });
        } else {
            res.status(404).json({ message: "Comment not found" });
        }
    } catch (error) {
        console.error("Error deleting comment:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Profile

readRouter.get("/profile", async (req, res) => {
    const userId = req.user.id;

    try {
        const queryProfile = `
            SELECT username, bio, email, profile_pic, created_at
            FROM reader 
            WHERE sub_id = ?`
        const [profile] = await db.query(queryProfile, [userId]);
        res.status(200).json({ profile: profile[0] });

    } catch (error) {
        console.error("Error fetching profile:", error);
        res.status(500).json({ message: "Internal server error" });
    }
})

readRouter.put("/profile/update", upload.single("profile_pic"), async (req, res) => {
    const userId = req.user.id;
    const { username, bio } = req.body;

    const setClauses = [];
    const values = [];

    try {

        if (username !== undefined) {

            if (typeof username !== "string" || username.trim().length < 3) {
                return res.status(400).json({
                    message: "Username must be at least 3 characters"
                });
            }

            const cleanUsername = username.trim();

            // Check whether another reader is already using this username
            const checkUsernameQuery = `
          SELECT sub_id
          FROM reader
          WHERE username = ?
          AND sub_id != ?
        `;

            const [usernameResult] = await db.query(
                checkUsernameQuery,
                [cleanUsername, userId]
            );

            if (usernameResult.length > 0) {
                return res.status(409).json({
                    message: "Username already taken"
                });
            }

            setClauses.push("username = ?");
            values.push(cleanUsername);
        }

        if (bio !== undefined) {

            if (typeof bio !== "string") {
                return res.status(400).json({
                    message: "Invalid bio"
                });
            }

            if (bio.length > 500) {
                return res.status(400).json({
                    message: "Bio must be less than 500 characters"
                });
            }

            setClauses.push("bio = ?");
            values.push(bio);
        }

        if (req.file !== undefined) {

            console.log(
                "Profile picture should be updated:",
                req.file.originalname
            );

            const fileStream = fs.createReadStream(req.file.path);

            const form = new FormData();

            form.append("file", fileStream);
            form.append("name", req.file.originalname);
            form.append("network", "public");

            const pinataRes = await axios.post(
                "https://uploads.pinata.cloud/v3/files",
                form,
                {
                    headers: {
                        Authorization: `Bearer ${process.env.PINATA_BEARER_TOKEN}`,
                        ...form.getHeaders(),
                    },
                }
            );

            // Delete temporary uploaded file
            fs.unlinkSync(req.file.path);

            const imageUrl =
                pinataRes.data?.data?.preview ||
                `https://gateway.pinata.cloud/ipfs/${pinataRes.data?.data?.cid}`;

            console.log("New image:", imageUrl);
 
            setClauses.push("profile_pic = ?");
            values.push(imageUrl);
        }

        if (setClauses.length === 0) {
            return res.status(400).json({
                message: "No valid fields to update"
            });
        }

        values.push(userId);

        const updateProfileQuery = `
        UPDATE reader
        SET ${setClauses.join(", ")}
        WHERE sub_id = ?
      `;

        await db.query(updateProfileQuery, values);


        res.status(200).json({
            message: "Profile updated successfully"
        });

    } catch (error) {
        console.error(error);

        if (req.file) {
            try {
                if (fs.existsSync(req.file.path)) {
                    fs.unlinkSync(req.file.path);
                }
            } catch (fileError) {
                console.error("Error deleting temporary file:", fileError);
            }
        }

        res.status(500).json({
            message: "Profile update failed"
        });
    }
});

// Settings

readRouter.put("/settings/password", async (req, res) => {
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

readRouter.delete("/delete", async (req, res) => {
    const userId = req.user.id;

    try {
        const queryDeleteReader = "DELETE FROM reader WHERE sub_id = ?";
        await db.query(queryDeleteReader, [userId]);

        const queryDeleteUser = "DELETE FROM users WHERE id = ?";
        await db.query(queryDeleteUser, [userId]);

        const queryDeleteFollows = "DELETE FROM reader_follows WHERE reader_id = ?";
        await db.query(queryDeleteFollows, [userId]);

        const queryDeleteBookmarks = "DELETE FROM bookmarks WHERE reader_id = ?";
        await db.query(queryDeleteBookmarks, [userId]);

        const queryDeleteLikes = "DELETE FROM article_likes WHERE reader_id = ?";
        await db.query(queryDeleteLikes, [userId]);

        const queryDeleteComments = "DELETE FROM comments WHERE user_id = ?";
        await db.query(queryDeleteComments, [userId]);

        res.status(200).json({
            message: "User deleted successfully",
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "User deletion failed",
        });
    }
});


export default readRouter;
