import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import { IAiProvider, AiCompletionOptions, AiCompletionResult } from './ai.interface';

@Injectable()
export class ClaudeAiProvider implements IAiProvider {
  private readonly logger = new Logger(ClaudeAiProvider.name);
  private readonly client: Anthropic;
  private readonly model: string;

  constructor(private config: ConfigService) {
    this.client = new Anthropic({ apiKey: config.get<string>('ANTHROPIC_API_KEY') });
    this.model = config.get<string>('ANTHROPIC_MODEL', 'claude-sonnet-4-6');
  }

  async complete(options: AiCompletionOptions): Promise<AiCompletionResult> {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: options.maxTokens ?? 1024,
      system: options.systemPrompt,
      messages: [{ role: 'user', content: options.prompt }],
    });

    const text = response.content
      .filter((b) => b.type === 'text')
      .map((b) => (b as { type: 'text'; text: string }).text)
      .join('');

    return {
      text,
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
      provider: 'claude',
      modelId: this.model,
    };
  }

  isAvailable(): boolean {
    return !!this.config.get<string>('ANTHROPIC_API_KEY');
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.client.messages.create({
        model: this.model,
        max_tokens: 1,
        messages: [{ role: 'user', content: 'ping' }],
      });
      return true;
    } catch {
      return false;
    }
  }
}
