'use server';

import { generateInterviewQuestions as genQuestionsFlow, GenerateInterviewQuestionsInput, GenerateInterviewQuestionsOutput } from '@/ai/flows/generate-interview-questions';
import { analyzeCandidatePerformance as analyzePerformanceFlow, AnalyzeCandidatePerformanceInput, AnalyzeCandidatePerformanceOutput } from '@/ai/flows/analyze-candidate-performance';
import { provideAIPoweredCoaching as provideCoachingFlow, ProvideAIPoweredCoachingInput, ProvideAIPoweredCoachingOutput } from '@/ai/flows/provide-ai-powered-coaching';
import { analyzeKeywordRelevance as analyzeKeywordFlow, AnalyzeKeywordRelevanceInput, AnalyzeKeywordRelevanceOutput } from '@/ai/flows/analyze-keyword-relevance';
import { z } from 'zod';

// Question Generation
const GenerateQuestionsSchema = z.object({
  jobDescription: z.string().min(50, "Job description must be at least 50 characters."),
  numQuestions: z.number().min(1).max(10).optional().default(5),
});

export async function generateInterviewQuestionsAction(
  values: z.infer<typeof GenerateQuestionsSchema>
): Promise<{ success: boolean; data?: GenerateInterviewQuestionsOutput; error?: string }> {
  const validatedFields = GenerateQuestionsSchema.safeParse(values);
  if (!validatedFields.success) {
    return { success: false, error: "Invalid input: " + validatedFields.error.flatten().fieldErrors.jobDescription?.join(", ") };
  }

  try {
    const input: GenerateInterviewQuestionsInput = {
      jobDescription: validatedFields.data.jobDescription,
      numQuestions: validatedFields.data.numQuestions,
    };
    const result = await genQuestionsFlow(input);
    return { success: true, data: result };
  } catch (e) {
    console.error("Error in generateInterviewQuestionsAction:", e);
    return { success: false, error: "Failed to generate questions. Please try again." };
  }
}


// Analyze Candidate Performance
const AnalyzePerformanceSchema = z.object({
  jobDescription: z.string(),
  candidateAnswers: z.array(z.string()),
});

export async function analyzeCandidatePerformanceAction(
  values: z.infer<typeof AnalyzePerformanceSchema>
): Promise<{ success: boolean; data?: AnalyzeCandidatePerformanceOutput; error?: string }> {
   const validatedFields = AnalyzePerformanceSchema.safeParse(values);
   if (!validatedFields.success) {
    return { success: false, error: "Invalid input for performance analysis." };
  }
  try {
    const result = await analyzePerformanceFlow(validatedFields.data);
    return { success: true, data: result };
  } catch (e) {
    console.error("Error in analyzeCandidatePerformanceAction:", e);
    return { success: false, error: "Failed to analyze performance." };
  }
}

// Provide AI Powered Coaching
const ProvideCoachingSchema = z.object({
  jobDescription: z.string(),
  candidateAnswer: z.string(),
  interviewQuestion: z.string(),
});

export async function provideAIPoweredCoachingAction(
  values: z.infer<typeof ProvideCoachingSchema>
): Promise<{ success: boolean; data?: ProvideAIPoweredCoachingOutput; error?: string }> {
  const validatedFields = ProvideCoachingSchema.safeParse(values);
  if (!validatedFields.success) {
    return { success: false, error: "Invalid input for coaching." };
  }
  try {
    const result = await provideCoachingFlow(validatedFields.data);
    return { success: true, data: result };
  } catch (e) {
    console.error("Error in provideAIPoweredCoachingAction:", e);
    return { success: false, error: "Failed to provide coaching." };
  }
}

// Analyze Keyword Relevance
const AnalyzeKeywordSchema = z.object({
  jobDescription: z.string(),
  candidateAnswer: z.string(),
});

export async function analyzeKeywordRelevanceAction(
  values: z.infer<typeof AnalyzeKeywordSchema>
): Promise<{ success: boolean; data?: AnalyzeKeywordRelevanceOutput; error?: string }> {
  const validatedFields = AnalyzeKeywordSchema.safeParse(values);
  if (!validatedFields.success) {
    return { success: false, error: "Invalid input for keyword analysis." };
  }
  try {
    const result = await analyzeKeywordFlow(validatedFields.data);
    return { success: true, data: result };
  } catch (e) {
    console.error("Error in analyzeKeywordRelevanceAction:", e);
    return { success: false, error: "Failed to analyze keyword relevance." };
  }
}

// Placeholder for summarization - No AI flow provided for this
export async function summarizeAnswerAction(
  answerText: string
): Promise<{ success: boolean; data?: { summary: string }; error?: string }> {
  if (!answerText || answerText.length < 50) {
    return { success: false, error: "Answer text is too short to summarize." };
  }
  // Mock summarization
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
  const summary = "This is a mock summary of the first 10 words: " + answerText.split(" ").slice(0, 10).join(" ") + "...";
  return { success: true, data: { summary } };
}
