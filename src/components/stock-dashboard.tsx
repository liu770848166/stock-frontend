"use client";

import Link from "next/link";

import { CheckCircleOutlined, DatabaseOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Card, Col, ConfigProvider, Input, Layout, Row, Space, Statistic, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";

import styles from "@/app/page.module.css";
import type { StockListItem } from "@/lib/db";

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;

type StockDashboardProps = {
  keyword: string;
  stocks: StockListItem[];
  databaseStatus: { ok: boolean; serverTime?: string; message?: string };
};

export default function StockDashboard({ keyword, stocks, databaseStatus }: StockDashboardProps) {
  const activeCount = stocks.filter((stock) => stock.isActive).length;

  const columns: ColumnsType<StockListItem> = [
    {
      title: "代码",
      dataIndex: "stockCode",
      key: "stockCode",
      width: 120,
      render: (value: string) => <Text code>{value}</Text>,
    },
    {
      title: "名称",
      dataIndex: "stockName",
      key: "stockName",
      width: 160,
    },
    {
      title: "市场",
      dataIndex: "market",
      key: "market",
      width: 120,
      render: (value: string) => <Tag color="gold">{value}</Tag>,
    },
    {
      title: "行业",
      dataIndex: "industry",
      key: "industry",
      render: (value: string | null) => value ?? "-",
    },
    {
      title: "上市日期",
      dataIndex: "listDate",
      key: "listDate",
      width: 140,
      render: (value: string | null) => value ?? "-",
    },
    {
      title: "状态",
      dataIndex: "isActive",
      key: "isActive",
      width: 120,
      render: (value: boolean) => <Tag color={value ? "green" : "default"}>{value ? "Active" : "Inactive"}</Tag>,
    },
  ];

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#7a4b12",
          borderRadius: 14,
          colorBgLayout: "#f3ead7",
          fontFamily: "var(--font-geist-sans), sans-serif",
        },
        components: {
          Card: {
            borderRadiusLG: 24,
          },
          Table: {
            headerBg: "#f7efde",
            rowHoverBg: "#fcf7ed",
          },
        },
      }}
    >
      <Layout className={styles.layout}>
        <Content className={styles.content}>
          <div className={styles.hero}>
            <Text className={styles.eyebrow}>STOCK FRONTEND</Text>
            <Title className={styles.title}>股票列表</Title>
            <Paragraph className={styles.subtitle}>
              使用 <Text code>Ant Design</Text> 构建股票后台列表页，服务端直接查询 <Text code>stock_info</Text>
              ，支持按代码、名称、市场、行业搜索。
            </Paragraph>
          </div>

          <Row gutter={[20, 20]}>
            <Col xs={24} md={12}>
              <Card>
                <Space direction="vertical" size={12} style={{ width: "100%" }}>
                  <Space align="center">
                    <DatabaseOutlined />
                    <Text strong>数据库状态</Text>
                    <Tag color={databaseStatus.ok ? "green" : "red"}>{databaseStatus.ok ? "Connected" : "Unavailable"}</Tag>
                  </Space>
                  <Paragraph className={styles.mutedText}>
                    {databaseStatus.ok
                      ? `Server time: ${databaseStatus.serverTime}`
                      : databaseStatus.message ?? "Database connection failed."}
                  </Paragraph>
                  <Text code>GET /api/health</Text>
                </Space>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card>
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Statistic title="当前展示" value={stocks.length} suffix="条" />
                  </Col>
                  <Col span={12}>
                    <Statistic title="活跃股票" value={activeCount} suffix="条" prefix={<CheckCircleOutlined />} />
                  </Col>
                  <Col span={24}>
                    <Paragraph className={styles.mutedText}>搜索关键词: {keyword || "无"}</Paragraph>
                    <Text code>GET /api/stocks?limit=100&amp;keyword=平安</Text>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>

          <Card className={styles.tableCard}>
            <div className={styles.tableHeader}>
              <div>
                <Title level={4} className={styles.sectionTitle}>
                  股票列表
                </Title>
                <Paragraph className={styles.mutedText}>可搜索股票代码、名称、市场、行业</Paragraph>
              </div>
              <Text type="secondary">{stocks.length} rows</Text>
            </div>

            <form className={styles.searchForm}>
              <Input
                name="keyword"
                defaultValue={keyword}
                placeholder="例如：000001、平安、主板、银行"
                prefix={<SearchOutlined />}
                allowClear
                size="large"
              />
              <Button type="primary" htmlType="submit" size="large">
                搜索
              </Button>
              <Link href="/">
                <Button size="large">重置</Button>
              </Link>
            </form>

            <Table
              rowKey="stockCode"
              columns={columns}
              dataSource={stocks}
              pagination={{ pageSize: 10, showSizeChanger: false }}
              locale={{ emptyText: "没有查询到匹配的股票数据。" }}
              scroll={{ x: 900 }}
            />
          </Card>
        </Content>
      </Layout>
    </ConfigProvider>
  );
}
