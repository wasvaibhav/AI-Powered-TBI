# Agri-Allied — Crop Advisory Platform

Agri-Allied is a full-stack, AI-powered agricultural advisory platform designed specifically for field supervisors of the organic farming collective in Almora, Uttarakhand, India. 

Field supervisors can input crop symptoms, pest issues, and post-harvest queries in plain language and receive practical, organic-compliant, hill-calibrated advice powered by Google's Gemini AI.

---

## Project Tech Stack

- **Frontend**: React (Vite) + Tailwind CSS + React Router
- **AI Model**: Google Gemini (`gemini-2.0-flash` with fallback to `gemini-1.5-flash`)
- **Theme**: Earthy Himalayan-agriculture styling:
  - Deep Pine Green (`#1B4332`)
  - Warm Terracotta Accent (`#BC6C25`)
  - Cream/Off-White Background (`#FAF6EF`)
  - Soft Charcoal Text (`#2D2A26`)
  - Typography: Serif headers (Fraunces / Spectral) paired with clean Sans-serif body (Work Sans).

---

## Directory Structure

```text
/
├── backend/
├── frontend/
│   ├── src/
│   │   ├── components/    # Navbar.jsx, Hero.jsx, Card.jsx, Footer.jsx
│   │   ├── pages/         # Home.jsx, About.jsx, Dashboard.jsx, Login.jsx
│   │   ├── App.jsx        # Routing & layouts
│   │   ├── main.jsx       # Entry point
│   │   └── index.css      # Core styles & custom typography
│   ├── tailwind.config.js # Tailwind color definitions
│   └── index.html         # SEO titles & meta tags
└── README.md              # Startup documentation
```
---

## How to run backend locally

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create a virtual environment:
   ```bash
   python -m venv venv
   ```
3. Activate the virtual environment:
   - On Windows (PowerShell):
     ```powershell
     .\venv\Scripts\activate
     ```
   - On Windows (Command Prompt):
     ```cmd
     .\venv\Scripts\activate.bat
     ```
   - On macOS/Linux:
     ```bash
     source venv/bin/activate
     ```
4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
5. Run the FastAPI development server on port 5000:
   ```bash
   uvicorn main:app --reload --port 5000
   ```

---

## Week 5: Authentication & MongoDB Atlas Integration

We transitioned the platform storage from in-memory arrays to **MongoDB Atlas** using the **Beanie ODM** (Object Document Mapper) and implemented a robust role-based authentication system.

### 1. Data Models (MongoDB Collections)

#### User (`users`)
Exposes safe profile information for supervisor sessions:
- `id` (ObjectId): Unique identifier.
- `name` (string): Supervisor's name.
- `email` (string, unique): Used for authentication.
- `phone` (string): Contact details (owner-only access).
- `hashed_password` (string): Hashed password.
- `created_at` (datetime): Account creation timestamp.

#### Advisory (`advisories`)
User-linked crop diagnosis and advisory recommendations:
- `id` (ObjectId): Record identifier.
- `userId` (string): Link to the owner `User.id`.
- `crop` (string): Target mountain crop (e.g. apple, beans).
- `query` (string): Field symptoms or supervisor query.
- `advice` (string): organic/AI advice recommendations.
- `status` (string): `"open"` or `"resolved"`.
- `createdAt` (datetime): Creation timestamp.

#### ChatMessage (`chat_messages`)
Chronological persistent storage for Gemini-powered organic chats:
- `id` (ObjectId): Message log identifier.
- `userId` (string): Link to the owner `User.id`.
- `role` (string): `"user"` or `"assistant"`.
- `content` (string): Chat message details.
- `createdAt` (datetime): Log timestamp.

### 2. Authentication Overview

- **Password Security**: Passwords are never stored as plain-text. They are hashed using **Bcrypt** (`passlib[bcrypt]`) before database insertion.
- **Session Tokens**: Authenticated routes are protected with **JSON Web Tokens (JWT)** (`python-jose`). Access tokens expire after 24 hours.
- **Data Isolation**: Route actions (listing, searching, updating, deleting, and logging chats) are automatically locked to the active user's session ID decoded from the JWT token.
- **Auto-Seeding**: On startup, if no users are registered, the system automatically creates a default test account (`supervisor@agriallied.org` / `password123`) and seeds the 5 Week-4 crop advisories linked directly to it.

### 3. Setup and Secrets

To connect to MongoDB Atlas and sign JWT tokens, add these parameters to your `.env` file in `/backend/`:
```text
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/agri_allied?retryWrites=true&w=majority
JWT_SECRET=your_jwt_signing_secret_here
```

