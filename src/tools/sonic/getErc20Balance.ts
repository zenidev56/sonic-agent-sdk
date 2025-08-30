import { ethers, Contract } from "ethers";
import { getProvider, getAgentAddress } from "../../core/client";
import { erc20Abi } from "./abis";

export const getErc20Balance = async ({ 
  tokenAddress,
  walletAddress
}: { 
  tokenAddress: string;
  walletAddress?: string;
}): Promise<string> => {
  try {
    const provider = getProvider();
    const agentAddress = getAgentAddress();
    
    // Validate wallet address if provided
    if (walletAddress && !ethers.isAddress(walletAddress)) {
      throw new Error("Invalid wallet address format");
    }
    
    // Validate token address 
    if (!tokenAddress) {
      throw new Error("Token address is required");
    }
    
    if (!ethers.isAddress(tokenAddress)) {
      throw new Error("Invalid token address format");
    }
    
    const addressToCheck = walletAddress || agentAddress;
    
    if (!provider) {
      throw new Error("Provider not initialized");
    }

    const tokenContract = new Contract(tokenAddress, erc20Abi, provider);
    const balanceOfFunction = tokenContract.balanceOf;
    const decimalsFunction = tokenContract.decimals;
    const symbolFunction = tokenContract.symbol;
    
    if (!balanceOfFunction || !decimalsFunction || !symbolFunction) {
      throw new Error('Required functions not available on token contract');
    }
    
    const [balance, decimals, symbol] = await Promise.all([
        balanceOfFunction(addressToCheck),
        decimalsFunction(),
        symbolFunction()
    ]);

    const formattedBalance = ethers.formatUnits(balance, decimals);
    const numericBalance = parseFloat(formattedBalance);
    return `${numericBalance} ${symbol}`;
  } catch (error: any) {
    throw new Error(`Error: ${error.message}`);
  }
}; 