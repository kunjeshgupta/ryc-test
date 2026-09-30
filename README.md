# RYC Invoice App

A mobile-friendly invoice generator for Rominder Yadav Cranes. Create GST invoices, save client details, generate PDFs, and keep an invoice history in the browser.

## Features

- Create intra-state (CGST + SGST) and inter-state (IGST) invoices
- Save and reuse client details
- Generate downloadable PDF invoices
- Upload a custom company logo
- Store invoices, clients, invoice number, and logo locally in the browser

## Run locally

Requirements: Node.js 18 or later.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. Build a production version with:

```bash
npm run build
```

## Project structure

```text
src/
  components/   App screens and forms
  utils/        Storage, PDF generation, and calculations
  assets/       Bundled RYC logo
  config.js     Company, bank, and invoice defaults
reference/      Source invoice used for layout reference
public/         Public static files
```

## Data storage

The current version stores data in browser localStorage. Clearing browser data or opening the app from a different domain/browser will not carry invoices over, so export or a hosted database should be added before changing hosting providers.
