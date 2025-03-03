import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { useToast } from '@/components/ui/use-toast';

// Allowed email domains - adjust this as needed
const ALLOWED_DOMAINS = ['company.edu'];

type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

type Organization = {
  id: string;
  name: string;
  description: string | null;
};

type OrganizationMember = {
  id: string;
  organization_id: string;
  user_id: string;
  role: 'admin' | 'member';
  created_at: string;
  organization?: Organization;
};

type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  organizationMemberships: OrganizationMember[];
  hasOrganization: boolean;
  isOrgAdmin: (orgId?: string) => boolean;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  createOrganization: (name: string, description?: string) => Promise<string | null>;
  fetchOrganizationMemberships: () => Promise<void>;
  hasValidDomain: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [organizationMemberships, setOrganizationMemberships] = useState<OrganizationMember[]>([]);
  const { toast } = useToast();

  const hasValidDomain = user?.email ? ALLOWED_DOMAINS.some(domain => 
    user.email!.endsWith(`@${domain}`)) : false;
  
  const hasOrganization = organizationMemberships.length > 0;

  const isOrgAdmin = (orgId?: string) => {
    if (!orgId) {
      // Check if user is admin in any organization
      return organizationMemberships.some(m => m.role === 'admin');
    }
    // Check if user is admin in the specific organization
    return organizationMemberships.some(m => m.organization_id === orgId && m.role === 'admin');
  };

  useEffect(() => {
    // Get session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchProfile(session.user.id);
          await fetchOrganizationMemberships();
          
          // Check for pending invites
          if (event === 'SIGNED_IN') {
            await checkPendingInvites(session.user.email || '');
          }
        } else {
          setProfile(null);
          setOrganizationMemberships([]);
          setLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error) {
        throw error;
      }
      
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrganizationMemberships = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('organization_members')
        .select(`
          *,
          organization:organizations(*)
        `)
        .eq('user_id', user.id);
        
      if (error) {
        throw error;
      }
      
      const typedData = data?.map(item => ({
        ...item,
        role: item.role as 'admin' | 'member' // Cast to ensure type compatibility
      })) || [];
      
      setOrganizationMemberships(typedData);
    } catch (error) {
      console.error('Error fetching organization memberships:', error);
    }
  };

  const checkPendingInvites = async (email: string) => {
    try {
      // Check if user has any pending invites
      const { data: invites, error } = await supabase
        .from('organization_invites')
        .select('*')
        .eq('email', email)
        .eq('accepted', false);
        
      if (error) throw error;
      
      if (invites && invites.length > 0) {
        // Process each invite
        for (const invite of invites) {
          // Add user to organization
          const { error: memberError } = await supabase
            .from('organization_members')
            .insert({
              organization_id: invite.organization_id,
              user_id: user!.id,
              role: invite.role
            });
            
          if (memberError) {
            console.error('Error accepting invite:', memberError);
            continue;
          }
          
          // Mark invite as accepted
          await supabase
            .from('organization_invites')
            .update({ accepted: true })
            .eq('id', invite.id);
            
          toast({
            title: "Organization Invite Accepted",
            description: "You've been added to an organization based on your email.",
          });
        }
        
        // Refresh memberships
        await fetchOrganizationMemberships();
      }
    } catch (error) {
      console.error('Error checking invites:', error);
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
    }
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
        queryParams: {
          // This filtering is not enforced on the backend and is just a UI hint
          // The actual domain restriction needs to be configured in the Supabase Dashboard
          // under Authentication > Providers > Google > Domains
          hd: ALLOWED_DOMAINS.join(',')
        }
      }
    });
    
    if (error) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const createOrganization = async (name: string, description?: string): Promise<string | null> => {
    if (!user) return null;
    
    try {
      // Create the organization
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name,
          description,
          created_by: user.id
        })
        .select('id')
        .single();
        
      if (orgError) throw orgError;
      
      // Add the current user as an admin
      const { error: memberError } = await supabase
        .from('organization_members')
        .insert({
          organization_id: orgData.id,
          user_id: user.id,
          role: 'admin'
        });
        
      if (memberError) throw memberError;
      
      // Refresh the list of organizations
      await fetchOrganizationMemberships();
      
      return orgData.id;
    } catch (error: any) {
      toast({
        title: "Failed to create organization",
        description: error.message,
        variant: "destructive"
      });
      return null;
    }
  };

  const value = {
    session,
    user,
    profile,
    loading,
    organizationMemberships,
    hasOrganization,
    isOrgAdmin,
    signOut,
    signInWithGoogle,
    createOrganization,
    fetchOrganizationMemberships,
    hasValidDomain
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
