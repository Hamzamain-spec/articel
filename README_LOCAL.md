
# Running Article Generator Locally

## Prerequisites
- Node.js 20 or higher installed
- PostgreSQL 16 (optional, not currently used)

## Quick Start

### On Windows:
1. Double-click `start.bat`
2. Wait for installation to complete
3. Open your browser to `http://localhost:5000`

### On Mac/Linux:
1. Make the script executable: `chmod +x start.sh`
2. Run: `./start.sh`
3. Open your browser to `http://localhost:5000`

## Manual Setup

If the scripts don't work, run these commands:

```bash
npm install
npm run dev
```

Then open `http://localhost:5000` in your browser.

## Environment Variables

Create a `.env` file in the root directory if you want to set default API keys:

```
GEMINI_API_KEY=your_key_here
GROQ_API_KEY=your_key_here
```

Note: API keys can also be entered in the web interface.

## Stopping the Application

Press `Ctrl+C` in the terminal window to stop the server.
