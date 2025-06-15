"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons, LoadingSpinner } from "@/components/icons";
import Link from "next/link";
import Image from "next/image";
import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import type { InterviewSession } from "@/lib/types";

const mockRecentSessions: InterviewSession[] = [
  {
    id: "1",
    title: "Software Engineer Role at TechCorp",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    questions: [{id: "q1", text:"Q1"}, {id: "q2", text:"Q2"}],
    answers: [{questionId: "q1", transcript: "A1"},{questionId: "q2", transcript: "A2"}],
    overallFeedback: { overallSentiment: "Positive", confidenceLevel: "High", areasForImprovement: "Clarity on project X" }
  },
  {
    id: "2",
    title: "Product Manager Interview Practice",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    questions: [{id: "q1", text:"Q1"}],
    answers: [{questionId: "q1", transcript: "A1"}],
    overallFeedback: { overallSentiment: "Neutral", confidenceLevel: "Medium", areasForImprovement: "More specific examples" }
  },
];

const mockPerformanceData = [
  { name: "Jan", score: 65 },
  { name: "Feb", score: 70 },
  { name: "Mar", score: 75 },
  { name: "Apr", score: 80 },
  { name: "May", score: 78 },
  { name: "Jun", score: 85 },
];


export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    // Simulate fetching user data
    setTimeout(() => {
      setUserName("Alex"); // Placeholder name
      setLoading(false);
    }, 1000);
  }, []);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner className="h-12 w-12 text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Welcome back, {userName || "User"}!</h1>
          <p className="text-muted-foreground">Here's your interview preparation overview.</p>
        </div>
        <Button size="lg" asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Link href="/interviews/new">
            <Icons.add className="mr-2 h-5 w-5" /> Start New Mock Interview
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Icons.mic className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+2 this month</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Icons.target className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">82%</div>
            <p className="text-xs text-muted-foreground">Improved by 5% from last month</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Goal: Confidence</CardTitle>
            <Icons.feedback className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-md font-semibold">Focus on confident delivery</div>
            <Progress value={60} className="mt-2 h-2" />
            <p className="text-xs text-muted-foreground mt-1">60% towards mastering confident speech</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3 shadow-lg">
          <CardHeader>
            <CardTitle>Performance Over Time</CardTitle>
            <CardDescription>Your average scores from recent mock interview sessions.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockPerformanceData}>
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)'}}
                  labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold' }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                 />
                <Bar dataKey="score" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 shadow-lg">
          <CardHeader>
            <CardTitle>Recent Sessions</CardTitle>
            <CardDescription>Quick access to your latest practice interviews.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockRecentSessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors">
                <div>
                  <h4 className="font-semibold text-sm">{session.title}</h4>
                  <p className="text-xs text-muted-foreground">
                    {new Date(session.createdAt).toLocaleDateString()} - {session.overallFeedback?.overallSentiment}
                  </p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/interviews/${session.id}/results`}>
                    View <Icons.next className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ))}
             <Button variant="link" asChild className="w-full text-primary">
                <Link href="/interviews/history">View All Sessions</Link>
              </Button>
          </CardContent>
        </Card>
      </div>
      
      <Card className="shadow-lg hover:shadow-xl transition-shadow">
        <CardHeader>
          <CardTitle>Quick Start Guide</CardTitle>
          <CardDescription>New here? Here are some tips to get started.</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-4">
          <div className="flex flex-col items-center text-center p-4 bg-background rounded-lg border">
            <Icons.job className="h-10 w-10 text-primary mb-3" />
            <h4 className="font-semibold mb-1">1. Add Job Description</h4>
            <p className="text-xs text-muted-foreground">Input a job description to generate relevant questions.</p>
             <Button variant="link" size="sm" asChild className="mt-2">
              <Link href="/interviews/new">Generate Questions</Link>
            </Button>
          </div>
          <div className="flex flex-col items-center text-center p-4 bg-background rounded-lg border">
            <Icons.mic className="h-10 w-10 text-primary mb-3" />
            <h4 className="font-semibold mb-1">2. Practice Answering</h4>
            <p className="text-xs text-muted-foreground">Record your answers and simulate a real interview.</p>
            <Button variant="link" size="sm" asChild className="mt-2">
              <Link href="/interviews/new">Start Practicing</Link>
            </Button>
          </div>
          <div className="flex flex-col items-center text-center p-4 bg-background rounded-lg border">
            <Icons.feedback className="h-10 w-10 text-primary mb-3" />
            <h4 className="font-semibold mb-1">3. Get AI Feedback</h4>
            <p className="text-xs text-muted-foreground">Receive detailed analysis and coaching to improve.</p>
             <Button variant="link" size="sm" asChild className="mt-2">
              <Link href="/progress">See Your Progress</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
