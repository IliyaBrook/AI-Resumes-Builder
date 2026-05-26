import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Search, Home } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center space-y-6 px-4">
      <div className="space-y-4 text-center">
        <Search className="text-muted-foreground mx-auto h-20 w-20" />
        <div className="space-y-2">
          <h1 className="text-foreground text-4xl font-bold">404</h1>
          <h2 className="text-foreground text-xl font-semibold">Page Not Found</h2>
          <p className="text-muted-foreground max-w-md">
            The page you are looking for doesn't exist or has been moved.
          </p>
        </div>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild className="min-w-32">
            <Link href="/dashboard">
              <Home className="h-4 w-4" />
              Go to Dashboard
            </Link>
          </Button>
          <Button variant="outline" asChild className="min-w-32">
            <Link href="/">Return Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
