import React from 'react';
import { Typography, Descriptions, Table, Tag, Card, Spin, Button } from 'antd';
import { useParams, Link } from 'react-router-dom';
import { useAgent, useAgentExecutions, usePublishAgent } from '../api/hooks';

const { Title, Text } = Typography;

const STATUS_COLORS: Record<string, string> = {
  draft: 'default',
  published: 'green',
  archived: 'red',
};

export function AgentDetail() {
  const { id } = useParams<{ id: string }>();
  const agentId = Number(id);
  const { data: agent, isLoading } = useAgent(agentId);
  const { data: executions, isLoading: loadingExecutions } = useAgentExecutions(agentId);
  const publishAgent = usePublishAgent();

  if (isLoading) return <Spin size="large" />;
  if (!agent) return <Text>No agent found</Text>;

  const execColumns = [
    { title: 'Trigger', dataIndex: 'triggerType', key: 'triggerType', render: (v: string) => <Tag>{v}</Tag> },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (v: string) => <Tag color={v === 'succeeded' ? 'green' : v === 'failed' ? 'red' : v === 'running' ? 'blue' : 'default'}>{v}</Tag>,
    },
    { title: 'Tokens In', dataIndex: 'tokensIn', key: 'tokensIn' },
    { title: 'Tokens Out', dataIndex: 'tokensOut', key: 'tokensOut' },
    { title: 'Started', dataIndex: 'startedAt', key: 'startedAt', render: (v: string | null) => v ? new Date(v).toLocaleString() : '-' },
    { title: 'Finished', dataIndex: 'finishedAt', key: 'finishedAt', render: (v: string | null) => v ? new Date(v).toLocaleString() : '-' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>{agent.name}</Title>
        {agent.status === 'draft' && (
          <Button type="primary" onClick={() => publishAgent.mutateAsync(agentId)}>Publish</Button>
        )}
      </div>

      <Descriptions bordered column={2} style={{ marginBottom: 24 }}>
        <Descriptions.Item label="Key">{agent.agentKey}</Descriptions.Item>
        <Descriptions.Item label="Category"><Tag>{agent.category}</Tag></Descriptions.Item>
        <Descriptions.Item label="Status"><Tag color={STATUS_COLORS[agent.status]}>{agent.status}</Tag></Descriptions.Item>
        <Descriptions.Item label="Built-in">{agent.isBuiltin ? 'Yes' : 'No'}</Descriptions.Item>
        <Descriptions.Item label="Model">{agent.modelConfig?.provider} / {agent.modelConfig?.model}</Descriptions.Item>
        <Descriptions.Item label="Timeout">{agent.timeoutSeconds}s</Descriptions.Item>
        <Descriptions.Item label="Description" span={2}>{agent.description ?? '-'}</Descriptions.Item>
      </Descriptions>

      <Card title="Execution History" style={{ borderRadius: 12 }}>
        <Table
          columns={execColumns}
          dataSource={executions ?? []}
          rowKey="id"
          loading={loadingExecutions}
          pagination={{ pageSize: 10 }}
          size="small"
        />
      </Card>
    </div>
  );
}
