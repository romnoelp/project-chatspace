
import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { AlertTriangle } from 'lucide-react';

const DomainRestricted = () => {
  const { signOut } = useAuth();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="mx-auto max-w-md text-center">
        <div className="mb-4 flex justify-center">
          <div className="rounded-full bg-destructive/10 p-3">
            <AlertTriangle className="h-10 w-10 text-destructive" />
          </div>
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Domain Restricted</h2>
        <p className="mt-2 text-muted-foreground">
          Access to this application is restricted to users with email addresses from authorized domains.
        </p>
        <p className="mt-4 text-sm text-muted-foreground">
          Please sign in with an institutional email address (@company.edu).
        </p>
        <div className="mt-6">
          <Button onClick={signOut} variant="outline">
            Sign Out and Try Again
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DomainRestricted;
