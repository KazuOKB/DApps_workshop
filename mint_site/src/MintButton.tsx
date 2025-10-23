import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { Button, Container, Flex, Heading, Text } from "@radix-ui/themes";
import { useState } from "react";

export function MintButton() {
  const account = useCurrentAccount();
  const { mutate: signAndExecuteTransaction, isPending } =
    useSignAndExecuteTransaction();

  const [digest, setDigest] = useState<string>("");
  const [error, setError] = useState<string>("");

  // 環境変数から設定を読み込み
  const packageId = import.meta.env.VITE_PACKAGE_ID;
  const moduleName = import.meta.env.VITE_MODULE_NAME;
  const functionName = import.meta.env.VITE_FUNCTION_NAME;

  // 環境変数が正しく設定されているかチェック
  const isConfigured =
    packageId &&
    moduleName &&
    functionName &&
    packageId !==
      "0x0000000000000000000000000000000000000000000000000000000000000000";

  const handleMint = () => {
    // エラーと成功メッセージをリセット
    setError("");
    setDigest("");

    try {
      // トランザクションを構築
      const tx = new Transaction();

      // Move関数を呼び出し
      // 引数が必要な場合は、argumentsに追加してください
      // 例: arguments: [tx.pure.string("name"), tx.pure.string("description")]
      tx.moveCall({
        target: `${packageId}::${moduleName}::${functionName}`,
        arguments: [],
      });

      // トランザクションに署名して実行
      signAndExecuteTransaction(
        {
          transaction: tx,
        },
        {
          onSuccess: (result) => {
            console.log("Transaction successful:", result);
            setDigest(result.digest);
            setError("");
          },
          onError: (err) => {
            console.error("Transaction failed:", err);
            setError(err.message || "Transaction failed");
            setDigest("");
          },
        },
      );
    } catch (err) {
      console.error("Error building transaction:", err);
      setError(
        err instanceof Error ? err.message : "Error building transaction",
      );
    }
  };

  const isDisabled = !account || !isConfigured || isPending;

  return (
    <Container my="2">
      <Heading mb="2">Mint NFT</Heading>

      {!isConfigured && (
        <Flex direction="column" gap="2" mb="2">
          <Text color="orange">
            ⚠️ Please configure environment variables in .env file
          </Text>
          <Text size="2" color="gray">
            Set VITE_PACKAGE_ID, VITE_MODULE_NAME, and VITE_FUNCTION_NAME
          </Text>
        </Flex>
      )}

      <Flex direction="column" gap="2">
        <Button onClick={handleMint} disabled={isDisabled} size="3">
          {isPending ? "Minting..." : "Mint NFT"}
        </Button>

        {!account && (
          <Text size="2" color="gray">
            Please connect your wallet to mint
          </Text>
        )}

        {digest && (
          <Flex direction="column" gap="1">
            <Text color="green" weight="bold">
              ✅ Mint successful!
            </Text>
            <Text size="2" style={{ wordBreak: "break-all" }}>
              Transaction: {digest}
            </Text>
            <Text size="2">
              <a
                href={`https://suiscan.xyz/testnet/tx/${digest}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--accent-9)" }}
              >
                View on Suiscan →
              </a>
            </Text>
          </Flex>
        )}

        {error && (
          <Text color="red" size="2">
            ❌ Error: {error}
          </Text>
        )}
      </Flex>
    </Container>
  );
}
