# ?? CampusVoice — Smart Campus Complaint Management System

> **Project 15** from the college project list  
> Built with: React.js · Node.js · Express · MongoDB · JWT Auth

---

## ?? Problem Statement

> *"Educational institutions lack an efficient system to track and resolve student complaints (hostel, Wi-Fi, maintenance). Manual systems delay resolution and lack transparency."*

In most colleges, students raise complaints verbally or through paper forms. There is no way to:
- Know **what happened** to your complaint after submitting it
- See **who is handling** the issue
- Get **notified** when it is resolved
- Have any **proof or record** of the complaint

Administrators also struggle — complaints come in from all directions with no central system, no priority tracking, and no easy way to assign or monitor resolution.

---

## ?? Objective

To develop a web application where:
- Students can **raise complaints** with images and category tagging
- Track the status of complaints **in real-time**
- Admins can **assign, manage, and resolve** complaints from a central dashboard
- All interactions are **authenticated and role-based**

---

## ? Key Features (from Requirements)

| Requirement | Status | How it is implemented |
|-------------|--------|-----------------------|
| User authentication (student/admin) | ? Done | JWT tokens + bcrypt password hashing |
| Complaint submission with images | ? Done | Multer file upload, up to 3 images |
| Live status tracking | ? Done | Status: Pending ? In Progress ? Resolved |
| Admin dashboard for assignment and resolution | ? Done | Admin can assign to staff, change status |
| Notifications (email/SMS if any) | ? In-app | Toast notifications on every action |

### Additional features built on top:
- ?? Search + filter complaints by status, category, priority
- ?? Comment thread on every complaint (student ? admin)
- ?? Admin analytics — category breakdown bar charts, resolution rate
- ?? Delete complaint with image cleanup
- ?? Activity timeline on each complaint
- ?? Image lightbox viewer
- ?? Priority levels: Low / Medium / High / Urgent
- ???? Sweden flag theme UI (blue + yellow design system)

---

## ?? Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| React.js (Vite) | UI framework |
| React Router DOM | Page navigation |
| Axios | HTTP requests to backend |
| React Toastify | Popup notifications |
| Vanilla CSS | Styling (Sweden theme design system) |
| Google Fonts (DM Sans) | Typography |

### Backend
| Technology | Purpose |
|-----------|---------|
| Node.js | JavaScript runtime |
| Express.js | Web server and routing |
| MongoDB Atlas | Cloud database |
| Mongoose | MongoDB object modelling |
| bcryptjs | Password hashing |
| JSON Web Token (JWT) | Authentication tokens |
| Multer | Image file uploads |
| dotenv | Environment config |
| nodemon | Dev auto-restart |

---

## ?? Project Structure

```
campus-complaint-system/
¦
+-- backend/
¦   +-- config/
¦   ¦   +-- db.js               # MongoDB connection
¦   +-- middleware/
¦   ¦   +-- auth.js             # JWT verification + role check
¦   +-- models/
¦   ¦   +-- User.js             # User schema (student/admin)
¦   ¦   +-- Complaint.js        # Complaint schema with embedded comments
¦   +-- routes/
¦   ¦   +-- auth.js             # POST /login, /register, GET /me
¦   ¦   +-- complaints.js       # CRUD for complaints + file upload
¦   ¦   +-- admin.js            # Stats, user list, admin tools
¦   +-- uploads/                # Uploaded images stored here
¦   +-- .env                    # Secret config (never commit to git)
¦   +-- package.json
¦   +-- seed.js                 # Creates sample accounts in DB
¦   +-- server.js               # Entry point — starts Express server
¦
+-- frontend/
    +-- src/
        +-- api/
        ¦   +-- axios.js        # Axios instance with token interceptor
        +-- components/
        ¦   +-- Layout.jsx      # Navbar with avatar dropdown
        +-- context/
        ¦   +-- AuthContext.jsx # Global auth state (login/logout/user)
        +-- pages/
        ¦   +-- Login.jsx
        ¦   +-- Register.jsx
        ¦   +-- StudentDashboard.jsx
        ¦   +-- AdminDashboard.jsx
        ¦   +-- NewComplaint.jsx
        ¦   +-- ComplaintDetail.jsx
        +-- utils/
        ¦   +-- helpers.js      # Badge styles, date formatting
        +-- App.jsx             # Routing + protected routes
        +-- index.css           # Full design system (CSS variables)
        +-- main.jsx            # React entry point
```

---

## ?? How to Run the Project

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account (free tier works)

### Step 1 — Backend setup

```bash
cd campus-complaint-system/backend
npm install
```

Create a `.env` file inside `backend/`:

```env
MONGO_URI=your_mongodb_connection_string_here
JWT_SECRET=any_random_secret_string
PORT=5000
```

### Step 2 — Seed the database (one time only)

```bash
node seed.js
```

This creates 3 accounts in MongoDB.

### Step 3 — Start Backend

```bash
npm run dev
```

Runs on: http://localhost:5000

### Step 4 — Frontend setup

Open a new terminal:

```bash
cd campus-complaint-system/frontend
npm install
npm run dev
```

Runs on: http://localhost:5173

---

## ?? Login Credentials

| Role | Email | Password |
|------|-------|----------|
| ????? Student 1 | student1@campus.edu | student123 |
| ????? Student 2 | student2@campus.edu | student123 |
| ??? Admin | admin@campus.edu | admin123 |

> To reset all data and restore these accounts: `node seed.js`

---

## ?? API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register a new student |
| POST | /api/auth/login | Login and get JWT token |
| GET | /api/auth/me | Get current logged-in user |

### Complaints
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | /api/complaints | Get complaints | Student (own), Admin (all) |
| GET | /api/complaints/:id | Get single complaint | Owner or Admin |
| POST | /api/complaints | Submit new complaint + images | Student |
| PATCH | /api/complaints/:id/status | Update status + assign | Admin only |
| POST | /api/complaints/:id/comments | Add a comment | Owner or Admin |
| DELETE | /api/complaints/:id | Delete complaint | Owner or Admin |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/admin/stats | Dashboard stats + category breakdown |
| GET | /api/admin/users | All users |
| GET | /api/admin/admins | All admins (for assignment dropdown) |

---

## ?? Database Schema

### Users Collection
```
_id, name, email, password (hashed), role, rollNo, department, year, createdAt, updatedAt
```

### Complaints Collection
```
_id, userId (? User), studentName, rollNo, department,
title, description, category, priority, location,
status, assignedTo (? User), assignedToName,
images[], comments[{ text, author, role, userId, createdAt }],
resolvedAt, createdAt, updatedAt
```

---

## ?? User Roles

### ????? Student
- Register and login
- Submit complaints with images
- View only their own complaints
- Filter and search complaints
- Add comments to their complaints
- Delete their own complaints

### ??? Admin
- View ALL complaints from all students
- Assign complaints to admin staff
- Change complaint status
- Add comments on any complaint
- View analytics dashboard with charts

---

## ?? Notes

- Passwords are never stored as plain text (bcrypt hashed)
- JWT tokens expire after 7 days
- Images stored in backend/uploads/ folder
- Never commit the .env file to GitHub
- Running `node seed.js` wipes all existing data

---

*Built as part of college web development project — Smart Campus Complaint Management System (Project 15)*
