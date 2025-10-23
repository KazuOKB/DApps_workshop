import React from "react";
import ReactDOM from "react-dom/client";
import "@mysten/dapp-kit/dist/index.css";
import "@radix-ui/themes/styles.css";

import { SuiClientProvider, WalletProvider } from "@mysten/dapp-kit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Theme } from "@radix-ui/themes";
import App from "./App.tsx";
import { networkConfig } from "./networkConfig.ts";

const queryClient = new QueryClient();

// ===========================================================================
// ネットワーク設定の読み込みと検証
// ===========================================================================
// 環境変数から接続先ネットワークを取得
// .envファイルでVITE_NETWORK=mainnet/testnet/devnetを設定できます
const network = import.meta.env.VITE_NETWORK;

// 有効なネットワーク名のリスト
const validNetworks = ["mainnet", "testnet", "devnet"] as const;
type NetworkType = (typeof validNetworks)[number];

// ネットワーク名が有効かチェックする型ガード関数
function isValidNetwork(value: string): value is NetworkType {
    return validNetworks.includes(value as NetworkType);
}

// 環境変数が有効な値かチェックし、無効な場合はtestnetにフォールバック
const defaultNetwork = isValidNetwork(network) ? network : "testnet";

// 開発時の警告：無効なネットワーク設定の場合
if (!isValidNetwork(network)) {
    console.warn(
        `Invalid VITE_NETWORK: "${network}". Using "testnet" as fallback.`,
    );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <Theme appearance="dark">
            <QueryClientProvider client={queryClient}>
                <SuiClientProvider
                    networks={networkConfig}
                    defaultNetwork={defaultNetwork}
                >
                    <WalletProvider autoConnect>
                        <App />
                    </WalletProvider>
                </SuiClientProvider>
            </QueryClientProvider>
        </Theme>
    </React.StrictMode>,
);
