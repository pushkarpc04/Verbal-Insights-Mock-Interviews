"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons, LoadingSpinner } from "@/components/icons";
import type { Question, Answer } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function PracticeNewInterviewPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [interviewTitle, setInterviewTitle] = useState("Practice Session");
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(()_ => {
    const storedQuestions = localStorage.getItem('currentInterviewQuestions');
    const storedTitle = localStorage.getItem('currentInterviewTitle');
    if (storedQuestions) {
      setQuestions(JSON.parse(storedQuestions));
    }
    if (storedTitle) {
      setInterviewTitle(storedTitle);
    }
    setIsLoading(false);
    // Clean up local storage for next session (optional)
    // localStorage.removeItem('currentInterviewQuestions');
    // localStorage.removeItem('currentInterviewJobDescription');
    // localStorage.removeItem('currentInterviewTitle');
  }, []);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prevTime => prevTime + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const handleStartRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    // Add actual audio recording logic here if needed
    // For now, it just starts a timer and allows text input
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    // Process recording/transcript here
  };

  const handleNextQuestion = () => {
    if (isRecording) handleStopRecording();
    
    const newAnswer: Answer = {
      questionId: questions[currentQuestionIndex].id,
      transcript: currentAnswer,
      duration: recordingTime,
    };
    setAnswers(prev => [...prev, newAnswer]);
    
    setCurrentAnswer("");
    setRecordingTime(0);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Last question answered, show finish dialog or redirect
      handleFinishInterview([...answers, newAnswer]);
    }
  };
  
  const handleFinishInterview = (finalAnswers?: Answer[]) => {
    const allAnswers = finalAnswers || answers;
    if (allAnswers.length !== questions.length && !finalAnswers?.find(a => a.questionId === questions[currentQuestionIndex].id)) {
       // If finishing before answering the last question, save the current one.
      const lastAnswer: Answer = {
        questionId: questions[currentQuestionIndex].id,
        transcript: currentAnswer,
        duration: recordingTime,
      };
       allAnswers.push(lastAnswer);
    }


    setIsSubmitting(true);
    // Simulate submission and analysis
    localStorage.setItem('interviewResults_questions', JSON.stringify(questions));
    localStorage.setItem('interviewResults_answers', JSON.stringify(allAnswers));
    localStorage.setItem('interviewResults_title', interviewTitle);
    const jobDesc = localStorage.getItem('currentInterviewJobDescription');
    if(jobDesc) localStorage.setItem('interviewResults_jobDescription', jobDesc);


    toast({ title: "Processing Interview...", description: "Analyzing your answers. This may take a moment." });
    
    setTimeout(() => {
      setIsSubmitting(false);
      router.push(`/interviews/results-new`);
    }, 2000); // Simulate delay for AI processing
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-full"><LoadingSpinner className="h-12 w-12 text-primary" /></div>;
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-xl text-muted-foreground">No questions loaded for this session.</p>
        <Button asChild className="mt-4"><Link href="/interviews/new">Start a New Interview</Link></Button>
      </div>
    );
  }

  const currentQ = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card className="shadow-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary to-accent text-primary-foreground p-6">
          <CardTitle className="text-2xl font-headline">{interviewTitle}</CardTitle>
          <CardDescription className="text-primary-foreground/80">
            Question {currentQuestionIndex + 1} of {questions.length}
          </CardDescription>
          <Progress value={progress} className="mt-2 h-2 [&>*]:bg-primary-foreground" />
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-3 font-headline text-primary">
              {currentQ.text}
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Take your time to think, then record your answer.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Button 
                onClick={isRecording ? handleStopRecording : handleStartRecording}
                variant={isRecording ? "destructive" : "default"}
                className="min-w-[150px]"
                aria-label={isRecording ? "Stop recording" : "Start recording"}
              >
                {isRecording ? <Icons.pause className="mr-2 h-5 w-5" /> : <Icons.mic className="mr-2 h-5 w-5" />}
                {isRecording ? "Stop Recording" : "Start Recording"}
              </Button>
              {isRecording && (
                <div className="flex items-center gap-2 text-destructive">
                  <div className="h-3 w-3 bg-destructive rounded-full animate-pulse"></div>
                  <span>{new Date(recordingTime * 1000).toISOString().substr(14, 5)}</span>
                </div>
              )}
            </div>
            <Textarea
              placeholder="Your answer will appear here (or type directly if not recording audio)..."
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              className="min-h-[200px] resize-y text-base border-2 focus:border-primary transition-colors duration-300"
              aria-label="Your answer transcript"
              disabled={isSubmitting}
            />
          </div>
        </CardContent>

        <CardFooter className="flex justify-between p-6 bg-secondary/20">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" disabled={isSubmitting}>
                <Icons.stop className="mr-2 h-5 w-5" /> End Interview
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Are you sure you want to end the interview?</DialogTitle>
                <DialogDescription>
                  Any unsaved answers for the current question will be lost. Your completed answers will be submitted for analysis.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="ghost" onClick={() => (document.querySelector('[data-radix-dialog-close]') as HTMLElement)?.click()}>Cancel</Button>
                <Button variant="destructive" onClick={() => handleFinishInterview()} disabled={isSubmitting}>
                  {isSubmitting && <LoadingSpinner className="mr-2 h-4 w-4" />}
                  Yes, End Interview
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button 
            onClick={handleNextQuestion} 
            disabled={!currentAnswer && !isRecording || isSubmitting}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
            aria-label={currentQuestionIndex < questions.length - 1 ? "Next Question" : "Finish and Submit"}
          >
            {isSubmitting && <LoadingSpinner className="mr-2 h-4 w-4" />}
            {currentQuestionIndex < questions.length - 1 ? "Next Question" : "Finish & Submit"}
            {currentQuestionIndex < questions.length - 1 && <Icons.next className="ml-2 h-5 w-5" />}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
