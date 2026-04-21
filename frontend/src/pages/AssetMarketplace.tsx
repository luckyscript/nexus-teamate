import React from 'react';
import { Typography, Tabs, Card, Tag, List, Input, Space } from 'antd';
import { useSkills, useCapsules, useTemplates } from '../api/hooks';
import { SearchOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const STATUS_COLORS: Record<string, string> = {
  draft: 'default',
  published: 'green',
  archived: 'red',
};

function SkillList() {
  const { data: skills, isLoading } = useSkills();
  return (
    <List
      grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 3 }}
      loading={isLoading}
      dataSource={skills ?? []}
      renderItem={(s: any) => (
        <List.Item>
          <Card title={s.name} extra={<Tag color={STATUS_COLORS[s.status]}>{s.status}</Tag>} style={{ borderRadius: 12 }}>
            <Text type="secondary">{s.category}</Text>
            <div style={{ margin: '8px 0' }}><Text ellipsis>{s.summary ?? s.content?.slice(0, 100)}</Text></div>
            <Space wrap>{s.tags?.map((t: string) => <Tag key={t}>{t}</Tag>)}</Space>
          </Card>
        </List.Item>
      )}
    />
  );
}

function CapsuleList() {
  const { data: capsules, isLoading } = useCapsules();
  return (
    <List
      grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 3 }}
      loading={isLoading}
      dataSource={capsules ?? []}
      renderItem={(c: any) => (
        <List.Item>
          <Card title={c.name} extra={<Tag color={STATUS_COLORS[c.status]}>{c.status}</Tag>} style={{ borderRadius: 12 }}>
            <Text type="secondary">{c.sceneType}</Text>
            <div style={{ margin: '8px 0' }}><Text ellipsis>{c.summary ?? c.content?.slice(0, 100)}</Text></div>
            <Space wrap>{c.tags?.map((t: string) => <Tag key={t}>{t}</Tag>)}</Space>
          </Card>
        </List.Item>
      )}
    />
  );
}

function TemplateList() {
  const { data: templates, isLoading } = useTemplates();
  return (
    <List
      grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 3 }}
      loading={isLoading}
      dataSource={templates ?? []}
      renderItem={(t: any) => (
        <List.Item>
          <Card title={t.name} extra={<Tag>{t.templateType}</Tag>} style={{ borderRadius: 12 }}>
            <Text type="secondary">Scope: {t.scopeType}</Text>
            <div style={{ margin: '8px 0' }}><Text type="secondary">Published: {t.publishedAt ? new Date(t.publishedAt).toLocaleDateString() : 'Not yet'}</Text></div>
          </Card>
        </List.Item>
      )}
    />
  );
}

const TABS = [
  { key: 'skills', label: 'Skills', children: <SkillList /> },
  { key: 'capsules', label: 'Capsules', children: <CapsuleList /> },
  { key: 'templates', label: 'Templates', children: <TemplateList /> },
];

export function AssetMarketplace() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>Asset Marketplace</Title>
        <Input prefix={<SearchOutlined />} placeholder="Search assets..." style={{ width: 240 }} />
      </div>
      <Tabs items={TABS} />
    </div>
  );
}
