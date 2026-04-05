# Wearo.in

**Wearo.in** is a responsive e-commerce storefront built with **Next.js 14** (App Router), **TypeScript**, **Tailwind CSS**, **Redux Toolkit**, **Framer Motion**, and **shadcn/ui**-style components. This repo is maintained by **Sonu Daryani** and includes a customized theme (colors, backgrounds, and card styling).

---

## Quick start

```bash
git clone https://github.com/sonu-daryani/wearo-india.git
cd shopco-ecommerce
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

| Script        | Description        |
| ------------- | ------------------ |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Run production server |
| `npm run lint`  | ESLint |

---

## Stack

- **Next.js 14.2** — App Router, SSR/SSG-friendly pages
- **React 18** + **TypeScript**
- **Tailwind CSS** — design tokens in `src/styles/globals.css`
- **Redux Toolkit** + **redux-persist** — cart and product-related state (`src/lib/`)
- **Radix UI** primitives, **Framer Motion**, **Embla Carousel**

---

## Project layout

```
shopco-ecommerce/
├── public/                 # Images, icons
├── src/
│   ├── app/                # Routes (App Router)
│   ├── components/         # UI, layout, homepage, shop, product, cart
│   ├── lib/                # Redux store, slices, utils
│   ├── styles/             # globals.css, fonts
│   └── types/              # Shared TypeScript types
├── components.json         # shadcn/ui config
├── next.config.mjs
├── tailwind.config.ts
├── postcss.config.mjs
└── tsconfig.json
```

---

## Customization

- **Theme (light/dark):** edit CSS variables in `src/styles/globals.css`.
- **Tailwind:** `tailwind.config.ts` maps semantic colors to those variables.
- **Cart / products:** `src/lib/features/carts` and `src/lib/features/products`.

---

## License

[MIT](LICENSE)

---

## Maintainer

**Sonu Daryani** — [GitHub @sonudaryani](https://github.com/sonu-daryani)
