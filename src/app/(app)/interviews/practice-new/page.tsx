
"use client";

import { useState, useEffect, useRef } from "react";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function PracticeNewInterviewPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isRecording, setIsRecording] = useState(false); // This now primarily controls timer/UI state
  const [recordingTime, setRecordingTime] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [interviewTitle, setInterviewTitle] = useState("Practice Session");
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const getCameraPermission = async () => {
      if (typeof navigator !== "undefined" && navigator.mediaDevices) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          setHasCameraPermission(true);
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (error) {
          console.error('Error accessing camera:', error);
          setHasCameraPermission(false);
          toast({
            variant: 'destructive',
            title: 'Camera Access Denied',
            description: 'Please enable camera permissions in your browser settings to display video.',
          });
        }
      } else {
        setHasCameraPermission(false);
        toast({
            variant: 'destructive',
            title: 'Camera Not Supported',
            description: 'Your browser does not support camera access or you are in an insecure context.',
          });
      }
    };
    getCameraPermission();

    return () => {
      // Cleanup: stop camera stream when component unmounts
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [toast]);

  useEffect(() => {
    const storedQuestions = localStorage.getItem('currentInterviewQuestions');
    const storedTitle = localStorage.getItem('currentInterviewTitle');
    if (storedQuestions) {
      setQuestions(JSON.parse(storedQuestions));
    }
    if (storedTitle) {
      setInterviewTitle(storedTitle);
    }
    setIsLoading(false);
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
    // Actual audio recording logic could be added here
  };

  const handleStopRecording = () => {
    setIsRecording(false);
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
      handleFinishInterview([...answers, newAnswer]);
    }
  };
  
  const handleFinishInterview = (finalAnswers?: Answer[]) => {
    let allAnswers = finalAnswers || [...answers]; // Create a mutable copy
    if (currentAnswer && questions[currentQuestionIndex] && !allAnswers.find(a => a.questionId === questions[currentQuestionIndex].id)) {
      const lastAnswer: Answer = {
        questionId: questions[currentQuestionIndex].id,
        transcript: currentAnswer,
        duration: recordingTime,
      };
       allAnswers.push(lastAnswer);
    }

    setIsSubmitting(true);
    localStorage.setItem('interviewResults_questions', JSON.stringify(questions));
    localStorage.setItem('interviewResults_answers', JSON.stringify(allAnswers));
    localStorage.setItem('interviewResults_title', interviewTitle);
    const jobDesc = localStorage.getItem('currentInterviewJobDescription');
    if(jobDesc) localStorage.setItem('interviewResults_jobDescription', jobDesc);
    const resumeUri = localStorage.getItem('currentInterviewResumeDataUri');
    if(resumeUri) localStorage.setItem('interviewResults_resumeDataUri', resumeUri);


    toast({ title: "Processing Interview...", description: "Analyzing your answers. This may take a moment." });
    
    setTimeout(() => {
      setIsSubmitting(false);
      router.push(`/interviews/results-new`);
    }, 2000); 
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
          <div className="mb-4">
            <video ref={videoRef} className="w-full aspect-video rounded-md bg-muted border" autoPlay muted playsInline />
            {hasCameraPermission === false && (
              <Alert variant="destructive" className="mt-2">
                <Icons.warning className="h-4 w-4" />
                <AlertTitle>Camera Access Required</AlertTitle>
                <AlertDescription>
                  Please allow camera access in your browser settings to display video. Refresh the page after granting permission.
                </AlertDescription>
              </Alert>
            )}
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3 font-headline text-primary">
              {currentQ.text}
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Think about your answer, then use the controls below to simulate responding.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Button 
                onClick={isRecording ? handleStopRecording : handleStartRecording}
                variant={isRecording ? "destructive" : "default"}
                className="min-w-[160px]"
                aria-label={isRecording ? "Stop timer" : "Start timer"}
              >
                {isRecording ? <Icons.pause className="mr-2 h-5 w-5" /> : <Icons.play className="mr-2 h-5 w-5" />}
                {isRecording ? "Stop Answering" : "Start Answering"}
              </Button>
              {isRecording && (
                <div className="flex items-center gap-2 text-destructive animate-pulse">
                  <Icons.mic className="h-5 w-5" />
                  <span>{new Date(recordingTime * 1000).toISOString().substr(14, 5)}</span>
                </div>
              )}
            </div>
            <Textarea
              placeholder="You can type your answer or key points here..."
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              className="min-h-[150px] resize-y text-base border-2 focus:border-primary transition-colors duration-300"
              aria-label="Your answer notes"
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
                  Your completed answers will be submitted for analysis. If you are currently answering a question, that answer will also be saved.
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
            disabled={(!currentAnswer && !isRecording && questions.length > 0) || isSubmitting}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
            aria-label={currentQuestionIndex < questions.length - 1 ? "Next Question" : "Finish and Submit"}
          >
            {isSubmitting && currentQuestionIndex === questions.length -1 && <LoadingSpinner className="mr-2 h-4 w-4" />}
            {currentQuestionIndex < questions.length - 1 ? "Next Question" : "Finish & Submit"}
            {currentQuestionIndex < questions.length - 1 && <Icons.next className="ml-2 h-5 w-5" />}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
