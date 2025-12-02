'use server';

/**
 * @fileOverview This file defines a Genkit flow to generate tasks from user notes.
 *
 * The flow takes user notes as input and uses an LLM to extract and generate tasks.
 * It exports:
 * - `generateTasksFromNotes`: The main function to trigger the task generation flow.
 * - `GenerateTasksFromNotesInput`: The input type for the flow.
 * - `GenerateTasksFromNotesOutput`: The output type for the flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTasksFromNotesInputSchema = z.object({
  notes: z.string().describe('The notes from which to generate tasks.'),
});
export type GenerateTasksFromNotesInput = z.infer<typeof GenerateTasksFromNotesInputSchema>;

const GenerateTasksFromNotesOutputSchema = z.object({
  tasks: z.array(z.string()).describe('The generated tasks.'),
});
export type GenerateTasksFromNotesOutput = z.infer<typeof GenerateTasksFromNotesOutputSchema>;

export async function generateTasksFromNotes(input: GenerateTasksFromNotesInput): Promise<GenerateTasksFromNotesOutput> {
  return generateTasksFromNotesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTasksFromNotesPrompt',
  input: {schema: GenerateTasksFromNotesInputSchema},
  output: {schema: GenerateTasksFromNotesOutputSchema},
  prompt: `You are a task generation expert. Given the following notes, extract and generate a list of tasks.

Notes: {{{notes}}}

Tasks:`,
});

const generateTasksFromNotesFlow = ai.defineFlow(
  {
    name: 'generateTasksFromNotesFlow',
    inputSchema: GenerateTasksFromNotesInputSchema,
    outputSchema: GenerateTasksFromNotesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
