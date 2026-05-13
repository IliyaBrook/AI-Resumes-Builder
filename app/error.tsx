'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-screen flex-col items-center justify-center space-y-6 px-4">
      <div className="space-y-4 text-center">
        <AlertTriangle className="mx-auto h-20 w-20 text-destructive" />
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Something went wrong!</h1>
          <p className="max-w-md text-muted-foreground">
            An unexpected error occurred. Please try again or contact support if the problem persists.
          </p>
        </div>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Button onClick={reset} className="min-w-32">
            Try again
          </Button>
          <Button variant="outline" onClick={() => (window.location.href = '/dashboard')} className="min-w-32">
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
