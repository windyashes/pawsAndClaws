const express = require('express');
const pool = require('../Modules/pool');
const router = express.Router();

/**
 * GET route for premade listings
 * Query params: sort (optional) - 'newest' or 'price'
 */
router.get('/premade', async (req, res) => {
  const { sort } = req.query;

  try {
    let query = `
      SELECT id, title, description, image_link, price, date_listed
      FROM pre_made_listings
    `;

    // Add sorting
    if (sort === 'newest') {
      query += ' ORDER BY date_listed DESC, id DESC';
    } else if (sort === 'price') {
      query += ' ORDER BY price ASC, id ASC';
    } else {
      // Default: newest first
      query += ' ORDER BY date_listed DESC, id DESC';
    }

    const result = await pool.query(query);

    res.json({
      success: true,
      listings: result.rows
    });
  } catch (error) {
    console.error('Error fetching premade listings:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching listings'
    });
  }
});

/**
 * GET route for custom listings
 */
router.get('/custom', async (req, res) => {
  try {
    const query = `
      SELECT id, title, description, image_link, starting_price
      FROM custom_listings
      ORDER BY id ASC
    `;

    const result = await pool.query(query);

    res.json({
      success: true,
      listings: result.rows
    });
  } catch (error) {
    console.error('Error fetching custom listings:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching custom listings'
    });
  }
});

module.exports = router;

