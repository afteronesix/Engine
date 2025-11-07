import { StrictMode } from 'react'
import { FarcasterSolanaProvider } from '@farcaster/mini-app-solana';
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Import Buffer polyfill
import { Buffer } from 'buffer';

// Inject Buffer ke global window
(window as any).Buffer = Buffer;

const solanaEndpoint = 'https://mainnet.helius-rpc.com/?api-key=124f2fb7-f0aa-49b2-8518-bdcf89846341'; 

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FarcasterSolanaProvider endpoint={solanaEndpoint}>
      <App />
    </FarcasterSolanaProvider>
  </StrictMode>,
)
