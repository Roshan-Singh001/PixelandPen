import express from 'express';
import db from './db.js';
const actionRouter = express.Router();

actionRouter.get('/isfollow/cont/', async (req, res) => {
    const userId = req.headers['user_id'];
    const cont_id = req.headers['cont_id'];

    try {
        const query = `SELECT id FROM reader_follows WHERE contributor_id=? AND reader_id=?`;
        const [results] = await db.query(query, [cont_id, userId]);
        const isFollow = results.length > 0;

        res.json({ isFollow });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error Fetching Profile Info" });

    }

});

actionRouter.get('/islike/article/', async (req, res) => {
    const userId = req.headers['user_id'];
    const article_id = req.headers['article_id'];

    try {
        const query = `SELECT id FROM article_likes WHERE reader_id=? AND article_id=?`;
        const [results] = await db.query(query, [userId, article_id]);
        const isLike = results.length > 0;

        res.json({ isLike });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error Fetching Profile Info" });

    }

});

actionRouter.post('/like', async (req, res) => {
    const { article_id, user_id } = req.body;

    try {
        const existing = await db.query(
            "SELECT * FROM article_likes WHERE article_id = ? AND reader_id = ?",
            [article_id, user_id]
        );

        if (existing.length > 0) {
            // Unlike
            await db.query(
                "DELETE FROM article_likes WHERE article_id = ? AND reader_id = ?",
                [article_id, user_id]
            );

            await db.query(
                "UPDATE articles SET likes = likes - 1 WHERE article_id = ?",
                [article_id]
            );

            return res.json({ liked: false });
        } else {
            // Like
            await db.query(
                "INSERT INTO article_likes (article_id, reader_id) VALUES (?, ?)",
                [article_id, user_id]
            );

            await db.query(
                "UPDATE articles SET likes = likes + 1 WHERE article_id = ?",
                [article_id]
            );

            return res.json({ liked: true });
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error in Like/Unlike" });
    }
});

actionRouter.post('/bookmark', async (req, res) => {
    const { article_id, user_id } = req.body;
    try {
        const existing = await db.query(
            "SELECT * FROM bookmarks WHERE article_id = ? AND reader_id = ?",
            [article_id, user_id]
        );

        if (existing.length > 0) {
            // Unbookmark
            await db.query(
                "DELETE FROM bookmarks WHERE article_id = ? AND reader_id = ?",
                [article_id, user_id]
            );
            res.json({ bookmarked: false });
        } else {
            // Bookmark
            await db.query(
                "INSERT INTO bookmarks (article_id, reader_id) VALUES (?, ?)",
                [article_id, user_id]
            );
            res.json({ bookmarked: true });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error in Bookmark/Unbookmark" });

    }
})

actionRouter.post('/follow/cont', async (req, res) => {
    const { cont_id, user_id, follow } = req.body;

    try {
        if (follow) {
            const query = `UPDATE contributor SET followers=followers+1 WHERE cont_id=?`;
            await db.query(query, [cont_id]);

            const query1 = `INSERT INTO reader_follows (reader_id,contributor_id) VALUES (?,?)`;
            await db.query(query1, [user_id, cont_id]);

            res.json({ message: "Followed" });
        }
        else {
            const query = `UPDATE contributor SET followers=followers-1 WHERE cont_id=?`;
            await db.query(query, [cont_id]);
            const query1 = `DELETE FROM reader_follows WHERE reader_id=? AND contributor_id=?`;
            await db.query(query1, [user_id, cont_id]);

            res.json({ message: "Unfollowed" });

        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error Fetching Profile Info" });

    }
});

actionRouter.post('/comment', async (req, res) => {
    const { article_id, article_title, userRole, user_id, content, username } = req.body;

    try {
        if (userRole == 'Admin') {
            const query = `INSERT INTO comments (article_id, article_title, user_id,content,username, status) VALUES (?,?,?,?,?,?)`;
            await db.query(query, [article_id, article_title, user_id, content, username, 'Approved']);

        }
        else {
            const query = `INSERT INTO comments (article_id,article_title,user_id,content,username) VALUES (?,?,?,?,?)`;
            await db.query(query, [article_id, article_title, user_id, content, username]);
        }

        res.json({ message: "Comment Posted" });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error while commenting" });

    }
});





export default actionRouter;