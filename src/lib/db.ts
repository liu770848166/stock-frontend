import mysql from "mysql2/promise";

const requiredEnvVars = ["DB_HOST", "DB_PORT", "DB_USER", "DB_NAME"] as const;

function getMissingEnvVars() {
  return requiredEnvVars.filter((key) => !process.env[key]);
}

declare global {
  var mysqlPool: mysql.Pool | undefined;
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

export async function getStockSummary(limit = 8) {
  const pool = getPool();
  const [rows] = await pool.query<mysql.RowDataPacket[]>(
    `
      SELECT stock_code, stock_name, market
      FROM stock_info
      WHERE is_active = 1
      ORDER BY stock_code ASC
      LIMIT ?
    `,
    [limit],
  );

  return rows.map((row) => ({
    stockCode: String(row.stock_code),
    stockName: String(row.stock_name),
    market: String(row.market),
  }));
}
