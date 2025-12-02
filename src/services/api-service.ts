import { auth } from '@/firebase';
import apiClient from '@/lib/api';

class ApiService {
  private async getAuthToken(): Promise<string | null> {
    const user = auth.currentUser;
    if (!user) return null;
    
    try {
      return await user.getIdToken();
    } catch (error) {
      console.error('Failed to get auth token:', error);
      return null;
    }
  }

  async updateAuthToken() {
    const token = await this.getAuthToken();
    if (token && typeof window !== 'undefined') {
      localStorage.setItem('authToken', token);
    }
  }

  // User services
  async getUserProfile() {
    await this.updateAuthToken();
    return apiClient.getUserProfile();
  }

  async updateUserProfile(data: any) {
    await this.updateAuthToken();
    return apiClient.updateUserProfile(data);
  }

  async getUserStats() {
    await this.updateAuthToken();
    return apiClient.getUserStats();
  }

  // AI services
  async chatWithAI(message: string, context?: string) {
    await this.updateAuthToken();
    return apiClient.chatWithAI(message, context);
  }

  async streamChatWithAI(message: string, context?: string) {
    await this.updateAuthToken();
    return apiClient.streamChat(message, context);
  }

  async generateImage(prompt: string, style?: string, size?: string) {
    await this.updateAuthToken();
    return apiClient.generateImage(prompt, style, size);
  }

  async translateText(text: string, targetLanguage: string) {
    await this.updateAuthToken();
    return apiClient.translateText(text, targetLanguage);
  }

  // Utility method to handle streaming responses
  async handleStreamingResponse(
    stream: ReadableStream,
    onChunk: (chunk: string) => void,
    onComplete?: () => void,
    onError?: (error: Error) => void
  ) {
    try {
      const reader = stream.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          onComplete?.();
          break;
        }

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              onChunk(data.content);
              
              if (data.done) {
                onComplete?.();
                return;
              }
            } catch (e) {
              // Skip invalid JSON lines
            }
          }
        }
      }
    } catch (error) {
      onError?.(error as Error);
    }
  }
}

export const apiService = new ApiService();
export default apiService;