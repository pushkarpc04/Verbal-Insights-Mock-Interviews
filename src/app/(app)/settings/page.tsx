"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Icons } from "@/components/icons";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const { toast } = useToast();

  const handleSaveChanges = (e: React.FormEvent) => {
    e.preventDefault();
    // Add logic to save settings
    toast({
      title: "Settings Saved",
      description: "Your preferences have been updated (mocked).",
    });
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <header>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Settings</h1>
        <p className="text-muted-foreground">Manage your account and application preferences.</p>
      </header>

      <form onSubmit={handleSaveChanges}>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline">Profile Information</CardTitle>
            <CardDescription>Update your personal details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" defaultValue="Alex Chen" placeholder="Your full name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" defaultValue="alex.chen@example.com" placeholder="your@email.com" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="avatar">Avatar URL</Label>
              <div className="flex items-center gap-4">
                <img src="https://placehold.co/64x64.png" alt="Current avatar" data-ai-hint="user profile" className="h-16 w-16 rounded-full" />
                <Input id="avatar" type="url" placeholder="https://example.com/avatar.png" className="flex-1"/>
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator className="my-8" />

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline">Notification Preferences</CardTitle>
            <CardDescription>Choose how you want to be notified.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between space-x-2 p-4 border rounded-lg">
              <Label htmlFor="email-notifications" className="flex flex-col space-y-1">
                <span>Email Notifications</span>
                <span className="font-normal leading-snug text-muted-foreground">
                  Receive updates about new features and tips.
                </span>
              </Label>
              <Switch id="email-notifications" defaultChecked />
            </div>
            <div className="flex items-center justify-between space-x-2 p-4 border rounded-lg">
              <Label htmlFor="progress-reports" className="flex flex-col space-y-1">
                <span>Weekly Progress Reports</span>
                <span className="font-normal leading-snug text-muted-foreground">
                  Get a summary of your weekly performance.
                </span>
              </Label>
              <Switch id="progress-reports" />
            </div>
          </CardContent>
        </Card>
        
        <Separator className="my-8" />

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline">Account Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <Button variant="outline" className="w-full sm:w-auto">
                <Icons.settings className="mr-2 h-4 w-4" /> Change Password
            </Button>
            <Button variant="destructive" className="w-full sm:w-auto">
                <Icons.delete className="mr-2 h-4 w-4" /> Delete Account
            </Button>
          </CardContent>
        </Card>
        
        <div className="mt-8 flex justify-end">
          <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Icons.save className="mr-2 h-4 w-4" /> Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
