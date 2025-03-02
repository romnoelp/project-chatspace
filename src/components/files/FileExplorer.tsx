
import React, { useState } from 'react';
import { 
  File, 
  FileText, 
  Folder, 
  Image, 
  MoreVertical, 
  Plus, 
  Search,
  FileArchive,
  FileCode,
  FileSpreadsheet,
  LayoutGrid,
  List,
  SortAsc
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder' | 'image' | 'document' | 'archive' | 'code' | 'spreadsheet';
  size?: number;
  updatedAt: Date;
  createdBy: {
    id: string;
    name: string;
  };
}

const getFileIcon = (type: FileItem['type']) => {
  switch (type) {
    case 'folder':
      return <Folder className="h-4 w-4" />;
    case 'image':
      return <Image className="h-4 w-4" />;
    case 'document':
      return <FileText className="h-4 w-4" />;
    case 'archive':
      return <FileArchive className="h-4 w-4" />;
    case 'code':
      return <FileCode className="h-4 w-4" />;
    case 'spreadsheet':
      return <FileSpreadsheet className="h-4 w-4" />;
    default:
      return <File className="h-4 w-4" />;
  }
};

const formatFileSize = (bytes?: number) => {
  if (!bytes) return '';
  
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
};

const FileExplorer: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Mock data - in a real app, this would come from the backend
  const files: FileItem[] = [
    {
      id: 'folder-1',
      name: 'Project Documents',
      type: 'folder',
      updatedAt: new Date(Date.now() - 86400000 * 2),
      createdBy: { id: 'user-1', name: 'Alex Kim' },
    },
    {
      id: 'folder-2',
      name: 'Design Assets',
      type: 'folder',
      updatedAt: new Date(Date.now() - 86400000 * 5),
      createdBy: { id: 'user-2', name: 'Taylor Morgan' },
    },
    {
      id: 'image-1',
      name: 'Logo Design.png',
      type: 'image',
      size: 2500000,
      updatedAt: new Date(Date.now() - 86400000 * 1),
      createdBy: { id: 'user-3', name: 'Jamie Chen' },
    },
    {
      id: 'doc-1',
      name: 'Project Brief.pdf',
      type: 'document',
      size: 1200000,
      updatedAt: new Date(Date.now() - 86400000 * 7),
      createdBy: { id: 'user-1', name: 'Alex Kim' },
    },
    {
      id: 'doc-2',
      name: 'Meeting Notes.docx',
      type: 'document',
      size: 350000,
      updatedAt: new Date(Date.now() - 3600000),
      createdBy: { id: 'user-4', name: 'Jordan Smith' },
    },
    {
      id: 'code-1',
      name: 'main.js',
      type: 'code',
      size: 15000,
      updatedAt: new Date(Date.now() - 86400000 * 3),
      createdBy: { id: 'user-2', name: 'Taylor Morgan' },
    },
    {
      id: 'spreadsheet-1',
      name: 'Budget.xlsx',
      type: 'spreadsheet',
      size: 500000,
      updatedAt: new Date(Date.now() - 86400000 * 10),
      createdBy: { id: 'user-4', name: 'Jordan Smith' },
    },
    {
      id: 'archive-1',
      name: 'Assets.zip',
      type: 'archive',
      size: 15000000,
      updatedAt: new Date(Date.now() - 86400000 * 4),
      createdBy: { id: 'user-3', name: 'Jamie Chen' },
    },
  ];
  
  const filteredFiles = searchQuery 
    ? files.filter(file => file.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : files;
  
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return 'Today';
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-card h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Files</h2>
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search files..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Upload
          </Button>
        </div>
      </div>
      
      <div className="p-4 border-b bg-muted/30">
        <div className="flex justify-between items-center">
          <div className="flex gap-1">
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="ghost" size="sm">
            <SortAsc className="h-4 w-4 mr-1" />
            <span className="text-sm">Sort</span>
          </Button>
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        {viewMode === 'list' ? (
          <div className="divide-y">
            {filteredFiles.map((file) => (
              <div key={file.id} className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-all animate-fade-in">
                <div className="flex items-center space-x-3">
                  <div className={cn(
                    "flex items-center justify-center h-9 w-9 rounded-md",
                    file.type === 'folder' ? "bg-blue-500/10" : "bg-muted"
                  )}>
                    {getFileIcon(file.type)}
                  </div>
                  <div>
                    <div className="font-medium">{file.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                      {file.size ? ' • ' : ''}
                      Last modified {formatDate(file.updatedAt)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Download</DropdownMenuItem>
                      <DropdownMenuItem>Share</DropdownMenuItem>
                      <DropdownMenuItem>Rename</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
            {filteredFiles.map((file) => (
              <div key={file.id} className="bg-background border rounded-lg overflow-hidden hover:shadow-md transition-all animate-scale-in">
                <div className={cn(
                  "h-24 flex items-center justify-center",
                  file.type === 'folder' ? "bg-blue-500/10" : "bg-muted"
                )}>
                  <div className="h-10 w-10">
                    {getFileIcon(file.type)}
                  </div>
                </div>
                <div className="p-3">
                  <div className="font-medium truncate">{file.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                    {file.size ? ' • ' : ''}
                    {formatDate(file.updatedAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default FileExplorer;
