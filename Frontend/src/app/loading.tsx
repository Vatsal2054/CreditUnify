// app/loading.tsx
'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { useTheme } from "next-themes";

export default function LoadingPage() {
  const [progress, setProgress] = useState(0);
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // Handle theme mounting to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setProgress(prev => {
        if (prev >= 100) return 100;
        return prev + 1;
      });
    }, 15);
    
    return () => clearTimeout(timer);
  }, [progress]);

  // Determine if we're in dark mode
  const isDarkMode = mounted && (theme === 'dark' || resolvedTheme === 'dark');

  // Only render the full component after mounting to avoid hydration mismatch
  if (!mounted) {
    return <div className="h-screen w-full bg-background" />;
  }

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-background transition-colors duration-300">
      <div className="w-full max-w-md px-4 space-y-8">
        {/* Logo and title */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="text-primary">Credit</span>Unify
          </h1>
          <p className="text-muted-foreground">Loading unified credit insights...</p>
        </div>
        
        {/* Loading card */}
        <Card className="border shadow-md dark:bg-card dark:border-border">
          <CardContent className="pt-6 pb-4">
            {/* Score indicator */}
            <div className="relative flex justify-center mb-6">
              <motion.div 
                className={`h-32 w-32 rounded-full flex items-center justify-center border-8 ${
                  isDarkMode ? 'border-primary/10' : 'border-primary/20'
                }`}
                initial={{ borderTopColor: "hsl(var(--primary))" }}
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              >
                <div className="text-3xl font-bold">{progress}</div>
              </motion.div>
            </div>
            
            {/* Progress bar */}
            <div className="w-full bg-muted rounded-full h-2.5 mb-4 dark:bg-muted/40">
              <div 
                className="bg-primary h-2.5 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            
            {/* Loading messages */}
            <div className="text-center text-sm text-muted-foreground">
              {progress < 30 && "Connecting to credit bureaus..."}
              {progress >= 30 && progress < 60 && "Aggregating your credit data..."}
              {progress >= 60 && progress < 90 && "Analyzing credit insights..."}
              {progress >= 90 && "Almost there..."}
            </div>
          </CardContent>
        </Card>
        
        {/* Security note */}
        <div className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5">
          <svg xmlns="/creditunify-logo.svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shield">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
          </svg>
          <span>End-to-end encryption for your security</span>
        </div>
      </div>
    </div>
  );
}