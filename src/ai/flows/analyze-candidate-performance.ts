'use server';

/**
 * @fileOverview A flow to analyze a candidate's performance during an interview based on their recorded answers.
 *
 * - analyzeCandidatePerformance - A function that analyzes the candidate's performance.
 * - AnalyzeCandidatePerformanceInput - The input type for the analyzeCandidatePerformance function.
 * - AnalyzeCandidatePerformanceOutput - The return type for the analyzeCandidatePerformance function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeCandidatePerformanceInputSchema = z.object({
  jobDescription: z.string().describe('The job description for the role.'),
  candidateAnswers: z.array(z.string()).describe('An array of the candidate\'s answers.'),
});
export type AnalyzeCandidatePerformanceInput = z.infer<typeof AnalyzeCandidatePerformanceInputSchema>;

const AnalyzeCandidatePerformanceOutputSchema = z.object({
  overallSentiment: z.string().describe('Overall sentiment of the candidate based on their answers.'),
  confidenceLevel: z.string().describe('The perceived confidence level of the candidate.'),
  areasForImprovement: z.string().describe('Specific areas where the candidate can improve their answers or delivery.'),
});
export type AnalyzeCandidatePerformanceOutput = z.infer<typeof AnalyzeCandidatePerformanceOutputSchema>;

export async function analyzeCandidatePerformance(input: AnalyzeCandidatePerformanceInput): Promise<AnalyzeCandidatePerformanceOutput> {
  return analyzeCandidatePerformanceFlow(input);
}

const analyzePerformancePrompt = ai.definePrompt({
  name: 'analyzePerformancePrompt',
  input: {schema: AnalyzeCandidatePerformanceInputSchema},
  output: {schema: AnalyzeCandidatePerformanceOutputSchema},
  prompt: `You are an AI-powered interview analyst. Your task is to evaluate a candidate's performance based on their answers to interview questions, considering their tone, confidence level, and the content of their responses.

Job Description: {{{jobDescription}}}

Candidate Answers:
{{#each candidateAnswers}}
- {{{this}}}
{{/each}}

Analyze the candidate's performance and provide feedback in the following areas:
- Overall sentiment (positive, negative, neutral)
- Confidence level (high, medium, low)
- Areas for improvement (specific suggestions for better answers or delivery)
`,
});

const analyzeCandidatePerformanceFlow = ai.defineFlow(
  {
    name: 'analyzeCandidatePerformanceFlow',
    inputSchema: AnalyzeCandidatePerformanceInputSchema,
    outputSchema: AnalyzeCandidatePerformanceOutputSchema,
  },
  async input => {
    const {output} = await analyzePerformancePrompt(input);
    return output!;
  }
);
