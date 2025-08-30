import { ethers, Contract, parseUnits } from "ethers";
import { getSigner, getProvider, getAgentAddress } from "../../core/client";
import { erc20Abi } from "./abis";

// Common burn address - using a well-known burn address that nobody has access to
const BURN_ADDRESS = "0x000000000000000000000000000000000000dEaD";

export const transferErc20 = async ({
  tokenAddress,
  toAddress,
  amount
}: {
  tokenAddress: string;
  toAddress: string;
  amount: string | number;
}): Promise<string> => {
  try {
    // Validate required parameters
    if (!tokenAddress) {
      throw new Error("Token address is required");
    }
    
    if (!toAddress) {
      throw new Error("Recipient address is required");
    }
    
    if (!amount || Number(amount) <= 0) {
      throw new Error("Amount must be greater than 0");
    }

    // Validate addresses
    if (!ethers.isAddress(tokenAddress)) {
      throw new Error("Invalid token address format");
    }
    
    if (!ethers.isAddress(toAddress)) {
      throw new Error("Invalid recipient address format");
    }

    const signer = getSigner();
    const provider = getProvider();
    
    if (!signer) {
      throw new Error("Signer not initialized");
    }

    // Check signer balance for gas fees
    const signerBalance = await provider.getBalance(signer.address);
    if (signerBalance === 0n) {
      throw new Error("Insufficient balance for gas fees");
    }

    const tokenContract = new Contract(tokenAddress, erc20Abi, signer);
    
    // Validate contract functions are available
    if (!tokenContract.transfer || !tokenContract.decimals || !tokenContract.balanceOf) {
      throw new Error("Required functions not available on token contract");
    }

    // Get token decimals and current balance
    const [decimals, currentBalance, symbol] = await Promise.all([
      tokenContract.decimals(),
      tokenContract.balanceOf(signer.address),
      tokenContract.symbol().catch(() => "Unknown") // Optional, don't fail if not available
    ]);

    // Convert amount to proper units
    const amountInWei = parseUnits(amount.toString(), decimals);
    
    // Check if user has sufficient token balance
    if (currentBalance < amountInWei) {
      const currentBalanceFormatted = ethers.formatUnits(currentBalance, decimals);
      throw new Error(`Insufficient token balance. Current: ${currentBalanceFormatted} ${symbol}, Required: ${amount}`);
    }

    console.log(`Transferring ${amount} ${symbol} to ${toAddress}...`);
    
    // Execute transfer
    const tx = await tokenContract.transfer(toAddress, amountInWei);
    console.log(`Transfer transaction sent: ${tx.hash}`);
    
    // Wait for confirmation
    const receipt = await tx.wait();
    
    if (!receipt) {
      throw new Error("Transaction receipt not available");
    }
    
    if (receipt.status !== 1) {
      throw new Error("Transaction failed");
    }
    
    console.log(`✅ Transfer completed successfully. Transaction hash: ${tx.hash}`);
    return tx.hash;
    
  } catch (error: any) {
    console.error("ERC20 transfer failed:", error.message);
    
    // Handle specific error types
    if (error.code === 'INSUFFICIENT_FUNDS') {
      throw new Error("Insufficient funds for gas fees");
    } else if (error.code === 'NETWORK_ERROR') {
      throw new Error("Network error during transfer");
    } else if (error.code === 'TIMEOUT') {
      throw new Error("Transfer transaction timed out");
    } else if (error.message.includes("transfer amount exceeds balance")) {
      throw new Error("Transfer amount exceeds token balance");
    }
    
    throw new Error(`ERC20 transfer failed: ${error.message}`);
  }
};

export const burnErc20 = async ({
  tokenAddress,
  amount
}: {
  tokenAddress: string;
  amount: string | number;
}): Promise<string> => {
  try {
    // Validate required parameters
    if (!tokenAddress) {
      throw new Error("Token address is required");
    }
    
    if (!amount || Number(amount) <= 0) {
      throw new Error("Amount must be greater than 0");
    }

    // Validate token address
    if (!ethers.isAddress(tokenAddress)) {
      throw new Error("Invalid token address format");
    }

    const signer = getSigner();
    const provider = getProvider();
    
    if (!signer) {
      throw new Error("Signer not initialized");
    }

    // Check signer balance for gas fees
    const signerBalance = await provider.getBalance(signer.address);
    if (signerBalance === 0n) {
      throw new Error("Insufficient balance for gas fees");
    }

    const tokenContract = new Contract(tokenAddress, erc20Abi, signer);
    
    // Validate contract functions are available
    if (!tokenContract.transfer || !tokenContract.decimals || !tokenContract.balanceOf) {
      throw new Error("Required functions not available on token contract");
    }

    // Get token details
    const [decimals, currentBalance, symbol] = await Promise.all([
      tokenContract.decimals(),
      tokenContract.balanceOf(signer.address),
      tokenContract.symbol().catch(() => "Unknown") // Optional, don't fail if not available
    ]);

    // Convert amount to proper units
    const amountInWei = parseUnits(amount.toString(), decimals);
    
    // Check if user has sufficient token balance
    if (currentBalance < amountInWei) {
      const currentBalanceFormatted = ethers.formatUnits(currentBalance, decimals);
      throw new Error(`Insufficient token balance. Current: ${currentBalanceFormatted} ${symbol}, Required: ${amount}`);
    }

    console.log(`Burning ${amount} ${symbol} (transferring to burn address)...`);
    
    // Execute burn by transferring to burn address
    const tx = await tokenContract.transfer(BURN_ADDRESS, amountInWei);
    console.log(`Burn transaction sent: ${tx.hash}`);
    
    // Wait for confirmation
    const receipt = await tx.wait();
    
    if (!receipt) {
      throw new Error("Transaction receipt not available");
    }
    
    if (receipt.status !== 1) {
      throw new Error("Transaction failed");
    }
    
    console.log(`✅ Burn completed successfully. ${amount} ${symbol} sent to burn address. Transaction hash: ${tx.hash}`);
    return tx.hash;
    
  } catch (error: any) {
    console.error("ERC20 burn failed:", error.message);
    
    // Handle specific error types
    if (error.code === 'INSUFFICIENT_FUNDS') {
      throw new Error("Insufficient funds for gas fees");
    } else if (error.code === 'NETWORK_ERROR') {
      throw new Error("Network error during burn");
    } else if (error.code === 'TIMEOUT') {
      throw new Error("Burn transaction timed out");
    } else if (error.message.includes("transfer amount exceeds balance")) {
      throw new Error("Burn amount exceeds token balance");
    }
    
    throw new Error(`ERC20 burn failed: ${error.message}`);
  }
};
