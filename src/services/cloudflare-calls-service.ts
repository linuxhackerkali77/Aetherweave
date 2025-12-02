'use client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export class CloudflareCallsService {
  private static instance: CloudflareCallsService;
  
  static getInstance(): CloudflareCallsService {
    if (!CloudflareCallsService.instance) {
      CloudflareCallsService.instance = new CloudflareCallsService();
    }
    return CloudflareCallsService.instance;
  }

  private async getToken() {
    if (typeof window === 'undefined') return null;
    const { getAuth } = await import('firebase/auth');
    const auth = getAuth();
    return auth.currentUser?.getIdToken();
  }

  async sendOffer(callId: string, offer: RTCSessionDescriptionInit) {
    const token = await this.getToken();
    const res = await fetch(`${API_URL}/calls/offer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ callId, offer })
    });
    if (!res.ok) throw new Error('Failed to send offer');
  }

  async sendAnswer(callId: string, answer: RTCSessionDescriptionInit) {
    const token = await this.getToken();
    const res = await fetch(`${API_URL}/calls/answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ callId, answer })
    });
    if (!res.ok) throw new Error('Failed to send answer');
  }

  async sendCandidate(callId: string, candidate: RTCIceCandidateInit) {
    const token = await this.getToken();
    await fetch(`${API_URL}/calls/candidate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ callId, candidate })
    });
  }

  async getOffer(callId: string) {
    const token = await this.getToken();
    const res = await fetch(`${API_URL}/calls/offer/${callId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    return data.offer;
  }

  async getAnswer(callId: string) {
    const token = await this.getToken();
    const res = await fetch(`${API_URL}/calls/answer/${callId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    return data.answer;
  }
}