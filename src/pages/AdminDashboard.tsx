
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Building2, Plus, UserPlus, Copy, RefreshCw } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';

const AdminDashboard = () => {
  const { user, isGlobalAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [orgName, setOrgName] = useState('');
  const [orgDescription, setOrgDescription] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Check if user is admin
  useEffect(() => {
    if (!isGlobalAdmin) {
      navigate('/dashboard');
    }
  }, [isGlobalAdmin, navigate]);

  // Fetch organizations and users
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch organizations
        const { data: orgsData, error: orgsError } = await supabase
          .from('organizations')
          .select(`
            *,
            members:organization_members(count)
          `)
          .order('created_at', { ascending: false });

        if (orgsError) throw orgsError;
        setOrganizations(orgsData || []);

        // Fetch profiles
        const { data: usersData, error: usersError } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (usersError) throw usersError;
        setUsers(usersData || []);
      } catch (error: any) {
        toast({
          title: "Error fetching data",
          description: error.message,
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast, refreshTrigger]);

  const handleCreateOrganization = async () => {
    if (!orgName.trim()) {
      toast({
        title: "Organization name required",
        description: "Please enter a name for your organization.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Generate a random 8-character join code
      const joinCode = Array.from(Array(8), () => Math.floor(Math.random() * 36).toString(36)).join('').toUpperCase();
      
      // Create the organization
      const { data, error } = await supabase
        .from('organizations')
        .insert({
          name: orgName.trim(),
          description: orgDescription.trim() || null,
          created_by: user?.id,
          join_code: joinCode
        });

      if (error) throw error;

      toast({
        title: "Organization created",
        description: "The organization has been created successfully."
      });

      // Reset form and refresh data
      setOrgName('');
      setOrgDescription('');
      setRefreshTrigger(prev => prev + 1);
    } catch (error: any) {
      toast({
        title: "Failed to create organization",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const regenerateJoinCode = async (orgId: string) => {
    try {
      const newJoinCode = Array.from(Array(8), () => Math.floor(Math.random() * 36).toString(36)).join('').toUpperCase();
      
      const { error } = await supabase
        .from('organizations')
        .update({ join_code: newJoinCode })
        .eq('id', orgId);
        
      if (error) throw error;
      
      toast({
        title: "Join code regenerated",
        description: "A new join code has been created for this organization."
      });
      
      setRefreshTrigger(prev => prev + 1);
    } catch (error: any) {
      toast({
        title: "Failed to regenerate join code",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col md:ml-64">
        <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <div className="container mx-auto max-w-7xl">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setRefreshTrigger(prev => prev + 1)}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
            
            <Tabs defaultValue="organizations" className="space-y-6">
              <TabsList>
                <TabsTrigger value="organizations">Organizations</TabsTrigger>
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="create">Create Organization</TabsTrigger>
              </TabsList>
              
              <TabsContent value="organizations" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {organizations.map((org) => (
                    <Card key={org.id}>
                      <CardHeader>
                        <CardTitle>{org.name}</CardTitle>
                        <CardDescription>
                          {org.description || "No description provided"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Join Code:</span>
                            <div className="flex items-center space-x-2">
                              <code className="bg-muted px-2 py-1 rounded text-sm">
                                {org.join_code || "No code"}
                              </code>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => {
                                  navigator.clipboard.writeText(org.join_code || '');
                                  toast({ title: "Copied to clipboard" });
                                }}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => regenerateJoinCode(org.id)}
                              >
                                <RefreshCw className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Members:</span>
                            <span className="text-sm">{org.members?.[0]?.count || 0}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Created:</span>
                            <span className="text-sm">
                              {new Date(org.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {organizations.length === 0 && !loading && (
                    <div className="col-span-2 text-center py-10">
                      <p className="text-muted-foreground">No organizations found</p>
                    </div>
                  )}
                  
                  {loading && (
                    <div className="col-span-2 text-center py-10">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
                      <p className="mt-2 text-muted-foreground">Loading organizations...</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="users" className="space-y-4">
                <div className="bg-card border rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted">
                          <th className="px-4 py-3 text-left font-medium">Name</th>
                          <th className="px-4 py-3 text-left font-medium">Email</th>
                          <th className="px-4 py-3 text-left font-medium">Joined</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {users.map((user) => (
                          <tr key={user.id} className="hover:bg-muted/50">
                            <td className="px-4 py-3">{user.full_name || "N/A"}</td>
                            <td className="px-4 py-3">{user.email}</td>
                            <td className="px-4 py-3">
                              {new Date(user.created_at).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {users.length === 0 && !loading && (
                    <div className="text-center py-10">
                      <p className="text-muted-foreground">No users found</p>
                    </div>
                  )}
                  
                  {loading && (
                    <div className="text-center py-10">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
                      <p className="mt-2 text-muted-foreground">Loading users...</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="create">
                <Card>
                  <CardHeader>
                    <CardTitle>Create New Organization</CardTitle>
                    <CardDescription>
                      Add a new organization to the system
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="org-name">Organization Name</Label>
                        <Input
                          id="org-name"
                          value={orgName}
                          onChange={(e) => setOrgName(e.target.value)}
                          placeholder="Enter organization name"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="org-description">Description (Optional)</Label>
                        <Textarea
                          id="org-description"
                          value={orgDescription}
                          onChange={(e) => setOrgDescription(e.target.value)}
                          placeholder="Brief description of the organization"
                          rows={4}
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      onClick={handleCreateOrganization} 
                      disabled={loading || !orgName.trim()}
                      className="w-full"
                    >
                      <Building2 className="mr-2 h-4 w-4" />
                      Create Organization
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
