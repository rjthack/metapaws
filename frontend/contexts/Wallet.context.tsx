import React, { useEffect } from 'react';
import { ethers } from 'ethers';

export type WalletContext = {
  address?: string;
  connectWallet: () => void;
  disconnectWallet: () => void;
  getProvider: () => ethers.providers.Web3Provider;
};

type ProviderType = {
  children: React.ReactNode;
};

export const walletContext = React.createContext<WalletContext | undefined>(
  undefined
);
export const useWalletContext = () =>
  React.useContext(walletContext) as WalletContext;

export const WalletContextProvider: React.FC<ProviderType> = ({ children }) => {
  const [address, setAddress] = React.useState('');

  const getProvider = () => {
    if (global.window) {
      return new ethers.providers.Web3Provider(
        (global.window as any)?.ethereum
      );
    } else {
    }
  };

  const connectWallet = async () => {
    const provider = getProvider();
    const accounts = await provider.send('eth_requestAccounts', []);
    setAddress(accounts[0]);
  };

  const autoConnectAccount = async () => {
    const provider = getProvider();
    const accounts = await provider.listAccounts();
    if (accounts.length > 0) {
      setAddress(accounts[0]);
    }
  };

  useEffect(() => {
    autoConnectAccount();
  }, []);

  const disconnectWallet = async () => {
    setAddress('');
  };

  return (
    <walletContext.Provider
      value={{ address, connectWallet, disconnectWallet, getProvider }}
    >
      {children}
    </walletContext.Provider>
  );
};
