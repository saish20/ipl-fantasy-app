const express = require('express');
const cors = require('cors');
const pool = require('./db'); // importing db connection

const app = express();
app.use(cors());
app.use(express.json());

// Simple route to test DB connection
app.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()'); // simple SQL query
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Login API
app.post('/api/login', async (req, res) => {
    const { username, code } = req.body;
  
    try {
      const result = await pool.query(
        'SELECT id, username, user_type FROM users WHERE username = $1 AND code = $2',
        [username, code]
      );
  
      if (result.rows.length > 0) {
        res.json({
          success: true,
          message: 'Login successful',
          user: result.rows[0],
        });
      } else {
        res.status(401).json({
          success: false,
          message: 'Invalid username or code',
        });
      }
    } catch (error) {
      console.error('Login error:', error.message);
      res.status(500).send('Server error');
    }
  });
  
  // Get Upcoming Matches API
app.get('/api/get-matches', async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT id, team1, team2, match_date, venue 
         FROM schedule 
         WHERE match_date >= CURRENT_DATE
         ORDER BY match_date ASC`
      );
  
      res.json({
        success: true,
        matches: result.rows
      });
    } catch (error) {
      console.error('Error fetching matches:', error.message);
      res.status(500).send('Server error');
    }
  });

  // Submit Prediction API
// Submit Prediction API
app.post('/api/submit-prediction', async (req, res) => {
  const { user_id, match_id, predicted_first_innings_score, predicted_match_winner, predicted_man_of_the_match } = req.body;

  try {
    await pool.query(
      `INSERT INTO predictions (
         user_id, match_id, predicted_score, predicted_winner, predicted_mom, 
         fis_points, mw_points, mom_points, total_points, submitted_at
       )
       VALUES ($1, $2, $3, $4, $5, 0, 0, 0, 0, CURRENT_TIMESTAMP)
       ON CONFLICT (user_id, match_id)
       DO UPDATE SET 
         predicted_score = EXCLUDED.predicted_score,
         predicted_winner = EXCLUDED.predicted_winner,
         predicted_mom = EXCLUDED.predicted_mom,
         fis_points = 0,
         mw_points = 0,
         mom_points = 0,
         total_points = 0,
         submitted_at = CURRENT_TIMESTAMP;`,
      [
        user_id,
        match_id,
        predicted_first_innings_score,
        predicted_match_winner,
        predicted_man_of_the_match
      ]
    );

    res.json({
      success: true,
      message: 'Prediction submitted successfully!'
    });
  } catch (error) {
    console.error('Prediction error:', error);
    res.status(500).send('Server error');
  }
});

  
// Leaderboard API
app.get('/api/leaderboard', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        username,
        fis_points,
        mw_points,
        mom_points,
        (fis_points + mw_points + mom_points) AS total_points
      FROM leaderboard
      ORDER BY total_points DESC
    `);

    res.json({
      success: true,
      leaderboard: result.rows
    });
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).send('Server error');
  }
});
  
  app.get('/api/players', async (req, res) => {
    const { team1, team2 } = req.query;
  
    try {
      const result = await pool.query(
        `SELECT name FROM players 
         WHERE team IN ($1, $2) AND status = 'Active' 
         ORDER BY name ASC`,
        [team1, team2]
      );
  
      res.json({ success: true, players: result.rows.map(p => p.name) });
    } catch (err) {
      console.error('Error fetching players:', err.message);
      res.status(500).send('Server error');
    }
  });

// Update results
app.post('/api/update-results', async (req, res) => {
  const { schedule_id, actual_first_innings_score, actual_match_winner, actual_mom } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Upsert into results table
    await client.query(
      `INSERT INTO results (schedule_id, actual_first_innings_score, actual_match_winner, actual_mom)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (schedule_id) DO UPDATE
       SET actual_first_innings_score = $2,
           actual_match_winner = $3,
           actual_mom = $4`,
      [schedule_id, actual_first_innings_score, actual_match_winner, actual_mom]
    );

    // 2. Fetch predictions by matching match_id with schedule_id value
    const predictions = await client.query(
      `SELECT p.user_id, u.username, p.predicted_score, p.predicted_winner, p.predicted_mom
       FROM predictions p
       JOIN users u ON u.id = p.user_id
       WHERE p.match_id = $1`,
      [schedule_id]
    );

    // 3. Loop through predictions and score them
    for (const row of predictions.rows) {
      let fisPoints = 0, mwPoints = 0, momPoints = 0;

      if (row.predicted_winner === actual_match_winner) mwPoints = 2;
      if (row.predicted_mom === actual_mom) momPoints = 5;
      if (Math.abs(row.predicted_score - actual_first_innings_score) <= 2) fisPoints = 3;

      // 4. Upsert into leaderboard
      await client.query(
        `INSERT INTO leaderboard (user_id, username, fis_points, mw_points, mom_points) VALUES ($1::uuid, $2::text, $3::int, $4::int, $5::int)
        ON CONFLICT (user_id) DO UPDATE
        SET fis_points = leaderboard.fis_points + EXCLUDED.fis_points,
       mw_points = leaderboard.mw_points + EXCLUDED.mw_points,
       mom_points = leaderboard.mom_points + EXCLUDED.mom_points`,
        [row.user_id, row.username, fisPoints, mwPoints, momPoints]
      );



      // 5. Update predictions with points
      await client.query(
        `UPDATE predictions
         SET fis_points = $1::int, mw_points = $2::int, mom_points = $3::int, total_points = $1::int + $2::int + $3::int
         WHERE user_id = $4 AND match_id = $5`,
        [fisPoints, mwPoints, momPoints, row.user_id, schedule_id]
      );
    }

    await client.query('COMMIT');
    res.json({ success: true, message: 'Result saved and leaderboard updated' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Result update error:', err.stack);
    res.status(500).send('Server error');
  } finally {
    client.release();
  }
});

  
  //all matches
  app.get('/api/get-all-matches', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, team1, team2, match_date, venue, status 
       FROM schedule 
       ORDER BY match_date ASC`
    );

    res.json({
      success: true,
      matches: result.rows
    });
  } catch (error) {
    console.error('Error fetching all matches:', error.message);
    res.status(500).send('Server error');
  }
});


app.get('/api/get-predictions', async (req, res) => {
  const { match_id } = req.query;

  try {
    const result = await pool.query(
      `SELECT p.predicted_winner, p.predicted_score, p.predicted_mom, u.username
       FROM predictions p
       JOIN users u ON u.id = p.user_id
       WHERE p.match_id = $1`,
      [match_id]
    );

    res.json({ success: true, predictions: result.rows });
  } catch (err) {
    console.error('Fetch predictions error:', err.stack);
    res.status(500).send('Server error');
  }
});
