const API_BASE = 'http://localhost:5000/api';

// State
let currentView = 'dashboard';
let books = [];
let students = [];
let transactions = [];

// DOM Elements
const mainContent = document.getElementById('main-content');
const viewTitle = document.getElementById('view-title');
const navLinks = document.querySelectorAll('.nav-link[data-view]');
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modal-title');
const formFields = document.getElementById('form-fields');
const modalForm = document.getElementById('modal-form');
const notification = document.getElementById('notification');

// Initial Load
document.addEventListener('DOMContentLoaded', () => {
    switchView('dashboard');
    setupNavigation();
});

function setupNavigation() {
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const view = link.getAttribute('data-view');
            switchView(view);
        });
    });
}

async function switchView(view) {
    currentView = view;
    
    // Update active link
    navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('data-view') === view);
    });

    // Update title
    viewTitle.textContent = view.charAt(0).toUpperCase() + view.slice(1);

    // Load Data and Render
    renderView(view);
}

async function renderView(view) {
    mainContent.innerHTML = '<div class="loading">Loading...</div>';
    
    try {
        switch(view) {
            case 'dashboard':
                await renderDashboard();
                break;
            case 'books':
                await renderBooks();
                break;
            case 'students':
                await renderStudents();
                break;
            case 'transactions':
                await renderTransactions();
                break;
            case 'reports':
                await renderReports();
                break;
        }
    } catch (err) {
        showNotification('Error loading data: ' + err.message, 'error');
    }
}

// --- View Renderers ---

