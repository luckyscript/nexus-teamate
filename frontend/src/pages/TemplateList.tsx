import React from 'react';
import { Typography, Table, Tag, List, Card, Space } from 'antd';
import { useTemplates } from '../api/hooks';

const { Title } = Typography;

const TYPE_COLORS: Record<string, string> = {
  board: 'blue',
  task: 'green',
  agent: 'purple',
  automation: 'orange',
};

export function TemplateList() {
  const { data: templates, isLoading } = useTemplates();

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Key', dataIndex: 'templateKey', key: 'templateKey' },
    {
      title: 'Type',
      dataIndex: 'templateType',
      key: 'templateType',
      render: (v: string) => <Tag color={TYPE_COLORS[v] ?? 'default'}>{v}</Tag>,
    },
    { title: 'Scope', dataIndex: 'scopeType', key: 'scopeType' },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (v: string) => <Tag color={v === 'published' ? 'green' : 'default'}>{v}</Tag>,
    },
    { title: 'Published', dataIndex: 'publishedAt', key: 'publishedAt', render: (v: string | null) => v ? new Date(v).toLocaleDateString() : 'Not yet' },
  ];

  return (
    <div>
      <Title level={3}>Templates</Title>
      <Table columns={columns} dataSource={templates ?? []} rowKey="id" loading={isLoading} pagination={false} />
    </div>
  );
}
