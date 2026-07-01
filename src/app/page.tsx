import styles from "./page.module.css";

import { checkDatabaseConnection, getStockList } from "@/lib/db";

export default async function Home() {
  let databaseStatus: { ok: boolean; serverTime?: string; message?: string };
  let stocks: Awaited<ReturnType<typeof getStockList>> = [];

  try {
    databaseStatus = await checkDatabaseConnection();
    stocks = await getStockList(100);
  } catch (error) {
    databaseStatus = {
      ok: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }

  const activeCount = stocks.filter((stock) => stock.isActive).length;

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>Stock Frontend</p>
          <h1>股票列表</h1>
          <p className={styles.lead}>
            首页直接从 MySQL 的 <code>stock_info</code> 表查询股票列表，服务端渲染输出，不暴露数据库凭据。
          </p>
        </section>

        <section className={styles.grid}>
          <article className={styles.card}>
            <div className={styles.cardHeader}>
              <h2>数据库状态</h2>
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
              <h2>列表摘要</h2>
            </div>
            <ul className={styles.metaList}>
              <li>当前展示: {stocks.length} 条</li>
              <li>活跃股票: {activeCount} 条</li>
              <li>列表接口: GET /api/stocks?limit=100</li>
            </ul>
          </article>
        </section>

        <section className={styles.panel}>
          <div className={styles.cardHeader}>
            <h2>股票列表</h2>
            <span className={styles.muted}>{stocks.length} rows</span>
          </div>
          {stocks.length > 0 ? (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>代码</th>
                    <th>名称</th>
                    <th>市场</th>
                    <th>行业</th>
                    <th>上市日期</th>
                    <th>状态</th>
                  </tr>
                </thead>
                <tbody>
                  {stocks.map((stock) => (
                    <tr key={stock.stockCode}>
                      <td>{stock.stockCode}</td>
                      <td>{stock.stockName}</td>
                      <td>{stock.market}</td>
                      <td>{stock.industry ?? "-"}</td>
                      <td>{stock.listDate ?? "-"}</td>
                      <td>
                        <span className={stock.isActive ? styles.ok : styles.error}>
                          {stock.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className={styles.cardText}>没有查询到股票数据。</p>
          )}
        </section>
      </main>
    </div>
  );
}
