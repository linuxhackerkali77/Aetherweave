import { Router } from 'express';
import multer from 'multer';
import sharp from 'sharp';
import { getFirestore } from 'firebase-admin/firestore';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/avatar', authenticateToken, upload.single('avatar'), async (req: AuthenticatedRequest, res) => {
  try {
    console.log('Avatar upload request received');
    console.log('User:', req.user);
    console.log('File:', req.file ? 'File present' : 'No file');
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const userId = req.user!.uid;
    const file = req.file;
    
    console.log('Processing file for user:', userId);
    console.log('File type:', file.mimetype);
    console.log('File size:', file.size);
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({ error: `Unsupported file type: ${file.mimetype}. Allowed: JPG, PNG, GIF, WebP` });
    }
    
    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return res.status(400).json({ error: 'File too large. Maximum size is 5MB' });
    }
    
    // Convert file to base64 data URL for now (simple solution)
    const base64 = file.buffer.toString('base64');
    const dataURL = `data:${file.mimetype};base64,${base64}`;

    // Compress and resize image
    const compressedBuffer = await sharp(file.buffer)
      .resize(200, 200, { fit: 'cover' })
      .jpeg({ quality: 80 })
      .toBuffer();
    
    const compressedBase64 = compressedBuffer.toString('base64');
    const compressedDataURL = `data:image/jpeg;base64,${compressedBase64}`;
    
    console.log('Image compressed, updating Firestore...');
    
    const db = getFirestore();
    await db.collection('users').doc(userId).set(
      { photoURL: compressedDataURL },
      { merge: true }
    );

    console.log('Firestore update successful');
    res.json({ downloadURL: compressedDataURL });
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
  }
});

export default router;