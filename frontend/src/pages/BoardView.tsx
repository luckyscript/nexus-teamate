import React, { useMemo, useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  pointerWithin,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { Typography, Spin, Empty, message, Select, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { KanbanColumnView } from '../components/kanban/KanbanColumn';
import { TaskCard } from '../components/kanban/TaskCard';
import { NewTaskModal } from '../components/kanban/NewTaskModal';
import { useBoards, useKanbanTasks, useCreateTask, useTransitionTask } from '../api/hooks';
import { Task, KanbanColumn } from '../types';

const { Title } = Typography;

const BOARD_ID = 1; // TODO: resolve from URL params
const PROJECT_ID = 1; // TODO: resolve from URL params

export function BoardView() {
  const { data: board } = useBoards(PROJECT_ID);
  const { data: kanbanData, isLoading } = useKanbanTasks(BOARD_ID);
  const createTask = useCreateTask();
  const transitionTask = useTransitionTask();
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [selectedBoardId, setSelectedBoardId] = useState<number>(BOARD_ID);

  const sensors = useSensors(
    useSensor({ type: 'pointer', activationConstraint: { distance: 8 } }),
  );

  const columns: KanbanColumn[] = useMemo(() => {
    if (kanbanData?.columns) return kanbanData.columns;
    // Fallback: derive columns from board config or use defaults
    return [
      { statusCode: 'todo', name: 'To Do', count: 0, tasks: [] },
      { statusCode: 'in_progress', name: 'In Progress', count: 0, tasks: [] },
      { statusCode: 'done', name: 'Done', count: 0, tasks: [] },
    ];
  }, [kanbanData]);

  const handleDragStart = ({ active }: DragStartEvent) => {
    const taskId = Number(String(active.id).replace('task-', ''));
    const task = columns.flatMap((c) => c.tasks).find((t) => t.id === taskId);
    setActiveTask(task ?? null);
  };

  const handleDragEnd = async ({ active, over }: DragEndEvent) => {
    setActiveTask(null);
    if (!over || !activeTask) return;

    const overId = String(over.id);
    if (!overId.startsWith('column-')) return;

    const targetStatusCode = overId.replace('column-', '');
    if (targetStatusCode === activeTask.statusCode) return;

    try {
      await transitionTask.mutateAsync({
        taskId: activeTask.id,
        toStatusCode: targetStatusCode,
        reason: 'Drag and drop',
        version: activeTask.version,
      });
      message.success(`Moved to ${columns.find((c) => c.statusCode === targetStatusCode)?.name}`);
    } catch {
      message.error('Failed to move task');
    }
  };

  const handleCreateTask = async (input: Parameters<typeof createTask.mutateAsync>[0]) => {
    await createTask.mutateAsync(input);
    setNewTaskOpen(false);
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>Kanban Board</Title>
        <div style={{ display: 'flex', gap: 12 }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setNewTaskOpen(true)}>
            New Task
          </Button>
          {board && board.length > 1 && (
            <Select
              style={{ width: 180 }}
              value={selectedBoardId}
              onChange={setSelectedBoardId}
              options={board.map((b) => ({ label: b.name, value: b.id }))}
            />
          )}
          <NewTaskModal
            open={newTaskOpen}
            onCancel={() => setNewTaskOpen(false)}
            onSubmit={handleCreateTask}
            projectId={PROJECT_ID}
            boardId={selectedBoardId}
          />
        </div>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: 80 }}>
          <Spin size="large" />
        </div>
      ) : columns.length === 0 || columns.every((c) => c.tasks.length === 0) ? (
        <Empty
          description="No tasks yet"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <a onClick={() => setNewTaskOpen(true)}>Create first task</a>
        </Empty>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={pointerWithin}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 16 }}>
            {columns.map((column) => (
              <KanbanColumnView key={column.statusCode} column={column} />
            ))}
          </div>
          <DragOverlay>
            {activeTask ? <TaskCard task={activeTask} /> : null}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  );
}
