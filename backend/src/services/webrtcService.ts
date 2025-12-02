import admin from '../config/firebase';

const db = admin.firestore();

export class WebRTCService {
  async createOffer(callId: string, offer: RTCSessionDescriptionInit) {
    await db.collection('webrtc').doc(callId).set({
      offer,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
  }

  async createAnswer(callId: string, answer: RTCSessionDescriptionInit) {
    await db.collection('webrtc').doc(callId).set({
      answer,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
  }

  async addIceCandidate(callId: string, candidate: RTCIceCandidateInit) {
    await db.collection('webrtc').doc(callId).collection('candidates').add({
      candidate,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
  }

  async getOffer(callId: string) {
    const doc = await db.collection('webrtc').doc(callId).get();
    return doc.exists ? doc.data()?.offer : null;
  }

  async getAnswer(callId: string) {
    const doc = await db.collection('webrtc').doc(callId).get();
    return doc.exists ? doc.data()?.answer : null;
  }
}
