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
