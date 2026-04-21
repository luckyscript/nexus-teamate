import React from 'react';
import { Row, Col, Card, Statistic, Table, Tag, Button, Typography } from 'antd';
import { Link } from 'react-router-dom';
import { useProjects, useAgents, useAnalyticsOverview } from '../api/hooks';
import {
  ProjectOutlined,
  RobotOutlined,
  ThunderboltOutlined,
  BarChartOutlined,
  PlusOutlined,
} from '@ant-design/icons';

const { Title } = Typography;

export function Dashboard() {
  const { data: projects, isLoading: loadingProjects } = useProjects();
  const { data: agents, isLoading: loadingAgents } = useAgents();
  const { data: analytics, isLoading: loadingAnalytics } = useAnalyticsOverview();

  const projectColumns = [
    { title: 'Name', dataIndex: 'name', key: 'name', render: (v: string, r: any) => <Link to={`/projects/${r.id}`}>{v}</Link> },
    { title: 'Code', dataIndex: 'code', key: 'code' },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (v: string) => <Tag color={v === 'active' ? 'green' : 'default'}>{v}</Tag>,
    },
    { title: 'Owner', dataIndex: 'ownerId', key: 'ownerId', render: (v: number | null) => v ?? '-' },
  ];

  return (
    <div>
      <Title level={3}>Dashboard</Title>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic title="Projects" value={projects?.length ?? 0} prefix={<ProjectOutlined />} loading={loadingProjects} />
            <div style={{ marginTop: 8 }}><Link to="/projects">View All</Link></div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic title="Agents" value={agents?.length ?? 0} prefix={<RobotOutlined />} loading={loadingAgents} />
            <div style={{ marginTop: 8 }}><Link to="/agents">View All</Link></div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic title="AI Participation" value={analytics?.aiParticipationRate ?? 0} prefix={<ThunderboltOutlined />} suffix="%" loading={loadingAnalytics} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic title="Automation Coverage" value={analytics?.automationCoverageRate ?? 0} prefix={<BarChartOutlined />} suffix="%" loading={loadingAnalytics} />
          </Card>
        </Col>
      </Row>

      <Card title="Recent Projects" extra={<Button type="primary" icon={<PlusOutlined />} href="/projects">New Project</Button>} style={{ borderRadius: 12 }}>
        <Table columns={projectColumns} dataSource={projects ?? []} rowKey="id" pagination={false} size="small" />
      </Card>
    </div>
  );
}
