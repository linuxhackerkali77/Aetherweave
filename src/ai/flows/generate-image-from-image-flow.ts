'use server';
/**
 * @fileOverview Generates an image from a base image and a text prompt using Genkit.
 *
 * - generateImageFromImage - A function that generates an image from a base image and a text prompt.
 * - GenerateImageFromImageInput - The input type for the function.
 * - GenerateImageFromImageOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateImageFromImageInputSchema = z.object({
  prompt: z.string().describe('A detailed text prompt describing the desired modifications to the image.'),
  baseImage: z.string().describe("The base image to modify, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type GenerateImageFromImageInput = z.infer<typeof GenerateImageFromImageInputSchema>;

const GenerateImageFromImageOutputSchema = z.object({
  imageUrl: z.string().describe('The data URI of the generated image.'),
});
export type GenerateImageFromImageOutput = z.infer<typeof GenerateImageFromImageOutputSchema>;

export async function generateImageFromImage(input: GenerateImageFromImageInput): Promise<GenerateImageFromImageOutput> {
  return generateImageFromImageFlow(input);
}

const generateImageFromImageFlow = ai.defineFlow(
  {
    name: 'generateImageFromImageFlow',
    inputSchema: GenerateImageFromImageInputSchema,
    outputSchema: GenerateImageFromImageOutputSchema,
  },
  async ({ prompt, baseImage }) => {
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.5-flash-image-preview',
      prompt: [
        { media: { url: baseImage } },
        { text: prompt },
      ],
      config: {
        // IMPORTANT: You must specify both TEXT and IMAGE as response modalities for this model.
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media.url) {
      throw new Error('Image generation failed to return a URL.');
    }

    return {
      imageUrl: media.url,
    };
  }
);
