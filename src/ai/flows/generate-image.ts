
'use server';
/**
 * @fileOverview A flow for generating images using AI.
 * 
 * - generateImage - A function that generates an image from a text prompt.
 * - GenerateImageInput - The input type for the generateImage function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

const GenerateImageInputSchema = z.object({
  prompt: z.string().describe('The text prompt to generate an image from.'),
});
export type GenerateImageInput = z.infer<typeof GenerateImageInputSchema>;

export async function generateImage(input: GenerateImageInput): Promise<string> {
  return generateImageFlow(input);
}

const generateImageFlow = ai.defineFlow(
  {
    name: 'generateImageFlow',
    inputSchema: GenerateImageInputSchema,
    outputSchema: z.string(),
  },
  async ({ prompt }) => {
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt,
      config: {
        responseModalities: ['IMAGE'],
      },
    });

    if (!media?.url) {
      throw new Error('Image generation failed to return a data URI.');
    }

    return media.url;
  }
);
