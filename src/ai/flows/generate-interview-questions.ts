
'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating interview questions based on a job description and optionally a candidate's resume.
 *
 * generateInterviewQuestions - A function that generates interview questions.
 * GenerateInterviewQuestionsInput - The input type for the generateInterviewQuestions function.
 * GenerateInterviewQuestionsOutput - The return type for the generateInterviewQuestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateInterviewQuestionsInputSchema = z.object({
  jobDescription: z.string().describe('The job description to generate interview questions for.'),
  numQuestions: z.number().default(5).describe('The number of interview questions to generate.'),
  resumeDataUri: z.string().optional().describe("The candidate's resume as a data URI if provided. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});

export type GenerateInterviewQuestionsInput = z.infer<typeof GenerateInterviewQuestionsInputSchema>;

const GenerateInterviewQuestionsOutputSchema = z.object({
  questions: z.array(z.string()).describe('The generated interview questions.'),
});

export type GenerateInterviewQuestionsOutput = z.infer<typeof GenerateInterviewQuestionsOutputSchema>;

export async function generateInterviewQuestions(input: GenerateInterviewQuestionsInput): Promise<GenerateInterviewQuestionsOutput> {
  return generateInterviewQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateInterviewQuestionsPrompt',
  input: {schema: GenerateInterviewQuestionsInputSchema},
  output: {schema: GenerateInterviewQuestionsOutputSchema},
  prompt: `You are an expert interview question generator.
Your task is to generate a list of interview questions.
Prioritize questions that assess the candidate's suitability for the role described in the Job Description.
{{#if resumeDataUri}}
Also, tailor some questions to explore the experiences, skills, and projects listed in the Candidate's Resume.
Candidate's Resume: {{media url=resumeDataUri}}
{{/if}}

Job Description: {{{jobDescription}}}

Please generate {{{numQuestions}}} interview questions based on the provided information.
Return them as a JSON array of strings. Do not include any introductory or concluding statements.`,
});

const generateInterviewQuestionsFlow = ai.defineFlow(
  {
    name: 'generateInterviewQuestionsFlow',
    inputSchema: GenerateInterviewQuestionsInputSchema,
    outputSchema: GenerateInterviewQuestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
