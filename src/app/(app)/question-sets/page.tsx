"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons, LoadingSpinner } from "@/components/icons";
import Link from "next/link";
import type { QuestionSet } from "@/lib/types";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

const mockQuestionSets: QuestionSet[] = [
  {
    id: "qs1",
    name: "FAANG Software Engineer Behavioral",
    description: "Common behavioral questions for top tech companies.",
    questions: [
      { id: "q1", text: "Tell me about a time you failed." },
      { id: "q2", text: "Describe a challenging project you worked on." },
      { id: "q3", text: "Why do you want to work at this company?" },
    ],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    jobDescriptionContext: "Job description for Senior Software Engineer at a large tech company focusing on distributed systems and cloud technologies..."
  },
  {
    id: "qs2",
    name: "Startup Product Manager - Technical",
    description: "Technical and product sense questions for PM roles at startups.",
    questions: [
      { id: "q4", text: "How would you design a product for X?" },
      { id: "q5", text: "Estimate the market size for Y." },
    ],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export default function QuestionSetsPage() {
  const [questionSets, setQuestionSets] = useState<QuestionSet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Simulate fetching data
    setTimeout(() => {
      setQuestionSets(mockQuestionSets);
      setIsLoading(false);
    }, 500);
  }, []);

  const handleDeleteSet = (setId: string) => {
    // Mock deletion
    setQuestionSets(prev => prev.filter(qs => qs.id !== setId));
    toast({
      title: "Question Set Deleted",
      description: "The question set has been removed (mocked).",
    });
  };

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
          <h1 className="text-3xl font-bold tracking-tight font-headline">My Question Sets</h1>
          <p className="text-muted-foreground">
            Manage your custom and AI-generated interview question sets.
          </p>
        </div>
        <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Link href="/interviews/new">
            <Icons.add className="mr-2 h-4 w-4" /> Create New Set
          </Link>
        </Button>
      </header>

      {questionSets.length === 0 ? (
        <Card className="text-center py-12 shadow-lg">
          <CardContent className="flex flex-col items-center">
            <Image src="https://placehold.co/300x200.png" alt="Empty state illustration" width={300} height={200} className="mb-6 rounded-lg" data-ai-hint="empty box document" />
            <h3 className="text-2xl font-semibold mb-2 font-headline">No Question Sets Yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Create your first question set by generating questions from a job description or adding them manually.
            </p>
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Link href="/interviews/new">
                <Icons.generate className="mr-2 h-5 w-5" /> Generate Questions from JD
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {questionSets.map((qs) => (
            <Card key={qs.id} className="flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="font-headline text-xl">{qs.name}</CardTitle>
                <CardDescription>
                  {qs.questions.length} questions | Created: {format(new Date(qs.createdAt), "MMM d, yyyy")}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {qs.description || (qs.jobDescriptionContext ? `Generated from: ${qs.jobDescriptionContext.substring(0,100)}...` : "No description available.")}
                </p>
              </CardContent>
              <CardFooter className="flex justify-between items-center pt-4 border-t">
                <Button variant="outline" size="sm" asChild>
                  {/* In real app, link to a page to view/edit the set */}
                  <Link href={`/question-sets/${qs.id}/edit`}> 
                    <Icons.editPencil className="mr-1.5 h-4 w-4" /> Edit
                  </Link>
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Icons.delete className="mr-1.5 h-4 w-4" /> Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the question set "{qs.name}".
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDeleteSet(qs.id)} className="bg-destructive hover:bg-destructive/90">
                        Yes, delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <Button size="sm" asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
                   {/* In real app, link to start practice with this set */}
                  <Link href={`/interviews/practice?set=${qs.id}`}>
                    <Icons.play className="mr-1.5 h-4 w-4" /> Practice
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
