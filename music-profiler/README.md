# Listener — A Music Taste Portrait

A web app that asks you 8 questions about your music taste, then uses Claude AI to build a personal taste profile and evaluate new music against it.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- An [Anthropic API key](https://console.anthropic.com/)

## Setup

1. **Clone the repo and navigate to the project folder:**
   ```bash
   git clone https://github.com/vanavi-bernitez/elicitation.git
   cd elicitation/music-profiler
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create your `.env` file:**
   ```bash
   cp .env.example .env
   ```
   Then open `.env` and fill in your values:
   ```
   VITE_ANTHROPIC_API_KEY=sk-ant-...
   VITE_CLAUDE_MODEL=claude-sonnet-4-6
   ```

4. **Start the dev server:**
   ```bash
   npm run dev
   ```

5. Open [http://localhost:5173](http://localhost:5173) in your browser.

