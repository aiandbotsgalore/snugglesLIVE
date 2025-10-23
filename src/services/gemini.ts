import { BIG_SNUGGLES_SYSTEM_PROMPT, GEMINI_API_URL } from '../config/character';
import type { Message } from '../types';

/**
 * A service class for interacting with the Google Gemini API.
 * It handles the formatting of messages, making API requests, and managing
 * a request queue to prevent race conditions.
 */
export class GeminiService {
  private apiKey: string;
  private requestQueue: Promise<string>[] = [];

  /**
   * Creates an instance of the GeminiService.
   * @param {string} apiKey - The API key for the Gemini API.
   */
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Generates a response from the Gemini API based on the conversation history.
   * @param {Message[]} messages - The recent messages in the conversation.
   * @param {string} [conversationSummary] - An optional summary of the conversation history.
   * @returns {Promise<string>} A promise that resolves with the AI-generated response text.
   */
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

  /**
   * Checks if there are any pending API requests.
   * @returns {boolean} True if there are active requests, false otherwise.
   */
  isProcessing(): boolean {
    return this.requestQueue.length > 0;
  }
}

let geminiServiceInstance: GeminiService | null = null;

/**
 * Initializes the singleton instance of the GeminiService.
 * This must be called before `getGeminiService` can be used.
 * @param {string} apiKey - The Gemini API key.
 */
export function initializeGeminiService(apiKey: string): void {
  geminiServiceInstance = new GeminiService(apiKey);
}

/**
 * Retrieves the singleton instance of the GeminiService.
 * @returns {GeminiService} The initialized GeminiService instance.
 * @throws {Error} If the service has not been initialized.
 */
export function getGeminiService(): GeminiService {
  if (!geminiServiceInstance) {
    throw new Error('Gemini service not initialized. Please set your API key first.');
  }
  return geminiServiceInstance;
}

/**
 * Checks if the GeminiService has been initialized.
 * @returns {boolean} True if the service is initialized, false otherwise.
 */
export function isGeminiServiceInitialized(): boolean {
  return geminiServiceInstance !== null;
}
