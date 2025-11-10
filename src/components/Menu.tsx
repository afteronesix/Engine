// src/components/Menu.tsx
import Spin from './Spin';
import History from './History';
import { useState } from 'react';
import { sdk } from '@farcaster/frame-sdk';

export default function Menu({ address }: { address: string }) {
  const [lastReward, setLastReward] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="min-h-screen p-4 bg-green-700 text-center relative">
      {/* Solana Address */}
      <div className="absolute top-4 left-4 rounded-full px-4 py-1 text-sm text-gray-700 shadow">
        <appkit-button/>
      </div>

      
      <div className="mt-20">
        <Spin
  address={address}
  onResult={(reward) => {
    setLastReward(reward);
    if (reward !== 'Try Again') {
      setShowModal(true);
    }
  }}
/>

      </div>

      {/* Modal Winner */}
      {showModal && lastReward && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl text-center w-80">
            <h2 className="text-xl font-bold mb-2">🎉 Congratulations!</h2>
            <p className="mb-4">
              You win : <span className="font-semibold">{lastReward}</span>
            </p>
            <button
              onClick={async () => {
                try {
                  await sdk.actions.composeCast({
                    text: `I just won ${lastReward} on SOL Wheel! Try your luck too`,
                    embeds: ['https://solana-wheel.vercel.app/'],
                  });
                } catch (e) {
                  console.error('Share failed:', e);
                }
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg w-full hover:bg-blue-700"
            >
              Share to Farcaster
            </button>
            <button
              onClick={() => setShowModal(false)}
              className="mt-3 text-sm text-gray-500 hover:underline"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <History />
    </div>
  );
}
