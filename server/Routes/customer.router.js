const express = require('express');
const pool = require('../Modules/pool');
const router = express.Router();

/**
 * GET route for customers with their pipeline positions
 */
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT 
        c.id,
        c.name,
        c.contact_info,
        c.notes,
        cp.pipeline_id,
        p.section_name
      FROM customers c
      LEFT JOIN customer_pipeline cp ON c.id = cp.customer_id
      LEFT JOIN pipeline p ON cp.pipeline_id = p.id
      ORDER BY c.id ASC
    `;

    const result = await pool.query(query);

    // Group customers by pipeline stage
    const customersByStage = {};
    result.rows.forEach(row => {
      const stageId = row.pipeline_id || 'unassigned';
      if (!customersByStage[stageId]) {
        customersByStage[stageId] = [];
      }
      customersByStage[stageId].push({
        id: row.id,
        name: row.name,
        contact_info: row.contact_info,
        notes: row.notes,
        pipeline_id: row.pipeline_id,
        section_name: row.section_name
      });
    });

    res.json({
      success: true,
      customers: result.rows,
      customersByStage
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching customers'
    });
  }
});

/**
 * GET route for pipeline stages
 */
router.get('/pipeline', async (req, res) => {
  try {
    const query = `
      SELECT id, section_name
      FROM pipeline
      ORDER BY id ASC
    `;

    const result = await pool.query(query);

    res.json({
      success: true,
      stages: result.rows
    });
  } catch (error) {
    console.error('Error fetching pipeline stages:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pipeline stages'
    });
  }
});

/**
 * POST route for creating a new customer
 */
router.post('/', async (req, res) => {
  const { name, contact_info, pipeline_id } = req.body;

  if (!name) {
    return res.status(400).json({
      success: false,
      message: 'Name is required'
    });
  }

  try {
    // Start transaction
    await pool.query('BEGIN');

    // Insert customer
    const customerQuery = `
      INSERT INTO customers (name, contact_info)
      VALUES ($1, $2)
      RETURNING id, name, contact_info, notes
    `;
    const customerResult = await pool.query(customerQuery, [name, contact_info || null]);
    const customer = customerResult.rows[0];

    // If pipeline_id is provided, add to customer_pipeline
    if (pipeline_id) {
      const pipelineQuery = `
        INSERT INTO customer_pipeline (customer_id, pipeline_id)
        VALUES ($1, $2)
        RETURNING id
      `;
      await pool.query(pipelineQuery, [customer.id, pipeline_id]);
    }

    await pool.query('COMMIT');

    res.status(201).json({
      success: true,
      customer: {
        ...customer,
        pipeline_id: pipeline_id || null
      }
    });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error creating customer:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating customer'
    });
  }
});

/**
 * PUT route for updating customer information
 */
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, contact_info, notes } = req.body;

  if (!name) {
    return res.status(400).json({
      success: false,
      message: 'Name is required'
    });
  }

  try {
    const query = `
      UPDATE customers
      SET name = $1, contact_info = $2, notes = $3
      WHERE id = $4
      RETURNING id, name, contact_info, notes
    `;

    const result = await pool.query(query, [name, contact_info || null, notes || null, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.json({
      success: true,
      customer: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating customer'
    });
  }
});

/**
 * PUT route for moving customer to a different pipeline stage
 */
router.put('/:id/pipeline', async (req, res) => {
  const { id } = req.params;
  const { pipeline_id } = req.body;

  if (!pipeline_id) {
    return res.status(400).json({
      success: false,
      message: 'Pipeline ID is required'
    });
  }

  try {
    await pool.query('BEGIN');

    // Delete existing pipeline assignment
    await pool.query(
      'DELETE FROM customer_pipeline WHERE customer_id = $1',
      [id]
    );

    // Add new pipeline assignment
    const insertQuery = `
      INSERT INTO customer_pipeline (customer_id, pipeline_id)
      VALUES ($1, $2)
      RETURNING id
    `;
    await pool.query(insertQuery, [id, pipeline_id]);

    // Get updated customer info
    const customerQuery = `
      SELECT 
        c.id,
        c.name,
        c.contact_info,
        c.notes,
        cp.pipeline_id,
        p.section_name
      FROM customers c
      LEFT JOIN customer_pipeline cp ON c.id = cp.customer_id
      LEFT JOIN pipeline p ON cp.pipeline_id = p.id
      WHERE c.id = $1
    `;
    const customerResult = await pool.query(customerQuery, [id]);

    await pool.query('COMMIT');

    res.json({
      success: true,
      customer: customerResult.rows[0]
    });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error moving customer:', error);
    res.status(500).json({
      success: false,
      message: 'Error moving customer'
    });
  }
});

/**
 * DELETE route for deleting a customer
 */
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Customer will be deleted and customer_pipeline entries will cascade
    const query = `
      DELETE FROM customers
      WHERE id = $1
      RETURNING id
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.json({
      success: true,
      message: 'Customer deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting customer'
    });
  }
});

module.exports = router;

