# Agri-Allied — Crop Advisory Platform

Agri-Allied is a full-stack, AI-powered agricultural advisory platform designed specifically for field supervisors of the organic farming collective in Almora, Uttarakhand, India. 

Field supervisors can input crop symptoms, pest issues, and post-harvest queries in plain language and receive practical, organic-compliant, hill-calibrated advice powered by Google's Gemini AI.

---

## Project Tech Stack

- **Frontend**: React (Vite) + Tailwind CSS + React Router
- **Backend**: Python FastAPI (proxies the Gemini API, maintaining API key security)
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

## How to Run the Project

### 1. Start the Backend Server

1. Open your terminal and navigate to the `/backend` folder.
2. Create your `.env` file from the example:
   ```bash
   cp .env.example .env
   ```
   *(On Windows PowerShell, use: `copy .env.example .env`)*
3. Open `.env` and fill in your Gemini API Key:
   ```env
   GEMINI_API_KEY=AIzaSyYourGeminiApiKeyHere
   ```
4. Install python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
5. Run the FastAPI dev server:
   ```bash
   uvicorn main:app --reload
   ```
   The backend will start running on **`http://localhost:8000`**.

---

### 2. Start the Frontend Application

1. Open a new terminal and navigate to the `/frontend` folder.
2. Install node dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to **`http://localhost:5173`** (or the port output in your terminal).

---

## Verification Checklist

- [x] **Home Route (`/`)**: Features Navbar, Footer, custom Hero banner with topographic contour backdrop, and two grids of the custom solid-accent Card component.
- [x] **About Route (`/about`)**: Detailed background text on high-altitude terraced farming and the collective's goals.
- [x] **Advisory Route (`/dashboard`)**: Full conversational chat interface, typing loaders, prompt suggestion chips, error banners, and the required persistent Agricultural Extension Officer disclaimer banner.
- [x] **Login Route (`/login`)**: Custom themed forms for field supervisor access.
- [x] **FastAPI Endpoint (`/api/chat`)**: Safely proxies client prompts to the Gemini API, appending the region-specific agricultural instruction prefix before querying.
