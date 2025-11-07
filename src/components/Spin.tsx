import { useState, useEffect } from 'react';
import { Wheel } from 'react-custom-roulette';
import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { useAppKitConnection } from '@reown/appkit-adapter-solana/react';

const data = [
  { option: '0.0001 SOL', style: { backgroundColor: '#8B5CF6', textColor: '#FFFFFF' }, weight: 45 },
  { option: '0.001 SOL', style: { backgroundColor: '#3B82F6', textColor: '#FFFFFF' }, weight: 5 },
  { option: '0.005 SOL', style: { backgroundColor: '#10B981', textColor: '#FFFFFF' }, weight: 0 },
  { option: '0.01 SOL', style: { backgroundColor: '#F59E0B', textColor: '#FFFFFF' }, weight: 0 },
  { option: '0.03 SOL', style: { backgroundColor: '#EF4444', textColor: '#FFFFFF' }, weight: 0 },
  { option: '0.05 SOL', style: { backgroundColor: '#EC4899', textColor: '#FFFFFF' }, weight: 0 },
  { option: 'Try Again', style: { backgroundColor: '#6B7280', textColor: '#FFFFFF' }, weight: 50 },
];

function getWeightedRandomIndex(items: typeof data): number {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;
  for (let i = 0; i < items.length; i++) {
    if (random < items[i].weight) return i;
    random -= items[i].weight;
  }
  return items.length - 1;
}

const MAX_SPINS_PER_DAY = 3;
const SPIN_DATA_KEY = 'spin_data';

interface SpinData {
  date: string;
  count: number;
}

interface BackendResponse {
  success: boolean;
  txHash?: string;
  error?: string;
}

interface SpinProps {
  onResult: (result: string) => void;
  address: string | null;
}


