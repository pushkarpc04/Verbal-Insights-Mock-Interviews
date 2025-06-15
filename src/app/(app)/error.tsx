// This must be a client component
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/icons";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-theme(spacing.16))] p-4">
      <Card className="w-full max-w-md text-center shadow-xl">
        <CardHeader>
          <div className="mx-auto bg-destructive/10 p-3 rounded-full w-fit">
            <Icons.warning className="h-10 w-10 text-destructive" />
          </div>
          <CardTitle className="mt-4 text-2xl font-headline">Oops! Something Went Wrong</CardTitle>
          <CardDescription>
            We encountered an unexpected issue. Please try again, or contact support if the problem persists.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {process.env.NODE_ENV === 'development' && (
            <details className="mb-4 p-3 bg-secondary/50 rounded-md text-left text-xs">
              <summary className="cursor-pointer font-medium">Error Details (Development Only)</summary>
              <pre className="mt-2 whitespace-pre-wrap">
                {error.message}
                {error.digest && `\nDigest: ${error.digest}`}
                {error.stack && `\nStack: ${error.stack}`}
              </pre>
            </details>
          )}
          <Button
            onClick={
              // Attempt to recover by trying to re-render the segment
              () => reset()
            }
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Icons.retry className="mr-2 h-4 w-4" /> Try Again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
