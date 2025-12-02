import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { z } from 'zod';

const chatRequestSchema = z.object({
  message: z.string().min(1).max(1000),
  context: z.string().optional(),
  model: z.enum(['gemini-pro', 'gemini-pro-vision']).default('gemini-pro'),
});

const imageGenerationSchema = z.object({
  prompt: z.string().min(1).max(500),
  style: z.enum(['realistic', 'artistic', 'cyberpunk', 'minimalist']).default('realistic'),
  size: z.enum(['512x512', '1024x1024', '1024x768']).default('1024x1024'),
});

export const chatWithAI = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { uid } = req.user!;
    const { message, context, model } = chatRequestSchema.parse(req.body);

    // Set up SSE headers for streaming response
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    });

    // Simulate AI response streaming (replace with actual AI integration)
    const response = `AI Response to: ${message}`;
    const words = response.split(' ');
    
    for (let i = 0; i < words.length; i++) {
      const chunk = words.slice(0, i + 1).join(' ');
      res.write(`data: ${JSON.stringify({ content: chunk, done: false })}\n\n`);
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    res.write(`data: ${JSON.stringify({ content: response, done: true })}\n\n`);
    res.end();

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid data', details: error.errors });
    }
    console.error('Error in AI chat:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const generateImage = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { uid } = req.user!;
    const { prompt, style, size } = imageGenerationSchema.parse(req.body);

    // Placeholder for image generation logic
    // Replace with actual AI image generation service
    const imageUrl = `https://picsum.photos/${size.replace('x', '/')}?random=${Date.now()}`;

    res.json({
      imageUrl,
      prompt,
      style,
      size,
      generatedAt: new Date(),
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid data', details: error.errors });
    }
    console.error('Error generating image:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const translateText = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { text, targetLanguage } = req.body;

    if (!text || !targetLanguage) {
      return res.status(400).json({ error: 'Text and target language are required' });
    }

    // Placeholder for translation logic
    // Replace with actual translation service
    const translatedText = `[${targetLanguage.toUpperCase()}] ${text}`;

    res.json({
      originalText: text,
      translatedText,
      targetLanguage,
      translatedAt: new Date(),
    });

  } catch (error) {
    console.error('Error translating text:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};