// src/components/History.tsx
import { useEffect, useState } from 'react';

type Winner = {
  address: string;
  amount: number;
  txHash: string;
  timestamp: string;
};

export default function History() {
  const [winners, setWinners] = useState<Winner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWinners = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/winners`);
        const data = await response.json();
        setWinners(data.slice(-3).reverse()); 
      } catch (error) {
        console.error('Failed to fetch winners:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWinners();
  }, []);

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const shortenTx = (tx: string) => {
    return `${tx.slice(0, 6)}...${tx.slice(-4)}`;
  };

  return (
    <div className="mt-8 w-full max-w-md mx-auto">
      <h2 className="text-lg font-bold mb-4 text-center text-white">🏆 Recent Winners</h2>
      <div className="grid gap-4">
        {loading ? (
          <div className="text-center text-gray-300">Loading...</div>
        ) : winners.length === 0 ? (
          <div className="text-center text-gray-300">No winners yet.</div>
        ) : (
          winners.map((winner, i) => (
            <div
              key={i}
              className="border border-white/20 rounded-xl p-4 shadow-md bg-white/20 backdrop-blur-sm flex flex-col gap-2"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white">
                  {winner.address.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-medium text-white">{shortenAddress(winner.address)}</div>
                  <div className="text-xs text-gray-200">
                    {new Date(winner.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-green-200 font-semibold">{winner.amount} SOL</div>
                <a
                  href={`https://solscan.io/tx/${winner.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-200 text-xs underline"
                >
                  {shortenTx(winner.txHash)}
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
