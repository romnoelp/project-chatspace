
import { useEffect, useCallback, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

type RealtimeOptions = {
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  schema?: string;
  table: string;
  filter?: string;
};

export const useRealtime = (
  options: RealtimeOptions,
  callback: (payload: any) => void
) => {
  const { event = '*', schema = 'public', table, filter } = options;

  useEffect(() => {
    // Updated channel configuration to properly use postgres_changes
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event,
          schema,
          table,
          filter,
        },
        callback
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [event, schema, table, filter, callback]);
};

// Specific hooks for common realtime scenarios
export const useTasksRealtime = (projectId: string, callback: (payload: any) => void) => {
  const memoizedCallback = useCallback(callback, [callback]);
  
  useRealtime(
    {
      table: 'tasks',
      filter: `project_id=eq.${projectId}`,
    },
    memoizedCallback
  );
};

export const useMessagesRealtime = (projectId: string, callback: (payload: any) => void) => {
  const memoizedCallback = useCallback(callback, [callback]);
  
  useRealtime(
    {
      table: 'messages',
      filter: `project_id=eq.${projectId}`,
    },
    memoizedCallback
  );
};

export const useFilesRealtime = (projectId: string, callback: (payload: any) => void) => {
  const memoizedCallback = useCallback(callback, [callback]);
  
  useRealtime(
    {
      table: 'files',
      filter: `project_id=eq.${projectId}`,
    },
    memoizedCallback
  );
};

export const useUserPresence = (room: string, userInfo: any) => {
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [presentUsers, setPresentUsers] = useState<any[]>([]);

  useEffect(() => {
    if (!room || !userInfo?.id) return;

    const presenceChannel = supabase.channel(`presence:${room}`);
    
    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const newState = presenceChannel.presenceState();
        const users = Object.values(newState).flat();
        setPresentUsers(users as any[]);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track(userInfo);
        }
      });

    setChannel(presenceChannel);

    return () => {
      supabase.removeChannel(presenceChannel);
    };
  }, [room, userInfo]);

  return { presentUsers };
};
