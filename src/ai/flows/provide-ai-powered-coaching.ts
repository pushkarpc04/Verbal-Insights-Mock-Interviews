// 'use server';

/**
 * @fileOverview Provides AI-powered coaching and personalized advice on how to improve interview responses.
 *
 * - provideAIPoweredCoaching - A function that provides coaching on interview responses.
 * - ProvideAIPoweredCoachingInput - The input type for the provideAIPoweredCoaching function.
 * - ProvideAIPoweredCoachingOutput - The return type for the provideAIPoweredCoaching function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProvideAIPoweredCoachingInputSchema = z.object({
  jobDescription: z.string().describe('The job description for the role.'),
  candidateAnswer: z.string().describe('The candidate\'s answer to the interview question.'),
  interviewQuestion: z.string().describe('The interview question asked.'),
});

export type ProvideAIPoweredCoachingInput = z.infer<typeof ProvideAIPoweredCoachingInputSchema>;

const ProvideAIPoweredCoachingOutputSchema = z.object({
  feedback: z.string().describe('Personalized advice on how to improve the interview response.'),
});

export type ProvideAIPoweredCoachingOutput = z.infer<typeof ProvideAIPoweredCoachingOutputSchema>;

export async function provideAIPoweredCoaching(input: ProvideAIPoweredCoachingInput): Promise<ProvideAIPoweredCoachingOutput> {
  return provideAIPoweredCoachingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'provideAIPoweredCoachingPrompt',
  input: {schema: ProvideAIPoweredCoachingInputSchema},
  output: {schema: ProvideAIPoweredCoachingOutputSchema},
  prompt: `You are an expert interview coach providing feedback to candidates.

  Based on the job description, interview question, and the candidate's answer, provide actionable and personalized advice on how to improve their response.
  Offer specific suggestions for elaboration, conciseness, and example strengthening.

  Job Description: {{{jobDescription}}}
  Interview Question: {{{interviewQuestion}}}
  Candidate's Answer: {{{candidateAnswer}}}

  Focus on how the candidate can:
  * More effectively address the question.
  * Strengthen their examples with more detail.
  * Refine their delivery for better impact.
  * Be more concise
`,
});

const provideAIPoweredCoachingFlow = ai.defineFlow(
  {
    name: 'provideAIPoweredCoachingFlow',
    inputSchema: ProvideAIPoweredCoachingInputSchema,
    outputSchema: ProvideAIPoweredCoachingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
