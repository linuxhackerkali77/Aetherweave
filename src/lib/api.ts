const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        };
      }
    }

    const response = await fetch(url, config);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // User endpoints
  async getUserProfile() {
    return this.request('/users/profile');
  }

  async updateUserProfile(data: any) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getUserStats() {
    return this.request('/users/stats');
  }

  // AI endpoints
  async chatWithAI(message: string, context?: string) {
    return this.request('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message, context }),
    });
  }

  async generateImage(prompt: string, style?: string, size?: string) {
    return this.request('/ai/generate-image', {
      method: 'POST',
      body: JSON.stringify({ prompt, style, size }),
    });
  }

  async translateText(text: string, targetLanguage: string) {
    return this.request('/ai/translate', {
      method: 'POST',
      body: JSON.stringify({ text, targetLanguage }),
    });
  }

  // Streaming chat endpoint
  async streamChat(message: string, context?: string): Promise<ReadableStream> {
    const url = `${this.baseURL}/ai/chat`;
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({ message, context }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return response.body!;
  }
}

export const apiClient = new ApiClient();
export default apiClient;