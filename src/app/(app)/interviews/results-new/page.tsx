"use client";

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Icons, LoadingSpinner } from '@/components/icons';
import { Textarea } from '@/components/ui/textarea';
import type { Question, Answer, SentimentAnalysis, CoachingFeedback, KeywordRelevance } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { 
  analyzeCandidatePerformanceAction, 
  provideAIPoweredCoachingAction, 
  analyzeKeywordRelevanceAction,
  summarizeAnswerAction
} from '@/app/actions';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface FullFeedback extends Answer {
  sentiment?: SentimentAnalysis;
  coaching?: CoachingFeedback;
  keywords?: KeywordRelevance;
  summary?: string;
}

export default function NewInterviewResultsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [feedbacks, setFeedbacks] = useState<FullFeedback[]>([]);
  const [overallFeedback, setOverallFeedback] = useState<SentimentAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, startTransition] = useTransition();
  const [interviewTitle, setInterviewTitle] = useState("Interview Results");
  const [jobDescription, setJobDescription] = useState<string | null>(null);

  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const storedQuestions = localStorage.getItem('interviewResults_questions');
    const storedAnswers = localStorage.getItem('interviewResults_answers');
    const storedTitle = localStorage.getItem('interviewResults_title');
    const storedJobDesc = localStorage.getItem('interviewResults_jobDescription');

    if (storedQuestions && storedAnswers) {
      const parsedQuestions: Question[] = JSON.parse(storedQuestions);
      const parsedAnswers: Answer[] = JSON.parse(storedAnswers);
      setQuestions(parsedQuestions);
      setAnswers(parsedAnswers);
      if (storedTitle) setInterviewTitle(storedTitle);
      if (storedJobDesc) setJobDescription(storedJobDesc);
      
      // Initialize feedbacks with answers
      setFeedbacks(parsedAnswers.map(ans => ({ ...ans })));
      
      // Trigger analysis
      analyzeAll(parsedQuestions, parsedAnswers, storedJobDesc || "");
    } else {
      toast({ title: "Error", description: "Could not load interview data.", variant: "destructive" });
      router.push('/dashboard');
    }
    // Clean up local storage after loading
    // localStorage.removeItem('interviewResults_questions');
    // localStorage.removeItem('interviewResults_answers');
    // localStorage.removeItem('interviewResults_title');
    // localStorage.removeItem('interviewResults_jobDescription');
  }, [router, toast]);

  const analyzeAll = async (qs: Question[], ans: Answer[], jobDesc: string) => {
    setIsLoading(true);
    startTransition(async () => {
      try {
        // Overall performance
        const overallPerfInput = { jobDescription: jobDesc, candidateAnswers: ans.map(a => a.transcript) };
        const overallResult = await analyzeCandidatePerformanceAction(overallPerfInput);
        if (overallResult.success && overallResult.data) {
          setOverallFeedback(overallResult.data);
        } else {
          toast({ title: "Overall Analysis Error", description: overallResult.error, variant: "destructive" });
        }

        // Per-question analysis
        const feedbackPromises = ans.map(async (answerData, index) => {
          const questionText = qs.find(q => q.id === answerData.questionId)?.text || "";
          let currentFeedback: FullFeedback = { ...answerData };

          const coachingInput = { jobDescription: jobDesc, candidateAnswer: answerData.transcript, interviewQuestion: questionText };
          const coachingRes = await provideAIPoweredCoachingAction(coachingInput);
          if (coachingRes.success) currentFeedback.coaching = coachingRes.data;

          const keywordInput = { jobDescription: jobDesc, candidateAnswer: answerData.transcript };
          const keywordRes = await analyzeKeywordRelevanceAction(keywordInput);
          if (keywordRes.success) currentFeedback.keywords = keywordRes.data;
          
          // Individual sentiment (if needed, or use overall)
          // For now, individual sentiment analysis is skipped to simplify. Using overall sentiment.

          return currentFeedback;
        });

        const settledFeedbacks = await Promise.all(feedbackPromises);
        setFeedbacks(settledFeedbacks);

      } catch (error) {
        toast({ title: "Analysis Failed", description: "An unexpected error occurred during analysis.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    });
  };

  const handleEditTranscript = (questionId: string, newTranscript: string) => {
    setFeedbacks(prev => prev.map(fb => fb.questionId === questionId ? { ...fb, transcript: newTranscript } : fb));
    // Potentially re-trigger analysis for this specific answer if desired
  };
  
  const handleSummarize = async (questionId: string) => {
     const feedbackItem = feedbacks.find(fb => fb.questionId === questionId);
     if (!feedbackItem) return;

     startTransition(async () => {
        const result = await summarizeAnswerAction(feedbackItem.transcript);
        if (result.success && result.data) {
          setFeedbacks(prev => prev.map(fb => fb.questionId === questionId ? { ...fb, summary: result.data.summary } : fb));
          toast({ title: "Summary Generated", description: "Answer summary created successfully." });
        } else {
          toast({ title: "Summarization Failed", description: result.error, variant: "destructive" });
        }
     });
  };


  if (isLoading && feedbacks.length === 0) { // Show initial loading spinner
    return <div className="flex flex-col items-center justify-center h-full"><LoadingSpinner className="h-12 w-12 text-primary mb-4" /><p>Loading interview data...</p></div>;
  }
  
  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">{interviewTitle}</h1>
          <p className="text-muted-foreground">Detailed feedback on your performance.</p>
        </div>
        <Button onClick={() => router.push('/dashboard')} variant="outline">
          <Icons.home className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>
      </header>

      {isAnalyzing && !overallFeedback && ( // Show analyzing spinner
         <Card className="shadow-lg">
          <CardContent className="p-10 flex flex-col items-center justify-center">
            <LoadingSpinner className="h-10 w-10 text-primary mb-4" />
            <p className="text-lg font-semibold">AI is analyzing your performance...</p>
            <p className="text-muted-foreground">This might take a few moments.</p>
          </CardContent>
        </Card>
      )}

      {overallFeedback && (
        <Card className="shadow-lg bg-gradient-to-br from-primary/5 via-background to-accent/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl font-headline text-primary">
              <Icons.analysis className="h-7 w-7" /> Overall Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-background/70 rounded-lg border">
                <h3 className="font-semibold text-sm text-muted-foreground mb-1">Overall Sentiment</h3>
                <Badge variant={overallFeedback.overallSentiment.toLowerCase() === 'positive' ? 'default' : overallFeedback.overallSentiment.toLowerCase() === 'neutral' ? 'secondary' : 'destructive'} 
                       className="text-lg px-3 py-1">
                  {overallFeedback.overallSentiment}
                </Badge>
              </div>
              <div className="p-4 bg-background/70 rounded-lg border">
                <h3 className="font-semibold text-sm text-muted-foreground mb-1">Confidence Level</h3>
                <Badge variant="outline" className="text-lg px-3 py-1 border-primary text-primary">{overallFeedback.confidenceLevel}</Badge>
              </div>
            </div>
            <div className="p-4 bg-background/70 rounded-lg border">
              <h3 className="font-semibold text-sm text-muted-foreground mb-1">Key Areas for Improvement</h3>
              <p className="text-foreground">{overallFeedback.areasForImprovement}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Accordion type="single" collapsible className="w-full space-y-4">
        {questions.map((question, index) => {
          const feedbackItem = feedbacks.find(fb => fb.questionId === question.id);
          return (
            <AccordionItem value={`item-${index}`} key={question.id} className="bg-card shadow-md rounded-lg overflow-hidden">
              <AccordionTrigger className="px-6 py-4 hover:bg-secondary/30 transition-colors">
                <div className="flex items-center gap-3 text-left">
                  <span className="text-primary font-bold">{index + 1}.</span>
                  <span className="font-semibold flex-1">{question.text}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 py-4 border-t">
                {feedbackItem ? (
                  <Tabs defaultValue="answer" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-4">
                      <TabsTrigger value="answer"><Icons.transcript className="mr-1.5 h-4 w-4"/> Answer</TabsTrigger>
                      <TabsTrigger value="coaching" disabled={isAnalyzing || !feedbackItem.coaching}><Icons.feedback className="mr-1.5 h-4 w-4"/> Coaching</TabsTrigger>
                      <TabsTrigger value="keywords" disabled={isAnalyzing || !feedbackItem.keywords}><Icons.target className="mr-1.5 h-4 w-4"/> Keywords</TabsTrigger>
                      <TabsTrigger value="summary" disabled={isAnalyzing || !feedbackItem.transcript}><Icons.editPencil className="mr-1.5 h-4 w-4"/> Summary</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="answer" className="space-y-3">
                      <h4 className="font-semibold">Your Answer:</h4>
                      <Textarea 
                        defaultValue={feedbackItem.transcript} 
                        onBlur={(e) => handleEditTranscript(question.id, e.target.value)}
                        className="min-h-[150px] text-base"
                        aria-label={`Transcript for question ${index + 1}`}
                      />
                       <p className="text-xs text-muted-foreground">Duration: {new Date((feedbackItem.duration || 0) * 1000).toISOString().substr(14, 5)}</p>
                    </TabsContent>

                    <TabsContent value="coaching" className="space-y-2">
                       <h4 className="font-semibold">AI Coaching:</h4>
                      {isAnalyzing && !feedbackItem.coaching && <div className="flex items-center text-muted-foreground"><LoadingSpinner className="mr-2 h-4 w-4"/>Analyzing...</div>}
                      {feedbackItem.coaching ? (
                        <p className="text-sm whitespace-pre-wrap">{feedbackItem.coaching.feedback}</p>
                      ) : !isAnalyzing && <p className="text-sm text-muted-foreground">Coaching feedback not available.</p>}
                    </TabsContent>

                    <TabsContent value="keywords" className="space-y-2">
                       <h4 className="font-semibold">Keyword Relevance:</h4>
                      {isAnalyzing && !feedbackItem.keywords && <div className="flex items-center text-muted-foreground"><LoadingSpinner className="mr-2 h-4 w-4"/>Analyzing...</div>}
                      {feedbackItem.keywords ? (
                        <p className="text-sm whitespace-pre-wrap">{feedbackItem.keywords.relevanceAnalysis}</p>
                      ) : !isAnalyzing && <p className="text-sm text-muted-foreground">Keyword analysis not available.</p>}
                    </TabsContent>
                    
                    <TabsContent value="summary" className="space-y-3">
                      <div className="flex justify-between items-center">
                        <h4 className="font-semibold">Answer Summary:</h4>
                        <Button size="sm" variant="outline" onClick={() => handleSummarize(question.id)} disabled={isAnalyzing}>
                          {isAnalyzing && feedbackItem.summary === undefined ? <LoadingSpinner className="mr-2 h-4 w-4"/> : <Icons.generate className="mr-2 h-4 w-4"/>}
                           Generate Summary
                        </Button>
                      </div>
                      {isAnalyzing && feedbackItem.summary === undefined && <div className="flex items-center text-muted-foreground"><LoadingSpinner className="mr-2 h-4 w-4"/>Summarizing...</div>}
                      {feedbackItem.summary ? (
                        <p className="text-sm bg-secondary/30 p-3 rounded-md whitespace-pre-wrap">{feedbackItem.summary}</p>
                      ) : !isAnalyzing && <p className="text-sm text-muted-foreground">Summary not yet generated. Click button to generate.</p>}
                    </TabsContent>

                  </Tabs>
                ) : (
                  <p className="text-muted-foreground">Feedback is being processed for this answer.</p>
                )}
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
      <CardFooter className="mt-8 flex justify-center">
        <Button onClick={() => router.push('/interviews/new')} size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Icons.add className="mr-2 h-5 w-5" /> Practice Another Interview
        </Button>
      </CardFooter>
    </div>
  );
}
