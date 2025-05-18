const pool = require('./db');

const alterTable = async () => {
  try {
    await pool.query(`
      ALTER TABLE players
      ADD CONSTRAINT unique_player_name UNIQUE (name);
    `);
    console.log('✅ Unique constraint added to players table!');
    process.exit();
  } catch (error) {
    console.error('❌ Error altering table:', error);
    process.exit(1);
  }
};

alterTable();
