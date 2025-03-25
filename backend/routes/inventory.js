const express = require('express');
const pool = require('../db');
const router = express.Router();
const { verifyToken, checkRole } = require('../utils/auth');

router.post('/search', async (req, res) => {
    try {
        const { searchTerm, categoryId, rentalPointIds, sizes, sortBy, sortOrder } = req.body;
        const includeAvailability = req.query.includeAvailability;
        const validSortBy = sortBy === 'price_per_day' ? 'price_per_day' : 'name';
        const validSortOrder = sortOrder === 'desc' ? 'DESC' : 'ASC';
        let availabilityCondition = "";
        if (includeAvailability) {
            availabilityCondition = `
                AND EXISTS (
                    SELECT 1
                    FROM inventory_availability ia
                    LEFT JOIN (
                        SELECT 
                            inventory_id, 
                            rental_point_id, 
                            COUNT(*) AS bookings_count
                        FROM bookings
                        WHERE 
                            status = 'confirmed'
                            AND now() BETWEEN pickup_datetime AND return_datetime
                        GROUP BY inventory_id, rental_point_id
                    ) b ON ia.inventory_id = b.inventory_id 
                      AND ia.rental_point_id = b.rental_point_id
                    WHERE ia.inventory_id = i.id
                      AND (ia.available_quantity - COALESCE(b.bookings_count, 0)) > 0
                )
            `;
        }

        const query = `
            SELECT 
                i.id,
                i.name,
                i.description,
                i.specifications,
                i.size,
                i.usage_rules,
                i.images,
                i.category_id,
                i.rental_point_ids,
                c.name AS category_name,
                ARRAY_AGG(r.name) AS rental_point_names,
                i.price_per_day
            FROM inventory i
            JOIN categories c ON i.category_id = c.id
            JOIN rental_points r ON r.id = ANY(i.rental_point_ids)
            WHERE 
                ($1::TEXT IS NULL OR i.name ILIKE '%' || $1 || '%' OR c.name ILIKE '%' || $1 || '%')
                AND ($2::INTEGER IS NULL OR i.category_id = $2)
                AND ($3::INTEGER[] IS NULL OR i.rental_point_ids && $3)
                AND ($4::TEXT[] IS NULL OR i.size = ANY($4))
                ${availabilityCondition}
            GROUP BY i.id, c.name
            ORDER BY ${validSortBy} ${validSortOrder};
        `;

        const values = [
            searchTerm || null,
            categoryId || null,
            rentalPointIds && rentalPointIds.length > 0 ? rentalPointIds : null,
            sizes && sizes.length > 0 ? sizes : null
        ];

        const { rows } = await pool.query(query, values);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


router.get('/allSizes', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT size FROM inventory');
        if (rows.length === 0) {
            return res.json([]);
        }
        res.json([...new Set(rows.map(el => el.size))]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { rows } = await pool.query('SELECT * FROM inventory WHERE id = $1', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Inventory not found' });
        }
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/', verifyToken, checkRole('admin'), async (req, res) => {
    try {
        const { name, description, specifications, size, usage_rules, images, category_id, rental_point_ids, price_per_day, rental_point_quantities } = req.body;
        const { rows } = await pool.query(
            'INSERT INTO inventory (name, description, specifications, size, usage_rules, images, category_id, rental_point_ids, price_per_day) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
            [name, description, specifications, size, usage_rules, images, category_id, rental_point_ids, price_per_day]
        );
        const object = rows?.[0]
        if (object) {
            const { rows: existingRows } = await pool.query(
                'SELECT * FROM inventory_availability WHERE id = $1',
                [object.id]
            );
            for (const row of existingRows) {
                await pool.query('DELETE FROM inventory_availability WHERE id = $1 RETURNING *', [row.id]);
            }
            for (const rpq in rental_point_quantities) {
                if (rental_point_ids.includes(Number(rpq))) {
                    await pool.query(
                        'INSERT INTO inventory_availability (inventory_id, rental_point_id, available_quantity) VALUES ($1, $2, $3) RETURNING *',
                        [object.id, rpq, rental_point_quantities[rpq]]
                    );
                }
            }

        }
        res.status(201).json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/:id', verifyToken, checkRole('admin', 'manager'), async (req, res) => {
    try {
        const { id } = req.params;
        const {
            name,
            description,
            specifications,
            size,
            usage_rules,
            images,
            category_id,
            rental_point_ids,
            price_per_day,
            rental_point_quantities
        } = req.body;

        const { rows: existingInventory } = await pool.query(
            'SELECT * FROM inventory WHERE id = $1',
            [id]
        );

        if (existingInventory.length === 0) {
            return res.status(404).json({ error: 'Inventory not found' });
        }

        const { rows } = await pool.query(
            `UPDATE inventory 
             SET name = $1, 
                 description = $2, 
                 specifications = $3, 
                 size = $4, 
                 usage_rules = $5, 
                 images = $6, 
                 category_id = $7, 
                 rental_point_ids = $8, 
                 price_per_day = $9 
             WHERE id = $10 
             RETURNING *`,
            [name, description, specifications, size, usage_rules, images, category_id, rental_point_ids, price_per_day, id]
        );

        const updatedInventory = rows[0];

        await pool.query('DELETE FROM inventory_availability WHERE inventory_id = $1', [id]);

        for (const rpq in rental_point_quantities) {
            if (rental_point_ids.includes(Number(rpq))) {
                await pool.query(
                    `INSERT INTO inventory_availability 
                     (inventory_id, rental_point_id, available_quantity) 
                     VALUES ($1, $2, $3) 
                     RETURNING *`,
                    [id, rpq, rental_point_quantities[rpq]]
                );
            }
        }

        res.json(updatedInventory);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/availability/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const query = `
            SELECT 
                ia.id,
                ia.inventory_id,
                (ia.available_quantity - COALESCE(b.bookings_count, 0)) AS available_quantity,
                ia.rental_point_id
            FROM inventory_availability ia
            LEFT JOIN (
                SELECT 
                    inventory_id, 
                    rental_point_id, 
                    COUNT(*) AS bookings_count
                FROM bookings
                WHERE 
                    status = 'confirmed'
                    AND now() BETWEEN pickup_datetime AND return_datetime
                GROUP BY inventory_id, rental_point_id
            ) b
            ON ia.inventory_id = b.inventory_id 
            AND ia.rental_point_id = b.rental_point_id
            WHERE ia.inventory_id = $1
        `;

        const { rows } = await pool.query(query, [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Inventory availability not found' });
        }
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


router.delete('/:id', verifyToken, checkRole('admin'), async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM inventory_availability WHERE inventory_id = $1', [id]);
        const { rows } = await pool.query('DELETE FROM inventory WHERE id = $1 RETURNING *', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Inventory not found' });
        }
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
