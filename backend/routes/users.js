const express = require('express');
const pool = require('../db');
const { generateToken, verifyToken, checkRole, hashPassword, comparePassword } = require('../utils/auth');

const router = express.Router();

router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const role = 'client'
        const hashedPassword = await hashPassword(password);
        const { rows } = await pool.query(
            'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
            [name, email, hashedPassword, role]
        );
        res.status(201).json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (rows.length === 0) {
            return res.status(401).json({ error: 'Неверный логин или пароль' });
        }
        const user = rows[0];
        const validPassword = await comparePassword(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Неверный логин или пароль' });
        }

        await pool.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);

        const token = generateToken(user);
        res.json({ token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/profile', verifyToken, async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT id, name, email, role FROM users WHERE id = $1', [req.user.id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/', verifyToken, checkRole('admin', 'manager'), async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT id, name, email, role, created_at, last_login FROM users ORDER BY id DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/:id', verifyToken, checkRole('admin'),  async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, password, role } = req.body;
        if (req.user.id !== parseInt(id) && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Нет доступа для редактирования' });
        }
        const hashedPassword = password ? await hashPassword(password) : undefined;
        const { rows } = await pool.query(`
            UPDATE users 
            SET 
                name = COALESCE($1, name),
                email = COALESCE($2, email),
                password = COALESCE($3, password),
                role = COALESCE($4, role)
            WHERE id = $5 
            RETURNING id, name, email, role
        `, [name, email, hashedPassword, role, id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }

        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
