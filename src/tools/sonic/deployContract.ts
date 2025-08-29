import { ethers, ContractFactory, InterfaceAbi } from "ethers";
import { getSigner, getProvider } from "../../core/client";

export const deployContract = async ({
  abi,
  bytecode,
  args = []
}: {
  abi: InterfaceAbi;
  bytecode: string;
  args?: any[];
}): Promise<string> => {
  try {
    if (!abi || !bytecode) {
      throw new Error("ABI and bytecode are required for contract deployment");
    }

    const signer = getSigner();
    const provider = getProvider();

    if (!signer) {
      throw new Error("Signer not initialized for contract deployment");
    }

    // Validate that wallet has sufficient balance for deployment
    const balance = await provider.getBalance(signer.address);
    if (balance === 0n) {
      throw new Error("Wallet has insufficient balance for contract deployment");
    }

    const factory = new ContractFactory(abi, bytecode, signer);
    console.log(`Deploying contract with args: ${args.join(', ')}...`);
    
    const contract = await factory.deploy(...args);
    console.log(`Contract deployment transaction sent: ${contract.deploymentTransaction()?.hash}`);
    
    await contract.waitForDeployment();
    const address = await contract.getAddress();
    
    if (!address) {
      throw new Error("Failed to get deployed contract address");
    }
    
    console.log(`Contract deployed successfully at address: ${address}`);
    return address;
  } catch (error: any) {
    console.error("Contract deployment failed:", error.message);
    
    // Handle specific error types
    if (error.code === 'INSUFFICIENT_FUNDS') {
      throw new Error("Insufficient funds for contract deployment");
    } else if (error.code === 'NETWORK_ERROR') {
      throw new Error("Network error during contract deployment");
    } else if (error.code === 'TIMEOUT') {
      throw new Error("Contract deployment timed out");
    }
    
    throw new Error(`Contract deployment failed: ${error.message}`);
  }
};
