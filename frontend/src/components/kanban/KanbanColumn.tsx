import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Typography, Space } from 'antd';
import { TaskCard } from './TaskCard';
import { KanbanColumn } from '../../types';

const { Title, Text } = Typography;

interface KanbanColumnProps {
  column: KanbanColumn;
}

export function KanbanColumnView({ column }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${column.statusCode}`,
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        minWidth: 280,
        maxWidth: 320,
        flex: 1,
        background: isOver ? '#f0f5ff' : '#fafafa',
        borderRadius: 12,
        padding: 12,
        display: 'flex',
        flexDirection: 'column',
        transition: 'background 0.2s',
      }}
    >
      <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={5} style={{ margin: 0 }}>{column.name}</Title>
        <Text type="secondary" style={{ fontSize: 12 }}>{column.count}</Text>
      </div>
      <div style={{ overflowY: 'auto', flex: 1 }}>
        {column.tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
}
