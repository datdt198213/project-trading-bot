// Function to create a SUI wallet
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { MIST_PER_SUI } from '@mysten/sui/utils';

export async function createSuiWallet(): Promise<Ed25519Keypair> {
    // Generate a new keypair
    return new Ed25519Keypair();
}
