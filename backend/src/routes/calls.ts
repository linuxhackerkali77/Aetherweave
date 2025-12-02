import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { WebRTCService } from '../services/webrtcService';

const router = Router();
const webrtcService = new WebRTCService();

router.post('/offer', authenticateToken, async (req, res) => {
  try {
    const { callId, offer } = req.body;
    await webrtcService.createOffer(callId, offer);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/answer', authenticateToken, async (req, res) => {
  try {
    const { callId, answer } = req.body;
    await webrtcService.createAnswer(callId, answer);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/candidate', authenticateToken, async (req, res) => {
  try {
    const { callId, candidate } = req.body;
    await webrtcService.addIceCandidate(callId, candidate);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/offer/:callId', authenticateToken, async (req, res) => {
  try {
    const offer = await webrtcService.getOffer(req.params.callId);
    res.json({ offer });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/answer/:callId', authenticateToken, async (req, res) => {
  try {
    const answer = await webrtcService.getAnswer(req.params.callId);
    res.json({ answer });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;