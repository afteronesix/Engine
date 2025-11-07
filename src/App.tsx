import { useWallet } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react';
import { sdk } from '@farcaster/frame-sdk';
import Menu from './components/Menu';
import Maintenance from './components/maintenance';

function App() {
  const { publicKey } = useWallet();
  const [address, setAddress] = useState<string | null>(null);
  const isMaintenanceMode = false;


  useEffect(() => {
    sdk.actions.ready();
  }, []);

  
  useEffect(() => {
    if (publicKey) {
      setAddress(publicKey.toBase58());
    }
  }, [publicKey]);

  if (isMaintenanceMode) {
    return <Maintenance />;
  }

  if (!address) {
    return <div className="p-4 text-center">Connecting wallet...</div>;
  }

  return (
    <div>
      <Menu address={address} />
    </div>
  );
}

export default App;
