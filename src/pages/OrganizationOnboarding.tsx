
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Building2, Plus, UserPlus, Copy } from 'lucide-react';

const OrganizationOnboarding = () => {
  const { 
    user, 
    profile, 
    hasOrganization, 
    createOrganization, 
    isGlobalAdmin,
    organizationMemberships,
    joinOrganizationWithCode
  } = useAuth();
  const [orgName, setOrgName] = useState('');
  const [orgDescription, setOrgDescription] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if user already has an organization
  useEffect(() => {
    if (hasOrganization) {
      navigate('/dashboard');
    }
  }, [hasOrganization, navigate]);

  // Handle creating a new organization
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

  // Handle joining an organization with code
  const handleJoinWithCode = async () => {
    if (!joinCode.trim()) {
      toast({
        title: "Join code required",
        description: "Please enter a valid join code to continue.",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    
    const success = await joinOrganizationWithCode(joinCode.trim());
    
    setLoading(false);
    
    if (success) {
      navigate('/dashboard');
    }
  };

  // Show the join code for existing org admins so they can share with others
  const getJoinCodesForAdmin = () => {
    const adminOrgs = organizationMemberships
      .filter(m => m.role === 'admin' && m.organization?.join_code)
      .map(m => ({
        name: m.organization!.name,
        code: m.organization!.join_code
      }));
      
    if (adminOrgs.length === 0) return null;
      
    return (
      <div className="mt-6 space-y-4">
        <h3 className="text-lg font-medium">Share Join Codes</h3>
        <p className="text-sm text-muted-foreground">
          Share these codes with users you want to invite to your organizations:
        </p>
        {adminOrgs.map((org, idx) => (
          <div key={idx} className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <span className="font-medium">{org.name}: </span>
              <code className="bg-muted px-2 py-1 rounded">{org.code}</code>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(org.code || '');
                toast({ title: "Copied to clipboard" });
              }}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    );
  };

  // Determine which tab to show as default
  const defaultTab = isGlobalAdmin ? "create" : "join";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">Welcome to CloudCast</h1>
          <p className="mt-2 text-muted-foreground">
            {profile?.full_name || user?.email}, {isGlobalAdmin 
              ? "you can create a new organization or join an existing one." 
              : "you need to join an organization to continue."}
          </p>
        </div>
        
        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="join">Join Organization</TabsTrigger>
            {isGlobalAdmin && <TabsTrigger value="create">Create New</TabsTrigger>}
          </TabsList>
          
          <TabsContent value="join" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Join an Organization</CardTitle>
                <CardDescription>
                  Enter the join code provided by an organization admin.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="joinCode">Organization Join Code</Label>
                    <Input
                      id="joinCode"
                      placeholder="Enter join code (e.g., AB12CD34)"
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  onClick={handleJoinWithCode}
                  disabled={loading || !joinCode.trim()}
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Join Organization
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {isGlobalAdmin && (
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
              
              {getJoinCodesForAdmin()}
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default OrganizationOnboarding;
