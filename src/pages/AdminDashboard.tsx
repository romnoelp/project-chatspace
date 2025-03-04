
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { PlusCircle, Trash2, Copy, Users } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Organization {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  join_code: string | null;
  member_count: number;
}

const AdminDashboard = () => {
  const { isGlobalAdmin } = useAuth();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgDescription, setNewOrgDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('organizations')
        .select(`
          *,
          members:organization_members(count)
        `);

      if (error) throw error;

      // Transform the data to include member count
      const orgsWithCounts = data.map(org => ({
        ...org,
        member_count: org.members[0]?.count || 0
      }));

      setOrganizations(orgsWithCounts);
    } catch (error) {
      console.error('Error fetching organizations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load organizations',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const createOrganization = async () => {
    if (!newOrgName.trim()) {
      toast({
        title: 'Error',
        description: 'Organization name is required',
        variant: 'destructive'
      });
      return;
    }

    try {
      // Generate a random 8-character join code
      const joinCode = Array.from(Array(8), () => Math.floor(Math.random() * 36).toString(36)).join('').toUpperCase();

      const { data, error } = await supabase
        .from('organizations')
        .insert({
          name: newOrgName.trim(),
          description: newOrgDescription.trim() || null,
          join_code: joinCode
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Organization created successfully'
      });

      // Clear form and close dialog
      setNewOrgName('');
      setNewOrgDescription('');
      setCreateDialogOpen(false);

      // Refresh organizations list
      fetchOrganizations();
    } catch (error: any) {
      console.error('Error creating organization:', error);
      toast({
        title: 'Error',
        description: `Failed to create organization: ${error.message}`,
        variant: 'destructive'
      });
    }
  };

  const deleteOrganization = async (id: string) => {
    if (!confirm('Are you sure you want to delete this organization? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('organizations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Organization deleted successfully'
      });

      // Refresh organizations list
      fetchOrganizations();
    } catch (error: any) {
      console.error('Error deleting organization:', error);
      toast({
        title: 'Error',
        description: `Failed to delete organization: ${error.message}`,
        variant: 'destructive'
      });
    }
  };

  const copyJoinCode = (joinCode: string | null) => {
    if (!joinCode) {
      toast({
        title: 'Error',
        description: 'No join code available',
        variant: 'destructive'
      });
      return;
    }

    navigator.clipboard.writeText(joinCode);
    toast({
      title: 'Success',
      description: 'Join code copied to clipboard'
    });
  };

  if (!isGlobalAdmin) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p>You do not have permission to view this page.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Organization
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Organization</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Organization Name
                </label>
                <Input
                  id="name"
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  placeholder="Enter organization name"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">
                  Description (Optional)
                </label>
                <Textarea
                  id="description"
                  value={newOrgDescription}
                  onChange={(e) => setNewOrgDescription(e.target.value)}
                  placeholder="Enter organization description"
                  rows={3}
                />
              </div>
              <Button onClick={createOrganization} className="w-full">
                Create Organization
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : organizations.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">No Organizations Found</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Get started by creating your first organization.
          </p>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Organization
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {organizations.map((org) => (
            <Card key={org.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{org.name}</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => deleteOrganization(org.id)}
                    className="h-8 w-8 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {org.description || 'No description provided'}
                </p>
                
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {org.member_count} {org.member_count === 1 ? 'Member' : 'Members'}
                  </Badge>
                  <div className="text-xs text-gray-500">
                    Created: {new Date(org.created_at).toLocaleDateString()}
                  </div>
                </div>
                
                <div className="pt-2 flex items-center space-x-2">
                  <div className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded text-sm font-mono flex-1 truncate">
                    {org.join_code}
                  </div>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => copyJoinCode(org.join_code)}
                    className="h-8 w-8"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
