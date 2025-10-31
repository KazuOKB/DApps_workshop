// =============================================================================
// Sui dApp Kit - React Hooks for Sui Blockchain Interaction
// =============================================================================
// Sui公式が提供するdApp開発用のReact Hooksライブラリ
// 公式ドキュメント: https://sdk.mystenlabs.com/dapp-kit
import {
    // 接続中のウォレットアカウント情報を取得
    useCurrentAccount,
    // トランザクションに署名してSuiネットワークに送信
    useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";

// =============================================================================
// Sui Transaction Builder
// =============================================================================
// Suiブロックチェーン上で実行される操作（トランザクション）を構築するクラス
// 公式ドキュメント: https://sdk.mystenlabs.com/typescript/transaction-building/basics
import { Transaction } from "@mysten/sui/transactions";

// =============================================================================
// UI Components (Radix UI)
// =============================================================================
import { Button, Container, Flex, Heading, Text, Box } from "@radix-ui/themes";

// =============================================================================
// React Hooks
// =============================================================================
import { useState } from "react";

// =============================================================================
// NFTメタデータ（名前・説明・画像URL）
// =============================================================================
type NftItem = { nftName: string; nftDesc: string; nftImageUrl: string };

// MintButton が src 直下にある前提で画像インポート
import nftImage from "./assets/saboten_genki.png";   // これで“URL文字列”として解決される

// ===========================================================================
// UI sizing constants 
// ===========================================================================
const PREVIEW_WIDTH = 240;   // px: ボタン & 画像の共通幅
//const PREVIEW_HEIGHT = 220;   // px: 画像の高さ（固定にしたい場合）

// =============================================================================
// 1枚分のカード（プレビュー＋Mint）
// =============================================================================
function NftCard({
    item,        // 1枚分のデータ { name, desc, imageUrl }
    pkg,         // 例: 0x...（package id）
    mod,         // 例: "nft"
    func,        // 例: "mint"
    network,     // 表示用（Suiscan リンクなどで使う）
    isConfigured // .env が正しく設定されているか
}: {
    item: NftItem;
    pkg: string; 
    mod: string; 
    func: string;
    network: string;
    isConfigured: boolean;
}) {
    const account = useCurrentAccount();
    const { mutate: signAndExecuteTransaction, isPending } = useSignAndExecuteTransaction();
    const [digest, setDigest] = useState("");
    const [error, setError] = useState("");


    // ===========================================================================
    // ボタンの無効化条件
    // ===========================================================================
    const isDisabled = !account || !isConfigured || isPending;
    // 以下のいずれかに該当する場合、Mintボタンを無効化します：
    // 1. ウォレットが接続されていない（account が null）
    // 2. 環境変数が正しく設定されていない（isConfigured が false）
    // 3. トランザクション実行中（isPending が true）

    // ===========================================================================
    // Mint実行ハンドラー
    // ===========================================================================
    const handleMint = () => {
        setError("");
        setDigest("");

        const tx = new Transaction();
        tx.moveCall({
            target: `${pkg}::${mod}::${func}`,
            arguments: [
                tx.pure.string(item.nftName),
                tx.pure.string(item.nftDesc),
                tx.pure.string(item.nftImageUrl), 
            ],
        });

        signAndExecuteTransaction(
            { transaction: tx },
            {
                onSuccess: (r) => setDigest(r.digest),
                onError: (e: any) => setError(e?.message || "Transaction failed"),
            },
        );
    };

    return (
        <Box style={{ width: PREVIEW_WIDTH }}>
            <Button
                onClick={handleMint}
                disabled={isDisabled}
                size="3"
                style={{ width: "80%", display: "block", margin: "0 auto" }}
            >
                {isPending ? "Minting..." : "Mint NFT"}
            </Button>

            {!account && (
                <Text size="2" color="gray" mt="1">
                Please connect your wallet to mint
                </Text>
            )}

            <Box mt="2" p="2" style={{ border: "1px solid var(--gray-6)", borderRadius: 12 }}>
                <img
                    src={item.nftImageUrl}
                    alt="NFT preview"
                    referrerPolicy="no-referrer"
                    style={{
                        display: "block",
                        width: "100%",
                        height: "auto",      // 比率維持
                        objectFit: "contain",
                        borderRadius: 8,
                    }}
                    onError={(e) => {
                    const img = e.currentTarget as HTMLImageElement;
                    img.style.objectFit = "contain";
                    // もし代替画像に切り替えたい場合（任意）:
                    // import fallbackPng from "./assets/fallback.png";
                    // img.src = fallbackPng;
                    }}
                />
            </Box>

            <Text as="div" size="4" weight="bold" mt="2" align="center">{item.nftName}</Text>
            {/* <Text size="1" color="gray">{item.nftDesc}</Text> */}

            {digest && (
                <Box mt="2">
                    <Text color="green" weight="bold">✅ Mint successful!</Text>
                    <Text size="2" style={{ wordBreak: "break-all" }}>Tx: {digest}</Text>
                    <Text size="2">
                        <a
                            href={`https://suiscan.xyz/${network}/tx/${digest}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "var(--accent-9)" }}
                        >
                            View on Suiscan →
                        </a>
                    </Text>
                </Box>
            )}

            {error && (
                <Text color="red" size="2" mt="1">❌ Error: {error}</Text>
            )}
        </Box>
    );
}


// =============================================================================
// 複数のカードを並べる親（配列 → map） 
// =============================================================================
/*
 * MintButton コンポーネント
 *
 * NFTをmintするためのボタンとUI状態管理を提供します。
 * このコンポーネントは以下の機能を持ちます：
 * 1. 環境変数からスマートコントラクト情報を読み込み
 * 2. トランザクションを構築
 * 3. ウォレットで署名してSuiネットワークに送信
 * 4. 実行結果の表示（成功時はdigest、失敗時はエラーメッセージ）
 */
export function MintButton() {
    // スマートコントラクトが配置されているパッケージのID（0xから始まる64文字のアドレス）
    const packageId = import.meta.env.VITE_PACKAGE_ID;

    // 呼び出すMoveモジュールの名前
    const moduleName = import.meta.env.VITE_MODULE_NAME;

    // モジュール内の実行する関数名
    const functionName = import.meta.env.VITE_FUNCTION_NAME;

    // 接続先ネットワーク（mainnet/testnet/devnet）
    // Suiscanリンクで使用するネットワーク名
    const network = import.meta.env.VITE_NETWORK || "testnet";

    // ===========================================================================
    // 環境変数のバリデーション
    // ===========================================================================
    // 環境変数が正しく設定されているかをチェック
    // - 全ての値が存在すること
    // - packageIdがダミー値（0x0000...）でないこと
    const isConfigured =
        packageId &&
        moduleName &&
        functionName &&
        packageId !==
            "0x0000000000000000000000000000000000000000000000000000000000000000";

    // ===========================================================================
    // ミント予定メタデータ
    // ===========================================================================
    const nftItems: NftItem[] = [
        {
            nftName: "元気だったサボテン",
            nftDesc: "NFT created at Build on Sui",
            nftImageUrl: "https://aggregator.walrus-testnet.walrus.space/v1/blobs/by-object-id/0xf7edb13af9e188ff939115b6ab49e4390724ae0087939b46387cd05e5f6032f4",
        },
        {
            nftName: "練習画像",
            nftDesc: "NFT created at Build on Sui",
            nftImageUrl: "https://www.1-firststep.com/wp-content/uploads/2016/12/unko-lime.png",
        },
        {
            nftName: "元気だったサボテン (Localなのでこれはnftにできない)",
            nftDesc: "Local preview",
            nftImageUrl: nftImage,
        },
    ];


    // ===========================================================================
    // UIレンダリング
    // ===========================================================================
    return (
        <Container my="2">
            <Heading mb="2">Mint NFT</Heading>

            {/* 環境変数未設定時の警告メッセージ */}
            {!isConfigured && (
                <Flex direction="column" gap="2" mb="2">
                    <Text color="orange">
                        ⚠️ Please configure environment variables in .env file
                    </Text>
                    <Text size="2" color="gray">
                        Set VITE_PACKAGE_ID, VITE_MODULE_NAME, and
                        VITE_FUNCTION_NAME
                    </Text>
                </Flex>
            )}

            {/* ここでカードを複数並べるだけ */}
            <Flex wrap="wrap" gap="5" justify="center">
                {nftItems.map((item, i) => (
                    <NftCard
                        key={i}
                        item={item}
                        pkg={packageId}
                        mod={moduleName}
                        func={functionName}
                        network={network}
                        isConfigured={isConfigured}
                    />
                ))}
            </Flex>
        </Container>
    );
}