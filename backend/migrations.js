import { Umzug } from "umzug";
import db, { MyDbName } from "./db.js";


const MIGRATION_TABLE = "umzug_migrations";

// Create the migration table if it doesn't exist
async function createMigrationTable() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS ${MIGRATION_TABLE} (
      name VARCHAR(255) PRIMARY KEY,
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

const storage = {
  async executed() {
    const [rows] = await db.execute(`
      SELECT name
      FROM ${MIGRATION_TABLE}
      ORDER BY name
    `);

    return rows.map((row) => row.name);
  },

  async logMigration({ name }) {
    await db.execute(
      `
        INSERT INTO ${MIGRATION_TABLE} (name)
        VALUES (?)
      `,
      [name]
    );
  },
  async unlogMigration({ name }) {
    await db.execute(
      `
        DELETE FROM ${MIGRATION_TABLE}
        WHERE name = ?
      `,
      [name]
    );
  },
};

const umzug = new Umzug({
  migrations: {
    glob: "migrations/*.js",
  },
  context: db,
  storage,
  logger: console,

});

// Check if the initial migration has been applied, and if not, mark it as applied if the database already has the expected tables
async function baselineExistingDatabase() {
  const [migrationRows] = await db.execute(
    `
      SELECT name
      FROM ${MIGRATION_TABLE}
      WHERE name = ?
      LIMIT 1
    `,
    ["001_initial_schema.js"]
  );

  if (migrationRows.length > 0) {
    console.log("001_initial_schema.js is already recorded as applied.");
    return;
  }

  const [tableRows] = await db.execute(
    `
      SELECT TABLE_NAME
      FROM information_schema.TABLES
      WHERE TABLE_SCHEMA = ?
        AND TABLE_NAME = 'users'
      LIMIT 1
    `,
    [MyDbName]
  );

  if (tableRows.length > 0) {
    await db.execute(
      `
        INSERT INTO ${MIGRATION_TABLE} (name)
        VALUES (?)
      `,
      ["001_initial_schema.js"]
    );

    console.log("Existing database detected.");
    console.log("001_initial_schema.js marked as already applied.");
  }
}

export async function runMigrations() {

  await createMigrationTable();
  await baselineExistingDatabase();

  const pending = await umzug.pending();
  if (pending.length === 0) {
    console.log("Database migrations: nothing to migrate.");
    return;
  }

  console.log("Pending migrations:",pending.map((migration) => migration.name));
  await umzug.up();
  console.log("Database migrations completed.");
}


export default umzug;