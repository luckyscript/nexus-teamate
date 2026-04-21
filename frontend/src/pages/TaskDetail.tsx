import React, { useState } from 'react';
import { Typography, Descriptions, Tag, Card, Spin, List, Input, Button, Select, Space, Divider, message, Popconfirm } from 'antd';
import { useParams, Link } from 'react-router-dom';
import { useTask, useTransitionTask, useTakeoverTask, useAddTaskComment } from '../api/hooks';
import { ArrowRightOutlined, UserAddOutlined, SendOutlined } from '@ant-design/icons';
import { TASK_STATUS_COLORS, AI_STATE_CONFIG } from '../types';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

export function TaskDetail() {
  const { id } = useParams<{ id: string }>();
  const taskId = Number(id);
  const { data: task, isLoading } = useTask(taskId);
  const transitionTask = useTransitionTask();
  const takeoverTask = useTakeoverTask();
  const addComment = useAddTaskComment();
  const [comment, setComment] = useState('');

  if (isLoading) return <Spin size="large" />;
  if (!task) return <Text>Task not found</Text>;

  const aiState = AI_STATE_CONFIG[task.aiState] ?? { color: 'default', label: task.aiState };
  const statusColor = TASK_STATUS_COLORS[task.statusCode] ?? 'default';

  const handleTransition = async (targetStatus: string) => {
    const nextStatus = task.availableActions?.find((a) => a.action === targetStatus);
    if (!nextStatus) {
      message.error(`Cannot transition to ${targetStatus}`);
      return;
    }
    await transitionTask.mutateAsync({ taskId, toStatusCode: targetStatus, reason: nextStatus.label, version: task.version });
    message.success(`Transitioned to ${nextStatus.label}`);
  };

  const handleComment = async () => {
    if (!comment.trim()) return;
    await addComment.mutateAsync({ taskId, content: comment.trim() });
    setComment('');
    message.success('Comment added');
  };

  return (
    <div>
      <Title level={3}>
        {task.title}
        <Tag color={statusColor} style={{ marginLeft: 8 }}>{task.statusCode}</Tag>
        <Tag color={aiState.color}>{aiState.label}</Tag>
      </Title>

      <Descriptions bordered column={2} style={{ marginBottom: 16 }}>
        <Descriptions.Item label="ID">{task.id}</Descriptions.Item>
        <Descriptions.Item label="Priority"><Tag>{task.priority}</Tag></Descriptions.Item>
        <Descriptions.Item label="Assignee">{task.assigneeId ?? 'Unassigned'}</Descriptions.Item>
        <Descriptions.Item label="Reporter">{task.reporterId ?? '-'}</Descriptions.Item>
        <Descriptions.Item label="Due Date">{task.dueAt ? new Date(task.dueAt).toLocaleDateString() : '-'}</Descriptions.Item>
        <Descriptions.Item label="Source"><Tag>{task.sourceType}</Tag></Descriptions.Item>
      </Descriptions>

      {task.description && <Paragraph>{task.description}</Paragraph>}

      <Divider />

      {task.availableActions && task.availableActions.length > 0 && (
        <Card title="Actions" size="small" style={{ borderRadius: 12, marginBottom: 16 }}>
          <Space>
            {task.availableActions.map((action) => (
              <Button key={action.action} icon={<ArrowRightOutlined />} onClick={() => handleTransition(action.action)}>
                {action.label}
              </Button>
            ))}
          </Space>
        </Card>
      )}

      {task.takeoverState === 'none' && (
        <Popconfirm title="Take over this task for AI processing?" onConfirm={() => takeoverTask.mutateAsync(taskId).then(() => message.success('AI takeover requested'))}>
          <Button icon={<UserAddOutlined />} type="dashed">AI Takeover</Button>
        </Popconfirm>
      )}

      <Divider />

      <Card title={`Comments (${task.comments?.length ?? 0})`} style={{ borderRadius: 12 }}>
        <List
          dataSource={task.comments ?? []}
          renderItem={(c: any) => (
            <List.Item>
              <List.Item.Meta
                title={<Space><Tag>{c.authorType}</Tag>{c.authorName ?? 'Anonymous'}<Text type="secondary">{new Date(c.createdAt).toLocaleString()}</Text></Space>}
                description={c.content}
              />
            </List.Item>
          )}
        />
        <Divider />
        <Space.Compact style={{ width: '100%' }}>
          <TextArea rows={2} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Add a comment..." />
          <Button type="primary" icon={<SendOutlined />} onClick={handleComment} disabled={!comment.trim()} />
        </Space.Compact>
      </Card>

      {task.latestExecutions && task.latestExecutions.length > 0 && (
        <Card title="Recent Agent Executions" style={{ marginTop: 16, borderRadius: 12 }}>
          <List
            dataSource={task.latestExecutions}
            renderItem={(e: any) => (
              <List.Item>
                <List.Item.Meta
                  title={<Space><Tag color={e.status === 'succeeded' ? 'green' : e.status === 'failed' ? 'red' : 'blue'}>{e.status}</Tag>{e.agentName}</Space>}
                  description={e.summary ?? '-'}
                />
                <Text type="secondary">{e.startedAt ? new Date(e.startedAt).toLocaleDateString() : ''}</Text>
              </List.Item>
            )}
          />
        </Card>
      )}
    </div>
  );
}
