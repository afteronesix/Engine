import { useEffect } from 'react';
import { sdk } from '@farcaster/frame-sdk';
import Menu from './components/Menu';
import Maintenance from './components/maintenance';

import { useAppKit } from '@reown/appkit/react'; 

function App() {
  const { address } = useAppKit();
  const isMaintenanceMode = false;

  useEffect(() => {
    sdk.actions.ready();
  }, []);

  if (isMaintenanceMode) {
    return <Maintenance />;
  }

  if (!address) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-indigo-900 text-white flex-col gap-4">
        <h1 className="text-3xl font-bold">Welcome to SOL Wheel!</h1>
        <p>Connect your wallet to play.</p>
        <appkit-button /> 
      </div>
    );
  }

  return (
    <div>
      <Menu address={address} />
    </div>
  );
}

export default App;