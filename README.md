# Watch Stock Watcher

A modular stock monitoring engine that tracks watch availability across multiple websites and sends real-time restock notifications via Telegram.

## Features

- Track watches by name (not fixed URL)
- Monitor multiple websites
- Telegram notifications
- Cooldown protection to prevent spam alerts
- Persistent state management
- Cron-based automated checks
- Modular architecture

## Architecture Overview

Scheduler (node-cron)
↓
Scrapers
- Store Site (Puppeteer)
- Official Site (Axios + Cheerio)
↓
State Manager (JSON persistence)
↓
Notification Engine (Telegram Bot)

## Project Structure

watch-stock-watcher/
│
├── index.js
├── package.json
├── .env.example
│
├── scrapers/
│   ├── storeScraper.js
│   └── officialScraper.js
│
├── notifier/
│   └── telegram.js
│
├── utils/
│   └── stateManager.js
│
└── state/
    └── state.json

## Installation

1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/watch-stock-watcher.git
cd watch-stock-watcher
```

2. Install dependencies

```bash
npm install
```

3. Setup environment variables

```bash
cp .env.example .env
```

Edit `.env`:

```
BOT_TOKEN=your_telegram_bot_token
CHAT_ID=your_chat_id
WATCH_NAME=janata white
CHECK_INTERVAL_MINUTES=5
COOLDOWN_MINUTES=60
```

## Telegram Bot Setup

1. Open Telegram
2. Search for `@BotFather`
3. Create a new bot
4. Copy the `BOT_TOKEN`
5. Get your chat ID (via `@userinfobot` or API)

## Run Locally

```bash
npm start
```

The system will:
- Run immediately
- Then check every configured interval

## Deployment

You can deploy this on:
- Railway
- Render
- VPS
- Raspberry Pi
- Docker container

Set environment variables in your hosting platform.

## How It Works

- Searches the target watch name on configured websites
- Detects availability by checking for "Out of stock"
- Compares with previous state
- Sends notification only on status change
- Applies cooldown logic to prevent spam

## Anti-Spam Logic

Notifications are sent only when:
- Previous status = OUT
- Current status = IN
- Cooldown window has passed

## Future Improvements

- Multi-watch tracking
- Web dashboard UI
- Email support
- Multi-platform retailer support
- Database persistence
- Docker support
- Cloudflare bypass improvements

## License

MIT License © 2026 YOUR_NAME

## Disclaimer

This project is intended for educational and personal use.
Please respect website terms of service and avoid aggressive scraping.
