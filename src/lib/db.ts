import mysql from "mysql2/promise";

const requiredEnvVars = ["DB_HOST", "DB_PORT", "DB_USER", "DB_NAME"] as const;

function getMissingEnvVars() {
  return requiredEnvVars.filter((key) => !process.env[key]);
}

declare global {
  var mysqlPool: mysql.Pool | undefined;
}

export type StockListItem = {
  stockCode: string;
  stockName: string;
  market: string;
  industry: string | null;
  listDate: string | null;
  isActive: boolean;
};

export type StockListFilters = {
  keyword?: string;
  limit?: number;
};

function formatDateValue(value: unknown) {
  if (!value) {
    return null;
  }

  if (typeof value === "string") {
    return value.slice(0, 10);
  }

  if (value instanceof Date) {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  return String(value);
}

export function getPool() {
  const missing = getMissingEnvVars();

  if (missing.length > 0) {
    throw new Error(`Missing database configuration: ${missing.join(", ")}`);
  }

  if (!global.mysqlPool) {
    global.mysqlPool = mysql.createPool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      charset: "utf8mb4",
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }

  return global.mysqlPool;
}

export async function checkDatabaseConnection() {
  const pool = getPool();
  const connection = await pool.getConnection();

  try {
    const [rows] = await connection.query<mysql.RowDataPacket[]>("SELECT NOW() AS serverTime");
    return {
      ok: true,
      serverTime: String(rows[0]?.serverTime ?? ""),
    };
  } finally {
    connection.release();
  }
}

export async function getStockList(filters: StockListFilters = {}) {
  const pool = getPool();
  const limit = Number.isFinite(filters.limit) ? Number(filters.limit) : 100;
  const keyword = filters.keyword?.trim();
  const values: Array<number | string> = [];

  let query = `
    SELECT stock_code, stock_name, market, industry, list_date, is_active
    FROM stock_info
  `;

  if (keyword) {
    query += `
      WHERE stock_code LIKE ?
         OR stock_name LIKE ?
         OR market LIKE ?
         OR industry LIKE ?
    `;
    const likeValue = `%${keyword}%`;
    values.push(likeValue, likeValue, likeValue, likeValue);
  }

  query += `
    ORDER BY is_active DESC, stock_code ASC
    LIMIT ?
  `;
  values.push(limit);

  const [rows] = await pool.query<mysql.RowDataPacket[]>(query, values);

  return rows.map((row) => ({
    stockCode: String(row.stock_code),
    stockName: String(row.stock_name),
    market: String(row.market),
    industry: row.industry ? String(row.industry) : null,
    listDate: formatDateValue(row.list_date),
    isActive: Boolean(row.is_active),
  })) as StockListItem[];
}
