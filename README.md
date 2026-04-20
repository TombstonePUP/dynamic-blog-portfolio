# Dynamic Blog Portfolio

A Next.js 16 portfolio/blog project with guest and admin route groups, Tailwind CSS v4 styling, and Prisma configured for PostgreSQL.

## Tech Stack

- Next.js `16.2.3` (App Router)
- React `19.2.4`
- TypeScript
- Tailwind CSS `4`
- Prisma `7.7.0` (`@prisma/client` + `prisma`)

## Prerequisites

- Node.js `>= 20` (Node 24 also works)
- npm

## Installation

```bash
npm install
```

## Run Locally

```bash
npm run dev
```

Open `http://localhost:3000`.

If port `3000` is busy, Next.js will automatically choose the next available port (for example `3001`).

## Build and Start (Production)

```bash
npm run build
npm run start
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build production bundle
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Routes (Current)

- `/` - Guest landing page
- `/blog` - Guest blog page
- `/dashboard` - Admin dashboard page
- `/api/posts` - Sample API route (`GET`, `POST`)

## Environment Variables

Prisma config expects:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DB_NAME"
```

Notes:

- `prisma.config.ts` reads `DATABASE_URL`.
- The current app pages and API route are mostly static/sample, so local dev can boot without a working database connection unless you start using Prisma features.

## Project Structure

```text
app/
  (guest)/
  (admin)/
  api/posts/
components/
data/
lib/
prisma/
services/
types/
```

## Developer Note

This project uses a newer Next.js version with breaking changes compared to older docs/tutorials. If you update framework behavior, check the local docs in:

`node_modules/next/dist/docs/`
