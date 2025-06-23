'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="h-screen flex flex-col items-center space-y-6 justify-center px-4">
      <div className="text-center space-y-4">
        <AlertTriangle className="h-20 w-20 text-destructive mx-auto" />
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Something went wrong!</h1>
          <p className="text-muted-foreground max-w-md">
            An unexpected error occurred. Please try again or contact support if the problem
            persists.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={reset} className="min-w-32">
            Try again
          </Button>
          <Button
            variant="outline"
            onClick={() => (window.location.href = '/dashboard')}
            className="min-w-32"
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
