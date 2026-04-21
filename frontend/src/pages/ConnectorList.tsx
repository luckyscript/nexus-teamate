import React, { useState } from 'react';
import { Typography, Table, Tag, Button, Space, Popconfirm, message, Modal, Form, Input, Collapse } from 'antd';
import { PlusOutlined, SyncOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { useConnectorInstances, useConnectorDefinitions, useCreateConnectorInstance, useTriggerSync, useTestConnector } from '../api/hooks';

const { Title } = Typography;

const STATUS_COLORS: Record<string, string> = {
  active: 'green',
  inactive: 'default',
  error: 'red',
  syncing: 'blue',
};

export function ConnectorList() {
  const { data: instances, isLoading: loadingInstances } = useConnectorInstances();
  const { data: definitions, isLoading: loadingDefs } = useConnectorDefinitions();
  const createInstance = useCreateConnectorInstance();
  const triggerSync = useTriggerSync();
  const testConnector = useTestConnector();
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm<{ definitionId: number; name: string }>();

  const defMap = new Map((definitions ?? []).map((d) => [d.id, d]));

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Type', dataIndex: 'definitionId', key: 'type', render: (v: number) => defMap.get(v)?.name ?? '-' },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (v: string) => <Tag color={STATUS_COLORS[v] ?? 'default'}>{v}</Tag>,
    },
    { title: 'Last Sync', dataIndex: 'lastSyncAt', key: 'lastSyncAt', render: (v: string | null) => v ? new Date(v).toLocaleString() : 'Never' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, r: any) => (
        <Space>
          <Button type="link" size="small" icon={<ThunderboltOutlined />} onClick={() => testConnector.mutateAsync(r.id).then(() => message.success('Test passed'))}>Test</Button>
          <Button type="link" size="small" icon={<SyncOutlined />} onClick={() => triggerSync.mutateAsync(r.id).then(() => message.success('Sync triggered'))}>Sync</Button>
        </Space>
      ),
    },
  ];

  const handleCreate = async (values: { definitionId: number; name: string }) => {
    await createInstance.mutateAsync({ ...values });
    setModalOpen(false);
    form.resetFields();
    message.success('Connector created');
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>Connectors</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>New Connector</Button>
      </div>

      <Table columns={columns} dataSource={instances ?? []} rowKey="id" loading={loadingInstances} pagination={false} />

      <Modal title="New Connector" open={modalOpen} onCancel={() => setModalOpen(false)} onOk={() => form.submit()} destroyOnClose>
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}><Input placeholder="Connector name" /></Form.Item>
          <Form.Item name="definitionId" label="Type" rules={[{ required: true }]}>
            <Input type="number" placeholder="Definition ID" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
