export async function up({ context: db }) {

    await db.execute(`
        CREATE TABLE password_reset_otps (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id VARCHAR(255) NOT NULL,
            otp_hash VARCHAR(255) NOT NULL,
            expires_at DATETIME NOT NULL,
            attempts INT DEFAULT 0,
            used_at DATETIME NULL,
            reset_token_hash VARCHAR(255) NULL,
            reset_token_expires_at DATETIME NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY (user_id) REFERENCES users(id)
                ON DELETE CASCADE
    );`)

}

export async function down({ context: db }) {
    await db.execute(`DROP TABLE IF EXISTS password_reset_otps;`)
}