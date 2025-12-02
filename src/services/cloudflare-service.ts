
/**
 * @fileOverview A backend service to interact with the Cloudflare API for video calls.
 * This service is responsible for creating rooms and generating client tokens.
 * It should only be called from secure backend flows (e.g., Genkit flows),
 * never directly from the client.
 */

import { z } from 'zod';

const CLOUDFLARE_API_BASE = 'https://api.cloudflare.com/client/v4';

const CreateMeetingResponseSchema = z.object({
  result: z.object({
    id: z.string(),
  }),
  success: z.boolean(),
});

const AddParticipantResponseSchema = z.object({
  result: z.object({
    auth_token: z.string(),
  }),
  success: z.boolean(),
});

async function createCfMeeting(): Promise<string> {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const appId = process.env.CLOUDFLARE_APP_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  if (!accountId || !appId || !apiToken) {
    throw new Error('Cloudflare credentials are not configured in environment variables.');
  }

  const response = await fetch(`${CLOUDFLARE_API_BASE}/accounts/${accountId}/realtime/kit/${appId}/meetings`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: `Aetherweave Call - ${new Date().toISOString()}`,
    }),
  });

  const data = await response.json();
  const parsed = CreateMeetingResponseSchema.safeParse(data);

  if (!parsed.success || !parsed.data.success) {
    console.error('Cloudflare create meeting failed:', parsed.error || data.errors);
    throw new Error('Failed to create Cloudflare meeting.');
  }
  
  return parsed.data.result.id;
}


async function createCfParticipantToken(meetingId: string, userId: string, userName: string): Promise<string> {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const appId = process.env.CLOUDFLARE_APP_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  
  if (!accountId || !appId || !apiToken) {
    throw new Error('Cloudflare credentials are not configured.');
  }
  
  const response = await fetch(`${CLOUDFLARE_API_BASE}/accounts/${accountId}/realtime/kit/${appId}/meetings/${meetingId}/participants`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: userName,
      preset_name: 'default-participant',
      custom_participant_id: userId
    }),
  });

  const data = await response.json();
  const parsed = AddParticipantResponseSchema.safeParse(data);
  
  if (!parsed.success || !parsed.data.success) {
    console.error('Cloudflare add participant failed:', parsed.error || data.errors);
    throw new Error('Failed to create Cloudflare participant token.');
  }
  
  return parsed.data.result.auth_token;
}

export async function createCfSession(userId: string, userName: string): Promise<{ meetingId: string; clientToken: string }> {
  try {
    const meetingId = await createCfMeeting();
    console.log(`[CF Service] Created meeting: ${meetingId}`);
    const clientToken = await createCfParticipantToken(meetingId, userId, userName);
    console.log(`[CF Service] Created token for user ${userId} in meeting ${meetingId}`);
    return { meetingId, clientToken };
  } catch (error) {
    console.error('[CF Service] Error creating session:', error);
    throw new Error('Could not create Cloudflare session.');
  }
}
