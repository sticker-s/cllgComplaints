# collegeComplaints — Smart Campus Complaint Management System

A web app where students can submit campus complaints (Wi-Fi, hostel, maintenance, etc.) and admins can track, assign, and resolve them in real-time.

---

## What it does

- Students register, submit complaints with photos, and track their status live
- Admins get a dashboard to manage all complaints, assign staff, and update status
- Both sides can leave comments on a complaint thread
- Role-based login — students see their own, admins see everything

---

## How it's made

**Frontend** — React.js (Vite) with React Router for navigation, Axios for API calls, and plain CSS with a Sweden-flag blue/yellow theme.

**Backend** — Node.js + Express REST API with JWT-based authentication and Multer for image uploads.

**Database** — MongoDB Atlas (cloud) with two collections: Users and Complaints (comments embedded inside complaints).

---

## Key Packages

| Package | Why we used it |
|---------|---------------|
| `express` | Creates the backend server and routes |
| `mongoose` | Connects to MongoDB and defines data schemas |
| `bcryptjs` | Hashes passwords before storing them |
| `jsonwebtoken` | Creates login tokens (JWT) for auth |
| `multer` | Handles image file uploads |
| `react-router-dom` | Frontend page navigation |
| `axios` | Makes HTTP requests from React to the backend |
| `react-toastify` | Shows success/error popup messages |
| `dotenv` | Loads secrets from `.env` file |
| `nodemon` | Auto-restarts backend on file save |

---

## How to Run

### 1. Backend

```bash
cd backend
npm install
```

Create a `.env` file inside `backend/`:
```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=any_random_secret
PORT=5000
```

Seed the database (first time only):
```bash
node seed.js
```

Start the backend:
```bash
npm run dev
```

### 2. Frontend

Open a new terminal:
```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Student | student1@campus.edu | student123 |
| Student | student2@campus.edu | student123 |
| Admin | admin@campus.edu | admin123 |

> Run `node seed.js` to reset all data and restore these accounts.
