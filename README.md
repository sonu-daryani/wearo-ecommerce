# Wearo.in

**Wearo.in** is a responsive e-commerce storefront built with **Next.js 14** (App Router), **TypeScript**, **Tailwind CSS**, **Redux Toolkit**, **Framer Motion**, and **shadcn/ui**-style components. This repo is maintained by **Sonu Daryani** and includes a customized theme (colors, backgrounds, and card styling).

**[Live reference demo](https://next-ecommerce-shopco.vercel.app/)** (original upstream deployment)

---

## Quick start

```bash
git clone https://github.com/sonudaryani/shopco-ecommerce.git
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

## Design credit

UI is based on a community [Figma e-commerce template](https://www.figma.com/community/file/1273571982885059508/e-commerce-website-template-freebie) by [Hamza Naeem](https://www.figma.com/@hamzauix). Upstream implementation inspiration: [next-ecommerce-shopco](https://github.com/mohammadoftadeh/next-ecommerce-shopco).

---

## License

[MIT](LICENSE)

---

## Maintainer

**Sonu Daryani** — [GitHub @sonudaryani](https://github.com/sonudaryani)
