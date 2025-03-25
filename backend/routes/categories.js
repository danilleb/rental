const express = require('express');
const pool = require('../db');
const router = express.Router();
const { verifyToken, checkRole } = require('../utils/auth');

router.get('/', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM categories');
        const categories = rows;
        const map = {};
        categories.forEach(cat => {
            cat.children = [];
            map[cat.id] = cat;
        });
        const tree = [];
        categories.forEach(cat => {
            if (cat.parent_id && map[cat.parent_id]) {
                map[cat.parent_id].children.push(cat);
            } else {
                tree.push(cat);
            }
        });
        res.json(tree);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/', verifyToken, checkRole('admin'), async (req, res) => {
    try {
        const { name, description, parent_id } = req.body;
        const { rows } = await pool.query(
            'INSERT INTO categories (name, description, parent_id) VALUES ($1, $2, $3) RETURNING *',
            [name, description, parent_id]
        );
        res.status(201).json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/:id', verifyToken, checkRole('admin'), async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, parent_id } = req.body;
        const { rows } = await pool.query(
            'UPDATE categories SET name = $1, description = $3, parent_id = $4 WHERE id = $2 RETURNING *',
            [name, id, description, parent_id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Category not found' });
        }
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:id', verifyToken, checkRole('admin'), async (req, res) => {
    try {
        const { id } = req.params;
        const query = `
            WITH RECURSIVE subcategories AS (
                SELECT id FROM categories WHERE id = $1
                UNION ALL
                SELECT c.id FROM categories c INNER JOIN subcategories s ON c.parent_id = s.id
            )
            DELETE FROM categories WHERE id IN (SELECT id FROM subcategories)
            RETURNING *;
        `;
        const { rows } = await pool.query(query, [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Category not found' });
        }
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


module.exports = router;
