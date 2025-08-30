import { ethers, parseEther } from "ethers";
import { getSigner, getProvider, getAgentAddress } from "../../core/client";

export const transferS = async ({
  toAddress,
  amount
}: {
  toAddress: string;
  amount: string | number;
}): Promise<string> => {
  try {
    // Validate required parameters
    if (!toAddress) {
      throw new Error("Recipient address is required");
    }
    
    if (!amount || Number(amount) <= 0) {
      throw new Error("Amount must be greater than 0");
    }

    // Validate recipient address
    if (!ethers.isAddress(toAddress)) {
      throw new Error("Invalid recipient address format");
    }

    const signer = getSigner();
    const provider = getProvider();
    
    if (!signer) {
      throw new Error("Signer not initialized");
    }

    if (!provider) {
      throw new Error("Provider not initialized");
    }

    // Get current balance
    const currentBalance = await provider.getBalance(signer.address);
    
    // Convert amount to wei
    const amountInWei = parseEther(amount.toString());
    
    // Estimate gas for the transaction
    const gasEstimate = await provider.estimateGas({
      to: toAddress,
      value: amountInWei,
      from: signer.address
    });
    
    // Get current gas price
    const feeData = await provider.getFeeData();
    const gasPrice = feeData.gasPrice || parseEther("0.000000001"); // fallback gas price
    
    // Calculate total gas cost
    const gasCost = gasEstimate * gasPrice;
    const totalRequired = amountInWei + gasCost;
    
    // Check if user has sufficient balance including gas
    if (currentBalance < totalRequired) {
      const currentBalanceFormatted = ethers.formatEther(currentBalance);
      const totalRequiredFormatted = ethers.formatEther(totalRequired);
      const gasCostFormatted = ethers.formatEther(gasCost);
      throw new Error(
        `Insufficient S balance. Current: ${currentBalanceFormatted} S, ` +
        `Required: ${totalRequiredFormatted} S (${amount} S + ${gasCostFormatted} S gas)`
      );
    }

    console.log(`Transferring ${amount} S to ${toAddress}...`);
    
    // Execute transfer
    const tx = await signer.sendTransaction({
      to: toAddress,
      value: amountInWei,
      gasLimit: gasEstimate
    });
    
    console.log(`S transfer transaction sent: ${tx.hash}`);
    
    // Wait for confirmation
    const receipt = await tx.wait();
    
    if (!receipt) {
      throw new Error("Transaction receipt not available");
    }
    
    if (receipt.status !== 1) {
      throw new Error("Transaction failed");
    }
    
    console.log(`✅ S transfer completed successfully. Transaction hash: ${tx.hash}`);
    return tx.hash;
    
  } catch (error: any) {
    console.error("S transfer failed:", error.message);
    
    // Handle specific error types
    if (error.code === 'INSUFFICIENT_FUNDS') {
      throw new Error("Insufficient funds for gas fees");
    } else if (error.code === 'NETWORK_ERROR') {
      throw new Error("Network error during transfer");
    } else if (error.code === 'TIMEOUT') {
      throw new Error("Transfer transaction timed out");
    } else if (error.message.includes("insufficient funds")) {
      throw new Error("Insufficient S balance for transfer and gas fees");
    } else if (error.message.includes("gas")) {
      throw new Error("Gas estimation failed or gas limit exceeded");
    }
    
    throw new Error(`S transfer failed: ${error.message}`);
  }
};
