
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
  interviewTitle: z.string().min(5, "Title must be at least 5 characters.").max(100, "Title cannot exceed 100 characters."),
  jobDescription: z.string().min(100, {
    message: "Job description must be at least 100 characters.",
  }).max(5000, {
    message: "Job description must not exceed 5000 characters.",
  }),
  numQuestions: z.coerce.number().min(1).max(10).default(5),
  resumeDataUri: z.string().optional(),
});

export default function NewInterviewPage() {
  const [isPending, startTransition] = useTransition();
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);
  const [resumeFileName, setResumeFileName] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      interviewTitle: "",
      jobDescription: "",
      numQuestions: 5,
      resumeDataUri: undefined,
    },
  });

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
          toast({ title: "File too large", description: "Please upload a resume under 5MB.", variant: "destructive" });
          event.target.value = ""; // Reset file input
          setResumeFileName(null);
          form.setValue("resumeDataUri", undefined);
          return;
      }
      const allowedTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"];
      if (!allowedTypes.includes(file.type)) {
          toast({ title: "Invalid file type", description: "Please upload a PDF, DOCX, or TXT file.", variant: "destructive" });
          event.target.value = ""; // Reset file input
          setResumeFileName(null);
          form.setValue("resumeDataUri", undefined);
          return;
      }

      setResumeFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        form.setValue("resumeDataUri", reader.result as string);
      };
      reader.onerror = () => {
          toast({ title: "Error reading file", description: "Could not read the resume file.", variant: "destructive" });
          setResumeFileName(null);
          form.setValue("resumeDataUri", undefined);
      };
      reader.readAsDataURL(file);
    } else {
      form.setValue("resumeDataUri", undefined);
      setResumeFileName(null);
    }
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      setGeneratedQuestions([]);
      const result = await generateInterviewQuestionsAction({
        jobDescription: values.jobDescription,
        numQuestions: values.numQuestions,
        resumeDataUri: values.resumeDataUri,
        interviewTitle: values.interviewTitle, // Pass title for consistency although not directly used in this action
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
          title: "Error Generating Questions",
          description: result.error || "Failed to generate questions. Please ensure your input is valid and try again.",
          variant: "destructive",
        });
      }
    });
  }

  const handleStartPractice = () => {
    localStorage.setItem('currentInterviewQuestions', JSON.stringify(generatedQuestions));
    localStorage.setItem('currentInterviewJobDescription', form.getValues('jobDescription'));
    localStorage.setItem('currentInterviewTitle', form.getValues('interviewTitle'));
    if (form.getValues('resumeDataUri')) {
      localStorage.setItem('currentInterviewResumeDataUri', form.getValues('resumeDataUri')!);
    } else {
      localStorage.removeItem('currentInterviewResumeDataUri');
    }
    router.push(`/interviews/practice-new`);
  };
  
  const handleSaveQuestionSet = () => {
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
          Generate tailored interview questions by providing a job description and optionally your resume.
        </p>
      </header>

      <Card className="shadow-lg">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
              <CardTitle>Job, Resume & Interview Details</CardTitle>
              <CardDescription>Enter the job description, optionally upload your resume, and set a title for this interview session.</CardDescription>
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
               <FormItem>
                <FormLabel>Upload Resume (Optional)</FormLabel>
                <FormControl>
                  <Input type="file" accept=".pdf,.docx,.txt" onChange={handleFileChange} className="file:text-primary file:font-medium" />
                </FormControl>
                {resumeFileName && <FormDescription>Uploaded: {resumeFileName}</FormDescription>}
                <FormDescription>PDF, DOCX, or TXT. Max 5MB. Questions will be tailored based on your resume.</FormDescription>
                {/* Hidden field for react-hook-form to track the data URI is implicitly handled by form.setValue("resumeDataUri", ...) */}
                <FormField
                    control={form.control}
                    name="resumeDataUri"
                    render={({ field }) => (
                    <FormControl>
                        <input type="hidden" {...field} />
                    </FormControl>
                    )}
                />
                {/* <FormMessage /> This would be for errors on the resumeDataUri field itself if it had direct validation */}
              </FormItem>
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
