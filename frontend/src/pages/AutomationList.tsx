import React, { useState } from 'react';
import { Typography, Table, Tag, Button, Space, Switch, message, Modal, Form, Input, Select } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useAutomationRules, useCreateRule, useToggleRule } from '../api/hooks';
import type { CreateAutomationRuleInput } from '../types';

const { Title } = Typography;

const EVENT_TYPE_OPTIONS = [
  { label: 'Task Created', value: 'task.created' },
  { label: 'Task Updated', value: 'task.updated' },
  { label: 'Task Transitioned', value: 'task.transitioned' },
];

export function AutomationList() {
  const { data: rules, isLoading, refetch } = useAutomationRules();
  const createRule = useCreateRule();
  const toggleRule = useToggleRule();
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm<CreateAutomationRuleInput>();

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Key', dataIndex: 'ruleKey', key: 'ruleKey' },
    { title: 'Event', dataIndex: 'eventType', key: 'eventType', render: (v: string) => <Tag>{v}</Tag> },
    { title: 'Priority', dataIndex: 'priority', key: 'priority' },
    {
      title: 'Enabled',
      dataIndex: 'isEnabled',
      key: 'isEnabled',
      render: (v: boolean, r: any) => <Switch checked={v} onChange={() => toggleRule.mutateAsync(r.id).then(() => message.success('Updated'))} />,
    },
    { title: 'Updated', dataIndex: 'updatedAt', key: 'updatedAt', render: (v: string) => new Date(v).toLocaleDateString() },
  ];

  const handleCreate = async (values: CreateAutomationRuleInput) => {
    await createRule.mutateAsync({
      ...values,
      conditionDsl: { operator: 'all', conditions: [] },
      actionDsl: [],
    });
    setModalOpen(false);
    form.resetFields();
    message.success('Rule created');
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>Automation Rules</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>New Rule</Button>
      </div>
      <Table columns={columns} dataSource={rules ?? []} rowKey="id" loading={isLoading} pagination={false} />
      <Modal title="New Rule" open={modalOpen} onCancel={() => setModalOpen(false)} onOk={() => form.submit()} destroyOnClose>
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}><Input placeholder="Rule display name" /></Form.Item>
          <Form.Item name="ruleKey" label="Key" rules={[{ required: true }]}><Input placeholder="rule_key" /></Form.Item>
          <Form.Item name="eventType" label="Event Type" rules={[{ required: true }]}><Select options={EVENT_TYPE_OPTIONS} /></Form.Item>
          <Form.Item name="priority" label="Priority" initialValue={0}><Input type="number" /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
