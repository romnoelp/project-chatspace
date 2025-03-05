
import { Navigate } from 'react-router-dom';

interface AuthGuardProps {
  children: React.ReactNode;
}

// Simplified AuthGuard that doesn't check authentication
const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  // Always render children without any authentication checks
  return <>{children}</>;
};

export default AuthGuard;
