import Anthropic from "@anthropic-ai/sdk";

export class AnthropicService {
  private client: Anthropic;

  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || ""
    });
  }

  async generateContent(prompt: string, systemPrompt: string, maxTokens: number = 1000, temperature: number = 0.3): Promise<string> {
    try {
      const msg = await this.client.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: maxTokens,
        temperature: temperature,
        system: systemPrompt,
        messages: [{ role: "user", content: prompt }],
      });

      return msg.content[0]?.type === 'text' ? msg.content[0].text : "";
    } catch (error) {
      console.error('Error in Anthropic generateContent:', error);
      throw error;
    }
  }
} 