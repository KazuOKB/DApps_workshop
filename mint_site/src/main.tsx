// =============================================================================
// このファイル（main.tsx）の役割
// -----------------------------------------------------------------------------
// ・React アプリを「起動」して、index.html の <div id="root"> に表示します。
// ・アプリ全体で使う “道具箱（Provider）” をここでまとめて設定します。
//   例）見た目のテーマ、データ取得の仕組み、Sui のネットワーク設定、
//       ウォレット接続の仕組み など
// ・実際の画面（UI）は App.tsx 側で作り、ここでは <App /> を包んで渡します。
// =============================================================================

import React from "react"; // React を使うための基本の import
import ReactDOM from "react-dom/client"; // ブラウザに描画（マウント）するための機能

// dApp Kit のスタイル（ウォレット接続ボタン等の見た目）を読み込み
import "@mysten/dapp-kit/dist/index.css";
// Radix UI（UI コンポーネント）のテーマ用スタイルを読み込み
import "@radix-ui/themes/styles.css";

// Sui 公式の dApp Kit：SuiClientProvider（RPC 接続）と WalletProvider（ウォレット）
import { SuiClientProvider, WalletProvider } from "@mysten/dapp-kit";
// データ取得のキャッシュ＆フェッチ管理（React Query）
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// Radix UI のテーマ（ダーク/ライトなど外観を揃える）
import { Theme } from "@radix-ui/themes";
// 画面本体となるコンポーネント
import App from "./App.tsx";
// Sui のネットワーク設定（devnet / testnet / mainnet の RPC URL）
import { networkConfig } from "./networkConfig.ts";

// React Query の管理人（クライアント）を 1 つ作る
// → アプリ全体で同じものを使い回す
const queryClient = new QueryClient();

// ===========================================================================
// ネットワーク設定の読み込みと検証
// ===========================================================================
// 環境変数から接続先ネットワークを取得
// ・.env ファイルで VITE_NETWORK=mainnet/testnet/devnet を設定できます
// ・ビルド／起動時に Vite が import.meta.env に注入します
const network = import.meta.env.VITE_NETWORK;

// 有効なネットワーク名のリスト（この中のどれかなら OK）
const validNetworks = ["mainnet", "testnet", "devnet"] as const;
type NetworkType = (typeof validNetworks)[number];

// ネットワーク名が有効かチェックする関数
function isValidNetwork(value: string): value is NetworkType {
    return validNetworks.includes(value as NetworkType);
}

// 環境変数が有効かチェックし、無効なら "testnet" に自動フォールバック
const defaultNetwork = isValidNetwork(network) ? network : "testnet";

// 開発時の注意：ネットワーク名が間違っていたらコンソールに警告
if (!isValidNetwork(network)) {
    console.warn(
        `Invalid VITE_NETWORK: "${network}". Using "testnet" as fallback.`,
    );
}

// index.html の <div id="root"></div> を見つける（ここに React を描画）
const rootElement = document.getElementById("root");
if (!rootElement) {
    throw new Error("Root element not found");
}
ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
        {/* Theme：アプリ全体の見た目（ここではダーク）を統一 */}
        <Theme appearance="dark">
            {/* React Query：データ取得の仕組みを全体に提供 */}
            <QueryClientProvider client={queryClient}>
                {/**
                 * SuiClientProvider：Sui RPC へ接続するクライアントを提供
                 * - networks: 各ネットワーク（devnet/testnet/mainnet）の RPC URL
                 * - defaultNetwork: 使うネットワーク（.env の VITE_NETWORK をもとに決定）
                 */}
                <SuiClientProvider
                    networks={networkConfig}
                    defaultNetwork={defaultNetwork}
                >
                    {/**
                     * WalletProvider：ブラウザの Sui ウォレット（Sui Wallet / Suiet 等）と連携
                     * - autoConnect: 前回の選択が残っていれば自動で再接続
                     * ここに包まれた子コンポーネントは、
                     * useCurrentAccount() や ConnectButton でウォレットを扱えます。
                     */}
                    <WalletProvider autoConnect>
                        {/* ここから先がアプリ本体。UI は App.tsx に実装 */}
                        <App />
                    </WalletProvider>
                </SuiClientProvider>
            </QueryClientProvider>
        </Theme>
    </React.StrictMode>,
);
