
import React from 'react';
import { MoreHorizontal, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ProjectCardProps {
  project: {
    id: string;
    name: string;
    description: string;
    progress: number;
    team: Array<{
      id: string;
      name: string;
      avatar?: string;
    }>;
    deadline?: string;
    role?: 'admin' | 'member' | 'viewer';
  };
  onDelete?: () => void;
  onSelect?: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onDelete, onSelect }) => {
  const isAdmin = project.role === 'admin';
  
  return (
    <div 
      className="bg-card rounded-lg overflow-hidden border border-border shadow-sm hover:shadow-md transition-all duration-300 animate-fade-in cursor-pointer"
      onClick={onSelect}
    >
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
            {project.name}
          </h3>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                onSelect && onSelect();
              }}>
                View Project
              </DropdownMenuItem>
              {isAdmin && (
                <>
                  <DropdownMenuItem>Edit Project</DropdownMenuItem>
                  <DropdownMenuItem>Share Project</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete && onDelete();
                    }}
                  >
                    Delete Project
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
          {project.description || "No description provided."}
        </p>
        
        <div className="flex flex-col gap-1 mb-4">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span className="font-medium">{project.progress}%</span>
          </div>
          <Progress value={project.progress} className="h-1.5" />
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex -space-x-2">
            {project.team.slice(0, 3).map((member) => (
              <Avatar key={member.id} className="border-2 border-background h-8 w-8">
                <AvatarImage src={member.avatar} alt={member.name} />
                <AvatarFallback className="text-xs">
                  {member.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
            ))}
            {project.team.length > 3 && (
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted text-muted-foreground text-xs border-2 border-background">
                +{project.team.length - 3}
              </div>
            )}
            {project.team.length === 0 && (
              <div className="flex items-center text-xs text-muted-foreground">
                <Users className="h-4 w-4 mr-1" />
                No members
              </div>
            )}
          </div>
          
          {project.deadline && (
            <div className="text-xs text-muted-foreground">
              Due {new Date(project.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
