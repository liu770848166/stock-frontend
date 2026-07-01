"use client";

import Link from "next/link";

import { CheckCircleOutlined, DatabaseOutlined, SearchOutlined, StockOutlined } from "@ant-design/icons";
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
      width: 170,
    },
    {
      title: "市场",
      dataIndex: "market",
      key: "market",
      width: 120,
      render: (value: string) => <Tag color="blue">{value}</Tag>,
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
          colorPrimary: "#1677ff",
          borderRadius: 10,
          colorBgLayout: "#0d1420",
          colorBgContainer: "#141c2b",
          colorBorder: "#22304a",
          colorText: "#e7edf7",
          colorTextSecondary: "#95a3bf",
          fontFamily: "var(--font-geist-sans), sans-serif",
        },
        components: {
          Layout: {
            bodyBg: "#0d1420",
          },
          Card: {
            colorBgContainer: "#141c2b",
            colorBorderSecondary: "#22304a",
            headerBg: "#141c2b",
          },
          Table: {
            headerBg: "#182233",
            headerColor: "#8ea1c0",
            colorBgContainer: "#141c2b",
            colorText: "#e7edf7",
            borderColor: "#22304a",
            rowHoverBg: "#182233",
          },
          Input: {
            colorBgContainer: "#0f1724",
            colorBorder: "#22304a",
            colorText: "#e7edf7",
            activeBorderColor: "#1677ff",
            hoverBorderColor: "#3b82f6",
          },
          Button: {
            primaryShadow: "none",
            defaultBg: "#141c2b",
            defaultColor: "#d8e1f0",
            defaultBorderColor: "#22304a",
          },
        },
      }}
    >
      <Layout className={styles.layout}>
        <Content className={styles.content}>
          <div className={styles.hero}>
            <Space size={12} align="center" className={styles.heroBadge}>
              <StockOutlined />
              <Text className={styles.eyebrow}>TRADING TERMINAL</Text>
            </Space>
            <Title className={styles.title}>股票列表</Title>
            <Paragraph className={styles.subtitle}>
              面向交易终端风格的股票后台列表页，服务端直接查询 <Text code>stock_info</Text>，支持按代码、名称、市场、行业搜索。
            </Paragraph>
          </div>

          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Card className={styles.metricCard}>
                <Space align="center" className={styles.metricTitle}>
                  <DatabaseOutlined />
                  <Text strong>数据库状态</Text>
                </Space>
                <div className={styles.metricValueWrap}>
                  <Tag color={databaseStatus.ok ? "green" : "red"}>{databaseStatus.ok ? "Connected" : "Unavailable"}</Tag>
                </div>
                <Paragraph className={styles.mutedText}>
                  {databaseStatus.ok
                    ? `Server time: ${databaseStatus.serverTime}`
                    : databaseStatus.message ?? "Database connection failed."}
                </Paragraph>
                <Text code>GET /api/health</Text>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card className={styles.metricCard}>
                <div className={styles.statWrap}>
                  <Statistic title="当前展示" value={stocks.length} suffix="条" />
                </div>
                <Paragraph className={styles.metricFoot}>当前列表已按搜索条件过滤。</Paragraph>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card className={styles.metricCard}>
                <div className={styles.statWrap}>
                  <Statistic title="活跃股票" value={activeCount} suffix="条" prefix={<CheckCircleOutlined />} />
                </div>
                <Paragraph className={styles.metricFoot}>搜索关键词: {keyword || "无"}</Paragraph>
              </Card>
            </Col>
          </Row>

          <Card className={styles.tableCard}>
            <div className={styles.tableHeader}>
              <div>
                <Title level={4} className={styles.sectionTitle}>
                  股票列表
                </Title>
                <Paragraph className={styles.mutedText}>列表接口: GET /api/stocks?limit=100&amp;keyword=平安</Paragraph>
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
