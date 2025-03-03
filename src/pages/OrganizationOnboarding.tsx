
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
import { Building2, Plus, UserPlus } from 'lucide-react';

const OrganizationOnboarding = () => {
  const { user, profile, hasOrganization, createOrganization } = useAuth();
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [orgName, setOrgName] = useState('');
  const [orgDescription, setOrgDescription] = useState('');
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [requestSent, setRequestSent] = useState<Record<string, boolean>>({});
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // If user already has an organization, redirect to dashboard
    if (hasOrganization) {
      navigate('/dashboard');
    }
  }, [hasOrganization, navigate]);

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const { data, error } = await supabase
          .from('organizations')
          .select('*')
          .order('name');
        
        if (error) throw error;
        setOrganizations(data || []);
        
        // Check if user has any pending join requests
        if (user) {
          const { data: requests, error: requestsError } = await supabase
            .from('organization_join_requests')
            .select('organization_id')
            .eq('user_id', user.id)
            .eq('status', 'pending');
            
          if (!requestsError && requests) {
            const pendingMap: Record<string, boolean> = {};
            requests.forEach(req => {
              pendingMap[req.organization_id] = true;
            });
            setRequestSent(pendingMap);
          }
        }
      } catch (error) {
        console.error('Error fetching organizations:', error);
      }
    };
    
    fetchOrganizations();
  }, [user]);

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
    
    const orgId = await createOrganization(orgName.trim(), orgDescription.trim() || undefined);
    
    setLoading(false);
    
    if (orgId) {
      toast({
        title: "Organization created",
        description: "Your organization has been created successfully.",
      });
      navigate('/dashboard');
    }
  };

  const handleRequestJoin = async (orgId: string) => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('organization_join_requests')
        .insert({
          organization_id: orgId,
          user_id: user.id
        });
        
      if (error) throw error;
      
      setRequestSent(prev => ({ ...prev, [orgId]: true }));
      
      toast({
        title: "Request sent",
        description: "Your request to join this organization has been sent.",
      });
    } catch (error: any) {
      toast({
        title: "Request failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">Welcome to CloudCast</h1>
          <p className="mt-2 text-muted-foreground">
            {profile?.full_name || user?.email}, you need to join an organization to continue.
          </p>
        </div>
        
        <Tabs defaultValue="join" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="join">Join Existing</TabsTrigger>
            <TabsTrigger value="create">Create New</TabsTrigger>
          </TabsList>
          
          <TabsContent value="join" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Join an Organization</CardTitle>
                <CardDescription>
                  Request access to an existing organization.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {organizations.length > 0 ? (
                    organizations.map(org => (
                      <div key={org.id} className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                          <h3 className="font-medium">{org.name}</h3>
                          {org.description && (
                            <p className="text-sm text-muted-foreground">{org.description}</p>
                          )}
                        </div>
                        <Button 
                          onClick={() => handleRequestJoin(org.id)}
                          disabled={loading || requestSent[org.id]}
                          variant={requestSent[org.id] ? "outline" : "default"}
                        >
                          {requestSent[org.id] ? "Request Sent" : "Request to Join"}
                        </Button>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground">
                      No organizations found. Create a new one instead.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="create" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Create an Organization</CardTitle>
                <CardDescription>
                  Start a new organization and invite team members.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Organization Name</Label>
                    <Input
                      id="name"
                      placeholder="Enter organization name"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      placeholder="Brief description of your organization"
                      value={orgDescription}
                      onChange={(e) => setOrgDescription(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  onClick={handleCreateOrganization}
                  disabled={loading || !orgName.trim()}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Organization
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default OrganizationOnboarding;
