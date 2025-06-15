
"use client";

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Icons, LoadingSpinner } from '@/components/icons';
import { Textarea } from '@/components/ui/textarea';
import type { Question, Answer } from '@/lib/types'; // Removed unused types
import { useToast } from '@/hooks/use-toast';
import { 
  analyzeCandidatePerformanceAction, 
  provideAIPoweredCoachingAction, 
  analyzeKeywordRelevanceAction,
  summarizeAnswerAction // Ensure this is correctly imported
} from '@/app/actions';
import { Badge } from '@/components/ui/badge';
// import { Separator } from '@/components/ui/separator'; // Not used

// Define types for feedback if not already in lib/types.ts
interface SentimentAnalysis { overallSentiment: string; confidenceLevel: string; areasForImprovement: string; }
interface CoachingFeedback { feedback: string; }
interface KeywordRelevance { relevanceAnalysis: string; }


interface FullFeedback extends Answer {
  sentiment?: SentimentAnalysis; // This might be per answer or overall. The current overallFeedback is separate.
  coaching?: CoachingFeedback;
  keywords?: KeywordRelevance;
  summary?: string;
}

export default function NewInterviewResultsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  // const [answers, setAnswers] = useState<Answer[]>([]); // No longer needed as feedbacks contains answers
  const [feedbacks, setFeedbacks] = useState<FullFeedback[]>([]);
  const [overallFeedback, setOverallFeedback] = useState<SentimentAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true); // For initial data load and overall analysis
  const [isAnalyzingQuestion, startPerQuestionTransition] = useTransition(); // For per-question analysis like summary
  const [interviewTitle, setInterviewTitle] = useState("Interview Results");
  const [jobDescription, setJobDescription] = useState<string | null>(null);
  // const [resumeDataUri, setResumeDataUri] = useState<string | null>(null); // If needed for display

  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const storedQuestions = localStorage.getItem('interviewResults_questions');
    const storedAnswers = localStorage.getItem('interviewResults_answers');
    const storedTitle = localStorage.getItem('interviewResults_title');
    const storedJobDesc = localStorage.getItem('interviewResults_jobDescription');
    // const storedResumeUri = localStorage.getItem('interviewResults_resumeDataUri'); // Load if needed

    if (storedQuestions && storedAnswers) {
      const parsedQuestions: Question[] = JSON.parse(storedQuestions);
      const parsedAnswers: Answer[] = JSON.parse(storedAnswers);
      setQuestions(parsedQuestions);
      // setAnswers(parsedAnswers); // Not needed directly
      if (storedTitle) setInterviewTitle(storedTitle);
      if (storedJobDesc) setJobDescription(storedJobDesc);
      // if (storedResumeUri) setResumeDataUri(storedResumeUri);
      
      setFeedbacks(parsedAnswers.map(ans => ({ ...ans }))); // Initialize feedbacks
      
      analyzeAll(parsedQuestions, parsedAnswers, storedJobDesc || "");
    } else {
      toast({ title: "Error", description: "Could not load interview data. Redirecting to dashboard.", variant: "destructive" });
      router.push('/dashboard');
    }
  }, [router, toast]);

  const analyzeAll = async (qs: Question[], ans: Answer[], jobDesc: string) => {
    setIsLoading(true); // This controls the main loading/analyzing state for overall feedback
    // For per-question feedback, we can use isAnalyzingQuestion or similar state per item
    try {
      // Overall performance
      if (ans.length > 0) {
        const overallPerfInput = { jobDescription: jobDesc, candidateAnswers: ans.map(a => a.transcript) };
        const overallResult = await analyzeCandidatePerformanceAction(overallPerfInput);
        if (overallResult.success && overallResult.data) {
          setOverallFeedback(overallResult.data);
        } else {
          toast({ title: "Overall Analysis Error", description: overallResult.error || "Failed to get overall analysis.", variant: "destructive" });
        }
      } else {
         setOverallFeedback({ overallSentiment: "N/A", confidenceLevel: "N/A", areasForImprovement: "No answers submitted for overall analysis."});
      }

      // Per-question analysis (Coaching and Keywords)
      const feedbackPromises = ans.map(async (answerData) => {
        const questionText = qs.find(q => q.id === answerData.questionId)?.text || "";
        let currentFeedback: FullFeedback = { ...answerData };

        const coachingInput = { jobDescription: jobDesc, candidateAnswer: answerData.transcript, interviewQuestion: questionText };
        const coachingRes = await provideAIPoweredCoachingAction(coachingInput);
        if (coachingRes.success) currentFeedback.coaching = coachingRes.data;

        const keywordInput = { jobDescription: jobDesc, candidateAnswer: answerData.transcript };
        const keywordRes = await analyzeKeywordRelevanceAction(keywordInput);
        if (keywordRes.success) currentFeedback.keywords = keywordRes.data;
        
        return currentFeedback;
      });

      const settledFeedbacks = await Promise.all(feedbackPromises);
      setFeedbacks(settledFeedbacks);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred during analysis.";
      toast({ title: "Analysis Failed", description: errorMessage, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditTranscript = (questionId: string, newTranscript: string) => {
    setFeedbacks(prev => prev.map(fb => fb.questionId === questionId ? { ...fb, transcript: newTranscript, summary: undefined } : fb));
    // Optionally, clear summary and prompt for re-analysis or re-summarization
    toast({ title: "Transcript Updated", description: "Remember to re-analyze or re-summarize if needed.", variant: "default" });
  };
  
  const handleSummarize = async (questionId: string) => {
     const feedbackItem = feedbacks.find(fb => fb.questionId === questionId);
     if (!feedbackItem || !feedbackItem.transcript) {
        toast({ title: "Cannot Summarize", description: "Answer transcript is empty.", variant: "destructive" });
        return;
     }

     startPerQuestionTransition(async () => {
        setFeedbacks(prev => prev.map(fb => fb.questionId === questionId ? { ...fb, summary: "Summarizing..." } : fb));
        const result = await summarizeAnswerAction(feedbackItem.transcript);
        if (result.success && result.data) {
          setFeedbacks(prev => prev.map(fb => fb.questionId === questionId ? { ...fb, summary: result.data.summary } : fb));
          toast({ title: "Summary Generated", description: "Answer summary created successfully." });
        } else {
          setFeedbacks(prev => prev.map(fb => fb.questionId === questionId ? { ...fb, summary: "Error summarizing." } : fb));
          toast({ title: "Summarization Failed", description: result.error || "Could not generate summary.", variant: "destructive" });
        }
     });
  };


  if (isLoading && feedbacks.length === 0) { 
    return <div className="flex flex-col items-center justify-center h-full"><LoadingSpinner className="h-12 w-12 text-primary mb-4" /><p>Loading interview data and performing initial analysis...</p></div>;
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

      {isLoading && !overallFeedback && ( // Show analyzing spinner if overall feedback is not yet available
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
                <Badge variant={overallFeedback.overallSentiment?.toLowerCase() === 'positive' ? 'default' : overallFeedback.overallSentiment?.toLowerCase() === 'neutral' ? 'secondary' : 'destructive'} 
                       className="text-lg px-3 py-1">
                  {overallFeedback.overallSentiment || "N/A"}
                </Badge>
              </div>
              <div className="p-4 bg-background/70 rounded-lg border">
                <h3 className="font-semibold text-sm text-muted-foreground mb-1">Confidence Level</h3>
                <Badge variant="outline" className="text-lg px-3 py-1 border-primary text-primary">{overallFeedback.confidenceLevel || "N/A"}</Badge>
              </div>
            </div>
            <div className="p-4 bg-background/70 rounded-lg border">
              <h3 className="font-semibold text-sm text-muted-foreground mb-1">Key Areas for Improvement</h3>
              <p className="text-foreground whitespace-pre-wrap">{overallFeedback.areasForImprovement || "No specific areas highlighted."}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Accordion type="single" collapsible className="w-full space-y-4">
        {questions.map((question, index) => {
          const feedbackItem = feedbacks.find(fb => fb.questionId === question.id);
          return (
            <AccordionItem value={`item-${index}`} key={question.id} className="bg-card shadow-md rounded-lg overflow-hidden">
              <AccordionTrigger className="px-6 py-4 hover:bg-secondary/30 transition-colors text-left">
                <div className="flex items-start gap-3">
                  <span className="text-primary font-bold shrink-0">{index + 1}.</span>
                  <span className="font-semibold flex-1">{question.text}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 py-4 border-t">
                {!feedbackItem && isLoading && <div className="flex items-center text-muted-foreground"><LoadingSpinner className="mr-2 h-4 w-4"/>Loading feedback...</div>}
                {feedbackItem && (
                  <Tabs defaultValue="answer" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-4">
                      <TabsTrigger value="answer"><Icons.transcript className="mr-1.5 h-4 w-4"/> Answer</TabsTrigger>
                      <TabsTrigger value="coaching" disabled={isLoading || !feedbackItem.coaching}><Icons.feedback className="mr-1.5 h-4 w-4"/> Coaching</TabsTrigger>
                      <TabsTrigger value="keywords" disabled={isLoading || !feedbackItem.keywords}><Icons.target className="mr-1.5 h-4 w-4"/> Keywords</TabsTrigger>
                      <TabsTrigger value="summary" disabled={isLoading || !feedbackItem.transcript}><Icons.editPencil className="mr-1.5 h-4 w-4"/> Summary</TabsTrigger>
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
                      {isLoading && !feedbackItem.coaching && <div className="flex items-center text-muted-foreground"><LoadingSpinner className="mr-2 h-4 w-4"/>Analyzing...</div>}
                      {feedbackItem.coaching ? (
                        <p className="text-sm whitespace-pre-wrap">{feedbackItem.coaching.feedback}</p>
                      ) : !isLoading && <p className="text-sm text-muted-foreground">Coaching feedback not available or still processing.</p>}
                    </TabsContent>

                    <TabsContent value="keywords" className="space-y-2">
                       <h4 className="font-semibold">Keyword Relevance:</h4>
                      {isLoading && !feedbackItem.keywords && <div className="flex items-center text-muted-foreground"><LoadingSpinner className="mr-2 h-4 w-4"/>Analyzing...</div>}
                      {feedbackItem.keywords ? (
                        <p className="text-sm whitespace-pre-wrap">{feedbackItem.keywords.relevanceAnalysis}</p>
                      ) : !isLoading && <p className="text-sm text-muted-foreground">Keyword analysis not available or still processing.</p>}
                    </TabsContent>
                    
                    <TabsContent value="summary" className="space-y-3">
                      <div className="flex justify-between items-center">
                        <h4 className="font-semibold">Answer Summary:</h4>
                        <Button size="sm" variant="outline" onClick={() => handleSummarize(question.id)} disabled={isAnalyzingQuestion || !feedbackItem.transcript}>
                          {(isAnalyzingQuestion && feedbackItem.summary === "Summarizing...") ? <LoadingSpinner className="mr-2 h-4 w-4"/> : <Icons.generate className="mr-2 h-4 w-4"/>}
                           {feedbackItem.summary ? "Regenerate" : "Generate Summary"}
                        </Button>
                      </div>
                      {(isAnalyzingQuestion && feedbackItem.summary === "Summarizing...") && <div className="flex items-center text-muted-foreground"><LoadingSpinner className="mr-2 h-4 w-4"/>Summarizing...</div>}
                      {feedbackItem.summary && feedbackItem.summary !== "Summarizing..." && feedbackItem.summary !== "Error summarizing." ? (
                        <p className="text-sm bg-secondary/30 p-3 rounded-md whitespace-pre-wrap">{feedbackItem.summary}</p>
                      ) : feedbackItem.summary === "Error summarizing." ? (
                        <p className="text-sm text-destructive p-3 rounded-md">{feedbackItem.summary}</p>
                      ): !isAnalyzingQuestion && <p className="text-sm text-muted-foreground">Summary not yet generated. Click button to generate.</p>}
                    </TabsContent>

                  </Tabs>
                )}
                 {!feedbackItem && !isLoading && <p className="text-muted-foreground">No answer submitted for this question.</p>}
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
