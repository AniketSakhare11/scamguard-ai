# ScamGuard AI 🛡️

A lightweight web application designed to scan SMS messages, emails, and DMs for scam signals. It features an offline local heuristics scanner and an optional Gemini AI-assisted scanner.

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run locally:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

## Features

* **Local Scan:** Runs instantly offline without any configuration. Detects links, phone numbers, emails, and urgency keywords.
* **AI Scan:** Toggle on and paste a Gemini API key inside the UI settings to get deep semantic risk scores, red flags, and recommended defense actions.
