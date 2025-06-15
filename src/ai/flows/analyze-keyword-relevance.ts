'use server';
/**
 * @fileOverview This file defines a Genkit flow for analyzing the keyword relevance of a candidate's answers
 * to a given job description.
 *
 * - analyzeKeywordRelevance - A function that analyzes the keyword relevance.
 * - AnalyzeKeywordRelevanceInput - The input type for the analyzeKeywordRelevance function.
 * - AnalyzeKeywordRelevanceOutput - The return type for the analyzeKeywordRelevance function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeKeywordRelevanceInputSchema = z.object({
  jobDescription: z
    .string()
    .describe('The job description to compare the answer against.'),
  candidateAnswer: z.string().describe('The candidate answer to be analyzed.'),
});
export type AnalyzeKeywordRelevanceInput = z.infer<
  typeof AnalyzeKeywordRelevanceInputSchema
>;

const AnalyzeKeywordRelevanceOutputSchema = z.object({
  relevanceAnalysis: z
    .string()
    .describe(
      'An analysis of the candidate answer in terms of keyword and concept relevance to the job description, highlighting areas for improvement.'
    ),
});
export type AnalyzeKeywordRelevanceOutput = z.infer<
  typeof AnalyzeKeywordRelevanceOutputSchema
>;

export async function analyzeKeywordRelevance(
  input: AnalyzeKeywordRelevanceInput
): Promise<AnalyzeKeywordRelevanceOutput> {
  return analyzeKeywordRelevanceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeKeywordRelevancePrompt',
  input: {schema: AnalyzeKeywordRelevanceInputSchema},
  output: {schema: AnalyzeKeywordRelevanceOutputSchema},
  prompt: `You are an expert interview analyst. Your task is to analyze a candidate's answer in terms of its relevance to the provided job description. Highlight areas where the candidate effectively uses keywords and concepts from the job description, and identify areas where the candidate could better align their language with the job description. Provide actionable feedback on how the candidate can improve their answer by incorporating key terms and concepts from the job description.

Job Description: {{{jobDescription}}}

Candidate Answer: {{{candidateAnswer}}}

Relevance Analysis:`,
});

const analyzeKeywordRelevanceFlow = ai.defineFlow(
  {
    name: 'analyzeKeywordRelevanceFlow',
    inputSchema: AnalyzeKeywordRelevanceInputSchema,
    outputSchema: AnalyzeKeywordRelevanceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