async function renderDashboard() {
    const res = await fetch(`${API_BASE}/transactions/stats`);
    const stats = await res.json();

    mainContent.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon" style="background: #eff6ff; color: #3b82f6;">
                    <i data-lucide="book-open"></i>
                </div>
                <div class="stat-label">Total Books</div>
                <div class="stat-value">${stats.total_quantity}</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon" style="background: #f0fdf4; color: #22c55e;">
                    <i data-lucide="check-circle"></i>
                </div>
                <div class="stat-label">Issued Books</div>
                <div class="stat-value">${stats.issued_books}</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon" style="background: #fef2f2; color: #ef4444;">
                    <i data-lucide="alert-circle"></i>
                </div>
                <div class="stat-label">Overdue Books</div>
                <div class="stat-value">${stats.overdue_books}</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon" style="background: #fff7ed; color: #f97316;">
                    <i data-lucide="users"></i>
                </div>
                <div class="stat-label">Total Students</div>
                <div class="stat-value">${stats.total_students}</div>
            </div>
        </div>
        
        <div class="table-container" style="padding: 1.5rem;">
            <h3>Quick Overview</h3>
            <canvas id="statsChart" style="max-height: 300px; margin-top: 1rem;"></canvas>
        </div>
    `;
    
    lucide.createIcons();
    initChart(stats);
}

function initChart(stats) {
    const ctx = document.getElementById('statsChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Total Books', 'Issued', 'Overdue', 'Students'],
            datasets: [{
                label: 'Library Stats',
                data: [stats.total_quantity, stats.issued_books, stats.overdue_books, stats.total_students],
                backgroundColor: ['#3b82f6', '#22c55e', '#ef4444', '#f97316']
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } }
        }
    });
}

async function renderBooks() {
    const res = await fetch(`${API_BASE}/books`);
    books = await res.json();

    mainContent.innerHTML = `
        <div style="display: flex; justify-content: space-between; margin-bottom: 1.5rem;">
            <input type="text" placeholder="Search books..." style="width: 300px;" oninput="filterBooks(this.value)">
            <button class="btn btn-primary" onclick="openBookModal()">+ Add Book</button>
        </div>
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Author</th>
                        <th>Category</th>
                        <th>ISBN</th>
                        <th>Qty</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="books-table-body">
                    ${books.map(book => `
                        <tr>
                            <td>${book.title}</td>
                            <td>${book.author}</td>
                            <td>${book.category}</td>
                            <td>${book.isbn}</td>
                            <td>${book.quantity}</td>
                            <td>
                                <button class="btn" style="padding: 0.4rem; color: #3b82f6;" onclick="editBook(${book.id})"><i data-lucide="edit" style="width: 16px;"></i></button>
                                <button class="btn" style="padding: 0.4rem; color: #ef4444;" onclick="deleteBook(${book.id})"><i data-lucide="trash-2" style="width: 16px;"></i></button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    lucide.createIcons();
}

async function renderStudents() {
    const res = await fetch(`${API_BASE}/students`);
    students = await res.json();

    mainContent.innerHTML = `
        <div style="display: flex; justify-content: space-between; margin-bottom: 1.5rem;">
            <input type="text" placeholder="Search students..." style="width: 300px;">
            <button class="btn btn-primary" onclick="openStudentModal()">+ Add Student</button>
        </div>
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${students.map(s => `
                        <tr>
                            <td>${s.name}</td>
                            <td>${s.email}</td>
                            <td>${s.phone}</td>
                            <td>
                                <button class="btn" style="padding: 0.4rem; color: #3b82f6;" onclick="editStudent(${s.id})"><i data-lucide="edit" style="width: 16px;"></i></button>
                                <button class="btn" style="padding: 0.4rem; color: #ef4444;" onclick="deleteStudent(${s.id})"><i data-lucide="trash-2" style="width: 16px;"></i></button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    lucide.createIcons();
}

async function renderTransactions() {
    const res = await fetch(`${API_BASE}/transactions`);
    transactions = await res.json();

    mainContent.innerHTML = `
        <div style="display: flex; justify-content: space-between; margin-bottom: 1.5rem;">
            <h3>Current Transactions</h3>
            <button class="btn btn-primary" onclick="openIssueModal()">Issue Book</button>
        </div>
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Book</th>
                        <th>Student</th>
                        <th>Issue Date</th>
                        <th>Return Date</th>
                        <th>Status</th>
                        <th>Fine</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    ${transactions.map(t => `
                        <tr>
                            <td>${t.book_title}</td>
                            <td>${t.student_name}</td>
                            <td>${new Date(t.issue_date).toLocaleDateString()}</td>
                            <td>${t.return_date ? new Date(t.return_date).toLocaleDateString() : '-'}</td>
                            <td><span style="color: ${t.status === 'issued' ? '#f59e0b' : '#10b981'}; font-weight: 600;">${t.status.toUpperCase()}</span></td>
                            <td>₹${t.fine}</td>
                            <td>
                                ${t.status === 'issued' ? `<button class="btn btn-primary" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;" onclick="returnBook(${t.id})">Return</button>` : '-'}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

async function renderReports() {
    mainContent.innerHTML = `
        <div class="table-container" style="padding: 2rem; text-align: center;">
            <i data-lucide="construction" style="width: 48px; height: 48px; color: var(--text-muted); margin-bottom: 1rem;"></i>
            <h3>Reports Engine</h3>
            <p style="color: var(--text-muted); margin-top: 0.5rem;">Select filters to generate reports</p>
            <div style="display: flex; gap: 1rem; justify-content: center; margin-top: 2rem;">
                <input type="date" style="width: 200px;">
                <input type="date" style="width: 200px;">
                <button class="btn btn-primary">Generate PDF</button>
            </div>
        </div>
    `;
    lucide.createIcons();
}

// --- Modal Functions ---

function openBookModal(bookId = null) {
    const book = bookId ? books.find(b => b.id === bookId) : null;
    modalTitle.textContent = book ? 'Edit Book' : 'Add New Book';
    
    formFields.innerHTML = `
        <div class="form-group">
            <label>Title</label>
            <input type="text" id="book-title" value="${book ? book.title : ''}" required>
        </div>
        <div class="form-group">
            <label>Author</label>
            <input type="text" id="book-author" value="${book ? book.author : ''}" required>
        </div>
        <div class="form-group">
            <label>Category</label>
            <input type="text" id="book-category" value="${book ? book.category : ''}">
        </div>
        <div class="form-group">
            <label>ISBN</label>
            <input type="text" id="book-isbn" value="${book ? book.isbn : ''}">
        </div>
        <div class="form-group">
            <label>Quantity</label>
            <input type="number" id="book-quantity" value="${book ? book.quantity : '1'}" required>
        </div>
    `;

    modalForm.onsubmit = async (e) => {
        e.preventDefault();
        const data = {
            title: document.getElementById('book-title').value,
            author: document.getElementById('book-author').value,
            category: document.getElementById('book-category').value,
            isbn: document.getElementById('book-isbn').value,
            quantity: document.getElementById('book-quantity').value,
        };

        const method = book ? 'PUT' : 'POST';
        const url = book ? `${API_BASE}/books/${bookId}` : `${API_BASE}/books`;

        await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        closeModal();
        renderBooks();
        showNotification(book ? 'Book updated' : 'Book added', 'success');
    };

    modal.style.display = 'flex';
}

async function openIssueModal() {
    // Fetch latest books and students
    const [booksRes, studentsRes] = await Promise.all([
        fetch(`${API_BASE}/books`),
        fetch(`${API_BASE}/students`)
    ]);
    const booksList = await booksRes.json();
    const studentsList = await studentsRes.json();

    modalTitle.textContent = 'Issue Book';
    formFields.innerHTML = `
        <div class="form-group">
            <label>Select Book</label>
            <select id="issue-book-id" required>
                ${booksList.filter(b => b.quantity > 0).map(b => `<option value="${b.id}">${b.title} (${b.quantity} left)</option>`).join('')}
            </select>
        </div>
        <div class="form-group">
            <label>Select Student</label>
            <select id="issue-student-id" required>
                ${studentsList.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}
            </select>
        </div>
        <div class="form-group">
            <label>Issue Date</label>
            <input type="date" id="issue-date" value="${new Date().toISOString().split('T')[0]}" required>
        </div>
    `;

    modalForm.onsubmit = async (e) => {
        e.preventDefault();
        const data = {
            book_id: document.getElementById('issue-book-id').value,
            student_id: document.getElementById('issue-student-id').value,
            issue_date: document.getElementById('issue-date').value,
        };

        const res = await fetch(`${API_BASE}/transactions/issue`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (res.ok) {
            closeModal();
            renderTransactions();
            showNotification('Book issued successfully', 'success');
        } else {
            const err = await res.json();
            showNotification(err.error, 'error');
        }
    };

    modal.style.display = 'flex';
}

async function returnBook(transactionId) {
    const returnDate = new Date().toISOString().split('T')[0];
    // Simple fine logic: ₹10 per day after 14 days
    const transaction = transactions.find(t => t.id === transactionId);
    const issueDate = new Date(transaction.issue_date);
    const diffTime = Math.abs(new Date() - issueDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const fine = diffDays > 14 ? (diffDays - 14) * 10 : 0;

    if (confirm(`Confirm return? ${fine > 0 ? 'Fine: ₹' + fine : 'No fine'}`)) {
        await fetch(`${API_BASE}/transactions/return`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ transaction_id: transactionId, return_date: returnDate, fine })
        });
        renderTransactions();
        showNotification('Book returned', 'success');
    }
}

// Utility
function closeModal() {
    modal.style.display = 'none';
}

function showNotification(message, type = 'success') {
    notification.textContent = message;
    notification.style.backgroundColor = type === 'success' ? '#10b981' : '#ef4444';
    notification.style.display = 'block';
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// Expose to global for onclick
window.closeModal = closeModal;
window.editBook = openBookModal;
window.deleteBook = async (id) => {
    if (confirm('Are you sure?')) {
        await fetch(`${API_BASE}/books/${id}`, { method: 'DELETE' });
        renderBooks();
    }
};
window.returnBook = returnBook;
window.openIssueModal = openIssueModal;
window.openBookModal = openBookModal;
