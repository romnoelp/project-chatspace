
import React, { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import ProjectCard from '@/components/dashboard/ProjectCard';
import KanbanBoard from '@/components/dashboard/KanbanBoard';
import ChatPanel from '@/components/chat/ChatPanel';
import FileExplorer from '@/components/files/FileExplorer';

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Mock data - in a real app, this would come from the backend
  const projects = [
    {
      id: 'project-1',
      name: 'Marketing Campaign',
      description: 'Q3 product launch marketing strategy and creative assets.',
      progress: 75,
      team: [
        { id: 'user-1', name: 'Alex Kim' },
        { id: 'user-2', name: 'Taylor Morgan' },
        { id: 'user-3', name: 'Jamie Chen' },
      ],
      deadline: '2023-08-15',
    },
    {
      id: 'project-2',
      name: 'Website Redesign',
      description: 'Complete overhaul of the company website with new branding.',
      progress: 40,
      team: [
        { id: 'user-2', name: 'Taylor Morgan' },
        { id: 'user-4', name: 'Jordan Smith' },
        { id: 'user-5', name: 'Riley Johnson' },
        { id: 'user-6', name: 'Casey Williams' },
      ],
      deadline: '2023-09-30',
    },
    {
      id: 'project-3',
      name: 'Mobile App Development',
      description: 'Native mobile application for iOS and Android platforms.',
      progress: 20,
      team: [
        { id: 'user-1', name: 'Alex Kim' },
        { id: 'user-3', name: 'Jamie Chen' },
        { id: 'user-4', name: 'Jordan Smith' },
      ],
      deadline: '2023-12-01',
    },
    {
      id: 'project-4',
      name: 'CRM Integration',
      description: 'Integrate new CRM system with existing tools and migrate data.',
      progress: 60,
      team: [
        { id: 'user-2', name: 'Taylor Morgan' },
        { id: 'user-5', name: 'Riley Johnson' },
      ],
      deadline: '2023-07-20',
    },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col md:ml-64">
        <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 p-4 md:p-6 overflow-hidden">
          <div className="container mx-auto max-w-7xl">
            <Tabs defaultValue="overview" className="space-y-6">
              <div className="flex justify-between items-center">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="board">Board</TabsTrigger>
                  <TabsTrigger value="chat">Chat</TabsTrigger>
                  <TabsTrigger value="files">Files</TabsTrigger>
                </TabsList>
                
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Project
                </Button>
              </div>
              
              <TabsContent value="overview" className="animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  {projects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="board" className="h-[calc(100vh-12rem)] animate-fade-in">
                <KanbanBoard projectId="project-1" />
              </TabsContent>
              
              <TabsContent value="chat" className="h-[calc(100vh-12rem)] animate-fade-in">
                <ChatPanel channelName="general" />
              </TabsContent>
              
              <TabsContent value="files" className="h-[calc(100vh-12rem)] animate-fade-in">
                <FileExplorer />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
