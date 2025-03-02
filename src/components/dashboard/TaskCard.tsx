
import React from 'react';
import { Calendar, Tag } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Task } from './KanbanBoard';

interface TaskCardProps {
  task: Task;
}

const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const priorityStyles = {
    low: "bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400",
    medium: "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400",
    high: "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400",
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-background rounded-md p-3 border shadow-sm hover:shadow transition-all animate-scale-in">
      <div className="space-y-2">
        <div className="flex justify-between items-start">
          <h4 className="font-medium text-sm">{task.title}</h4>
          <Badge variant="outline" className={cn("text-xs", priorityStyles[task.priority])}>
            {task.priority}
          </Badge>
        </div>
        
        {task.description && (
          <p className="text-muted-foreground text-xs line-clamp-2">{task.description}</p>
        )}
        
        <div className="flex flex-wrap gap-1">
          {task.tags?.map(tag => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
        
        <div className="flex justify-between items-center pt-2">
          {task.assignee ? (
            <Avatar className="h-6 w-6">
              <AvatarImage src={task.assignee.avatar} alt={task.assignee.name} />
              <AvatarFallback className="text-[10px]">
                {task.assignee.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
          ) : (
            <span />
          )}
          
          {task.dueDate && (
            <div className="flex items-center text-xs text-muted-foreground gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(task.dueDate)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
