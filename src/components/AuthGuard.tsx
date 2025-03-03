
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { user, loading, hasOrganization, hasValidDomain } = useAuth();
  const location = useLocation();
  
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // If not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If email domain is not valid, redirect to restricted page
  if (!hasValidDomain) {
    return <Navigate to="/domain-restricted" replace />;
  }
  
  // If no organization and not on org onboarding page, redirect there
  if (!hasOrganization && !location.pathname.includes('/organization-onboarding')) {
    return <Navigate to="/organization-onboarding" replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;
