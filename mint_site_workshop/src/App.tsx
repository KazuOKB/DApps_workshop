// =============================================================================
// このファイル（App.tsx）の役割
// -----------------------------------------------------------------------------
// ・アプリの「画面本体」をつくります。
// ・ヘッダーにウォレット接続ボタンを置き、本文に各機能コンポーネントを配置します。
// ・見た目（レイアウト）は Radix UI のコンポーネントでシンプルに組んでいます。
// =============================================================================

// Sui dApp Kit が用意する「ウォレット接続ボタン」。
// クリックするとインストール済みの Sui ウォレット（Sui Wallet / Suiet 等）が選べます。
import { ConnectButton } from "@mysten/dapp-kit";

// Radix UI：余白やレイアウトのための基本コンポーネント（Box, Flex, Container, Heading）
import { Box, Container, Flex, Heading } from "@radix-ui/themes";

// 接続状態（アドレスなど）を表示する自作コンポーネント
import { WalletStatus } from "./WalletStatus";
// NFT をミントする自作コンポーネント（ボタンを押すと Transaction を実行）
import { MintButton } from "./MintButton";

function App() {
    return (
        <>
            {/**
             * ヘッダー
             * - 左にタイトル、右に ConnectButton を配置。
             * - position="sticky" なのでスクロールしても上部に固定されます。
             */}
            <Flex
                position="sticky"
                px="4"
                py="2"
                justify="between"
                style={{
                    borderBottom: "1px solid var(--gray-a2)", // 薄いボーダーで区切り
                }}
            >
                <Box>
                    {/* タイトル（アプリ名）。ワークショップなら自由に変更OK */}
                    <Heading>dApp Starter Template</Heading>
                </Box>

                <Box>
                    {/**
                     * ConnectButton（dApp Kit 提供）
                     * - クリックでウォレット選択 → 接続/切断を管理
                     * - 接続後はアドレスの一部が表示され、メニューから Disconnect も可能
                     */}
                    <ConnectButton />
                </Box>
            </Flex>

            {/**
             * 本文エリア
             * - 少し余白を入れ、背景に薄いグレーを敷いて内容が見やすいように。
             */}
            <Container>
                <Container
                    mt="5"
                    pt="2"
                    px="4"
                    style={{ background: "var(--gray-a2)", minHeight: 500 }}
                >
                    {/**
                     * WalletStatus：
                     * - useCurrentAccount() で接続状態を取得し、
                     *   「接続済み/未接続」とアドレスを表示します。
                     */}
                    <WalletStatus />

                    {/**
                     * MintButton：
                     * - ボタンを押すと Transaction を組み立て、
                     *   useSignAndExecuteTransaction() で署名→送信します。
                     * - 成功するとトランザクションの digest を表示します。
                     */}
                    <MintButton />
                </Container>
            </Container>
        </>
    );
}

export default App;
