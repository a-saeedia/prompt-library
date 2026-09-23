<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Prompt Library

A growing collection of reusable AI prompts, built with Google AI Studio and run as a Vite + React app. The prompt library itself lives in AI Studio — this repo is the app that showcases and serves it.

View the app in AI Studio: https://ai.studio/apps/drive/1enq_F9lisfxdoAmEcUf94gptjEaTZb2g

## Run locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

> **Note:** `.env.local` is git-ignored — never commit your Gemini API key. Generate one at [Google AI Studio](https://aistudio.google.com/app/apikey).

## Tech

- Vite + React
- [`@google/genai`](https://www.npmjs.com/package/@google/genai) SDK for Gemini
- Deployed from AI Studio