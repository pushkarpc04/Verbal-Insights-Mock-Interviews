"use client";

import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons, LoadingSpinner } from "@/components/icons";
import { generateInterviewQuestionsAction } from "@/app/actions";
import type { Question } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
  jobDescription: z.string().min(100, {
    message: "Job description must be at least 100 characters.",
  }).max(5000, {
    message: "Job description must not exceed 5000 characters.",
  }),
  numQuestions: z.coerce.number().min(1).max(10).default(5),
  interviewTitle: z.string().min(5, "Title must be at least 5 characters.").max(100, "Title too long."),
});

export default function NewInterviewPage() {
  const [isPending, startTransition] = useTransition();
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      jobDescription: "",
      numQuestions: 5,
      interviewTitle: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      setGeneratedQuestions([]);
      const result = await generateInterviewQuestionsAction({
        jobDescription: values.jobDescription,
        numQuestions: values.numQuestions,
      });
      if (result.success && result.data?.questions) {
        setGeneratedQuestions(
          result.data.questions.map((q, i) => ({ id: `gen-q-${i}`, text: q }))
        );
        toast({
          title: "Success!",
          description: "Interview questions generated.",
          variant: "default",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to generate questions.",
          variant: "destructive",
        });
      }
    });
  }

  const handleStartPractice = () => {
    // In a real app, you'd save this session and redirect to its practice page
    // For now, we'll pass data via query params or local storage if it's too large
    // Or ideally, use a state management solution or POST to create a session
    localStorage.setItem('currentInterviewQuestions', JSON.stringify(generatedQuestions));
    localStorage.setItem('currentInterviewJobDescription', form.getValues('jobDescription'));
    localStorage.setItem('currentInterviewTitle', form.getValues('interviewTitle'));
    router.push(`/interviews/practice-new`); // A dynamic route would be better for saved sessions
  };
  
  const handleSaveQuestionSet = () => {
    // Mock saving question set
    toast({
      title: "Question Set Saved (Mock)",
      description: `The set "${form.getValues('interviewTitle')}" with ${generatedQuestions.length} questions has been saved.`,
    });
  };


  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Create New Mock Interview</h1>
        <p className="text-muted-foreground">
          Generate tailored interview questions by providing a job description.
        </p>
      </header>

      <Card className="shadow-lg">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
              <CardTitle>Job & Interview Details</CardTitle>
              <CardDescription>Enter the job description and a title for this interview session.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="interviewTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Interview Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Software Engineer at Google" {...field} />
                    </FormControl>
                    <FormDescription>A descriptive title for this practice session.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="jobDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Paste the job description here..."
                        className="min-h-[200px] resize-y"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      The AI will use this to generate relevant questions. (Min 100 chars)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="numQuestions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Questions</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" max="10" {...field} />
                    </FormControl>
                    <FormDescription>
                      How many questions would you like to generate? (1-10)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isPending} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                {isPending ? (
                  <>
                    <LoadingSpinner className="mr-2 h-4 w-4" /> Generating...
                  </>
                ) : (
                  <>
                    <Icons.generate className="mr-2 h-4 w-4" /> Generate Questions
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      {generatedQuestions.length > 0 && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Generated Questions</CardTitle>
            <CardDescription>Review the questions. You can start practicing or save this set.</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] rounded-md border p-4">
              <ul className="space-y-3">
                {generatedQuestions.map((q, index) => (
                  <li key={q.id} className="flex items-start gap-3 p-3 bg-secondary/30 rounded-md">
                    <span className="text-primary font-semibold">{index + 1}.</span>
                    <p>{q.text}</p>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </CardContent>
          <CardFooter className="flex justify-end gap-4">
             <Button variant="outline" onClick={handleSaveQuestionSet} disabled={isPending}>
              <Icons.save className="mr-2 h-4 w-4" /> Save Question Set
            </Button>
            <Button onClick={handleStartPractice} disabled={isPending} className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Icons.play className="mr-2 h-4 w-4" /> Start Practice
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
