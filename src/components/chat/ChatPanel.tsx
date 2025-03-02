
import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Smile, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  content: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
    isCurrentUser?: boolean;
  };
  timestamp: Date;
}

interface ChatPanelProps {
  channelName: string;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ channelName }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hey team, I just finished the wireframes for the homepage. Can someone review them?',
      sender: {
        id: 'user-1',
        name: 'Alex Kim',
      },
      timestamp: new Date(Date.now() - 3600000),
    },
    {
      id: '2',
      content: "I'll take a look at them this afternoon. By the way, has anyone started on the authentication implementation yet?",
      sender: {
        id: 'user-2',
        name: 'Taylor Morgan',
      },
      timestamp: new Date(Date.now() - 1800000),
    },
    {
      id: '3',
      content: "Yes, I'm working on it now. Should be done by tomorrow.",
      sender: {
        id: 'current-user',
        name: 'You',
        isCurrentUser: true,
      },
      timestamp: new Date(Date.now() - 900000),
    },
    {
      id: '4',
      content: "Great! Let's sync up tomorrow to review progress on all fronts.",
      sender: {
        id: 'user-1',
        name: 'Alex Kim',
      },
      timestamp: new Date(Date.now() - 600000),
    },
  ]);
  
  const [newMessage, setNewMessage] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const sendMessage = () => {
    if (!newMessage.trim()) return;
    
    const message: Message = {
      id: Date.now().toString(),
      content: newMessage,
      sender: {
        id: 'current-user',
        name: 'You',
        isCurrentUser: true,
      },
      timestamp: new Date(),
    };
    
    setMessages([...messages, message]);
    setNewMessage('');
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const groupMessagesByDate = () => {
    const groups: { date: string; messages: Message[] }[] = [];
    
    messages.forEach(message => {
      const messageDate = message.timestamp.toDateString();
      const existingGroup = groups.find(group => group.date === messageDate);
      
      if (existingGroup) {
        existingGroup.messages.push(message);
      } else {
        groups.push({
          date: messageDate,
          messages: [message],
        });
      }
    });
    
    return groups;
  };

  const messageGroups = groupMessagesByDate();

  return (
    <div className="flex flex-col h-full border rounded-lg overflow-hidden bg-card">
      <div className="p-4 border-b flex items-center">
        <h3 className="font-medium"># {channelName}</h3>
      </div>
      
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="space-y-6">
          {messageGroups.map((group, groupIndex) => (
            <div key={group.date} className="space-y-4">
              <div className="relative flex items-center">
                <div className="flex-1 border-t border-border"></div>
                <div className="mx-4 text-xs text-muted-foreground">
                  {new Date(group.date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </div>
                <div className="flex-1 border-t border-border"></div>
              </div>
              
              {group.messages.map((message, index) => (
                <div 
                  key={message.id}
                  className={cn(
                    "flex gap-3 animate-fade-in",
                    message.sender.isCurrentUser && "justify-end"
                  )}
                >
                  {!message.sender.isCurrentUser && (
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage src={message.sender.avatar} alt={message.sender.name} />
                      <AvatarFallback>{message.sender.name[0]}</AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div className={cn(
                    "max-w-[80%]",
                    message.sender.isCurrentUser ? "items-end" : "items-start"
                  )}>
                    {!message.sender.isCurrentUser && (
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{message.sender.name}</span>
                        <span className="text-xs text-muted-foreground">{formatTime(message.timestamp)}</span>
                      </div>
                    )}
                    
                    <div className={cn(
                      "px-4 py-2 rounded-lg text-sm",
                      message.sender.isCurrentUser 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-muted"
                    )}>
                      {message.content}
                    </div>
                    
                    {message.sender.isCurrentUser && (
                      <div className="flex justify-end mt-1">
                        <span className="text-xs text-muted-foreground">{formatTime(message.timestamp)}</span>
                      </div>
                    )}
                  </div>
                  
                  {message.sender.isCurrentUser && (
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage src={message.sender.avatar} alt={message.sender.name} />
                      <AvatarFallback>{message.sender.name[0]}</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </ScrollArea>
      
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Button variant="outline" size="icon" className="rounded-full flex-shrink-0">
            <Paperclip className="h-4 w-4" />
          </Button>
          
          <div className="relative w-full">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="pr-10"
            />
            <Button 
              size="icon"
              variant="ghost"
              className="absolute right-0 top-0 h-full aspect-square rounded-full"
              onClick={sendMessage}
              disabled={!newMessage.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          
          <Button variant="outline" size="icon" className="rounded-full flex-shrink-0">
            <Smile className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;
