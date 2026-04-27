import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AI_PROVIDER } from './providers/ai.interface';
import { ClaudeAiProvider } from './providers/claude.provider';
import { OllamaAiProvider } from './providers/ollama.provider';
import { AiService } from './ai.service';

@Module({
  providers: [
    {
      provide: AI_PROVIDER,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const provider = config.get<string>('AI_PROVIDER', 'claude');
        if (provider === 'ollama') return new OllamaAiProvider(config);
        if (provider === 'disabled') return null;
        return new ClaudeAiProvider(config);
      },
    },
    AiService,
  ],
  exports: [AiService],
})
export class AiModule {}
