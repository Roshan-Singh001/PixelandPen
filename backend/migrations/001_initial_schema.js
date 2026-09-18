export async function up({ context: db }) {

  // 1. temp_users
  await db.execute(`
    CREATE TABLE IF NOT EXISTS temp_users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(100) NOT NULL,
      email VARCHAR(100) NOT NULL,
      password VARCHAR(255) NOT NULL,
      role ENUM('Admin', 'Reader', 'Contributor') NOT NULL,
      otp VARCHAR(10),
      otp_expiry DATETIME
    )
  `);


  // 2. users
  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(255) PRIMARY KEY,
      username VARCHAR(100),
      email VARCHAR(100),
      password VARCHAR(255),
      role ENUM('Admin', 'Reader', 'Contributor'),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);


  // 3. admin
  await db.execute(`
    CREATE TABLE IF NOT EXISTS admin (
      admin_id VARCHAR(255) PRIMARY KEY,
      username VARCHAR(100) NOT NULL,
      email VARCHAR(100) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);


  // 4. contributor
  await db.execute(`
    CREATE TABLE IF NOT EXISTS contributor (
      cont_id VARCHAR(255) PRIMARY KEY,
      username VARCHAR(100) NOT NULL,
      slug VARCHAR(255) UNIQUE,
      email VARCHAR(100) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      bio VARCHAR(255),
      profile_pic VARCHAR(255),
      dob DATE,
      expertise JSON,
      links JSON,
      city VARCHAR(255),
      country VARCHAR(255),
      status ENUM(
        'Pending',
        'Approved',
        'Rejected',
        'Block'
      ) DEFAULT 'Pending',
      reject_reason TEXT DEFAULT NULL,
      followers INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);


  // 5. reader
  await db.execute(`
    CREATE TABLE IF NOT EXISTS reader (
      sub_id VARCHAR(255) PRIMARY KEY,
      username VARCHAR(100) NOT NULL,
      email VARCHAR(100) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      bio VARCHAR(255),
      profile_pic VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);


  // 6. categories
  await db.execute(`
    CREATE TABLE IF NOT EXISTS categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      slug VARCHAR(255) UNIQUE NOT NULL DEFAULT 'Unknown',
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);


  // 7. articles
  await db.execute(`
    CREATE TABLE IF NOT EXISTS articles (
      article_id VARCHAR(255) PRIMARY KEY,
      slug VARCHAR(255) UNIQUE,
      title VARCHAR(255) NOT NULL,
      category_id INT NOT NULL,
      description VARCHAR(200),
      content JSON NOT NULL,
      tags JSON,
      thumbnail_url VARCHAR(255),
      author VARCHAR(255) NOT NULL,
      cont_id VARCHAR(255) NOT NULL,
      views INT DEFAULT 0,
      likes INT DEFAULT 0,
      is_featured BOOLEAN DEFAULT FALSE,
      publish_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

      FOREIGN KEY (category_id)
        REFERENCES categories(id)
    )
  `);


  // 8. article_likes
  await db.execute(`
    CREATE TABLE IF NOT EXISTS article_likes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      reader_id VARCHAR(255),
      article_id VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

      UNIQUE(reader_id, article_id),

      FOREIGN KEY (reader_id)
        REFERENCES reader(sub_id)
        ON DELETE CASCADE,

      FOREIGN KEY (article_id)
        REFERENCES articles(article_id)
        ON DELETE CASCADE
    )
  `);


  // 9. article_views
  await db.execute(`
    CREATE TABLE IF NOT EXISTS article_views (
      id INT AUTO_INCREMENT PRIMARY KEY,
      reader_id VARCHAR(255),
      article_id VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

      UNIQUE(reader_id, article_id),

      FOREIGN KEY (reader_id)
        REFERENCES reader(sub_id)
        ON DELETE CASCADE,

      FOREIGN KEY (article_id)
        REFERENCES articles(article_id)
        ON DELETE CASCADE
    )
  `);


  // 10. reader_follows
  await db.execute(`
    CREATE TABLE IF NOT EXISTS reader_follows (
      id INT AUTO_INCREMENT PRIMARY KEY,
      reader_id VARCHAR(255),
      contributor_id VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

      UNIQUE(reader_id, contributor_id),

      FOREIGN KEY (reader_id)
        REFERENCES reader(sub_id)
        ON DELETE CASCADE,

      FOREIGN KEY (contributor_id)
        REFERENCES contributor(cont_id)
        ON DELETE CASCADE
    )
  `);


  // 11. bookmarks
  await db.execute(`
    CREATE TABLE IF NOT EXISTS bookmarks (
      id INT AUTO_INCREMENT PRIMARY KEY,
      reader_id VARCHAR(255),
      article_id VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

      UNIQUE(reader_id, article_id),

      FOREIGN KEY (reader_id)
        REFERENCES reader(sub_id)
        ON DELETE CASCADE,

      FOREIGN KEY (article_id)
        REFERENCES articles(article_id)
        ON DELETE CASCADE
    )
  `);


  // 12. review_articles
  await db.execute(`
    CREATE TABLE IF NOT EXISTS review_articles (
      review_id INT AUTO_INCREMENT PRIMARY KEY,
      slug VARCHAR(255) UNIQUE,
      title VARCHAR(255) NOT NULL,
      author VARCHAR(255) NOT NULL,
      cont_id VARCHAR(255) NOT NULL,

      status ENUM(
        'Approved',
        'Rejected',
        'Pending'
      ) DEFAULT 'Pending',

      is_featured BOOLEAN DEFAULT FALSE,
      reject_reason TEXT DEFAULT NULL,
      reject_at TIMESTAMP DEFAULT NULL,

      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
    )
  `);


  // 13. comments
  await db.execute(`
    CREATE TABLE IF NOT EXISTS comments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      article_id VARCHAR(255) NOT NULL,
      article_title VARCHAR(255),
      user_id VARCHAR(255),
      username VARCHAR(255),
      content TEXT NOT NULL,

      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

      status ENUM(
        'Pending',
        'Approved',
        'Deleted'
      ) DEFAULT 'Pending',

      FOREIGN KEY (article_id)
        REFERENCES articles(article_id)
        ON DELETE CASCADE,

      FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE SET NULL
    )
  `);


  // 14. announcements
  await db.execute(`
    CREATE TABLE IF NOT EXISTS announcements (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      content TEXT,

      audience ENUM(
        'All',
        'Contributors',
        'Readers'
      ) DEFAULT 'All',

      status ENUM(
        'Draft',
        'Published'
      ) DEFAULT 'Draft',

      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      published_at DATETIME DEFAULT NULL
    )
  `);

  console.log("001_initial_schema migration executed.");
}


export async function down({ context: db }) {

  // Drop dependent tables first.
  await db.execute(`
    DROP TABLE IF EXISTS comments
  `);

  await db.execute(`
    DROP TABLE IF EXISTS bookmarks
  `);

  await db.execute(`
    DROP TABLE IF EXISTS reader_follows
  `);

  await db.execute(`
    DROP TABLE IF EXISTS article_views
  `);

  await db.execute(`
    DROP TABLE IF EXISTS article_likes
  `);

  await db.execute(`
    DROP TABLE IF EXISTS articles
  `);

  await db.execute(`
    DROP TABLE IF EXISTS review_articles
  `);

  await db.execute(`
    DROP TABLE IF EXISTS announcements
  `);

  await db.execute(`
    DROP TABLE IF EXISTS categories
  `);

  await db.execute(`
    DROP TABLE IF EXISTS reader
  `);

  await db.execute(`
    DROP TABLE IF EXISTS contributor
  `);

  await db.execute(`
    DROP TABLE IF EXISTS admin
  `);

  await db.execute(`
    DROP TABLE IF EXISTS users
  `);

  await db.execute(`
    DROP TABLE IF EXISTS temp_users
  `);
  
  console.log("001_initial_schema migration rolled back.");
}