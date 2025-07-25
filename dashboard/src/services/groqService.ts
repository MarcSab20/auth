import { Groq } from 'groq-sdk';

export class GroqService {
  private client: Groq;

  constructor() {
    this.client = new Groq({
      apiKey: process.env.GROQ_API_KEY || ""
    });
  }

  async generateContent(prompt: string, systemPrompt: string, maxTokens: number = 1000, temperature: number = 0.3): Promise<string> {
    try {
      const completion = await this.client.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        model: 'llama3-70b-8192',
        temperature: temperature,
        max_tokens: maxTokens,
      });

      return completion.choices[0].message.content || "";
    } catch (error) {
      console.error('Error in Groq generateContent:', error);
      throw error;
    }
  }
} 