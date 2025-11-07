// src/hooks/account.tsx
import { useFarcasterAccount } from "./FarcasterAccount";
import { useState } from "react";

export default function Account({ address }: { address: string }) {
  const { data: account } = useFarcasterAccount();
  const [showDetail, setShowDetail] = useState(false);

  if (!account) return null;

  return (
    <>
      {/* Trigger (pfp + username) */}
      <div
        onClick={() => setShowDetail(true)}
        className="absolute top-5 right-5 flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-3xl z-50 cursor-pointer hover:bg-white/30 transition"
      >
        <img
          src={account.pfpUrl}
          alt="User Avatar"
          className="w-6 h-6 rounded-full border border-white"
        />
        <span className="text-white text-sm font-medium">@{account.username}</span>
      </div>

      {/* Modal detail */}
      {showDetail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 shadow-xl w-80 text-center relative">
            <button
              onClick={() => setShowDetail(false)}
              className="absolute top-2 right-3 text-gray-500 hover:text-black text-sm"
            >
              ✕
            </button>
            <img
              src={account.pfpUrl}
              alt="Profile"
              className="w-20 h-20 rounded-full mx-auto mb-4 border-2 border-purple-600"
            />
            <h2 className="text-lg font-semibold mb-2">@{account.username}</h2>
            <p className="text-sm text-gray-600 break-all">
              <span className="font-semibold">SOL Address:</span><br /> {address}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
