'use server';
/**
 * @fileOverview An AI flow to enhance a user's profile by generating suggestions.
 *
 * - enhanceProfile - A function that generates a bio, interests, and an "aura personality".
 * - EnhanceProfileInput - The input type for the enhanceProfile function.
 * - EnhanceProfileOutput - The return type for the enhanceProfile function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const EnhanceProfileInputSchema = z.object({
  interests: z.string().describe('A few words or a sentence describing the user\'s interests, hobbies, or personality.'),
});
export type EnhanceProfileInput = z.infer<typeof EnhanceProfileInputSchema>;

const EnhanceProfileOutputSchema = z.object({
  bio: z.string().describe('A generated bio (1-3 sentences) in a cyberpunk or futuristic style.'),
  auraPersonality: z.string().describe('A single, evocative word representing the user\'s "aura" or personality type (e.g., "Strategist", "Explorer", "Dreamer").'),
  suggestedInterests: z.array(z.string()).describe('A list of 5-7 suggested interests or skills as short phrases or single words.'),
  suggestedTheme: z.string().describe('A suggested theme name (e.g., "Neon Noir", "Synthwave Sunset", "Glitch Runner").'),
});
export type EnhanceProfileOutput = z.infer<typeof EnhanceProfileOutputSchema>;

export async function enhanceProfile(input: EnhanceProfileInput): Promise<EnhanceProfileOutput> {
  return enhanceProfileFlow(input);
}

const enhanceProfileFlow = ai.defineFlow(
  {
    name: 'enhanceProfileFlow',
    inputSchema: EnhanceProfileInputSchema,
    outputSchema: EnhanceProfileOutputSchema,
  },
  async (input) => {
    const result = await ai.generate({
      model: 'googleai/gemini-2.0-flash',
      prompt: `You are an AI Profile Enhancer for a cyberpunk-themed social platform called Aetherweave.
Your task is to generate a cool, futuristic profile for a user based on their stated interests.

User Interests: ${input.interests}

Based on these interests, generate the following in JSON format:
1. bio: A short, edgy, and cool bio (1-3 sentences).
2. auraPersonality: A single, impactful word that defines their persona (e.g., Nomad, Analyst, Ghost, Visionary).
3. suggestedInterests: A list of 5-7 related skills or hobbies that fit the cyberpunk theme.
4. suggestedTheme: A cool name for a color theme, like "Arcade Glow" or "Data Stream".

Return only valid JSON with these exact keys.`,
      output: { schema: EnhanceProfileOutputSchema },
    });
    return result.output!;
  }
);
