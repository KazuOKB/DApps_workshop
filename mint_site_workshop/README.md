# Mint dApp ワークショップ課題ガイド（演習用リポジトリ）

このフォルダは Chapter 4 ワークショップで参加者が手を動かしながら完成させるための教材です。同じワークスペースにある `mint_site/` が完成版（お手本）なので、挙動が不明なときは比較しながら進めてください。

## ワークショップのゴール
- Sui ネットワークに接続するための設定を理解する
- React + @mysten/dapp-kit を使ってウォレット接続とトランザクション実行を体験する
- Move で用意された NFT コントラクトをフロントエンドから呼び出してミントを成功させる

## 事前準備
- Dev Container 起動時に `pnpm` のセットアップと `mint_site` での依存関係インストールが自動で行われます。別途 `pnpm install` を実行する必要はありません。
- ハンズオン中に開発サーバーを起動したい場合は、必要に応じて下記コマンドを利用してください。
  ```bash
  pnpm dev
  ```

---

## 課題1: Move コントラクトを Publish し、`.env` を完成させよう
はじめに、ワークショップ用の NFT コントラクトを自分で Sui ネットワークへデプロイし、その情報を `.env` に設定します。手順に沿って進めましょう。

### 手順A: ウォレットシードのインポートとネットワーク確認
1. 共有されたシードフレーズを使ってウォレットをインポートします（例では ed25519 鍵を想定）。
   ```bash
   sui keytool import "<ここに12語もしくは24語のシードフレーズ>" ed25519
   ```
2. インポートしたアドレスをアクティブに設定します。`<ADDRESS>` の部分はインポート時に表示されたアドレスへ置き換えてください。
   ```bash
   sui client switch --address <ADDRESS>
   ```
3. 現在の接続先ネットワーク（環境）を確認します。出力が `testnet` になっているかチェックしてください。
   ```bash
   sui client active-env
   ```
4. `testnet` 以外になっていた場合は、下記コマンドで切り替えましょう。
   ```bash
   sui client switch --env testnet
   ```
5. Publish に必要なガス（SUI 残高）があるか確認します。表示されない場合は Faucet で入手してください。
   ```bash
   sui client gas
   ```
   > Faucet 例: `sui client faucet`。テストネット用のウォレットに SUI が追加されるまで少し待ちます。

### 手順B: コントラクトを Publish
1. コントラクトのディレクトリへ移動します。
   ```bash
   cd /workspaces/chapter4_workshop/contracts
   ```
2. 動作確認としてビルドしてみましょう。
   ```bash
   sui move build
   ```
3. 問題が無ければ Publish（デプロイ）します。
   ```bash
   sui client publish --gas-budget 200000000
   ```
   - コマンドが成功すると、最後に `package` ID が表示されます。`0x` から始まる長い文字列です。これを控えておきましょう。
   - 同時に `Upgrade Cap` や `publisher` オブジェクトも表示されますが、今回使用するのは `package` ID です。

### 手順C: `.env` に必要な値を入力
Publish で取得した情報をもとに `mint_site_workshop/.env` を編集します。

| 変数名 | 説明 | 入力ヒント |
| --- | --- | --- |
| `VITE_NETWORK` | 接続先ネットワーク名 | Publish したネットワークに合わせて `testnet` を入力 |
| `VITE_PACKAGE_ID` | Publish コマンドで得たパッケージ ID | 出力例: `0x1234...abcd` |
| `VITE_MODULE_NAME` | 呼び出す Move モジュール名 | この教材では `nft` もしくは `nft_sample` |
| `VITE_FUNCTION_NAME` | モジュール内で呼び出す関数名 | `mint` |

### チェックポイント
- `.env` を保存した後、開発サーバーを再起動しブラウザで警告メッセージが表示されないか確認しましょう。
- 正しく設定できると、ウォレット接続後に Mint ボタンがアクティブになります。

---

## 課題2: `WalletStatus` で接続情報を表示しよう
次は、ウォレットが接続されているかどうかを画面に表示するコンポーネントを仕上げます。`src/WalletStatus.tsx` には骨組みだけが残っているので、以下の手順で完成させてください。

1. `@mysten/dapp-kit` から `useCurrentAccount` をインポートする。
2. フックを呼び出して `const account = useCurrentAccount();` のように現在のアカウント情報を取得する。
3. `account` が存在する場合は「接続中」である旨とウォレットアドレスを表示し、存在しない場合は「未接続」と表示する。
   - アドレスは `account.address` から取得できます。
   - 表示形式に迷ったら、`0x1234...abcd` のように短縮表示しても構いません。
4. Dev Wallet や Sui Wallet を接続し、表示が切り替わることをブラウザで確認しましょう。

🔗 参考: [Sui dApp Kit ドキュメント - useCurrentAccount / useAccounts](https://sdk.mystenlabs.com/dapp-kit/wallet-hooks/useAccounts)

### 発展課題（任意）
- アドレスのコピー用ボタンを追加する。
- 接続済みのチェーン情報（`account.chains`）を表示してみる。

---

## 課題3: `MintButton` でミント用トランザクションを完成させよう
`src/MintButton.tsx` では、トランザクションを構築する部分が未実装の状態になっています。以下の手順で `tx.moveCall(...)` を書き換え、NFT をミントできるようにしましょう。

1. ファイルを開くと `throw new Error("TODO: ...")` が配置されています。これは未完成のコードが実行されるのを防ぐためのガードです。課題を解く際は `tx.moveCall` を実装したタイミングでこの `throw` を削除し、ミント処理が実際に動作するかを確認してください。
2. `Transaction` クラスを使って Move コントラクトの `mint` 関数を呼び出す処理を追加します。
   ```ts
   tx.moveCall({
       target: `${packageId}::${moduleName}::${functionName}`,
       arguments: [
           tx.pure.string("NFTの名前"),
           tx.pure.string("説明"),
           tx.pure.string("画像URL"),
       ],
   });
   ```
3. 文字列は自由に設定して構いません。（例: ワークショップ名やお好みの画像URL）
4. 実装後に Mint ボタンを押し、ウォレットで署名するとトランザクションが成功し `digest` が表示されます。
5. うまくいかない場合はブラウザのコンソールとターミナルのログを確認し、`tx.moveCall` の引数が正しいか見直してみましょう。

🔗 参考: [Sui TypeScript SDK - Transaction Building Basics](https://sdk.mystenlabs.com/typescript/transaction-building/basics)

### 発展課題（任意）
- NFT のメタデータをフォーム入力から受け取るよう拡張する。
- `tx.moveCall` で別の引数（例: 数値やブール値）を渡すサンプルを追加してみる。

> 次の課題では、ミント後に所有している NFT を取得して表示する処理へ発展させる予定です。準備が整ったら講師の指示を待ちましょう。
