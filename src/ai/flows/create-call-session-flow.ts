
'use server';
/**
 * @fileOverview A Genkit flow to create a WebRTC call session using Cloudflare.
 *
 * This flow securely interacts with the Cloudflare API on the backend to provision
 * a new call room and generate a session token for a client.
 */

import { z } from 'genkit';
import { createCfSession } from '@/services/cloudflare-service';
import { ai } from '@/ai/genkit';

export const CreateCallSessionInputSchema = z.object({
  callerId: z.string().describe('The UID of the user initiating the call.'),
  callerName: z.string().describe('The display name of the user initiating the call.'),
});
export type CreateCallSessionInput = z.infer<typeof CreateCallSessionInputSchema>;

export const CreateCallSessionOutputSchema = z.object({
  meetingId: z.string().describe("The unique ID for the meeting, returned by Cloudflare."),
  clientToken: z.string().describe("The JWT token for the client to join the Cloudflare session."),
});
export type CreateCallSessionOutput = z.infer<typeof CreateCallSessionOutputSchema>;


/**
 * Securely creates a Cloudflare meeting and generates a participant token.
 * This function is designed to be called from the client to provision a call session.
 * @param input The caller and receiver information.
 * @returns The meeting ID and a client token for the caller.
 */
export async function createCallSession(input: CreateCallSessionInput): Promise<CreateCallSessionOutput> {
    return createCallSessionFlow(input);
}

const createCallSessionFlow = ai.defineFlow(
    {
        name: 'createCallSessionFlow',
        inputSchema: CreateCallSessionInputSchema,
        outputSchema: CreateCallSessionOutputSchema,
    },
    async (input) => {
        console.log(`[Flow] Creating call session for caller: ${input.callerId}`);
        
        // Directly call the Cloudflare service to get the session details.
        const { meetingId, clientToken } = await createCfSession(input.callerId, input.callerName);

        console.log(`[Flow] Cloudflare session created. Meeting ID: ${meetingId}`);
        
        // Return the created session details.
        return {
            meetingId: meetingId,
            clientToken: clientToken,
        };
    }
);
