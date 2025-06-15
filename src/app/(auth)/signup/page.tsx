
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/icons";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Mock signup logic
    toast({
      title: "Signup Successful (Mock)",
      description: "Welcome! Redirecting to your dashboard...",
    });
    // In a real app, you would handle user creation and authentication here
    setTimeout(() => {
      router.push("/dashboard");
    }, 1500);
  };

  return (
    <Card className="w-full max-w-md shadow-2xl">
      <CardHeader className="text-center">
         <div className="mx-auto mb-4">
          <Link href="/" className="flex items-center justify-center gap-2 text-primary">
            <Icons.logo className="h-10 w-10" />
            <span className="text-3xl font-semibold font-headline">Verbal Insights</span>
          </Link>
        </div>
        <CardTitle className="text-2xl font-headline">Create Your Account</CardTitle>
        <CardDescription>Join Verbal Insights and start acing your interviews.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <div className="relative">
              <Icons.user className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input id="fullName" type="text" placeholder="Your Name" required className="pl-10" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
             <div className="relative">
              <Icons.mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input id="email" type="email" placeholder="you@example.com" required className="pl-10" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Icons.lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input id="password" type="password" placeholder="Create a strong password" required className="pl-10" />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
            <Icons.add className="mr-2 h-5 w-5" /> Sign Up
          </Button>
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Button variant="link" className="p-0 h-auto" asChild>
              <Link href="/login">Log In</Link>
            </Button>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
