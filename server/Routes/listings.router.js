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
 * POST route for creating a new premade listing
 */
router.post('/premade', async (req, res) => {
  const { title, description, image_link, price } = req.body;

  if (!title || !price) {
    return res.status(400).json({
      success: false,
      message: 'Title and price are required'
    });
  }

  try {
    const query = `
      INSERT INTO pre_made_listings (title, description, image_link, price, date_listed)
      VALUES ($1, $2, $3, $4, CURRENT_DATE)
      RETURNING id, title, description, image_link, price, date_listed
    `;

    const result = await pool.query(query, [title, description || null, image_link || null, price]);

    res.status(201).json({
      success: true,
      listing: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating listing:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating listing'
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

/**
 * PUT route for updating a premade listing
 */
router.put('/premade/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description, image_link, price } = req.body;

  if (!title || !price) {
    return res.status(400).json({
      success: false,
      message: 'Title and price are required'
    });
  }

  try {
    const query = `
      UPDATE pre_made_listings
      SET title = $1, description = $2, image_link = $3, price = $4
      WHERE id = $5
      RETURNING id, title, description, image_link, price, date_listed
    `;

    const result = await pool.query(query, [title, description || null, image_link || null, price, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    res.json({
      success: true,
      listing: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating listing:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating listing'
    });
  }
});

/**
 * DELETE route for deleting a premade listing
 */
router.delete('/premade/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const query = `
      DELETE FROM pre_made_listings
      WHERE id = $1
      RETURNING id
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    res.json({
      success: true,
      message: 'Listing deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting listing:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting listing'
    });
  }
});

module.exports = router;

