const bcrypt = require('bcrypt');
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

// Login API
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await pool.query(
      'SELECT id, username, user_type, password_hash FROM users WHERE username = $1',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password',
      });
    }

    const user = result.rows[0];

    if (!user.password_hash) {
      return res.status(400).json({
        success: false,
        message: 'This user does not have a password set yet',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password',
      });
    }

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        user_type: user.user_type,
      },
    });
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
        `INSERT INTO predictions (user_id, 
        match_id, 
        predicted_score, 
        predicted_winner, 
        predicted_mom, 
        fis_points, 
        mw_points, 
        mom_points, 
        total_points)
        VALUES ($1, $2, $3, $4, $5, 0, 0, 0, 0)
        ON CONFLICT (user_id, match_id)
        DO UPDATE SET
        predicted_score = EXCLUDED.predicted_score,
        predicted_winner = EXCLUDED.predicted_winner,
        predicted_mom = EXCLUDED.predicted_mom,
        submitted_at = CURRENT_TIMESTAMP`,
        [
          user_id,
          match_id,
          predicted_first_innings_score,   // maps to predicted_score
          predicted_match_winner,           // maps to predicted_winner
          predicted_man_of_the_match,        // maps to predicted_mom          
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
  
  app.post('/api/update-results', async (req, res) => {
    const { schedule_id, actual_first_innings_score, actual_match_winner, actual_mom } = req.body;
  
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
  
      // 1. Upsert into actuals/results table
      await client.query(
        `INSERT INTO results (schedule_id, actual_first_innings_score, actual_match_winner, actual_mom)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (schedule_id) DO UPDATE
         SET actual_first_innings_score = $2,
             actual_match_winner = $3,
             actual_mom = $4`,
        [schedule_id, actual_first_innings_score, actual_match_winner, actual_mom]
      );
  
      // 2. Get all predictions for that match
      const predictions = await client.query(
        `SELECT p.user_id, u.username, p.predicted_score, p.predicted_winner, p.predicted_mom
         FROM predictions p
         JOIN users u ON u.id = p.user_id
         WHERE p.match_id = $1`,
        [schedule_id]
      );
  
      for (const row of predictions.rows) {
        let fisPoints = 0, mwPoints = 0, momPoints = 0;
  
        if (row.predicted_winner === actual_match_winner) mwPoints = 2;
        if (row.predicted_mom === actual_mom) momPoints = 5;
        if (Math.abs(row.predicted_score - actual_first_innings_score) <= 2) fisPoints = 3;
  
        // 3. Update leaderboard
        await client.query(
          `INSERT INTO leaderboard (user_id, username, fis_points, mw_points, mom_points)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (user_id) DO UPDATE
           SET fis_points = leaderboard.fis_points + $3,
               mw_points = leaderboard.mw_points + $4,
               mom_points = leaderboard.mom_points + $5`,
          [row.user_id, row.username, fisPoints, mwPoints, momPoints]
        );

        const totalPoints = fisPoints + mwPoints + momPoints;

        await client.query(
          `UPDATE predictions
          SET fis_points = $1,
              mw_points = $2,
              mom_points = $3,
              total_points = $4
          WHERE user_id = $5
            AND match_id = $6`,
          [fisPoints, mwPoints, momPoints, totalPoints, row.user_id, schedule_id]
        );       
      }
  
      await client.query('COMMIT');
      res.json({ success: true, message: 'Result saved and leaderboard updated' });
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('Result update error:', err);
      res.status(500).send('Server error');
    } finally {
      client.release();
    }
  });
  

  // Register API
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    // basic validation
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    // check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE username = $1',
      [username]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Username already exists',
      });
    }

    // hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // insert user
    const result = await pool.query(
      `INSERT INTO users (username, password_hash, user_type)
       VALUES ($1, $2, $3)
       RETURNING id, username, user_type`,
      [username, passwordHash, 'user']
    );

    res.json({
      success: true,
      message: 'User registered successfully',
      user: result.rows[0],
    });

  } catch (error) {
    console.error('Register error:', error.message);
    res.status(500).send('Server error');
  }
});


// Get today's predictions for admin view
app.get('/api/get-all-predictions', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        p.id,
        u.username,
        p.predicted_winner,
        p.predicted_score,
        p.predicted_mom,
        p.submitted_at
      FROM predictions p
      JOIN users u
        ON u.id = p.user_id
      WHERE DATE(p.submitted_at) = CURRENT_DATE
      ORDER BY p.submitted_at DESC
    `);

    res.json({
      success: true,
      predictions: result.rows
    });
  } catch (error) {
    console.error('Error fetching predictions:', error.message);
    res.status(500).send('Server error');
  }
});

app.get('/api/predictions-visibility', (req, res) => {
  res.json({ showPredictionsGlobal });
});

app.post('/api/toggle-predictions', (req, res) => {
  showPredictionsGlobal = !showPredictionsGlobal;
  res.json({ showPredictionsGlobal });
});

app.get('/api/predictions-visibility', async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT visible
      FROM prediction_visibility
      WHERE visible_date = CURRENT_DATE
      LIMIT 1
      `
    );

    const visible = result.rows.length > 0 ? result.rows[0].visible : false;

    res.json({ showPredictionsGlobal: visible });
  } catch (error) {
    console.error('Error fetching prediction visibility:', error.message);
    res.status(500).send('Server error');
  }
});

app.post('/api/set-predictions-visibility', async (req, res) => {
  const { visible } = req.body;

  try {
    await pool.query(
      `
      INSERT INTO prediction_visibility (visible, visible_date, updated_at)
      VALUES ($1, CURRENT_DATE, CURRENT_TIMESTAMP)
      ON CONFLICT (visible_date)
      DO UPDATE SET
        visible = EXCLUDED.visible,
        updated_at = CURRENT_TIMESTAMP
      `,
      [visible]
    );

    res.json({
      success: true,
      showPredictionsGlobal: visible
    });
  } catch (error) {
    console.error('Error updating prediction visibility:', error.message);
    res.status(500).send('Server error');
  }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));