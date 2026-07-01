import styles from "./page.module.css";

import { checkDatabaseConnection, getStockSummary } from "@/lib/db";

export default async function Home() {
  let databaseStatus: { ok: boolean; serverTime?: string; message?: string };
  let stocks: Array<{ stockCode: string; stockName: string; market: string }> = [];

  try {
    databaseStatus = await checkDatabaseConnection();
    stocks = await getStockSummary();
  } catch (error) {
    databaseStatus = {
      ok: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>Stock Frontend</p>
          <h1>Next.js dashboard with direct server-side MySQL access.</h1>
          <p className={styles.lead}>
            This project connects to your database on the server, exposes a simple health endpoint,
            and renders a stock list without leaking credentials to the browser.
          </p>
        </section>

        <section className={styles.grid}>
          <article className={styles.card}>
            <div className={styles.cardHeader}>
              <h2>Database</h2>
              <span className={databaseStatus.ok ? styles.ok : styles.error}>
                {databaseStatus.ok ? "Connected" : "Unavailable"}
              </span>
            </div>
            <p className={styles.cardText}>
              {databaseStatus.ok
                ? `Server time: ${databaseStatus.serverTime}`
                : databaseStatus.message ?? "Database connection failed."}
            </p>
            <code className={styles.code}>GET /api/health</code>
          </article>

          <article className={styles.card}>
            <div className={styles.cardHeader}>
              <h2>Environment</h2>
            </div>
            <ul className={styles.metaList}>
              <li>Framework: Next.js 16 App Router</li>
              <li>Driver: mysql2/promise</li>
              <li>Runtime: server-side only for DB calls</li>
            </ul>
          </article>
        </section>

        <section className={styles.panel}>
          <div className={styles.cardHeader}>
            <h2>Sample stocks</h2>
            <span className={styles.muted}>{stocks.length} rows</span>
          </div>
          {stocks.length > 0 ? (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Name</th>
                    <th>Market</th>
                  </tr>
                </thead>
                <tbody>
                  {stocks.map((stock) => (
                    <tr key={stock.stockCode}>
                      <td>{stock.stockCode}</td>
                      <td>{stock.stockName}</td>
                      <td>{stock.market}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className={styles.cardText}>
              No rows loaded. If the database is connected, confirm the `stock_info` table exists and has
              active records.
            </p>
          )}
        </section>
      </main>
    </div>
  );
}
