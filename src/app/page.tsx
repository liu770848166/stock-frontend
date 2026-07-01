import StockDashboard from "@/components/stock-dashboard";
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

  return <StockDashboard keyword={keyword} stocks={stocks} databaseStatus={databaseStatus} />;
}
