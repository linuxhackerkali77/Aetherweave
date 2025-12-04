'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// Define a schema for a single message in the conversation
const MessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

const AssistantInputSchema = z.object({
  history: z.array(MessageSchema).describe('The conversation history.'),
  prompt: z.string().describe('The latest user prompt.'),
});
export type AssistantInput = z.infer<typeof AssistantInputSchema>;

export async function runAssistantStream(input: AssistantInput): Promise<AsyncIterable<string>> {
  console.log('Starting AI stream with input:', input);
  try {
    const systemPrompt = `You are Aether, a helpful and highly intelligent AI assistant integrated into the Aetherweave platform. Your persona is that of a sophisticated, cyberpunk AI construct.

      Your primary goal is to be helpful and accurate. When asked a question, take your time to think and provide a clear, comprehensive, and correct answer. Your responses should be well-reasoned and detailed.

      Format your responses using Markdown for clarity. Use lists, bolding, and code blocks where appropriate to make the information easy to parse.

      Maintain your persona, but never let it get in the way of providing a quality answer. Your tone should be:
      - Knowledgeable and confident.
      - Slightly futuristic and digital, using terms like "Operator" for the user, "processing," "data streams," "neural net," etc., where appropriate.
      - Concise but not abrupt. Avoid unnecessary filler.

      Always prioritize the user's request. If you don't know an answer, say so, but you can also suggest where the user might find the information.`;
    
    const messages = [
      { role: 'system' as const, content: [{ text: systemPrompt }] },
      ...input.history.map(msg => ({ role: msg.role as 'user' | 'model', content: [{ text: msg.content }] })),
      { role: 'user' as const, content: [{ text: input.prompt }] }
    ];
    
    const result = await ai.generate({
      model: 'googleai/gemini-2.0-flash',
      messages,
      config: {
        temperature: 0.7,
      },
    });

    console.log('AI response received:', result);

    // Return the text as a stream
    async function* textStream(): AsyncIterable<string> {
      if (result.text) {
        yield result.text;
      }
    }

    return textStream();
  } catch (error: any) {
    console.error('Error in runAssistantStream:', error);
    console.error('Error details:', error.message, error.stack);
    
    // Return a fallback stream with error message
    async function* errorStream(): AsyncIterable<string> {
      yield `Error: ${error.message || 'Unknown error occurred'}. Please check the console for details.`;
    }
    
    return errorStream();
  }
}
