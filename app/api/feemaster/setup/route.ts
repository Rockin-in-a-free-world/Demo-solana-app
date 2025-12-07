import { NextRequest, NextResponse } from 'next/server';
import { createFeemasterAccount, getFeemasterPublicKey } from '@/lib/feemaster';
import { generateSeedPhrase } from '@/lib/feemaster-generate';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Setup feemaster account - creates account index 0 and stores in .env
 * This is the FIRST operation - just account creation and storage
 * Uses Tether SDK to create the account
 * 
 * Can either:
 * - Generate a new seed phrase (if seedPhrase not provided)
 * - Use provided seed phrase
 */
export async function POST(request: NextRequest) {
  try {
    let { seedPhrase } = await request.json();

    // If no seed phrase provided, generate one
    if (!seedPhrase || seedPhrase.trim() === '') {
      seedPhrase = generateSeedPhrase();
    }

    // Remove validation - just use whatever is provided or generated
    // If user provided a seed phrase, use it as-is (Tether SDK will validate if needed)

    // Create feemaster account using Tether SDK
    const walletManager = createFeemasterAccount(seedPhrase);
    const publicKey = await getFeemasterPublicKey(walletManager);

    // Store credentials
    // On Railway: Use Railway environment variables (set via dashboard or API)
    // Local dev: Store in .env.local for development
    const isRailway = process.env.RAILWAY_ENVIRONMENT === 'production' || process.env.RAILWAY;
    
    if (isRailway) {
      // On Railway: Return instructions to add to Railway secrets
      // Railway secrets should be added via Railway dashboard or Railway API
      return NextResponse.json({
        success: true,
        publicKey,
        seedPhrase, // User should add this to Railway secrets
        message: 'Feemaster account created. Add FEEMASTER_SEED_PHRASE and FEEMASTER_PUBLIC_KEY to Railway Variables.',
        instructions: 'Go to Railway dashboard → Your Project → Variables → Add: FEEMASTER_SEED_PHRASE and FEEMASTER_PUBLIC_KEY',
        railway: true,
      });
    } else {
      // Local development: Store in .env.local
      const envPath = path.join(process.cwd(), '.env.local');
      let envContent = '';
      
      // Read existing .env.local if it exists
      if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf-8');
      }

      // Add or update feemaster credentials
      const lines = envContent.split('\n');
      const newLines: string[] = [];
      let foundSeed = false;
      let foundPublicKey = false;

      for (const line of lines) {
        if (line.startsWith('FEEMASTER_SEED_PHRASE=')) {
          newLines.push(`FEEMASTER_SEED_PHRASE="${seedPhrase}"`);
          foundSeed = true;
        } else if (line.startsWith('FEEMASTER_PUBLIC_KEY=')) {
          newLines.push(`FEEMASTER_PUBLIC_KEY=${publicKey}`);
          foundPublicKey = true;
        } else if (line.trim() !== '') {
          newLines.push(line);
        }
      }

      // Add missing entries
      if (!foundSeed) {
        newLines.push(`FEEMASTER_SEED_PHRASE="${seedPhrase}"`);
      }
      if (!foundPublicKey) {
        newLines.push(`FEEMASTER_PUBLIC_KEY=${publicKey}`);
      }

      // Write to .env.local
      fs.writeFileSync(envPath, newLines.join('\n') + '\n');

      return NextResponse.json({
        success: true,
        publicKey,
        seedPhrase, // Return seed phrase if it was generated
        message: 'Feemaster account created and stored in .env.local',
      });
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to setup feemaster account' },
      { status: 500 }
    );
  }
}

