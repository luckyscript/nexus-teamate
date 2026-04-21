import React from 'react';
import { Modal, Form, Input, Select, Button } from 'antd';
import { CreateTaskInput } from '../../types';

const { TextArea } = Input;

interface NewTaskModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (input: CreateTaskInput) => void;
  projectId: number;
  boardId: number;
}

export function NewTaskModal({ open, onCancel, onSubmit, projectId, boardId }: NewTaskModalProps) {
  const [form] = Form.useForm<CreateTaskInput>();

  const handleOk = async () => {
    const values = await form.validateFields();
    onSubmit({ ...values, projectId, boardId, sourceType: 'manual' });
    form.resetFields();
  };

  return (
    <Modal
      title="New Task"
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item name="title" label="Title" rules={[{ required: true, message: 'Title is required' }]}>
          <Input placeholder="Enter task title" />
        </Form.Item>
        <Form.Item name="description" label="Description">
          <TextArea rows={3} placeholder="Task description" />
        </Form.Item>
        <Form.Item name="priority" label="Priority" initialValue="P2" rules={[{ required: true }]}>
          <Select>
            <Select.Option value="P0">P0 - Urgent</Select.Option>
            <Select.Option value="P1">P1 - High</Select.Option>
            <Select.Option value="P2">P2 - Normal</Select.Option>
            <Select.Option value="P3">P3 - Low</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item name="dueAt" label="Due Date">
          <Input type="datetime-local" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
