const express = require('express');
const pool = require('../db');
const router = express.Router();
const { verifyToken } = require('../utils/auth');
router.get('/', verifyToken, async (req, res) => {
    try {
        const { rows } = await pool.query(`SELECT * FROM notifications WHERE user_id = ${req.user.id} ORDER BY id DESC`);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
