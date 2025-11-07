// functions/api/winners.ts

/**
 * Define the Environment Variables.
 * We only need the KV database binding for this endpoint.
 */
interface Env {
  WINNER_LOGS: KVNamespace;
}

/**
 * This endpoint responds to GET requests at /api/winners
 * because we named it 'onRequestGet'.
 * Its only job is to read the data that 'spin.ts' wrote.
 */
export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const { env } = context;
    
    // 1. Read the list of winners from our KV database ("all_winners" key)
    // This is the serverless equivalent of 'res.json(logs)'.
    const logs = await env.WINNER_LOGS.get("all_winners", { type: "json" }) || [];

    // 2. Return the list as a JSON response
    // We add a Cache-Control header to improve performance,
    // so Cloudflare's Edge caches this response for 60 seconds.
    return new Response(JSON.stringify(logs), {
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60' // Cache for 60 seconds
      },
    });

  } catch (err: any) {
    // 3. Error Handling
    console.error('Failed to fetch winners:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};