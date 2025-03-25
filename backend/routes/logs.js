const express = require('express');
const pool = require('../db');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM logs');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { rows } = await pool.query('SELECT * FROM logs WHERE id = $1', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Log not found' });
        }
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const { user_id, action } = req.body;
        const { rows } = await pool.query(
            'INSERT INTO logs (user_id, action) VALUES ($1, $2) RETURNING *',
            [user_id, action]
        );
        res.status(201).json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { user_id, action } = req.body;
        const { rows } = await pool.query(
            'UPDATE logs SET user_id = $1, action = $2 WHERE id = $3 RETURNING *',
            [user_id, action, id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Log not found' });
        }
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { rows } = await pool.query('DELETE FROM logs WHERE id = $1 RETURNING *', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Log not found' });
        }
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
