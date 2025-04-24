import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import * as linera from '@linera/client';

// Prevent double-initialization under React StrictMode
let lineraInitialized = false;

interface LineraContextType {
  client?: linera.Client;
  wallet?: linera.Wallet;
  chainId?: string;
  backend?: any;
  loading: boolean;
  status: 'Loading' | 'Creating Wallet' | 'Creating Client' | 'Creating Chain' | 'Ready';
  error?: Error;
}

const LineraContext = createContext<LineraContextType>({ loading: true, status: 'Loading' });

export const useLinera = () => useContext(LineraContext);

export const LineraProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<LineraContextType>({ loading: true, status: 'Loading' });

  useEffect(() => {
    if (lineraInitialized) return;
    lineraInitialized = true;
    async function initLinera() {
      try {
        console.log('Linera init: loading WASM');
        await linera.default();
        setState(prev => ({ ...prev, status: 'Creating Wallet' }));
        console.log('Linera init: WASM loaded');
        const faucet = new linera.Faucet('https://faucet.testnet-babbage.linera.net');
        const wallet = await faucet.createWallet();
        setState(prev => ({ ...prev, status: 'Creating Client' }));
        console.log('Linera init: wallet', wallet);
        const clientInstance = await new linera.Client(wallet);
        setState(prev => ({ ...prev, status: 'Creating Chain' }));
        console.log('Linera init: client', clientInstance);
        const chainId = await faucet.claimChain(clientInstance);
        console.log('Linera init: chainId', chainId);
        const backend = await clientInstance.frontend().application(
          "d42c05544165f040b11e789a54b4754fa304fa16a2777bc16985e3caa6ed17ec"
        );
        console.log('Linera init: backend', backend);
        setState(prev => ({
          ...prev,
          client: clientInstance,
          wallet,
          chainId,
          backend,
          loading: false,
          status: 'Ready',
        }));
      } catch (err) {
        console.error('Linera init error', err);
        setState(prev => ({
          ...prev,
          loading: false,
          error: err as Error,
        }));
      }
    }
    initLinera();
  }, []);

  return <LineraContext.Provider value={state}>{children}</LineraContext.Provider>;
};
