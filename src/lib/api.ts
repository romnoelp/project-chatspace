
import { supabase } from '@/integrations/supabase/client';

// User profile
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
    
  if (error) throw error;
  return data;
};

export const updateUserProfile = async (userId: string, updates: any) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

// Projects
export const getProjects = async () => {
  const { data: user } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from('project_members')
    .select(`
      project_id,
      role,
      projects (
        id,
        name,
        description,
        created_at,
        updated_at,
        created_by
      )
    `)
    .eq('user_id', user.user?.id);
    
  if (error) throw error;
  
  // Map the results to a cleaner format
  return data.map(item => ({
    ...item.projects,
    role: item.role
  }));
};

export const getProject = async (projectId: string) => {
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      project_members (
        user_id,
        role,
        profiles (
          id,
          full_name,
          avatar_url
        )
      )
    `)
    .eq('id', projectId)
    .single();
    
  if (error) throw error;
  return data;
};

export const createProject = async (projectData: { name: string; description?: string }) => {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('User not authenticated');
  
  // First create the project
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .insert({
      name: projectData.name,
      description: projectData.description,
      created_by: user.user.id
    })
    .select()
    .single();
    
  if (projectError) throw projectError;
  
  // Then add the creator as an admin
  const { error: memberError } = await supabase
    .from('project_members')
    .insert({
      project_id: project.id,
      user_id: user.user.id,
      role: 'admin'
    });
    
  if (memberError) throw memberError;
  
  return project;
};

export const updateProject = async (projectId: string, updates: Partial<{ name: string; description: string }>) => {
  const { data, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', projectId)
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

export const deleteProject = async (projectId: string) => {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId);
    
  if (error) throw error;
  return true;
};

// Tasks
export const getTasks = async (projectId: string) => {
  const { data, error } = await supabase
    .from('tasks')
    .select(`
      *,
      assignee:profiles (
        id,
        full_name,
        avatar_url
      ),
      task_tags (
        id,
        name
      )
    `)
    .eq('project_id', projectId);
    
  if (error) throw error;
  return data;
};

export const getTask = async (taskId: string) => {
  const { data, error } = await supabase
    .from('tasks')
    .select(`
      *,
      assignee:profiles (
        id,
        full_name,
        avatar_url
      ),
      task_tags (
        id,
        name
      )
    `)
    .eq('id', taskId)
    .single();
    
  if (error) throw error;
  return data;
};

export const createTask = async (taskData: { 
  title: string; 
  description?: string; 
  status?: 'todo' | 'in-progress' | 'done' | 'blocked';
  priority?: 'low' | 'medium' | 'high';
  project_id: string;
  assignee_id?: string;
  due_date?: string;
  tags?: string[];
}) => {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('User not authenticated');
  
  const { tags, ...taskFields } = taskData;
  
  // Create task
  const { data, error } = await supabase
    .from('tasks')
    .insert({
      ...taskFields,
      created_by: user.user.id
    })
    .select()
    .single();
    
  if (error) throw error;
  
  // Create tags if provided
  if (tags && tags.length > 0) {
    const tagInserts = tags.map(tag => ({
      task_id: data.id,
      name: tag
    }));
    
    const { error: tagError } = await supabase
      .from('task_tags')
      .insert(tagInserts);
      
    if (tagError) throw tagError;
  }
  
  return data;
};

export const updateTask = async (taskId: string, updates: Partial<{
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done' | 'blocked';
  priority: 'low' | 'medium' | 'high';
  assignee_id: string | null;
  due_date: string | null;
  tags: string[];
}>) => {
  const { tags, ...taskUpdates } = updates;
  
  // Update task
  const { data, error } = await supabase
    .from('tasks')
    .update(taskUpdates)
    .eq('id', taskId)
    .select()
    .single();
    
  if (error) throw error;
  
  // Update tags if provided
  if (tags !== undefined) {
    // First delete existing tags
    await supabase
      .from('task_tags')
      .delete()
      .eq('task_id', taskId);
      
    // Then add new ones
    if (tags.length > 0) {
      const tagInserts = tags.map(tag => ({
        task_id: taskId,
        name: tag
      }));
      
      await supabase
        .from('task_tags')
        .insert(tagInserts);
    }
  }
  
  return data;
};

export const deleteTask = async (taskId: string) => {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId);
    
  if (error) throw error;
  return true;
};

// Files
export const getFiles = async (projectId: string, taskId?: string) => {
  let query = supabase
    .from('files')
    .select(`
      *,
      uploader:profiles (
        id,
        full_name,
        avatar_url
      )
    `)
    .eq('project_id', projectId);
    
  if (taskId) {
    query = query.eq('task_id', taskId);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  return data;
};

export const uploadFile = async (projectId: string, taskId: string | null, file: File) => {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('User not authenticated');
  
  const fileExt = file.name.split('.').pop();
  const filePath = `${projectId}/${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
  
  // Upload to storage
  const { error: uploadError } = await supabase.storage
    .from('project_files')
    .upload(filePath, file);
    
  if (uploadError) throw uploadError;
  
  // Get the public URL
  const { data: { publicUrl } } = supabase.storage
    .from('project_files')
    .getPublicUrl(filePath);
    
  // Save file metadata
  const { data, error } = await supabase
    .from('files')
    .insert({
      project_id: projectId,
      task_id: taskId,
      name: file.name,
      type: file.type,
      size: file.size,
      path: filePath,
      uploaded_by: user.user.id
    })
    .select()
    .single();
    
  if (error) throw error;
  
  return { ...data, url: publicUrl };
};

export const deleteFile = async (fileId: string, filePath: string) => {
  // Delete from storage
  const { error: storageError } = await supabase.storage
    .from('project_files')
    .remove([filePath]);
    
  if (storageError) throw storageError;
  
  // Delete metadata
  const { error } = await supabase
    .from('files')
    .delete()
    .eq('id', fileId);
    
  if (error) throw error;
  
  return true;
};

// Messages
export const getMessages = async (projectId: string) => {
  const { data, error } = await supabase
    .from('messages')
    .select(`
      *,
      sender:profiles (
        id,
        full_name,
        avatar_url
      ),
      message_mentions (
        id,
        user_id,
        profiles (
          id,
          full_name
        )
      )
    `)
    .eq('project_id', projectId)
    .order('created_at', { ascending: true });
    
  if (error) throw error;
  return data;
};

export const sendMessage = async (projectId: string, content: string, mentions: string[] = []) => {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('User not authenticated');
  
  // Create message
  const { data, error } = await supabase
    .from('messages')
    .insert({
      project_id: projectId,
      sender_id: user.user.id,
      content
    })
    .select()
    .single();
    
  if (error) throw error;
  
  // Add mentions if any
  if (mentions.length > 0) {
    const mentionInserts = mentions.map(userId => ({
      message_id: data.id,
      user_id: userId
    }));
    
    const { error: mentionError } = await supabase
      .from('message_mentions')
      .insert(mentionInserts);
      
    if (mentionError) throw mentionError;
  }
  
  return data;
};

export const deleteMessage = async (messageId: string) => {
  const { error } = await supabase
    .from('messages')
    .delete()
    .eq('id', messageId);
    
  if (error) throw error;
  return true;
};
