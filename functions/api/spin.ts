// functions/api/spin.ts
// We import all necessary libraries from Solana Web3.js
import { 
  Connection, 
  Keypair, 
  LAMPORTS_PER_SOL, 
  PublicKey, 
  Transaction, 
  SystemProgram, 
  sendAndConfirmTransaction 
} from '@solana/web3.js';

/**
 * Define the structure of our Environment Variables.
 * These are set securely in the Cloudflare Dashboard, NOT in a .env file.
 */
interface Env {
  SOLANA_RPC_URL: string;
  PRIVATE_KEY: string;      // The server's wallet secret key
  API_KEY: string;          // A secret key to prevent abuse from scripts
  WINNER_LOGS: KVNamespace; // This is our database binding (the shared "logs" array)
}

// A server-side list to validate rewards from the frontend.
// This prevents a user from claiming a reward that doesn't exist.
const ALLOWED_REWARDS: Record<string, number> = {
  "0.0001 SOL": 0.0001,
  "0.001 SOL": 0.001,
  "0.005 SOL": 0.005,
  "0.01 SOL": 0.01,
};

/**
 * This is our main API endpoint for processing a spin.
 * It only responds to POST requests because we named the function 'onRequestPost'.
 */
export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    // 'context' contains the request, environment variables (env), and more.
    const { request, env } = context;

    // 1. Parse incoming data from the frontend
    const { address, reward, amount, chain } = await request.json<any>();
    const apiKey = request.headers.get('x-api-key');

    // 2. Security Check: Validate API Key
    // This ensures that only our frontend can call this function.
    if (apiKey !== env.API_KEY) {
      console.warn('Invalid API Key');
      return new Response(JSON.stringify({ success: false, error: 'Invalid API key' }), {
        status: 403, // 403 Forbidden
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 3. Validation: Check payload
    if (!address || !reward || !amount || chain !== 'SOL') {
      console.warn('Missing or malformed fields');
      return new Response(JSON.stringify({ success: false, error: 'Missing or invalid fields' }), {
        status: 400, // 400 Bad Request
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 4. Validation: Check reward amount
    // Prevents a user from "hacking" the frontend to claim a larger prize.
    const expectedAmount = ALLOWED_REWARDS[reward];
    if (!expectedAmount || expectedAmount !== amount) {
      console.warn('Reward verification failed');
      return new Response(JSON.stringify({ success: false, error: 'Invalid reward or amount' }), {
        status: 400, // 400 Bad Request
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // 5. Solana Logic: Initialize connection and server wallet
    // We pull the RPC URL and Private Key from the secure 'env' context.
    const connection = new Connection(env.SOLANA_RPC_URL, 'confirmed');
    const secretKey = Uint8Array.from(JSON.parse(env.PRIVATE_KEY));
    const sender = Keypair.fromSecretKey(secretKey);

    console.log(`Server wallet public key: ${sender.publicKey.toBase58()}`);
    
    // 6. Solana Logic: Build and send the transaction
    const recipient = new PublicKey(address);
    const lamports = Math.floor(amount * LAMPORTS_PER_SOL);
    console.log(`Sending ${amount} SOL to ${address}...`);

    const latestBlockhash = await connection.getLatestBlockhash();
    const transaction = new Transaction({ 
      recentBlockhash: latestBlockhash.blockhash, 
      feePayer: sender.publicKey 
    }).add(
      SystemProgram.transfer({
        fromPubkey: sender.publicKey,
        toPubkey: recipient,
        lamports,
      })
    );

    // Sign and send the transaction, waiting for confirmation
    const signature = await sendAndConfirmTransaction(connection, transaction, [sender]);
    console.log(`Transaction successful! Signature: ${signature}`);

    // 7. Database Write: Save the winner to Cloudflare KV
    // This is the serverless equivalent of 'logs.push()'.
    const newWinner = { 
      address, 
      amount, 
      txHash: signature,
      timestamp: new Date().toISOString() // History.tsx component needs this
    };
    
    // Get the current list of winners from the KV "database"
    const currentLogs: any[] = (await env.WINNER_LOGS.get("all_winners", { type: "json" })) || [];
    // Add the new winner
    currentLogs.push(newWinner);
    // Keep only the last 50 winners to save space
    const updatedLogs = currentLogs.slice(-50); 
    
    // Save the new, updated list back to the KV database
    await env.WINNER_LOGS.put("all_winners", JSON.stringify(updatedLogs));
    
    // 8. Return success response to the frontend
    return new Response(JSON.stringify({ success: true, txHash: signature }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err: any) {
    // 9. Error Handling
    console.error('Function Error:', err);
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500, // 500 Internal Server Error
      headers: { 'Content-Type': 'application/json' },
    });
  }
};