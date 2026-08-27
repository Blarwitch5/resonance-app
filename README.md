# Resonance

Where your music resonates.

PWA journal sonore — vinyl, cassettes, CDs. Stack : Next.js 16, React 19, Drizzle, Neon, better-auth, Vercel.

Le produit et l’univers visuel sont décrits dans [`Read.me`](./Read.me). Les conventions agent sont **uniquement** dans [`.cursor/rules/`](./.cursor/rules/). Preview des tokens : `/dev/tokens` (dev only).

## Prérequis

- Node.js 22.12+
- pnpm 10.11+
- Compte [Neon](https://neon.tech) (free) et clés [Discogs](https://www.discogs.com/settings/developers)

## Démarrage

```bash
pnpm install
cp env.example .env.local
```

Renseigne `DATABASE_URL`, `BETTER_AUTH_SECRET` (32+ caractères), `BETTER_AUTH_URL`, et les clés Discogs.

```bash
pnpm db:push
pnpm dev
```

Ouvre [http://localhost:3000](http://localhost:3000).

## Scripts

| Commande | Rôle |
| --- | --- |
| `pnpm dev` | Serveur de développement |
| `pnpm build` | Build production |
| `pnpm lint` | ESLint |
| `pnpm db:generate` | Générer une migration Drizzle |
| `pnpm db:migrate` | Appliquer les migrations |
| `pnpm db:push` | Pousser le schéma (local) |
| `pnpm db:studio` | Drizzle Studio |

## Déploiement

Vercel Hobby. Root Directory = racine du repo. Variables : les mêmes que `.env.local` (sans `NODE_ENV`).
