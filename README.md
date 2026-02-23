# Stock Monitor

A modular Node.js stock monitoring system that checks store and official product pages and sends Telegram alerts when items are in stock.

## Structure
- `index.js`: entry point and scheduler
- `scrapers/`: site scrapers
- `notifier/`: notification providers
- `state/`: persisted run state
- `utils/`: shared utilities

## Setup
1. Install dependencies: `npm install`
2. Configure environment variables:
   - `STORE_PRODUCT_URL`
   - `OFFICIAL_PRODUCT_URL`
   - `TELEGRAM_BOT_TOKEN`
   - `TELEGRAM_CHAT_ID`
   - `CRON_SCHEDULE` (optional, default `*/10 * * * *`)
3. Run: `npm start`
