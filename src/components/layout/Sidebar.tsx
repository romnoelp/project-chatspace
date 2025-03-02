
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Calendar, 
  FileText, 
  Home, 
  Inbox, 
  MessageSquare, 
  Plus, 
  Settings, 
  Users,
  ChevronRight,
  Folder
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  to: string;
  active?: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon: Icon, label, to, active }) => {
  return (
    <Link 
      to={to} 
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200",
        active 
          ? "bg-sidebar-accent text-sidebar-accent-foreground" 
          : "text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
      )}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </Link>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const path = location.pathname;

  const mainNavItems = [
    { icon: Home, label: 'Dashboard', to: '/dashboard' },
    { icon: Inbox, label: 'Inbox', to: '/inbox' },
    { icon: Calendar, label: 'Calendar', to: '/calendar' },
    { icon: MessageSquare, label: 'Messages', to: '/messages' },
    { icon: FileText, label: 'Documents', to: '/documents' },
  ];

  const projectItems = [
    { label: 'Marketing Campaign', to: '/projects/marketing' },
    { label: 'Website Redesign', to: '/projects/website' },
    { label: 'Mobile App', to: '/projects/app' },
  ];

  return (
    <aside className={cn(
      "fixed inset-y-0 left-0 z-30 w-64 bg-sidebar transition-transform duration-300 ease-in-out transform",
      isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
    )}>
      <div className="flex flex-col h-full border-r border-sidebar-border">
        <div className="p-4">
          <Button className="w-full justify-start gap-2">
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>
        
        <ScrollArea className="flex-1 px-3 py-2">
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="px-3 text-xs font-medium text-sidebar-foreground/60 uppercase tracking-wider">
                Main
              </h3>
              <nav className="space-y-1">
                {mainNavItems.map((item) => (
                  <SidebarItem 
                    key={item.to}
                    icon={item.icon}
                    label={item.label}
                    to={item.to}
                    active={path === item.to}
                  />
                ))}
              </nav>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center justify-between px-3 group">
                <h3 className="text-xs font-medium text-sidebar-foreground/60 uppercase tracking-wider">
                  Projects
                </h3>
                <Button variant="ghost" size="icon" className="h-5 w-5 opacity-0 group-hover:opacity-100">
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              <nav className="space-y-1">
                {projectItems.map((project) => (
                  <Link
                    key={project.to}
                    to={project.to}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200",
                      path === project.to 
                        ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                        : "text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                    )}
                  >
                    <Folder className="h-4 w-4" />
                    <span>{project.label}</span>
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </ScrollArea>
        
        <div className="p-4 border-t border-sidebar-border">
          <SidebarItem 
            icon={Settings}
            label="Settings"
            to="/settings"
            active={path === '/settings'}
          />
        </div>
      </div>
      
      <div 
        className={cn(
          "fixed inset-0 z-20 bg-black/50 md:hidden",
          isOpen ? "block" : "hidden"
        )}
        onClick={onClose}
      />
    </aside>
  );
};

export default Sidebar;
