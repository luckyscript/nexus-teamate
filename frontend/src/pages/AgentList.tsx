import React, { useState } from 'react';
import { Typography, Table, Tag, Button, Space, Popconfirm, message, Modal, Form, Input, Select } from 'antd';
import { Link } from 'react-router-dom';
import { useAgents, useCreateAgent, usePublishAgent, useDeleteAgent, useExecuteAgent } from '../api/hooks';
import { PlusOutlined, PlayCircleOutlined, CloudUploadOutlined, DeleteOutlined } from '@ant-design/icons';
import type { CreateAgentInput } from '../types';

const { Title } = Typography;

const CATEGORY_OPTIONS = [
  { label: 'Task Agent', value: 'task' },
  { label: 'Automation Agent', value: 'automation' },
  { label: 'Analysis Agent', value: 'analysis' },
];

const STATUS_COLORS: Record<string, string> = {
  draft: 'default',
  published: 'green',
  archived: 'red',
};

export function AgentList() {
  const { data: agents, isLoading, refetch } = useAgents();
  const createAgent = useCreateAgent();
  const publishAgent = usePublishAgent();
  const deleteAgent = useDeleteAgent();
  const executeAgent = useExecuteAgent();
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm<CreateAgentInput>();

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name', render: (v: string, r: any) => <Link to={`/agents/${r.id}`}>{v}</Link> },
    { title: 'Key', dataIndex: 'agentKey', key: 'agentKey' },
    { title: 'Category', dataIndex: 'category', key: 'category', render: (v: string) => <Tag>{v}</Tag> },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (v: string) => <Tag color={STATUS_COLORS[v] ?? 'default'}>{v}</Tag>,
    },
    { title: 'Model', dataIndex: 'modelConfig', key: 'model', render: (v: { model: string }) => v?.model ?? '-' },
    { title: 'Built-in', dataIndex: 'isBuiltin', key: 'isBuiltin', render: (v: boolean) => v ? <Tag color="blue">Yes</Tag> : <Tag>No</Tag> },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, r: any) => (
        <Space>
          {r.status === 'draft' && (
            <Button type="link" size="small" icon={<CloudUploadOutlined />} onClick={() => publishAgent.mutateAsync(r.id).then(() => message.success('Published'))}>Publish</Button>
          )}
          <Button type="link" size="small" icon={<PlayCircleOutlined />} onClick={() => executeAgent.mutateAsync({ agentId: r.id }).then(() => message.success('Execution started'))}>Execute</Button>
          <Popconfirm title="Delete this agent?" onConfirm={() => deleteAgent.mutateAsync(r.id).then(() => message.success('Deleted'))}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleCreate = async (values: CreateAgentInput) => {
    await createAgent.mutateAsync(values);
    setModalOpen(false);
    form.resetFields();
    message.success('Agent created');
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>Agents</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>New Agent</Button>
      </div>
      <Table columns={columns} dataSource={agents ?? []} rowKey="id" loading={isLoading} pagination={false} />
      <Modal title="New Agent" open={modalOpen} onCancel={() => setModalOpen(false)} onOk={() => form.submit()} destroyOnClose>
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="agentKey" label="Key" rules={[{ required: true }]}><Input placeholder="agent_key" /></Form.Item>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}><Input placeholder="Agent display name" /></Form.Item>
          <Form.Item name="category" label="Category" rules={[{ required: true }]}><Select options={CATEGORY_OPTIONS} /></Form.Item>
          <Form.Item name="promptTemplate" label="Prompt Template" rules={[{ required: true }]}><Input.TextArea rows={3} placeholder="System prompt template" /></Form.Item>
          <Form.Item name={['modelConfig', 'provider']} label="Provider" rules={[{ required: true }]}><Input placeholder="openai, anthropic, etc." /></Form.Item>
          <Form.Item name={['modelConfig', 'model']} label="Model" rules={[{ required: true }]}><Input placeholder="gpt-4, claude-3, etc." /></Form.Item>
          <Form.Item name="description" label="Description"><Input.TextArea rows={2} /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
