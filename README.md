<p align="center">
  <img src="./src/assets/images/icons/Gemini_Generated_Image_x2myi5x2myi5x2my.png" alt="ぶいつーアイコン" width="200">
</p>

<h1 align="center">ぶいつー</h1>

<p align="center">
  <strong>声でサクッと予定登録できるLINE BOT</strong>
</p>

---

## これなに？

LINEに音声メッセージを送るだけで、Googleカレンダーに予定を追加してくれるBOTです。

「明日の14時から会議ね」って話しかけるだけでOK。AIが内容を理解してカレンダーに登録してくれます。キーボードぽちぽちしなくていいので楽ちん。

> **お知らせ**: 現在Googleの審査中なので、一般公開までもうちょっとだけ待っててね！

## できること

| 機能 | やり方 |
|------|--------|
| 音声で予定登録 | 音声メッセージを送るだけ！ |
| 今日の予定確認 | 「今日の予定」って送る |
| 今週の予定確認 | 「今週の予定」って送る |
| ヘルプ | 「ヘルプ」って送る |
| ログアウト | 「ログアウト」って送る |

## 友達追加してね

**LINE ID**: `@175ublzc`

<p align="center">
  <img src="./src/assets/images/qr/M_gainfriends_2dbarcodes_GW.png" alt="LINE QRコード" width="200">
</p>

## 使い方

### テキストコマンド

リッチメニューからも操作できるよ！

- `今日の予定` → 今日のスケジュールを確認
- `今週の予定` → 週間スケジュールを確認
- `ヘルプ` → 使い方を表示
- `ログアウト` → Googleアカウント連携を解除

### 音声で予定登録

1. LINEのマイクボタンをタップ
2. 予定を話す（例：「明日の15時から打ち合わせ」）
3. 送信！→ 自動でカレンダーに登録される

**コツ**: 日時とタイトルを含めて話すと正確に登録できるよ

---

## 技術スタック

| カテゴリ | 技術 |
|---------|------|
| ランタイム | Google Apps Script (GAS) |
| 言語 | TypeScript |
| ビルド | esbuild + clasp |
| LINE連携 | LINE Messaging API |
| カレンダー | Google Calendar API v3 |
| 音声認識 | Google Cloud Speech-to-Text API v2 |
| AI解析 | Gemini 2.5 Flash Lite |
| 認証 | OAuth2 for Apps Script ライブラリ |

## アーキテクチャ

擬似オニオンアーキテクチャで、クラスではなく関数ベースで実装してます。

### 層構成

```
Handler層 → UseCase層 → Infra層
              ↓
         Config/Constants
```

- **Handler層**: LINEからのイベントを受け取って振り分け
- **UseCase層**: ビジネスロジック
- **Infra層**: 外部API（LINE, Google Calendar, Speech-to-Text, Gemini）との通信
- **Config/Constants**: 設定値とメッセージ定数

### ディレクトリ構造

```
src/
├── main.ts                 # GASエントリーポイント
├── index.ts                # doPost, doGet, authCallback
├── handler/
│   ├── lineWebhookHandler.ts   # LINEイベント処理（Strategyパターン）
│   └── oauthCallbackHandler.ts # OAuth2コールバック
├── usecase/
│   ├── CreateEventFromVoiceUseCase.ts  # 音声→イベント作成
│   ├── ShowTodayScheduleUseCase.ts     # 今日の予定
│   ├── ShowWeekScheduleUseCase.ts      # 週間予定
│   ├── ShowHelpUseCase.ts              # ヘルプ表示
│   └── ...
├── infra/
│   ├── google/
│   │   ├── OAuth2Manager.ts        # OAuth2認証管理
│   │   ├── userCalendarApi.ts      # カレンダーAPI
│   │   ├── speechToTextApi.ts      # 音声認識API
│   │   └── geminiApi.ts            # Gemini API
│   └── line/
│       ├── lineMessagingApi.ts     # LINE API
│       └── flexMessageFactory.ts   # Flexメッセージ生成
├── config/
│   └── index.ts            # 設定定数
├── constants/
│   └── message.ts          # メッセージ定数
└── view/
    └── oauth/              # OAuth認証画面
```

### 処理フロー

```
LINEで音声送信
    ↓
doPost（Webhook受信）
    ↓
lineWebhookHandler（イベント振り分け）
    ↓
CreateEventFromVoiceUseCase
    ├─ LINE API: 音声ファイル取得
    ├─ Speech-to-Text: 音声→テキスト変換
    ├─ Gemini: テキスト→イベント情報抽出
    └─ Calendar API: 予定登録
    ↓
LINEに結果を返信
```

## 開発方法

### セットアップ

```bash
# クローン
git clone https://github.com/TakayukiHirano117/line-calendar-schedule-app.git
cd line-calendar-schedule-app

# 依存関係インストール
npm install
```

### npm scripts

```bash
npm run build   # TypeScript → JavaScript（esbuild）
npm run push    # GASにプッシュ（clasp）
npm run deploy  # build + push
```

### 新機能の追加方法

1. `src/usecase/` に新しいUseCaseを作成
2. 必要に応じて `src/infra/` にAPI連携を追加
3. `src/handler/lineWebhookHandler.ts` に条件分岐を追加してUseCaseを呼び出し

```typescript
// lineWebhookHandler.ts の例
export const processLineEvent = (lineEvent) => {
  if (isAudioMessage(lineEvent)) {
    createEventFromVoice(replyToken, lineEvent.message.id);
  } else if (isTextMessage(lineEvent)) {
    processTextMessage(replyToken, lineEvent.message.text);
  } else {
    InvalidRequestUsecase(replyToken);
  }
};
```

## セットアップ（開発者向け）

### 必要なScript Properties

GASのスクリプトプロパティに以下を設定してね。

| キー | 説明 |
|------|------|
| `LINE_CHANNEL_ACCESS_TOKEN` | LINEチャネルアクセストークン |
| `GCP_PROJECT_ID` | GCPプロジェクトID |
| `GCP_PRIVATE_KEY` | サービスアカウントの秘密鍵 |
| `GCP_CLIENT_EMAIL` | サービスアカウントのメール |
| `GEMINI_API_KEY` | Gemini APIキー |
| `OAUTH_CLIENT_ID` | OAuth2クライアントID |
| `OAUTH_CLIENT_SECRET` | OAuth2クライアントシークレット |

### 必要なGCP API

- Cloud Speech-to-Text API
- Google Calendar API

## 今後の予定

- 個人のカレンダーを選択して追加できる機能
- Outlook対応版（別リポジトリで開発予定）

## 利用規約・プライバシーポリシー

https://github.com/TakayukiHirano117/line-gas-schedule-lp
