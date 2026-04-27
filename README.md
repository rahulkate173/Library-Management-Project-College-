# Library Management System

A modern, minimalistic, white-themed Library Management System built with Node.js, Express, MySQL, and Vanilla Frontend.

## Features
- **Dashboard**: Real-time statistics and visual charts.
- **Book Management**: CRUD operations for the library catalog.
- **Student Management**: Manage student details.
- **Issue/Return System**: Track book loans, availability, and overdue fines.
- **Modern UI**: Clean design with smooth transitions and responsive layout.

## Tech Stack
- **Frontend**: HTML5, Vanilla CSS3, Javascript, Lucide Icons, Chart.js.
- **Backend**: Node.js, Express.js.
- **Database**: MySQL.

## Setup Instructions

### 1. Database Setup
1. Open **MySQL Workbench** or any MySQL client.
2. Run the script found in `sql/schema.sql` to create the database and tables.
3. (Optional) The script includes sample data for testing.

### 2. Backend Setup
1. Open a terminal in the `backend` folder.
2. Run `npm install` to install dependencies.
3. Open the `.env` file and update the `DB_PASSWORD` with your MySQL password.
4. Start the server using:
   ```bash
   npm start
   ```
   The server will run on `http://localhost:5000`.

### 3. Frontend Setup
1. You can serve the `frontend` folder using any local server (e.g., Live Server in VS Code).
2. Open `index.html` in your browser.
3. Ensure the backend is running for data to display.

## API Endpoints
- `GET /api/books`: Fetch all books.
- `POST /api/books`: Add a new book.
- `GET /api/transactions/stats`: Get dashboard statistics.
- `POST /api/transactions/issue`: Issue a book to a student.
- `POST /api/transactions/return`: Return a book and calculate fines.

## Project Structure
```
├── backend/
│   ├── config/          # Database connection
│   ├── routes/          # API Route handlers
│   ├── server.js        # Entry point
│   └── .env             # Environment variables
├── frontend/
│   ├── css/             # Styling
│   ├── js/              # Frontend logic
│   └── index.html       # Main application
└── sql/
    └── schema.sql       # Database schema
```
