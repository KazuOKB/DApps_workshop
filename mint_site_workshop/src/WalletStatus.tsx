
import { Container, Heading, Text } from "@radix-ui/themes";

export function WalletStatus() {
    // TODO: useCurrentAccount フックをインポートして接続中アカウントを取得
    // const account = ...

    return (
        <Container my="2">
            <Heading mb="2">Wallet Status</Heading>
            {/* TODO: account の有無で表示を切り替える */}
            <Text color="gray">
                ウォレット接続状態をここに表示してください。
            </Text>
        </Container>
    );
}
