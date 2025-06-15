"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons, LoadingSpinner } from "@/components/icons";
import Link from "next/link";
import type { InterviewSession } from "@/lib/types";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Image from "next/image";

const mockPastSessions: InterviewSession[] = [
  {
    id: "session1",
    title: "Full Stack Developer at Innovatech",
    jobDescription: "Seeking a full stack developer proficient in React, Node.js, and AWS...",
    questions: [
      { id: "q1", text: "Describe your experience with microservices." },
      { id: "q2", text: "How do you handle state management in a large React application?" },
    ],
    answers: [
      { questionId: "q1", transcript: "I have extensive experience...", duration: 120 },
      { questionId: "q2", transcript: "I typically use Redux or Zustand...", duration: 150 },
    ],
    overallFeedback: { overallSentiment: "Positive", confidenceLevel: "High", areasForImprovement: "Provide more specific examples for project X." },
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    duration: 270,
  },
  {
    id: "session2",
    title: "Data Analyst Behavioral Round",
    jobDescription: "Behavioral interview for a Data Analyst position...",
    questions: [{ id: "q3", text: "Tell me about a time you had to work with a difficult stakeholder." }],
    answers: [{ questionId: "q3", transcript: "In my previous role...", duration: 180 }],
    overallFeedback: { overallSentiment: "Neutral", confidenceLevel: "Medium", areasForImprovement: "Be more concise in your answers." },
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    duration: 180,
  },
   {
    id: "session3",
    title: "UX Designer Portfolio Review Prep",
    questions: [{ id: "q4", text: "Walk me through your favorite project." }],
    answers: [{ questionId: "q4", transcript: "My favorite project was...", duration: 300 }],
    overallFeedback: { overallSentiment: "Positive", confidenceLevel: "Very High", areasForImprovement: "Could mention user testing results more." },
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    duration: 300,
  },
];


export default function InterviewHistoryPage() {
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching data
    setTimeout(() => {
      setSessions(mockPastSessions);
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
  
  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Interview History</h1>
          <p className="text-muted-foreground">
            Review your past mock interview sessions and their feedback.
          </p>
        </div>
        <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Link href="/interviews/new">
            <Icons.add className="mr-2 h-4 w-4" /> Start New Interview
          </Link>
        </Button>
      </header>

      {sessions.length === 0 ? (
         <Card className="text-center py-12 shadow-lg">
          <CardContent className="flex flex-col items-center">
            <Image src="https://placehold.co/300x200.png" alt="No history" width={300} height={200} className="mb-6 rounded-lg" data-ai-hint="empty folder archive" />
            <h3 className="text-2xl font-semibold mb-2 font-headline">No Interview History Yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Your completed mock interviews will appear here. Start practicing to build your history!
            </p>
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Link href="/interviews/new">
                <Icons.mic className="mr-2 h-5 w-5" /> Practice Now
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>Past Sessions</CardTitle>
            <CardDescription>A log of all your completed mock interviews.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-headline">Title</TableHead>
                  <TableHead className="font-headline">Date</TableHead>
                  <TableHead className="font-headline text-center">Questions</TableHead>
                  <TableHead className="font-headline">Sentiment</TableHead>
                  <TableHead className="font-headline text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((session) => (
                  <TableRow key={session.id} className="hover:bg-secondary/20 transition-colors">
                    <TableCell className="font-medium">{session.title}</TableCell>
                    <TableCell>{format(new Date(session.createdAt), "MMM d, yyyy - p")}</TableCell>
                    <TableCell className="text-center">{session.questions.length}</TableCell>
                    <TableCell>
                      <Badge variant={session.overallFeedback?.overallSentiment?.toLowerCase() === 'positive' ? 'default' : session.overallFeedback?.overallSentiment?.toLowerCase() === 'neutral' ? 'secondary' : 'destructive'}>
                        {session.overallFeedback?.overallSentiment || "N/A"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/interviews/${session.id}/results`}> {/* Adjust if using different result page for history */}
                          <Icons.view className="mr-1.5 h-4 w-4" /> View Results
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
