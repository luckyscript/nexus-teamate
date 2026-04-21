import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Tag, Typography, Space } from 'antd';
import { Task, PRIORITY_CONFIG, AI_STATE_CONFIG } from '../../types';
import { ClockCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `task-${task.id}`,
    data: { task, sourceColumn: task.statusCode },
  });

  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
    : undefined;

  const priority = PRIORITY_CONFIG[task.priority] || { color: 'default', label: task.priority };
  const aiState = AI_STATE_CONFIG[task.aiState] || { color: 'default', label: task.aiState };

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        padding: 12,
        marginBottom: 8,
        background: '#fff',
        borderRadius: 8,
        border: '1px solid #f0f0f0',
        boxShadow: isDragging ? '0 2px 8px rgba(0,0,0,0.15)' : '0 1px 2px rgba(0,0,0,0.05)',
        cursor: 'grab',
        opacity: isDragging ? 0.6 : 1,
        transition: 'box-shadow 0.2s, opacity 0.2s',
      }}
      {...listeners}
      {...attributes}
    >
      <Text strong style={{ display: 'block', marginBottom: 8 }}>{task.title}</Text>
      <Space size={4} wrap>
        <Tag color={priority.color}>{priority.label}</Tag>
        {task.aiState !== 'none' && (
          <Tag color={aiState.color}>{aiState.label}</Tag>
        )}
        {task.dueAt && (
          <Tag icon={<ClockCircleOutlined />}>{task.dueAt.slice(0, 10)}</Tag>
        )}
      </Space>
    </div>
  );
}
