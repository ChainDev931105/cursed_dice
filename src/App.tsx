import {FC, useMemo} from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from './pages/Home';
import Admin from './pages/Admin';
import {WalletAdapterNetwork} from '@solana/wallet-adapter-base';
import {
    LedgerWalletAdapter,
    PhantomWalletAdapter,
    SlopeWalletAdapter,
    SolflareWalletAdapter,
    SolletExtensionWalletAdapter,
    SolletWalletAdapter,
    TorusWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import {clusterApiUrl} from '@solana/web3.js';
import {ConnectionProvider, WalletProvider} from "@solana/wallet-adapter-react";
import {WalletDialogProvider} from "@solana/wallet-adapter-material-ui";
  
import 'bootstrap/dist/css/bootstrap.min.css';
import AdminUpdate from "./pages/AdminUpdate";

const App: FC = () => {
    // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.
    const network = WalletAdapterNetwork.Devnet;

    // You can also provide a custom RPC endpoint.
    const endpoint = useMemo(() => clusterApiUrl(network), [network]);

    // @solana/wallet-adapter-wallets includes all the adapters but supports tree shaking and lazy loading --
    // Only the wallets you configure here will be compiled into your application, and only the dependencies
    // of wallets that your users connect to will be loaded.
    const wallets = useMemo(
        () => [
            new PhantomWalletAdapter(),
            new SlopeWalletAdapter(),
            new SolflareWalletAdapter(),
            new TorusWalletAdapter(),
            new LedgerWalletAdapter(),
            new SolletWalletAdapter({network}),
            new SolletExtensionWalletAdapter({network}),
        ],
        [network]
    );

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletDialogProvider>
                    <Router>
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/house-admin" element={<Admin />} />
                            <Route path="/view-house/:admin/:program" element={<AdminUpdate />} />
                        </Routes>
                    </Router>
                </WalletDialogProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
}

export default App;
