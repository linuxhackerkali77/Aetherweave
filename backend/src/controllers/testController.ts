import { Request, Response } from 'express';
import { auth, db } from '../config/firebase';

export const createTestUser = async (req: Request, res: Response) => {
  try {
    const testEmail = 'test@aether.corp';
    const testPassword = 'password123';
    const testDisplayName = 'Test Operator';

    // Create user in Firebase Auth
    const userRecord = await auth.createUser({
      email: testEmail,
      password: testPassword,
      displayName: testDisplayName,
    });

    // Create user document in Firestore
    await db.collection('users').doc(userRecord.uid).set({
      id: userRecord.uid,
      username: 'testoperator',
      email: testEmail,
      displayName: testDisplayName,
      photoURL: '',
      bio: 'Test operator in the matrix.',
      status: 'Online',
      isAnonymous: false,
      createdAt: new Date(),
      xp: 100,
      level: 1,
      trustScore: 50,
      streak: 1,
      badgesUnlocked: ['pioneer'],
      inventory: [],
      questsCompleted: [],
      questResets: {
        daily: new Date(),
        weekly: new Date(),
        seasonal: new Date(),
      },
      messagesSent: 0,
      notesCreated: 0,
      filesUploaded: 0,
      friends: 0,
    });

    res.json({
      message: 'Test user created successfully',
      email: testEmail,
      password: testPassword,
      uid: userRecord.uid,
    });

  } catch (error: any) {
    console.error('Error creating test user:', error);
    
    if (error.code === 'auth/email-already-exists') {
      return res.json({
        message: 'Test user already exists',
        email: 'test@aether.corp',
        password: 'password123',
      });
    }

    res.status(500).json({ error: 'Failed to create test user', details: error.message });
  }
};