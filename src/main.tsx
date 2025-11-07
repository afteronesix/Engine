import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App'; 

import { createAppKit } from "@reown/appkit/react";
import { SolanaAdapter } from "@reown/appkit-adapter-solana/react";
import { solana, solanaTestnet, solanaDevnet } from "@reown/appkit/networks";

import { Buffer } from 'buffer';

(window as any).Buffer = Buffer;

const solanaWeb3JsAdapter = new SolanaAdapter();

const projectId = "b5177ed9c756b72ea8a9cb11f7aab606"; // get on https://reown.com

const metadata = {
  name: "SOL Wheel Game",
  description: "Spin the wheel to win SOL!",
  url: "https://solana-wheel.vercel.app/", 
  icons: ["https://solana-wheel.vercel.app/logo.png"], 
};


createAppKit({
  adapters: [solanaWeb3JsAdapter],
  networks: [solana, solanaTestnet, solanaDevnet],
  metadata: metadata,
  projectId,
  features: {
    analytics: true,
  },
});


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);