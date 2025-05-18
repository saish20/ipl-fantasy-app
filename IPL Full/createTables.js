const pool = require('./db');

const createTables = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username TEXT UNIQUE NOT NULL,
        code TEXT NOT NULL,
        user_type TEXT CHECK (user_type IN ('admin', 'user')) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS schedule (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        team1 TEXT NOT NULL,
        team2 TEXT NOT NULL,
        match_date DATE NOT NULL,
        venue TEXT,
        status TEXT CHECK (status IN ('Upcoming', 'Completed')) DEFAULT 'Upcoming'
      );

      CREATE TABLE IF NOT EXISTS players (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        team TEXT NOT NULL,
        status TEXT CHECK (status IN ('Active', 'Inactive')) DEFAULT 'Active'
      );

      CREATE TABLE IF NOT EXISTS matches (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        schedule_id UUID REFERENCES schedule(id) ON DELETE CASCADE,
        actual_first_innings_score INTEGER,
        actual_match_winner TEXT,
        actual_mom TEXT
      );

      CREATE TABLE IF NOT EXISTS predictions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
        predicted_score INTEGER,
        predicted_winner TEXT,
        predicted_mom TEXT,
        fis_points INTEGER DEFAULT 0,
        mw_points INTEGER DEFAULT 0,
        mom_points INTEGER DEFAULT 0,
        total_points INTEGER DEFAULT 0
      );
    `);
    console.log('✅ All tables created successfully!');
    process.exit(); // exit after running
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    process.exit(1);
  }
};

createTables();
