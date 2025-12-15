# Copilot instructions — Filtro-CTG

This repo is a small static single-page app. Give focused, non-opinionated edits that fit the existing vanilla-JS + Tailwind approach.

- **Project type:** Static HTML/CSS/JS; no build step. Run by opening `index.html` in a browser or hosting the folder (e.g., GitHub Pages).

- **Key files:**
  - [index.html](index.html#L1-L40) — layout, Tailwind CDN, UI containers and progress elements (`#content`, `#barra`, `#etapaAtual`).
  - [js/app.js](js/app.js#L3-L4) — main logic: constants, `QUESTIONS` map, `state`, validators, render flow.
  - [js/app.js](js/app.js#L120-L128) — step → question mapping (update here when adding/removing steps).
  - [css/app.css](css/app.css#L1-L20) — small project-specific CSS utilities and keyframes.

- **Big picture:** The app is a client-side, state-driven stepper.
  - `state.step` (1..TOTAL_STEPS) controls what `render()` places into `#content`.
  - Step 1 is the contact form; steps 2..N are rendered via `renderQuestion(key)` using the `QUESTIONS` map.
  - On completion the app POSTs to FormSubmit (`FORMSUBMIT_EMAIL`) then redirects to WhatsApp (`WHATSAPP_PHONE`). See [js/app.js](js/app.js#L3-L4).

- **Patterns & conventions specific to this repo:**
  - Minimal vanilla JS; helper functions `$` and `el` are used for DOM selection and element creation.
  - UI text and options live in `QUESTIONS` (a plain object). Index and render logic assume the following: step 1 = contact, steps 2..N map to specific `QUESTIONS` keys in `render()` (see [js/app.js](js/app.js#L120-L128)). When you add/remove questions update both `QUESTIONS`, `TOTAL_STEPS` and the hard-coded `render()` mapping.
  - Small number of global constants at the top of `js/app.js` for quick configuration: `FORMSUBMIT_EMAIL`, `WHATSAPP_PHONE`, and `TOTAL_STEPS`.
  - The file `js/app.js` currently contains `<script>` tags around the source. Keep edits minimal: prefer editing the code body but avoid duplicating `<script>` tags if moving code.

- **When modifying behavior:**
  - Validation: `validateEmail` and `validatePhone` are the app's canonical validators (see [js/app.js](js/app.js#L46-L48)). Use them for form checks.
  - Adding a question: add an entry in `QUESTIONS`, append a step mapping in `render()` (see [js/app.js](js/app.js#L120-L128)), and increment `TOTAL_STEPS`.
  - Changing submission flow: `sendEmail()` constructs a FormData table and posts to FormSubmit; `redirectToWhatsApp()` builds the WhatsApp message. Update `FORMSUBMIT_EMAIL` or `WHATSAPP_PHONE` for destination changes.

- **Styling & assets:** Tailwind is loaded via CDN in `index.html` and project CSS adds small utility rules; prefer Tailwind classes for layout/visuals and `css/app.css` only for micro-interactions defined there.

- **Dev & debugging tips:**
  - No bundler or test runner; open `index.html` or use a static server (e.g., `npx http-server .`) to test.
  - Use the browser console to inspect `state` and `QUESTIONS` at runtime (e.g., `window.state` is not exported; you can temporarily attach it for debugging).

- **Safe edits examples:**
  - To change the destination email: edit `FORMSUBMIT_EMAIL` at [js/app.js](js/app.js#L3).
  - To localize text: update labels in `index.html` for static copy, and `QUESTIONS` titles/options in [js/app.js](js/app.js#L6-L36).

If any behavior or mapping is unclear, tell me which part you want clarified (e.g., adding a new question, changing submission), and I will update this file with a short how-to example. 
