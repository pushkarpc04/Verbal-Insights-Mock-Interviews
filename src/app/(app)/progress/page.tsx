"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons, LoadingSpinner } from "@/components/icons";
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";
import type { ProgressMetric, InterviewSession } from "@/lib/types";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const mockProgressData: ProgressMetric[] = [
  { date: "2024-05-01", score: 65, metricName: "Overall Score" },
  { date: "2024-05-08", score: 72, metricName: "Overall Score" },
  { date: "2024-05-15", score: 70, metricName: "Overall Score" },
  { date: "2024-05-22", score: 78, metricName: "Overall Score" },
  { date: "2024-05-29", score: 82, metricName: "Overall Score" },
  { date: "2024-06-05", score: 85, metricName: "Overall Score" },
];

const mockKeywordScores = [
  { name: "Communication", score: 75 },
  { name: "Problem Solving", score: 80 },
  { name: "Leadership", score: 60 },
  { name: "Teamwork", score: 85 },
  { name: "Technical Skills", score: 70 },
];

const mockPastSessions: Partial<InterviewSession>[] = [
  { id: "s1", title: "Senior Dev Role Check-in", createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), overallFeedback: { overallSentiment: "Positive", confidenceLevel: "High", areasForImprovement: "More STAR examples"} },
  { id: "s2", title: "PM Interview Prep", createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), overallFeedback: { overallSentiment: "Neutral", confidenceLevel: "Medium", areasForImprovement: "Clarity on metrics"} },
  { id: "s3", title: "Behavioral Round Practice", createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), overallFeedback: { overallSentiment: "Positive", confidenceLevel: "Medium", areasForImprovement: "Vary sentence structure"} },
];


export default function ProgressPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching data
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner className="h-12 w-12 text-primary" />
      </div>
    );
  }

  const formattedProgressData = mockProgressData.map(d => ({ ...d, date: format(new Date(d.date), "MMM d") }));

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Your Progress</h1>
        <p className="text-muted-foreground">
          Track your interview performance and identify areas for growth.
        </p>
      </header>

      {mockProgressData.length === 0 ? (
         <Card className="text-center py-12 shadow-lg">
          <CardContent className="flex flex-col items-center">
             <Image src="https://placehold.co/300x200.png" alt="No progress data" width={300} height={200} className="mb-6 rounded-lg" data-ai-hint="empty chart graph" />
            <h3 className="text-2xl font-semibold mb-2 font-headline">No Progress Data Yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Complete a few mock interviews to see your progress charted here.
            </p>
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Link href="/interviews/new">
                <Icons.mic className="mr-2 h-5 w-5" /> Start Your First Interview
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="font-headline text-xl">Overall Performance Trend</CardTitle>
              <CardDescription>Your average scores over time.</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px] pl-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={formattedProgressData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)'}}
                    labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold' }}
                    itemStyle={{ color: 'hsl(var(--accent))' }}
                  />
                  <Legend wrapperStyle={{fontSize: "12px"}}/>
                  <Line type="monotone" dataKey="score" name="Overall Score" stroke="hsl(var(--accent))" strokeWidth={3} dot={{ r: 5, fill: "hsl(var(--accent))" }} activeDot={{ r: 7 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="font-headline">Keyword & Concept Scores</CardTitle>
                <CardDescription>Performance on key skills and concepts.</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] pl-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockKeywordScores} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" domain={[0, 100]} stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(value) => `${value}%`} />
                    <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} width={100} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)'}}
                      labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold' }}
                      itemStyle={{ color: 'hsl(var(--primary))' }}
                    />
                    <Legend wrapperStyle={{fontSize: "12px"}}/>
                    <Bar dataKey="score" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="font-headline">Recent Session Highlights</CardTitle>
                <CardDescription>Key takeaways from your last few interviews.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockPastSessions.slice(0, 3).map(session => (
                  <Link key={session.id} href={`/interviews/${session.id}/results`} className="block p-4 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-md">{session.title}</h4>
                        <p className="text-xs text-muted-foreground">{format(new Date(session.createdAt!), "MMM d, yyyy")}</p>
                      </div>
                      <Badge variant={session.overallFeedback?.overallSentiment?.toLowerCase() === 'positive' ? 'default' : 'outline'}>
                        {session.overallFeedback?.overallSentiment}
                      </Badge>
                    </div>
                    <p className="text-sm mt-2 text-foreground line-clamp-2">
                      Feedback: {session.overallFeedback?.areasForImprovement || "No specific areas highlighted."}
                    </p>
                  </Link>
                ))}
                 <Button variant="link" asChild className="w-full text-primary mt-2">
                    <Link href="/interviews/history">View All Past Sessions</Link>
                 </Button>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
