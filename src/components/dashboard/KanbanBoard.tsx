
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TaskCard from './TaskCard';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'done' | 'blocked';
  priority: 'low' | 'medium' | 'high';
  assignee?: {
    id: string;
    name: string;
    avatar?: string;
  };
  dueDate?: string;
  tags?: string[];
}

interface KanbanColumn {
  id: string;
  title: string;
  status: Task['status'];
  tasks: Task[];
}

interface KanbanBoardProps {
  projectId: string;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ projectId }) => {
  // Mock data - in a real app, this would come from the backend
  const [columns, setColumns] = useState<KanbanColumn[]>([
    {
      id: 'col-1',
      title: 'To Do',
      status: 'todo',
      tasks: [
        {
          id: 'task-1',
          title: 'Research competitors',
          description: 'Analyze top 5 competitors and create a report',
          status: 'todo',
          priority: 'high',
          assignee: {
            id: 'user-1',
            name: 'Alex Kim',
          },
          dueDate: '2023-06-30',
          tags: ['research', 'marketing'],
        },
        {
          id: 'task-2',
          title: 'Create wireframes',
          description: 'Design initial wireframes for homepage and dashboard',
          status: 'todo',
          priority: 'medium',
          dueDate: '2023-07-05',
          tags: ['design'],
        },
      ],
    },
    {
      id: 'col-2',
      title: 'In Progress',
      status: 'in-progress',
      tasks: [
        {
          id: 'task-3',
          title: 'Implement authentication',
          description: 'Set up user registration and login with Supabase',
          status: 'in-progress',
          priority: 'high',
          assignee: {
            id: 'user-2',
            name: 'Taylor Morgan',
          },
          tags: ['dev', 'backend'],
        },
        {
          id: 'task-4',
          title: 'Design system setup',
          description: 'Create color palette, typography, and component library',
          status: 'in-progress',
          priority: 'medium',
          assignee: {
            id: 'user-3',
            name: 'Jamie Chen',
          },
          dueDate: '2023-06-28',
          tags: ['design', 'ui'],
        },
      ],
    },
    {
      id: 'col-3',
      title: 'Done',
      status: 'done',
      tasks: [
        {
          id: 'task-5',
          title: 'Project setup',
          description: 'Initialize repository and set up basic project structure',
          status: 'done',
          priority: 'high',
          assignee: {
            id: 'user-2',
            name: 'Taylor Morgan',
          },
          tags: ['dev', 'setup'],
        },
      ],
    },
    {
      id: 'col-4',
      title: 'Blocked',
      status: 'blocked',
      tasks: [
        {
          id: 'task-6',
          title: 'API integration',
          description: 'Integrate with third-party payment processor',
          status: 'blocked',
          priority: 'high',
          assignee: {
            id: 'user-4',
            name: 'Jordan Smith',
          },
          tags: ['backend', 'api'],
        },
      ],
    },
  ]);

  const handleDragStart = (e: React.DragEvent, taskId: string, sourceColumnId: string) => {
    e.dataTransfer.setData('taskId', taskId);
    e.dataTransfer.setData('sourceColumnId', sourceColumnId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    const sourceColumnId = e.dataTransfer.getData('sourceColumnId');

    // Skip if dropping in the same column
    if (sourceColumnId === targetColumnId) return;

    setColumns(prev => {
      // Create a new array to avoid mutation
      const newColumns = [...prev];
      
      // Find the source and target columns
      const sourceColumn = newColumns.find(col => col.id === sourceColumnId);
      const targetColumn = newColumns.find(col => col.id === targetColumnId);
      
      if (!sourceColumn || !targetColumn) return prev;
      
      // Find the task and remove it from the source column
      const taskIndex = sourceColumn.tasks.findIndex(task => task.id === taskId);
      if (taskIndex === -1) return prev;
      
      const [task] = sourceColumn.tasks.splice(taskIndex, 1);
      
      // Update the task's status to match the new column
      const updatedTask = { ...task, status: targetColumn.status };
      
      // Add the task to the target column
      targetColumn.tasks.push(updatedTask);
      
      return newColumns;
    });
  };

  return (
    <div className="h-full flex gap-4 overflow-x-auto p-4 scrollbar-thin">
      {columns.map(column => (
        <div 
          key={column.id}
          className={cn(
            "flex-shrink-0 w-80 bg-card rounded-lg border shadow-sm overflow-hidden",
            column.status === 'blocked' && "border-destructive/20"
          )}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, column.id)}
        >
          <div className="p-3 border-b bg-muted/50">
            <div className="flex items-center justify-between">
              <h3 className="font-medium flex items-center gap-2">
                <span 
                  className={cn(
                    "h-2 w-2 rounded-full", 
                    column.status === 'todo' && "bg-muted-foreground",
                    column.status === 'in-progress' && "bg-blue-500",
                    column.status === 'done' && "bg-green-500",
                    column.status === 'blocked' && "bg-destructive"
                  )}
                />
                {column.title}
                <span className="text-xs text-muted-foreground font-normal">
                  {column.tasks.length}
                </span>
              </h3>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <ScrollArea className="h-[calc(100vh-13rem)] p-3">
            <div className="space-y-3">
              {column.tasks.map(task => (
                <div 
                  key={task.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task.id, column.id)}
                  className="cursor-grab active:cursor-grabbing"
                >
                  <TaskCard task={task} />
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      ))}
    </div>
  );
};

export default KanbanBoard;
