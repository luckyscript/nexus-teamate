import React from 'react';
import { Row, Col, Card, Spin, Typography, Table, Tag } from 'antd';
import { useAnalyticsOverview, useAnalyticsTrends, useAgentRanking, useAutomationFunnel } from '../api/hooks';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const { Title } = Typography;

export function AnalyticsDashboard() {
  const { data: overview, isLoading: loadingOverview } = useAnalyticsOverview();
  const { data: trends, isLoading: loadingTrends } = useAnalyticsTrends();
  const { data: ranking, isLoading: loadingRanking } = useAgentRanking();
  const { data: funnel, isLoading: loadingFunnel } = useAutomationFunnel();

  const trendData = trends?.dataPoints?.map((d: any) => ({ ...d, date: d.date.slice(0, 10) })) ?? [];

  const rankingColumns = [
    { title: 'Agent', dataIndex: 'agentName', key: 'agentName' },
    { title: 'Executions', dataIndex: 'totalExecutions', key: 'totalExecutions', sorter: (a: any, b: any) => a.totalExecutions - b.totalExecutions },
    { title: 'Success Rate', dataIndex: 'successRate', key: 'successRate', render: (v: number) => `${v.toFixed(1)}%` },
    { title: 'Avg Duration', dataIndex: 'avgDuration', key: 'avgDuration', render: (v: number) => `${(v / 1000).toFixed(1)}s` },
  ];

  return (
    <div>
      <Title level={3}>Analytics</Title>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderRadius: 12 }} loading={loadingOverview}>
            <Typography.Statistic title="AI Participation" value={overview?.aiParticipationRate ?? 0} suffix="%" />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderRadius: 12 }} loading={loadingOverview}>
            <Typography.Statistic title="Automation Coverage" value={overview?.automationCoverageRate ?? 0} suffix="%" />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderRadius: 12 }} loading={loadingOverview}>
            <Typography.Statistic title="Asset Reuse" value={overview?.assetReuseRate ?? 0} suffix="%" />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderRadius: 12 }} loading={loadingOverview}>
            <Typography.Statistic title="Efficiency Score" value={overview?.taskEfficiencyScore ?? 0} />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Card title="Trends" style={{ borderRadius: 12 }} loading={loadingTrends}>
            {trendData.length > 0 && (
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="aiParticipationRate" stroke="#1890ff" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Automation Funnel" style={{ borderRadius: 12 }} loading={loadingFunnel}>
            {funnel && (
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li>Total Tasks: <strong>{funnel.totalTasks}</strong></li>
                <li>With Agent: <strong>{funnel.tasksWithAgentExecution}</strong></li>
                <li>With Automation: <strong>{funnel.tasksWithAutomationRule}</strong></li>
                <li>Auto-Transitioned: <strong>{funnel.tasksAutoTransitioned}</strong></li>
                <li>Completed: <strong>{funnel.tasksCompleted}</strong></li>
              </ul>
            )}
          </Card>
        </Col>
      </Row>

      <Card title="Agent Ranking" style={{ marginTop: 16, borderRadius: 12 }} loading={loadingRanking}>
        <Table columns={rankingColumns} dataSource={ranking ?? []} rowKey="agentId" pagination={false} size="small" />
      </Card>
    </div>
  );
}
