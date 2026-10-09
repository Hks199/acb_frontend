# React + Vite

## FAQs

FAQs appear before the homepage contact form and at `/faq`, linked from desktop/mobile navigation and the footer. Questions expand with mouse, touch, or keyboard; answers render as plain text with preserved line breaks. The section refreshes every 30 seconds and on tab focus, and includes loading, empty, and retry states.

Manage content in the sibling admin app under **Store management > FAQs**. Add or edit both question and answer, publish/hide, delete, and set display order (lower numbers first). New FAQs default to hidden. No sample policy answers are published automatically.

Deploy the backend at `C:/Users/admin/Documents/acb_project` first, then rebuild/deploy both Vite apps using their existing `VITE_API_URL` with the `/api/` prefix. MongoDB creates the `faqs` collection on the first save; no SQL migration is needed. See the admin README for the API contract.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
