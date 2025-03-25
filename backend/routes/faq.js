const express = require('express');
const pool = require('../db');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM faq');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { rows } = await pool.query('SELECT * FROM faq WHERE id = $1', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'FAQ not found' });
        }
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const { question, answer } = req.body;
        const { rows } = await pool.query(
            'INSERT INTO faq (question, answer) VALUES ($1, $2) RETURNING *',
            [question, answer]
        );
        res.status(201).json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { question, answer } = req.body;
        const { rows } = await pool.query(
            'UPDATE faq SET question = $1, answer = $2 WHERE id = $3 RETURNING *',
            [question, answer, id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ error: 'FAQ not found' });
        }
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { rows } = await pool.query('DELETE FROM faq WHERE id = $1 RETURNING *', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'FAQ not found' });
        }
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
