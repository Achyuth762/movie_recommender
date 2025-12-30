# CineSuggest - AI Movie Curator 🎬

A premium, AI-powered web application that curates movie recommendations based on your specific mood and vibe. Built with a cyberpunk aesthetic and modern web technologies.

## ✨ Features
*   **AI Intelligence**: Powered by Perplexity (Sonar model) for real-time, context-aware recommendations.
*   **Cyberpunk UI**: Dark mode, neon accents, and smooth animations.
*   **My Collection**: Save your favorite discoveries to a local watch list.
*   **No Scrolling**: "Stop Searching. Start Watching." philosophy.
*   **History**: Search history is privately stored in a local SQLite database (server-side).

## 🛠️ Tech Stack
*   **Frontend**: React (Vite), Vanilla CSS (High perfromance).
*   **Backend**: Node.js, Fastify.
*   **Database**: SQLite (via `better-sqlite3`).
*   **AI**: Perplexity API (OpenAI SDK compatible).

## 🚀 How to Run Locally

### Prerequisites
*   Node.js installed.
*   A Perplexity API Key.

### 1. Backend Setup (Server)
Navigate to the server folder and install dependencies:
```bash
cd server
npm install
```

Create a `.env` file in the `server/` directory:
```env
PERPLEXITY_API_KEY=pplx-xxxxxxxxxxxxxxxxxxxxx
```

Start the server:
```bash
npm start
```
*Server runs on `http://localhost:3000`*

### 2. Frontend Setup (Client)
Open a new terminal, navigate to the client folder, and install dependencies:
```bash
cd client
npm install
```

Start the development server:
```bash
npm run dev
```
*Client runs on `http://localhost:5173`*

## 🌍 Deployment
*   **Backend**: Deployed on Render.
*   **Frontend**: Deployed on Vercel.
*   See `DEPLOY_GUIDE.md` for detailed steps.

## © License
2025 CineSuggest. All rights reserved.
