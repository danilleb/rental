const express = require('express');
const pool = require('../db');
const router = express.Router();
const { verifyToken, checkRole } = require('../utils/auth');

router.get('/', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM rental_points');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/', verifyToken, checkRole('admin'), async (req, res) => {
    try {
        const { name, address, contact_info, working_hours } = req.body;
        const { rows } = await pool.query(
            'INSERT INTO rental_points (name, address, contact_info, working_hours) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, address, contact_info, working_hours]
        );
        res.status(201).json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/:id', verifyToken, checkRole('admin', 'manager'), async (req, res) => {
    try {
        const { id } = req.params;
        const { name, address, contact_info, working_hours } = req.body;
        const { rows } = await pool.query(
            'UPDATE rental_points SET name = $1, address = $2, contact_info = $4, working_hours = $5 WHERE id = $3 RETURNING *',
            [name, address, id, contact_info, working_hours]
        );
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Rental point not found' });
        }
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:id', verifyToken, checkRole('admin'), async (req, res) => {
    try {
        const { id } = req.params;
        const { rows } = await pool.query('DELETE FROM rental_points WHERE id = $1 RETURNING *', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Rental point not found' });
        }
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
