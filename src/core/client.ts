import { ethers, Provider, Wallet, ContractFactory, InterfaceAbi } from "ethers";
import "dotenv/config";

if (!process.env.SONIC_RPC_URL || !process.env.PRIVATE_KEY) {
  throw new Error("Missing SONIC_RPC_URL or PRIVATE_KEY in .env file");
}

const provider: Provider = new ethers.JsonRpcProvider(process.env.SONIC_RPC_URL);
const wallet: Wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

export const getSigner = (): Wallet => wallet;

export const deployContract = async (abi: InterfaceAbi, bytecode: string, args: any[] = []): Promise<string> => {
  const factory = new ContractFactory(abi, bytecode, wallet);
  console.log(`Deploying contract with args: ${args.join(', ')}...`);
  const contract = await factory.deploy(...args);
  await contract.waitForDeployment();
  const address = await contract.getAddress();
  console.log(`Contract deployed at address: ${address}`);
  return address;
}; 