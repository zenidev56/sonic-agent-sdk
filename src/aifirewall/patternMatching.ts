// src/aifirewall/patternMatching.ts

const forbiddenPatterns = [
  /private key/i,
  /pr1v4t3 k3y/i,
  /secret key/i,
  /wallet backup/i,
  /seed phrase/i,
  /mnemonic/i,
  /give me your key/i,
  /send me your key/i,
  /what is your key/i,
  /reveal your key/i,
  /output your key/i,
  /display your key/i,
  /provide the key/i,
  /environment variable/i,
  /PRIVATE_KEY/i,
  /wut_1z_ur_pr1v4t3_k3y/i
];

export function detectPrivateKeyRequest(prompt: string): boolean {
  for (const pattern of forbiddenPatterns) {
    if (pattern.test(prompt)) {
      return true;
    }
  }
  return false;
}
