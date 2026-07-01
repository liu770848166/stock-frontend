import Link from "next/link";

import styles from "./page.module.css";

import { checkDatabaseConnection, getStockList } from "@/lib/db";

type HomeProps = {
  searchParams?: Promise<{
    keyword?: string;
  }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const keyword = resolvedSearchParams?.keyword?.trim() ?? "";

  let databaseStatus: { ok: boolean; serverTime?: string; message?: string };
  let stocks: Awaited<ReturnType<typeof getStockList>> = [];

  try {
    databaseStatus = await checkDatabaseConnection();
    stocks = await getStockList({ keyword, limit: 100 });
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
            首页直接从 MySQL 的 <code>stock_info</code> 表查询股票列表，支持按代码、名称、市场、行业搜索。
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
              <li>搜索关键词: {keyword || "无"}</li>
              <li>列表接口: GET /api/stocks?limit=100&amp;keyword=平安</li>
            </ul>
          </article>
        </section>

        <section className={styles.panel}>
          <div className={styles.searchHeader}>
            <div>
              <h2>股票列表</h2>
              <p className={styles.cardText}>可搜索股票代码、名称、市场、行业</p>
            </div>
            <span className={styles.muted}>{stocks.length} rows</span>
          </div>

          <form className={styles.searchForm}>
            <input
              className={styles.searchInput}
              type="text"
              name="keyword"
              defaultValue={keyword}
              placeholder="例如：000001、平安、主板、银行"
            />
            <button className={styles.searchButton} type="submit">
              搜索
            </button>
            <Link className={styles.resetButton} href="/">
              重置
            </Link>
          </form>

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
            <p className={styles.cardText}>没有查询到匹配的股票数据。</p>
          )}
        </section>
      </main>
    </div>
  );
}
