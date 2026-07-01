This is a Next.js 16 project configured to connect to MySQL directly on the server side.

## Setup

1. Copy the environment template and fill in your database settings.

```bash
cp .env.example .env.local
```

2. Install dependencies.

```bash
npm install
```

3. Start the development server.

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Database access

- Server-side connection helper: `src/lib/db.ts`
- Health endpoint: `GET /api/health`
- Sample homepage query: reads active stocks from `stock_info`

Database queries run only on the server. Do not move connection logic into client components.

## Expected tables

The homepage currently expects:

```sql
stock_info(stock_code, stock_name, market, is_active)
```

If that table is missing, the page will still load, but the query section will show an error or zero rows.

## Scripts

- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`
