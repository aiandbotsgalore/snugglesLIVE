import { BIG_SNUGGLES_SYSTEM_PROMPT, GEMINI_API_URL } from '../config/character';
import type { Message } from '../types';

export class GeminiService {
  private apiKey: string;
  private requestQueue: Promise<string>[] = [];

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateResponse(
    messages: Message[],
    conversationSummary?: string
  ): Promise<string> {
    const formattedMessages = this.formatMessages(messages, conversationSummary);

    const request = this.makeRequest(formattedMessages);
    this.requestQueue.push(request);

    try {
      const response = await request;
      return response;
    } finally {
      this.requestQueue = this.requestQueue.filter(req => req !== request);
    }
  }

  private formatMessages(messages: Message[], summary?: string): any[] {
    const contextMessages: any[] = [];

    if (summary) {
      contextMessages.push({
        role: 'user',
        parts: [{ text: `[Previous conversation summary: ${summary}]` }]
      });
    }

    const recentMessages = messages.slice(-10);

    for (const msg of recentMessages) {
      contextMessages.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      });
    }

    return contextMessages;
  }

  private async makeRequest(messages: any[]): Promise<string> {
    const payload = {
      system_instruction: {
        parts: [{ text: BIG_SNUGGLES_SYSTEM_PROMPT }]
      },
      contents: messages,
      generationConfig: {
        temperature: 1.0,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    };

    const response = await fetch(`${GEMINI_API_URL}?key=${this.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Gemini API error: ${response.status} - ${
          errorData.error?.message || response.statusText
        }`
      );
    }

    const data = await response.json();

    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('No response generated from Gemini API');
    }

    const candidate = data.candidates[0];
    if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
      throw new Error('Invalid response structure from Gemini API');
    }

    return candidate.content.parts[0].text;
  }

  isProcessing(): boolean {
    return this.requestQueue.length > 0;
  }
}

let geminiServiceInstance: GeminiService | null = null;

export function initializeGeminiService(apiKey: string): void {
  geminiServiceInstance = new GeminiService(apiKey);
}

export function getGeminiService(): GeminiService {
  if (!geminiServiceInstance) {
    throw new Error('Gemini service not initialized. Please set your API key first.');
  }
  return geminiServiceInstance;
}

export function isGeminiServiceInitialized(): boolean {
  return geminiServiceInstance !== null;
}
