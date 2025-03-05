
import { createContext, useContext, ReactNode } from 'react';

// Minimal mock authentication context
type AuthContextType = {
  loading: boolean;
  signInWithGoogle: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Mock sign in function
  const signInWithGoogle = () => {
    console.log('Mock sign in with Google');
    // In a real app, this would trigger authentication
    window.location.href = '/dashboard';
  };

  const value = {
    loading: false,
    signInWithGoogle
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
