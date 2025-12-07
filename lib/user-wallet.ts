/**
 * User wallet management using Tether WDK SDK
 * 
 * ARCHITECTURE:
 * - Tether WDK SDK (@tetherto/wdk-wallet-solana): Used for ALL wallet operations
 * - Same pattern as feemaster: seed phrase → Tether WDK SDK → account index 0
 * 
 * This is the main purpose of the demo - to showcase Tether WDK SDK for transactions.
 */

import WalletManagerSolana from '@tetherto/wdk-wallet-solana';
import { SOLANA_RPC_URL } from './solana';

/**
 * Create Tether WDK wallet manager from seed phrase (if available)
 * 
 * This is the preferred method if Web3Auth provides a seed phrase
 */
export function createUserWalletManagerFromSeed(seedPhrase: string): WalletManagerSolana {
  return new WalletManagerSolana(seedPhrase, {
    rpcUrl: SOLANA_RPC_URL,
    commitment: 'confirmed'
  });
}

/**
 * Get user account using Tether WDK SDK
 * 
 * @param walletManager - Tether WDK wallet manager
 * @param accountIndex - Account index (default: 0)
 * @returns WDK account instance
 */
export async function getUserAccount(
  walletManager: WalletManagerSolana,
  accountIndex: number = 0
) {
  return await walletManager.getAccount(accountIndex);
}

/**
 * Send transaction using Tether WDK SDK
 * 
 * This is the main transaction method - uses Tether WDK SDK as required.
 * Based on working examples in solana-wallet-integration/src/app.ts
 */
export async function sendTransactionWithWDK(
  walletManager: WalletManagerSolana,
  accountIndex: number,
  recipient: string,
  amountLamports: bigint
): Promise<string> {
  const account = await getUserAccount(walletManager, accountIndex);
  
  // Use Tether WDK SDK's sendTransaction method
  // Based on working example: account.sendTransaction({ recipient, value, commitment })
  const signature = await (account as any).sendTransaction({
    recipient,
    value: amountLamports,
    commitment: 'confirmed',
  });

  return signature;
}

