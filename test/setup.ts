import { SonicAgent, type SonicAgentConfig } from '../src/SonicAgent.js';

export type SonicAgentType = SonicAgent;


export const createTestAgent = (config?: Partial<SonicAgentConfig> & { personalityPrompt?: string }): SonicAgent => {
  if (!config?.privateKey) {
    throw new Error('privateKey is required in config');
  }

  const defaultConfig: SonicAgentConfig = {
    privateKey: config.privateKey,
    rpcUrl: config?.rpcUrl || 'https://rpc.sonicchain.org/',
    model: config?.model || 'gpt-4o-mini',
    openAiApiKey: config?.openAiApiKey,
    anthropicApiKey: config?.anthropicApiKey,
    personalityPrompt: config?.personalityPrompt,
  };

  return new SonicAgent(defaultConfig);
};


