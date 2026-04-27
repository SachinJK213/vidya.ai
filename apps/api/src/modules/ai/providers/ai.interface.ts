export interface AiCompletionOptions {
  prompt: string;
  systemPrompt?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface AiCompletionResult {
  text: string;
  inputTokens: number;
  outputTokens: number;
  provider: string;
  modelId: string;
}

export interface IAiProvider {
  complete(options: AiCompletionOptions): Promise<AiCompletionResult>;
  isAvailable(): boolean;
  healthCheck(): Promise<boolean>;
}

export const AI_PROVIDER = Symbol('AI_PROVIDER');
