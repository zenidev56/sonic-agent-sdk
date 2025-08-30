import { ethers, Provider, Wallet } from "ethers";

let provider: Provider | null = null;
let currentWallet: Wallet | null = null;
let currentPrivateKey: string | null = null;
let currentRpcUrl: string | null = null;

export const initializeClient = (privateKey: string, rpcUrl: string): void => {
  if (!privateKey) {
    throw new Error("Private key is required");
  }
  
  if (!rpcUrl) {
    throw new Error("RPC URL is required");
  }
  
  // Validate private key format
  if (privateKey.length !== 64 && privateKey.length !== 66) {
    throw new Error("Private key must be a valid 64 or 66-character hex string");
  }
  
  // Normalize private key (remove 0x prefix if present)
  const normalizedKey = privateKey.startsWith('0x') ? privateKey.slice(2) : privateKey;
  
  if (normalizedKey.length !== 64) {
    throw new Error("Private key must be a valid 64-character hex string");
  }
  
  try {
    // Initialize provider if RPC URL changed
    if (currentRpcUrl !== rpcUrl) {
      provider = new ethers.JsonRpcProvider(rpcUrl);
      currentRpcUrl = rpcUrl;
    }
    
    // Create new wallet if private key changed or no wallet exists
    if (currentPrivateKey !== normalizedKey || !currentWallet) {
      if (!provider) {
        throw new Error("Provider not initialized");
      }
      currentWallet = new ethers.Wallet(normalizedKey, provider);
      currentPrivateKey = normalizedKey;
    }
  } catch (error) {
    throw new Error(`Failed to initialize client: ${error}`);
  }
};

export const setCurrentPrivateKey = (privateKey: string): void => {
  if (!provider || !currentRpcUrl) {
    throw new Error("Client not initialized. Call initializeClient() first.");
  }
  
  if (!privateKey) {
    throw new Error("Private key is required");
  }
  
  // Validate private key format
  if (privateKey.length !== 64 && privateKey.length !== 66) {
    throw new Error("Private key must be a valid 64 or 66-character hex string");
  }
  
  // Normalize private key (remove 0x prefix if present)
  const normalizedKey = privateKey.startsWith('0x') ? privateKey.slice(2) : privateKey;
  
  if (normalizedKey.length !== 64) {
    throw new Error("Private key must be a valid 64-character hex string");
  }
  
  try {
    // Create new wallet if private key changed
    if (currentPrivateKey !== normalizedKey) {
      currentWallet = new ethers.Wallet(normalizedKey, provider);
      currentPrivateKey = normalizedKey;
    }
  } catch (error) {
    throw new Error(`Failed to initialize wallet with private key: ${error}`);
  }
};

export const getSigner = (): Wallet => {
  if (!currentWallet) {
    throw new Error("Client not initialized. Call initializeClient() first.");
  }
  
  return currentWallet;
};

export const getProvider = (): Provider => {
  if (!provider) {
    throw new Error("Client not initialized. Call initializeClient() first.");
  }
  return provider;
};

export const getAgentAddress = (): string => {
  const wallet = getSigner();
  return wallet.address;
}; 