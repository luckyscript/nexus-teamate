import React, { useState } from 'react';
import { Typography, Table, Tag, Button, Space, Popconfirm, message, Modal, Form, Input } from 'antd';
import { Link } from 'react-router-dom';
import { useProjects, useCreateProject, useUpdateProject, useDeleteProject, useBoards } from '../api/hooks';
import { PlusOutlined } from '@ant-design/icons';
import type { CreateProjectInput } from '../types';

const { Title } = Typography;

export function ProjectList() {
  const { data: projects, isLoading } = useProjects();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<{ id: number; name: string; description?: string } | null>(null);
  const [form] = Form.useForm<CreateProjectInput>();

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name', render: (v: string, r: any) => <Link to={`/projects/${r.id}`}>{v}</Link> },
    { title: 'Code', dataIndex: 'code', key: 'code' },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (v: string) => <Tag color={v === 'active' ? 'green' : 'default'}>{v}</Tag>,
    },
    { title: 'Owner', dataIndex: 'ownerId', key: 'ownerId', render: (v: number | null) => v ?? '-' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, r: any) => (
        <Space>
          <Button type="link" size="small" onClick={() => { setEditingProject({ id: r.id, name: r.name, description: r.description }); setModalOpen(true); }}>Edit</Button>
          <Popconfirm title="Delete this project?" onConfirm={() => deleteProject.mutateAsync(r.id).then(() => message.success('Deleted'))}>
            <Button type="link" size="small" danger>Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleCreate = async (values: CreateProjectInput) => {
    if (editingProject) {
      await updateProject.mutateAsync({ id: editingProject.id, ...values });
      message.success('Project updated');
    } else {
      await createProject.mutateAsync(values);
      message.success('Project created');
    }
    setModalOpen(false);
    setEditingProject(null);
    form.resetFields();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>Projects</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingProject(null); setModalOpen(true); }}>New Project</Button>
      </div>
      <Table columns={columns} dataSource={projects ?? []} rowKey="id" loading={isLoading} pagination={false} />
      <Modal title={editingProject ? 'Edit Project' : 'New Project'} open={modalOpen} onCancel={() => { setModalOpen(false); setEditingProject(null); }} onOk={() => form.submit()} destroyOnClose>
        <Form form={form} layout="vertical" initialValues={editingProject ?? undefined} onFinish={handleCreate}>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}><Input placeholder="Project name" /></Form.Item>
          <Form.Item name="code" label="Code" rules={[{ required: true }]}><Input placeholder="PROJ" /></Form.Item>
          <Form.Item name="description" label="Description"><Input.TextArea rows={2} /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
