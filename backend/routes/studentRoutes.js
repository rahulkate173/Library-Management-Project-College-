const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get all students
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM students');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add new student
router.post('/', async (req, res) => {
    const { name, email, phone } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO students (name, email, phone) VALUES (?, ?, ?)',
            [name, email, phone]
        );
        res.json({ id: result.insertId, message: 'Student added successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update student
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, email, phone } = req.body;
    try {
        await db.query(
            'UPDATE students SET name = ?, email = ?, phone = ? WHERE id = ?',
            [name, email, phone, id]
        );
        res.json({ message: 'Student updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete student
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM students WHERE id = ?', [id]);
        res.json({ message: 'Student deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
