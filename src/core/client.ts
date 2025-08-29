import { ethers, Provider, Wallet } from "ethers";
import "dotenv/config";

// Validate environment variables
if (!process.env.SONIC_RPC_URL) {
  throw new Error("SONIC_RPC_URL is required in .env file");
}

if (!process.env.PRIVATE_KEY) {
  throw new Error("PRIVATE_KEY is required in .env file");
}

// Validate private key format
if (!process.env.PRIVATE_KEY.startsWith('0x') || process.env.PRIVATE_KEY.length !== 66) {
  throw new Error("PRIVATE_KEY must be a valid 64-character hex string starting with 0x");
}

let provider: Provider;
let wallet: Wallet;

try {
  provider = new ethers.JsonRpcProvider(process.env.SONIC_RPC_URL);
} catch (error) {
  throw new Error(`Failed to initialize provider with RPC URL: ${error}`);
}

try {
  wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
} catch (error) {
  throw new Error(`Failed to initialize wallet with private key: ${error}`);
}

export const getSigner = (): Wallet => {
  if (!wallet) {
    throw new Error("Wallet not initialized");
  }
  return wallet;
};

export const getProvider = (): Provider => {
  if (!provider) {
    throw new Error("Provider not initialized");
  }
  return provider;
};

export const getAgentAddress = (): string => {
  if (!wallet) {
    throw new Error("Wallet not initialized");
  }
  return wallet.address;
}; 