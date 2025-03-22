'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from "next-themes";
import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Custom404() {
  const router = useRouter();
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // Handle theme mounting to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Determine if we're in dark mode
  const isDarkMode = mounted && (theme === 'dark' || resolvedTheme === 'dark');

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background p-4">
      <div className="max-w-lg w-full space-y-8">
        {/* Logo */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="text-primary">Credit</span>Unify
          </h1>
        </div>
        
        {/* SVG Illustration */}
        <div className="flex justify-center">
          {/* You would need to add this SVG to your public directory */}
          <img 
            src={isDarkMode ? "/404.svg" : "/404.svg"} 
            alt="404 - Page Not Found" 
            className="w-full max-w-md" 
          />
        </div>
        
        <Card className="p-6 border shadow-md">
          {/* Error message */}
          <div className="space-y-3 text-center mb-6">
            <h2 className="text-2xl font-bold">Page Not Found</h2>
            <p className="text-muted-foreground">
              We couldn't locate the credit information you're looking for.
            </p>
          </div>
          
          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => router.back()}
            >
              Go Back
            </Button>
            <Button 
              className="flex-1"
              onClick={() => router.push('/')}
            >
              Return Home
            </Button>
          </div>
        </Card>
        
        {/* Help section */}
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Need assistance finding something?
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
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shield">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
          </svg>
          <span>Secure connection maintained</span>
        </div>
      </div>
    </div>
  );
}