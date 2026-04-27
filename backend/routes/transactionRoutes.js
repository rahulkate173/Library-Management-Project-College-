const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get all transactions with book and student details
router.get('/', async (req, res) => {
    try {
        const query = `
            SELECT t.*, b.title as book_title, s.name as student_name 
            FROM transactions t
            JOIN books b ON t.book_id = b.id
            JOIN students s ON t.student_id = s.id
            ORDER BY t.issue_date DESC
        `;
        const [rows] = await db.query(query);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Issue a book
router.post('/issue', async (req, res) => {
    const { book_id, student_id, issue_date } = req.body;
    try {
        // Check book availability
        const [book] = await db.query('SELECT quantity FROM books WHERE id = ?', [book_id]);
        if (book.length === 0 || book[0].quantity <= 0) {
            return res.status(400).json({ error: 'Book not available' });
        }

        // Create transaction
        await db.query(
            'INSERT INTO transactions (book_id, student_id, issue_date, status) VALUES (?, ?, ?, ?)',
            [book_id, student_id, issue_date, 'issued']
        );

        // Update book quantity
        await db.query('UPDATE books SET quantity = quantity - 1 WHERE id = ?', [book_id]);

        res.json({ message: 'Book issued successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Return a book
router.post('/return', async (req, res) => {
    const { transaction_id, return_date, fine } = req.body;
    try {
        // Get transaction details
        const [transaction] = await db.query('SELECT * FROM transactions WHERE id = ?', [transaction_id]);
        if (transaction.length === 0) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        if (transaction[0].status === 'returned') {
            return res.status(400).json({ error: 'Book already returned' });
        }

        // Update transaction
        await db.query(
            'UPDATE transactions SET return_date = ?, fine = ?, status = ? WHERE id = ?',
            [return_date, fine, 'returned', transaction_id]
        );

        // Update book quantity
        await db.query('UPDATE books SET quantity = quantity + 1 WHERE id = ?', [transaction[0].book_id]);

        res.json({ message: 'Book returned successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get dashboard stats
router.get('/stats', async (req, res) => {
    try {
        const [totalBooks] = await db.query('SELECT SUM(quantity) as count FROM books');
        const [uniqueBooks] = await db.query('SELECT COUNT(*) as count FROM books');
        const [issuedBooks] = await db.query('SELECT COUNT(*) as count FROM transactions WHERE status = "issued"');
        const [totalStudents] = await db.query('SELECT COUNT(*) as count FROM students');
        
        // Overdue count (assuming 14 days limit)
        const [overdue] = await db.query(`
            SELECT COUNT(*) as count FROM transactions 
            WHERE status = "issued" AND DATEDIFF(CURDATE(), issue_date) > 14
        `);

        res.json({
            total_quantity: totalBooks[0].count || 0,
            unique_books: uniqueBooks[0].count,
            issued_books: issuedBooks[0].count,
            total_students: totalStudents[0].count,
            overdue_books: overdue[0].count
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
