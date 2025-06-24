'use client';

import { useEffect } from 'react';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex h-screen flex-col items-center justify-center space-y-6 bg-background px-4 text-foreground">
          <div className="space-y-4 text-center">
            <div className="text-6xl font-bold text-destructive">⚠️</div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">Application Error</h1>
              <p className="max-w-md text-muted-foreground">
                A critical error occurred. Please refresh the page or contact support.
              </p>
            </div>
            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <button
                onClick={reset}
                className="inline-flex h-9 min-w-32 items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
              >
                Try again
              </button>
              <button
                onClick={() => (window.location.href = '/')}
                className="inline-flex h-9 min-w-32 items-center justify-center gap-2 whitespace-nowrap rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
