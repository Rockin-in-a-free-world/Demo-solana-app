import { NextRequest, NextResponse } from 'next/server';
import { createFeemasterAccount, getFeemasterBalance } from '@/lib/feemaster';

/**
 * Get feemaster account balance using Tether SDK
 * This is a SECONDARY operation (button on dashboard)
 * 
 * Reads seed phrase from environment variables (Railway secrets or .env.local)
 */
export async function GET(request: NextRequest) {
  try {
    // Get seed phrase from environment variables
    // Railway: Automatically injected as process.env.FEEMASTER_SEED_PHRASE
    // Local: From .env.local (loaded by Next.js)
    const seedPhrase = process.env.FEEMASTER_SEED_PHRASE;
    
    if (!seedPhrase) {
      return NextResponse.json(
        { error: 'Feemaster account not set up. Run setup first and add FEEMASTER_SEED_PHRASE to environment variables.' },
        { status: 400 }
      );
    }
    
    // Create wallet manager and get balance using Tether SDK
    const walletManager = createFeemasterAccount(seedPhrase);
    const balanceLamports = await getFeemasterBalance(walletManager);
    const balanceSOL = Number(balanceLamports) / 1e9;

    return NextResponse.json({
      success: true,
      balance: balanceLamports.toString(),
      balanceSOL: balanceSOL.toFixed(4),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to get balance' },
      { status: 500 }
    );
  }
}

