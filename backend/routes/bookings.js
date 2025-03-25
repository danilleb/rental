const express = require('express');
const pool = require('../db');
const router = express.Router();
const { verifyToken } = require('../utils/auth');

router.get('/', verifyToken, async (req, res) => {
    try {
        const query = `
            SELECT 
                b.cancellation_deadline,
                b.id, 
                b.user_id, 
                u.name AS user_name,
                u.email AS user_email,
                b.pickup_datetime, 
                b.return_datetime, 
                b.status, 
                b.total_amount, 
                b.cancellation_deadline, 
                i.name AS inventory_name, 
                rp.name AS rental_point_name,
                b.inventory_id,
                b.rental_point_id
            FROM bookings b
            JOIN users u ON b.user_id = u.id
            JOIN inventory i ON b.inventory_id = i.id
            JOIN rental_points rp ON b.rental_point_id = rp.id
            ${req.user.role === 'client' ? `WHERE user_id = ${req.user.id}` : ''}
            ORDER BY 
                CASE b.status
                    WHEN 'pending' THEN 1
                    WHEN 'confirmed' THEN 2
                    WHEN 'cancelled' THEN 3
                    WHEN 'completed' THEN 4
                    ELSE 5
                END,
                b.id DESC
        `;
        const { rows } = await pool.query(query);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/', verifyToken, async (req, res) => {
    try {
        const { user_id, inventory_id, datePickup, dateReturn, price, rental_point_id } = req.body;

        if (!user_id || !inventory_id || !datePickup || !dateReturn || !price) {
            return res.status(400).json({ error: 'All required fields must be provided' });
        }

        const query = `
            INSERT INTO bookings (
                user_id,
                inventory_id, 
                pickup_datetime, 
                return_datetime, 
                status, 
                total_amount,
                rental_point_id
            ) 
            VALUES ($1, $2, $3, $4, 'pending', $5, $6)
            RETURNING *;
        `;

        const { rows } = await pool.query(query, [
            user_id,
            inventory_id,
            datePickup,
            dateReturn,
            price,
            rental_point_id
        ]);

        const newBooking = rows[0];

        const notificationMessage = `Создано бронирование номер ${newBooking.id}`;
        const notificationQuery = `
            INSERT INTO notifications (user_id, message)
            VALUES ($1, $2)
        `;
        await pool.query(notificationQuery, [user_id, notificationMessage]);

        res.status(201).json(newBooking);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { user_id, inventory_id, datePickup, dateReturn, price, status, rental_point_id, cancellation_deadline } = req.body;

        if (!user_id) {
            return res.status(400).json({ error: 'user_id is required for updating' });
        }

        const query = `
            UPDATE bookings
            SET 
                user_id = $1,
                inventory_id = $2, 
                pickup_datetime = $3, 
                return_datetime = $4, 
                status = $5, 
                total_amount = $6,
                rental_point_id = $8,
                cancellation_deadline = $9
            WHERE id = $7
            RETURNING *;
        `;

        const { rows } = await pool.query(query, [
            user_id,
            inventory_id,
            datePickup,
            dateReturn,
            status,
            price,
            id,
            rental_point_id,
            cancellation_deadline
        ]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        const updatedBooking = rows[0];

        const notificationMessage = `Изменено бронирование номер ${updatedBooking.id}`;
        const notificationQuery = `
            INSERT INTO notifications (user_id, message)
            VALUES ($1, $2)
        `;
        await pool.query(notificationQuery, [user_id, notificationMessage]);

        res.json(updatedBooking);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
