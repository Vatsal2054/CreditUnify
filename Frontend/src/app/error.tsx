'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Image from 'next/image';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Log the error to an error reporting service
  useEffect(() => {
    console.error(error);
  }, [error]);

  // Handle theme mounting to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Determine if we're in dark mode
  const isDarkMode = mounted && (theme === 'dark' || resolvedTheme === 'dark');

  return (
    <html>
      <body>
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background p-4">
          <div className="max-w-lg w-full space-y-8">
            {/* Logo
            <div
              className="flex items-center gap-2 cursor-pointer justify-center"
              onClick={() => (window.location.href = '/')}
            >
              <Image
                alt="logo"
                src="/logo/creditunify-logo.svg"
                width={35}
                height={35}
              />
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
                CreditUnify
              </span>
            </div> */}

            {/* SVG Illustration */}
            <div className="flex justify-center">
              {/* You would need to add this SVG to your public directory */}
              <img
                src={'/error.svg'}
                alt="An error occurred"
                className="w-full max-w-md"
              />
            </div>

            <Card className="p-6 border shadow-md">
              {/* Error message */}
              <div className="space-y-3 text-center mb-6">
                <h2 className="text-2xl font-bold">Something Went Wrong</h2>
                <p className="text-muted-foreground">
                  We're sorry, but we encountered an unexpected issue.
                </p>
                {process.env.NODE_ENV === 'development' && (
                  <div className="mt-2 p-3 bg-muted rounded-md text-left text-sm overflow-auto">
                    <p className="font-medium">Error details:</p>
                    <p className="font-mono">{error.message}</p>
                  </div>
                )}
                {error.digest && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Error ID: {error.digest}
                  </p>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => reset()}
                >
                  Try Again
                </Button>
                <Button className="flex-1" onClick={() => router.push('/')}>
                  Return Home
                </Button>
              </div>
            </Card>

            {/* Help section */}
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Need assistance with this error?
              </p>
              <div className="flex justify-center space-x-4">
                <Link
                  href="/support"
                  className="text-sm text-primary hover:underline"
                >
                  Contact Support
                </Link>
                <Link
                  href="/sitemap"
                  className="text-sm text-primary hover:underline"
                >
                  View Sitemap
                </Link>
              </div>
            </div>

            {/* Security note */}
            <div className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-shield"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
              </svg>
              <span>Secure connection maintained</span>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
