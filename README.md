# Wearo storefront (`shopco-ecommerce`)

Responsive e-commerce storefront built with **Next.js 14** (App Router), **TypeScript**, **Tailwind CSS**, **Redux Toolkit**, **Framer Motion**, and **shadcn/ui**-style components. Pairs with **[wearo-ecommerce-admin](https://github.com/sonu-daryani/wearo-ecommerce-admin)** (same MongoDB + Prisma schema).

---

## Quick start

```bash
git clone https://github.com/sonu-daryani/wearo-ecommerce.git
cd shopco-ecommerce
npm install
cp .env.example .env
# Set DATABASE_URL (same DB as admin), AUTH_*, optional payment-related vars (see below)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

| Script | Description |
| ------ | ----------- |
| `npm run dev` | Development server |
| `npm run build` | Production build (`prisma generate` + `next build`) |
| `npm run start` | Production server |
| `npm run lint` | ESLint |

---

## Stack

- **Next.js 14.2** — App Router
- **React 18** + **TypeScript**
- **Prisma** + **MongoDB** — orders, company settings, Auth.js users
- **Tailwind CSS** — `src/styles/globals.css`
- **Redux Toolkit** + **redux-persist** — cart (`src/lib/features/`)
- **Radix UI**, **Framer Motion**, **Embla Carousel**
- **Axios** — storefront API client with `{ success, message, data }` envelopes where used

---

## Payments & checkout

- **Admin** configures **Stripe**, **Razorpay**, and/or **Cashfree** under **Payment settings** (App ID / publishable key + API secrets stored in MongoDB, server-only).
- Storefront: **`POST /api/orders/place`**, **`POST /api/payments/session`**, **`POST /api/payments/verify`**.
- **Cashfree:** set `CASHFREE_ENV=sandbox` or `production` in `.env` (see `.env.example`).
- Public checkout flags and keys (no secrets) come from **`GET /api/company-settings`**.

---

## Environment

Copy **`.env.example`** → `.env`. Important variables:

- **`DATABASE_URL`** — same MongoDB as the admin app (Prisma `db push` / `generate`).
- **`AUTH_SECRET`**, **`AUTH_URL`**, Google OAuth — NextAuth.
- **`NEXT_PUBLIC_ADMIN_PORTAL_URL`** — link to admin (e.g. `http://localhost:3001`).

---

## Project layout

```
shopco-ecommerce/
├── prisma/                 # schema.prisma (shared with admin)
├── public/
├── src/
│   ├── app/                # App Router (checkout, API routes, …)
│   ├── components/
│   ├── lib/                # Redux, payments, company-settings, http client
│   └── styles/
├── .env.example
└── next.config.mjs
```

---

## Customization

- **Theme:** CSS variables in `src/styles/globals.css`, `tailwind.config.ts`.
- **Cart / products:** `src/lib/features/carts`, `src/lib/features/products`.

---

## License

[MIT](LICENSE)

---

## Maintainer

**Sonu Daryani** — [@sonu-daryani](https://github.com/sonu-daryani)
