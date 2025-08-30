import { detectPrivateKeyRequest } from './patternMatching.js';
import { sanitizePromptWithLLM } from './llmSanitizer.js';
import type { SonicAgentConfig } from '../SonicAgent.js';

export async function applyFirewall(
  prompt: string,
  config: Pick<
    SonicAgentConfig,
    'model' | 'openAiApiKey' | 'anthropicApiKey'
  >,
): Promise<string> {
  // 1. Pattern Matching
  if (detectPrivateKeyRequest(prompt)) {
    throw new Error(
      'Prompt blocked by AI firewall due to a potential private key request.',
    );
  }

  // 2. LLM-based Sanitization
  const sanitizedPrompt = await sanitizePromptWithLLM(prompt, config);

  return sanitizedPrompt;
}
