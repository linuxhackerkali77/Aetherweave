'use server';

import { z } from 'zod';

const GenerateImageInputSchema = z.object({
  prompt: z.string().describe('A detailed text prompt to generate an image from.'),
});
export type GenerateImageInput = z.infer<typeof GenerateImageInputSchema>;

const GenerateImageOutputSchema = z.object({
  imageUrl: z.string().describe('The data URI of the generated image.'),
});
export type GenerateImageOutput = z.infer<typeof GenerateImageOutputSchema>;

export async function generateImage(input: GenerateImageInput): Promise<GenerateImageOutput> {
  throw new Error('Image generation is currently unavailable. This feature requires additional API setup.');
}
