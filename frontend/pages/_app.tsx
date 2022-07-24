import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { Nav } from '../components/Nav';
import { WalletContextProvider } from '../contexts/Wallet.context';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WalletContextProvider>
      <Nav/>
      <div className='min-h-screen bg-orange-50'>
        <Component {...pageProps} />
      </div>
    </WalletContextProvider>
  )
}

export default MyApp
