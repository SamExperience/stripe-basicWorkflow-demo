# Stripe Demo

A React + Vite starter project for building a basic Stripe payment workflow. This is currently a scaffold with the foundation in place.

## Tech Stack

- **React** 19
- **Vite** 8 (build tool)
- **Oxlint** (code linter)

## Prerequisites

- Node.js (version 18 or higher recommended)
- npm

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables (Firebase config): copy `.env.example` to `.env.local` and fill in the values.

3. Start the dev server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to the URL shown in the terminal (typically `http://localhost:5173`).

## Available Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Start the development server with hot module reload |
| `npm run build` | Build the project for production |
| `npm run lint` | Run Oxlint to check code quality |
| `npm run preview` | Preview the production build locally |

## Project Structure

```
src/
├── main.jsx       # Application entry point
├── App.jsx        # Root React component
├── App.css        # Component styles
└── index.css      # Global styles
index.html         # HTML template
vite.config.js     # Vite configuration
.oxlintrc.json     # Oxlint configuration
```

## Status

This project is in early development. The following features are **not yet implemented**:

- Stripe API integration (Checkout, Payment Element, or Custom Integration)
- Backend API for managing Stripe keys and webhooks
- Payment form components
- Order management

## Next Steps

To continue development:

1. Set up a Stripe account and obtain API keys
2. Create a backend service to handle Stripe payments securely
3. Integrate Stripe.js and a payment element into React components
4. Implement webhook handling for payment confirmations

For more information, see the [Stripe documentation](https://stripe.com/docs).
