
import { createContext, useContext, ReactNode, useState } from 'react';

// Mock types for frontend display
interface UserProfile {
  id: string;
  full_name: string | null;
  email: string;
}

interface Organization {
  id: string;
  name: string;
  description: string | null;
  join_code: string | null;
}

interface OrganizationMembership {
  id: string;
  role: 'admin' | 'member';
  organization: Organization | null;
}

// Complete mock authentication context
type AuthContextType = {
  loading: boolean;
  user: { email: string } | null;
  profile: UserProfile | null;
  isGlobalAdmin: boolean;
  hasOrganization: boolean;
  organizationMemberships: OrganizationMembership[];
  signInWithGoogle: () => void;
  signOut: () => void;
  createOrganization: (name: string, description?: string) => Promise<string>;
  joinOrganizationWithCode: (code: string) => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{ email: string } | null>(null);
  
  // Mock sign in function
  const signInWithGoogle = () => {
    console.log('Mock sign in with Google');
    // Simulate successful login
    setUser({ email: 'user@example.com' });
    // Mock redirect
    window.location.href = '/dashboard';
  };

  // Mock sign out function
  const signOut = () => {
    console.log('Mock sign out');
    setUser(null);
    window.location.href = '/login';
  };

  // Mock create organization function
  const createOrganization = async (name: string, description?: string): Promise<string> => {
    console.log('Mock create organization:', name, description);
    return 'mock-org-id';
  };

  // Mock join organization function
  const joinOrganizationWithCode = async (code: string): Promise<boolean> => {
    console.log('Mock join organization with code:', code);
    return true;
  };

  // Mock data for fronted presentation
  const mockProfile: UserProfile = {
    id: 'user-123',
    full_name: 'Test User',
    email: 'user@example.com'
  };

  const mockOrganizations: OrganizationMembership[] = [
    {
      id: 'membership-1',
      role: 'admin',
      organization: {
        id: 'org-1',
        name: 'Test Organization',
        description: 'This is a test organization',
        join_code: 'TEST123'
      }
    }
  ];

  const value: AuthContextType = {
    loading: false,
    user,
    profile: user ? mockProfile : null,
    isGlobalAdmin: user?.email === 'romnoel.petracorta@neu.edu.ph',
    hasOrganization: mockOrganizations.length > 0,
    organizationMemberships: mockOrganizations,
    signInWithGoogle,
    signOut,
    createOrganization,
    joinOrganizationWithCode
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
