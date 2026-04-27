const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get all books
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM books');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add new book
router.post('/', async (req, res) => {
    const { title, author, category, isbn, quantity } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO books (title, author, category, isbn, quantity) VALUES (?, ?, ?, ?, ?)',
            [title, author, category, isbn, quantity]
        );
        res.json({ id: result.insertId, message: 'Book added successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update book
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { title, author, category, isbn, quantity } = req.body;
    try {
        await db.query(
            'UPDATE books SET title = ?, author = ?, category = ?, isbn = ?, quantity = ? WHERE id = ?',
            [title, author, category, isbn, quantity, id]
        );
        res.json({ message: 'Book updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete book
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM books WHERE id = ?', [id]);
        res.json({ message: 'Book deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