export default function Spin({ onResult, address }: SpinProps) {
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeIndex, setPrizeIndex] = useState(0);
  const [remainingSpins, setRemainingSpins] = useState(MAX_SPINS_PER_DAY);
  const [isSpinningDisabled, setIsSpinningDisabled] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState<{ loading: boolean; error: string | null; success: boolean; txHash?: string }>({
    loading: false,
    error: null,
    success: false,
    txHash: undefined,
  });
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [donateAmount, setDonateAmount] = useState('');
  const [donateError, setDonateError] = useState<string | null>(null);
  const [donateSuccess, setDonateSuccess] = useState<string | null>(null);

  const { publicKey, sendTransaction } = useAppKitConnection();

  const prizeMap: Record<number, { reward: string; amount: number; chain: string }> = {
    0: { reward: '0.0001 SOL', amount: 0.0001, chain: 'SOL' },
    1: { reward: '0.001 SOL', amount: 0.001, chain: 'SOL' },
    2: { reward: '0.005 SOL', amount: 0.005, chain: 'SOL' },
    3: { reward: '0.01 SOL', amount: 0.01, chain: 'SOL' },
    4: { reward: '0.03 SOL', amount: 0.03, chain: 'SOL' },
    5: { reward: '0.05 SOL', amount: 0.05, chain: 'SOL' },
    6: { reward: 'Try Again', amount: 0, chain: 'SOL' },
  };

  useEffect(() => {
    if (address) {
      checkSpins(address);
    } else {
      setIsSpinningDisabled(true);
      setRemainingSpins(MAX_SPINS_PER_DAY);
    }
  }, [address]);

  const checkSpins = (addr: string) => {
    const today = new Date().toDateString();
    const spinDataStr = localStorage.getItem(`${SPIN_DATA_KEY}_${addr}`);

    if (spinDataStr) {
      const spinData: SpinData = JSON.parse(spinDataStr);
      if (spinData.date === today) {
        const remaining = MAX_SPINS_PER_DAY - spinData.count;
        setRemainingSpins(remaining);
        setIsSpinningDisabled(remaining <= 0);
        return;
      }
    }
    updateSpinData(addr, 0, today);
    setRemainingSpins(MAX_SPINS_PER_DAY);
    setIsSpinningDisabled(false);
  };

  const updateSpinData = (addr: string, count: number, date: string) => {
    const spinData: SpinData = { date, count };
    localStorage.setItem(`${SPIN_DATA_KEY}_${addr}`, JSON.stringify(spinData));
  };

  const handleSpinClick = () => {
    if (!address || isSpinningDisabled || transactionStatus.loading) return;

    const today = new Date().toDateString();
    const spinDataStr = localStorage.getItem(`${SPIN_DATA_KEY}_${address}`);
    let spinData: SpinData = spinDataStr ? JSON.parse(spinDataStr) : { date: today, count: 0 };

    if (spinData.date !== today) {
      spinData = { date: today, count: 0 };
    }

    if (spinData.count >= MAX_SPINS_PER_DAY) {
      setIsSpinningDisabled(true);
      return;
    }

    spinData.count += 1;
    localStorage.setItem(`${SPIN_DATA_KEY}_${address}`, JSON.stringify(spinData));
    setRemainingSpins(MAX_SPINS_PER_DAY - spinData.count);
    setIsSpinningDisabled(spinData.count >= MAX_SPINS_PER_DAY);

    const selected = getWeightedRandomIndex(data);
    setPrizeIndex(selected);
    setMustSpin(true);
    setTransactionStatus({ loading: false, error: null, success: false, txHash: undefined });
  };


  const handleSpinEnd = async () => {
    setMustSpin(false);
    const prize = prizeMap[prizeIndex];
    onResult(prize.reward);

    if (!address || prize.reward === 'Try Again') return;

    const payload = { address, reward: prize.reward, amount: prize.amount, chain: prize.chain };
    setTransactionStatus({ loading: true, error: null, success: false, txHash: undefined });

    try {
      const res = await fetch('/api/spin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': import.meta.env.VITE_API_KEY || '',
        },
        body: JSON.stringify(payload),
      });

      const rawText = await res.text();
      const responseData: BackendResponse = JSON.parse(rawText);

      if (!res.ok) {
        throw new Error(responseData.error || 'Failed to process reward');
      }

      setTransactionStatus({ loading: false, success: true, error: null, txHash: responseData.txHash });
    } catch (err: any) {
      setTransactionStatus({ loading: false, success: false, error: err.message, txHash: undefined });
    }
  };


  const handleDonate = async () => {
    setDonateError(null);
    setDonateSuccess(null);

    const amount = parseFloat(donateAmount);
    if (isNaN(amount) || amount < 0.001) {
      setDonateError('Minimum donation is 0.001 SOL');
      return;
    }

    if (!publicKey || !sendTransaction) {
      setDonateError('Wallet not connected. Please connect your wallet to donate.');
      return;
    }

    try {
      const connection = new Connection(import.meta.env.VITE_SOLANA_ENDPOINT || 'https://api.mainnet-beta.solana.com');
      const toPubkey = new PublicKey('3KLHVSieHoAiY1XC3yZazxbatoiDHZjGYnWMEcueVAoX'); 

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey,
          lamports: amount * 1e9,
        })
      );

      const signature = await sendTransaction({transaction, connection});
      await connection.confirmTransaction(signature, 'confirmed');

      setDonateSuccess(signature);
      setDonateAmount('');
    } catch (err: any) {
      console.error('Donation error:', err);
      setDonateError(err.message || 'Transaction failed. Please try again.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-800 to-purple-900 p-4 font-sans text-white">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl shadow-2xl p-8 max-w-lg w-full transform transition-all duration-300 hover:scale-[1.02] border border-purple-500/50">
        <h1 className="text-4xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 mb-6 drop-shadow-lg">
          Spin & Win SOL
        </h1>
        <p className="text-center text-gray-300 mb-8 text-lg leading-relaxed">
          Test your luck and win Solana! You get {MAX_SPINS_PER_DAY} free spins daily.
        </p>

        {!address && (
          <div className="mb-8 p-4 bg-yellow-800/30 border border-yellow-700 rounded-lg text-yellow-200 text-center text-sm">
            <p>Please **connect your Solana wallet** to start playing!</p>
          </div>
        )}

        <div className="relative mb-8 flex justify-center items-center">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full w-0 h-0 border-l-[15px] border-r-[15px] border-b-[25px] border-l-transparent border-r-transparent border-b-white z-10 shadow-lg"></div>

          <Wheel
            mustStartSpinning={mustSpin}
            prizeNumber={prizeIndex}
            data={data}
            onStopSpinning={handleSpinEnd}
            outerBorderColor="#4F46E5"
            outerBorderWidth={10}
            innerBorderColor="#6D28D9"
            innerBorderWidth={20}
            radiusLineColor="#312E81"
            radiusLineWidth={3}
            textColors={['#FFFFFF']}
            fontSize={18}
            perpendicularText={true}
            backgroundColors={['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#6B7280']}
          />
        </div>

        <button
          onClick={handleSpinClick}
          disabled={isSpinningDisabled || transactionStatus.loading || !address}
          className={`w-full py-4 rounded-full font-bold text-xl transition duration-300 ease-in-out transform hover:scale-105 shadow-xl border-b-4 border-l-2 border-r-2
            ${isSpinningDisabled || transactionStatus.loading || !address
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed opacity-70 border-gray-600'
              : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 border-blue-700'
            }`}
        >
          {transactionStatus.loading
            ? 'Processing...'
            : !address
              ? 'Connect Wallet to Spin'
              : isSpinningDisabled
                ? 'No Spins Left Today'
                : 'Spin the Wheel!'
          }
        </button>

        <p className="text-center text-gray-400 mt-4 text-md">
          {address ? `Spins remaining today: ${remainingSpins}/${MAX_SPINS_PER_DAY}` : 'Connect your wallet to see spin count.'}
        </p>

        {transactionStatus.error && (
          <div className="bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 rounded-lg relative mt-4 text-center text-sm">
            <p><strong>Error:</strong> {transactionStatus.error}</p>
          </div>
        )}
        {transactionStatus.success && transactionStatus.txHash && (
          <div className="bg-green-900/30 border border-green-700 text-green-300 px-4 py-3 rounded-lg relative mt-4 text-center text-sm">
            <p><strong>Success!</strong> Your reward has been sent. <br /></p>
            <a href={`https://solscan.io/tx/${transactionStatus.txHash}`} target="_blank" rel="noopener noreferrer" className="underline hover:text-green-100 break-all">
              TX: {transactionStatus.txHash.slice(0, 10)}...{transactionStatus.txHash.slice(-10)}
            </a>
          </div>
        )}

        <div className="mt-8 text-center">
          <button
            onClick={() => setShowDonateModal(true)}
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-md text-white bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition duration-300 ease-in-out transform hover:-translate-y-1"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-9a1 1 0 011-1h.01a1 1 0 011 1v2a1 1 0 01-1 1h-.01a1 1 0 01-1-1V9z" clipRule="evenodd"></path>
            </svg>
            Support This App
          </button>
        </div>
      </div>

      {showDonateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4 animate-fadeIn">
          <div className="bg-gray-800 rounded-xl shadow-2xl p-8 max-w-sm w-full relative transform transition-all duration-300 scale-100 animate-zoomIn border border-purple-500/50">
            <button
              onClick={() => setShowDonateModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white text-3xl font-bold transition duration-200"
            >
              &times;
            </button>
            <h2 className="text-3xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-500 mb-4">
              Support Us! 💖
            </h2>
            <p className="text-gray-300 text-md text-center mb-6 leading-relaxed">
              Your generous donations help us cover operational costs and provide more rewards. 100% of funds go directly to the reward vault!
            </p>
            <div className="mb-4">
              <label htmlFor="donate-amount" className="block text-gray-200 text-sm font-bold mb-2">
                Donation Amount (SOL):
              </label>
              <input
                id="donate-amount"
                type="number"
                step="0.001"
                min="0.001"
                placeholder="e.g., 0.01"
                value={donateAmount}
                onChange={(e) => setDonateAmount(e.target.value)}
                className="shadow-inner appearance-none border border-gray-700 bg-gray-900 rounded-lg w-full py-3 px-4 text-gray-100 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              />
            </div>
            <button
              onClick={handleDonate}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-700 text-white font-bold py-3 rounded-lg hover:from-purple-700 hover:to-indigo-800 transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed shadow-md"
              disabled={!publicKey || transactionStatus.loading || !donateAmount}
            >
              {transactionStatus.loading ? 'Sending...' : 'Donate Now'}
            </button>
            {donateError && <p className="text-red-400 mt-4 text-center text-sm font-medium animate-pulse">{donateError}</p>}
            {donateSuccess && (
              <p className="text-green-400 mt-4 text-center text-sm font-medium animate-fadeIn">
                Thank you for your donation! 🎉 <br />
                TX: <a href={`https://solscan.io/tx/${donateSuccess}`} target="_blank" rel="noopener noreferrer" className="underline hover:text-green-200 break-all">
                  {donateSuccess.slice(0, 10)}...{donateSuccess.slice(-10)}
                </a>
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}