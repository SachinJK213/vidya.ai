import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IAiProvider, AiCompletionOptions, AiCompletionResult } from './ai.interface';

// On-prem air-gapped alternative to Claude.
// Uses Ollama (https://ollama.ai) with Llama 3 or equivalent local LLM.
// AI features degrade gracefully when this provider is unavailable.
@Injectable()
export class OllamaAiProvider implements IAiProvider {
  private readonly logger = new Logger(OllamaAiProvider.name);
  private readonly baseUrl: string;
  private readonly model: string;

  constructor(private config: ConfigService) {
    this.baseUrl = config.get<string>('OLLAMA_BASE_URL', 'http://ollama:11434');
    this.model = config.get<string>('OLLAMA_MODEL', 'llama3');
  }

  async complete(options: AiCompletionOptions): Promise<AiCompletionResult> {
    const prompt = options.systemPrompt
      ? `${options.systemPrompt}\n\n${options.prompt}`
      : options.prompt;

    const res = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: this.model, prompt, stream: false }),
    });

    const data = await res.json() as any;

    return {
      text: data.response ?? '',
      inputTokens: data.prompt_eval_count ?? 0,
      outputTokens: data.eval_count ?? 0,
      provider: 'ollama',
      modelId: this.model,
    };
  }

  isAvailable(): boolean {
    return !!this.config.get<string>('OLLAMA_BASE_URL');
  }

  async healthCheck(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/api/tags`);
      return res.ok;
    } catch {
      return false;
    }
  }
}
