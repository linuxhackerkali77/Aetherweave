import { Request, Response } from 'express';
import { db } from '../config/firebase';
import { AuthenticatedRequest } from '../middleware/auth';
import { z } from 'zod';

const updateProfileSchema = z.object({
  displayName: z.string().min(1).max(50).optional(),
  bio: z.string().max(500).optional(),
  theme: z.string().optional(),
  preferences: z.object({
    notifications: z.boolean().optional(),
    darkMode: z.boolean().optional(),
    language: z.string().optional(),
  }).optional(),
});

export const getUserProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { uid } = req.user!;
    const userDoc = await db.collection('users').doc(uid).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userDoc.data();
    res.json({
      uid,
      ...userData,
      createdAt: userData?.createdAt?.toDate(),
      updatedAt: userData?.updatedAt?.toDate(),
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateUserProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { uid } = req.user!;
    const validatedData = updateProfileSchema.parse(req.body);

    await db.collection('users').doc(uid).update({
      ...validatedData,
      updatedAt: new Date(),
    });

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid data', details: error.errors });
    }
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUserStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { uid } = req.user!;
    
    // Get user's notes count
    const notesSnapshot = await db.collection('notes').where('userId', '==', uid).get();
    const notesCount = notesSnapshot.size;

    // Get user's connections count
    const connectionsSnapshot = await db.collection('connections').where('userId', '==', uid).get();
    const connectionsCount = connectionsSnapshot.size;

    // Get user's tasks count
    const tasksSnapshot = await db.collection('tasks').where('userId', '==', uid).get();
    const tasksCount = tasksSnapshot.size;

    res.json({
      notesCount,
      connectionsCount,
      tasksCount,
      lastActive: new Date(),
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};