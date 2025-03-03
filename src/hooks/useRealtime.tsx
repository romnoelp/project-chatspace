
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

type PostgresChangesPayload<T> = {
  new: T;
  old: T;
  schema: string;
  table: string;
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  commit_timestamp: string;
  errors: unknown[];
};

type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

export function useRealtimeSubscription<T>(
  table: string,
  event: RealtimeEvent = '*',
  callback: (payload: PostgresChangesPayload<T>) => void,
  schema: string = 'public'
) {
  useEffect(() => {
    // Create a channel with the correct configuration for Supabase Realtime
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: event,
          schema: schema,
          table: table
        },
        (payload: PostgresChangesPayload<T>) => {
          callback(payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, event, callback, schema]);
}
