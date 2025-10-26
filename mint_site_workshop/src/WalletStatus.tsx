import { useState } from "react";
import { useCurrentAccount, useSuiClientContext } from "@mysten/dapp-kit";
import {
  Container,
  Heading,
  Text,
  Flex,
  Code,
  Badge,
  Tooltip,
  IconButton,
} from "@radix-ui/themes";
import { CopyIcon, CheckIcon } from "@radix-ui/react-icons";

/** 0x1234...abcd のように短縮表示 */
function shorten(addr: string, head = 6, tail = 6) {
  if (!addr) return "アドレスがありません";
  return `${addr.slice(0, head)}…${addr.slice(-tail)}`;
}

/** chain id → 表示名（例: "sui:testnet" → "Sui Testnet"） */
function chainLabel(chainId: string) {
  if (chainId.startsWith("sui:")) {
    const net = chainId.split(":")[1];
    const map: Record<string, string> = {
      mainnet: "Mainnet",
      testnet: "Testnet",
      devnet: "Devnet",
      localnet: "Localnet",
    };
    return `Sui ${map[net] ?? net}`;
  }
  return chainId;
}

// TODO: useCurrentAccount フックをインポートして接続中アカウントを取得

export function WalletStatus() {
    
    const account = useCurrentAccount();
    const { network } = useSuiClientContext();
    const activeChain = `sui:${network}` as const;

    const [copied, setCopied] = useState(false);
    async function copyAddress() {
        if (!account?.address) return;
        try {
            await navigator.clipboard.writeText(account.address);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch (e) {
            console.error(e);
        }
    }
    
    return (
        <Container my="2">
            <Heading mb="2">Wallet Status</Heading>
            {account ? (
                <Flex direction="column">
                    {/* ウォレットの接続状況の表示 */}
                    <Text>Wallet connected!!</Text>

                    {/* アドレス表示 + コピー */}
                    <Flex align="center" gap="2">
                        <Text weight="bold">Address:</Text>
                        <Tooltip content={account.address}>
                            <Code>{shorten(account.address)}</Code>
                        </Tooltip>
                        <IconButton
                        size="1"
                        variant="soft"
                        aria-label="Copy address"
                        onClick={copyAddress}
                        >
                            {copied ? <CheckIcon /> : <CopyIcon />}
                        </IconButton>
                        {copied && <Text size="1">Copied!</Text>}
                    </Flex>

                    {/* 接続中のチェーンを表示 */}
                    <Flex align="center" gap="2">
                        <Text weight="bold">Network:</Text>
                        <Badge variant="surface">{chainLabel(activeChain)}</Badge>
                    </Flex>
                </Flex>
            ) : (
                <Text>ウォレット未接続</Text>
            )}

            <Text color="gray">
                Dev Wallet や Sui Wallet を接続して表示が切り替わることを確認してください。
            </Text>
        </Container>
    );
}
