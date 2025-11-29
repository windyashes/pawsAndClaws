const express = require('express');
const pool = require('../Modules/pool');
const router = express.Router();

/**
 * POST route for admin login
 * Checks username and password against admin_user table
 */
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ 
      success: false, 
      message: 'Username and password are required' 
    });
  }

  try {
    const query = `
      SELECT id, name, password 
      FROM admin_user 
      WHERE name = $1 AND password = $2
    `;
    
    const result = await pool.query(query, [username, password]);

    if (result.rows.length > 0) {
      res.json({
        success: true,
        user: {
          id: result.rows[0].id,
          name: result.rows[0].name
        }
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

module.exports = router;

