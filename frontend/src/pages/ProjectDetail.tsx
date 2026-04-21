import React, { useState } from 'react';
import { Typography, Descriptions, Table, Tag, Button, Space, Modal, Form, Input, Select, message, Card, List } from 'antd';
import { useParams, Link } from 'react-router-dom';
import { useBoards, useCreateBoard, useKanbanTasks } from '../api/hooks';
import { PlusOutlined } from '@ant-design/icons';
import type { CreateBoardInput } from '../types';

const { Title } = Typography;

const VIEW_TYPE_OPTIONS = [
  { label: 'Kanban', value: 'kanban' },
  { label: 'List', value: 'list' },
];

export function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const projectId = Number(id);
  const { data: boards, isLoading } = useBoards(projectId);
  const createBoard = useCreateBoard();
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm<CreateBoardInput>();

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name', render: (v: string, r: any) => <Link to={`/boards/${r.id}`}>{v}</Link> },
    { title: 'Type', dataIndex: 'viewType', key: 'viewType', render: (v: string) => <Tag>{v}</Tag> },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (v: string) => <Tag color={v === 'active' ? 'green' : 'default'}>{v}</Tag>,
    },
    {
      title: 'Columns',
      dataIndex: 'columns',
      key: 'columns',
      render: (cols: any[]) => cols?.length ?? 0,
    },
  ];

  const handleCreate = async (values: CreateBoardInput) => {
    await createBoard.mutateAsync(values);
    setModalOpen(false);
    form.resetFields();
    message.success('Board created');
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>Project #{projectId}</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>New Board</Button>
      </div>

      <Table columns={columns} dataSource={boards ?? []} rowKey="id" loading={isLoading} pagination={false} />

      <Modal title="New Board" open={modalOpen} onCancel={() => setModalOpen(false)} onOk={() => form.submit()} destroyOnClose>
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}><Input placeholder="Board name" /></Form.Item>
          <Form.Item name="viewType" label="View Type" initialValue="kanban" rules={[{ required: true }]}><Select options={VIEW_TYPE_OPTIONS} /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
