export type Slide = {
  title: string;
  body?: string[];
  note?: string;
  layout?: "title" | "content" | "section" | "profile";
  image?: string;
  avatar?: string;
  tags?: { label: string; icon?: string; url?: string; download?: boolean }[];
};

export const slides: Slide[] = [
  {
    layout: "title",
    title: "LINEと連携したスケジュール音声入力ツールを開発したらまさかの結果に！？",
    body: ["平野 / コミュニティ事業部 · 2026年4月10日"],
    image: "/v2.png",
  },
  {
    layout: "profile",
    title: "平野 宇教",
    avatar: "/face.jpg",
    body: [
      "2000年生まれ・25歳",
      "2025年5月入社",
      "支援開発 → フロントエンド推進 → コミュニティ事業部",
      "携わったPJ: IBJS / Leaf / kana / smary / IBR / BN / IBJ Online",
    ],
    tags: [
      { label: "Claude", icon: "/clawd.png" },
      { label: "Gemini", icon: "/gemini-color.png" },
      { label: "ハーネスエンジニアリング" },
      { label: "Go", icon: "https://cdn.simpleicons.org/go/00ADD8" },
      { label: "開発以外の自動化" },
    ],
  },
  {
    layout: "section",
    title: "概要",
  },
  {
    layout: "content",
    title: "何を作ったか",
    body: [
      "LINEに話しかけるだけで Google Calendar に予定が入る",
      "「明日の15時から打ち合わせ」と送るだけでOK",
      "キーボードをぽちぽちしなくていい",
    ],
    note: "LINE Messaging API + Google Apps Script + Gemini + Speech-to-Text を組み合わせて実装",
  },
  {
    layout: "content",
    title: "作った背景",
    body: [
      "スマホから Google Calendar をぽちぽちして予定を入れるのがまあまあめんどい",
      "AIで自然言語から指示できる可能性が広がってきた",
      "「これ楽できないかな」と思ったのがきっかけ",
    ],
  },
  {
    layout: "content",
    title: "予定の管理もLINEから",
    body: [
      "登録した予定を一覧で確認できる",
      "予定の編集・削除もLINEのメニューから操作",
      "今日・今週の予定もすぐ確認できる",
    ],
  },
  {
    layout: "section",
    title: "何をやったか",
  },
  {
    layout: "content",
    title: "実装したこと",
    body: [
      "LINE公式アカウントの構築",
      "GAS（Google Apps Script）での実装（TypeScript）",
      "Webhook URLで受け取った音声を処理するロジック",
      "Google Calendar API との連携",
    ],
    note: "claspというツールを使いローカルでTSを書いてGASにデプロイ",
  },
  {
    layout: "content",
    title: "GASとは",
    body: [
      "Googleが提供するサーバーレス実行環境",
      "スプレッドシート・カレンダーなどと簡単に連携できる",
      "TypeScript / JavaScript と同じ書き味で書ける",
      "clasp でローカル開発 → GASにデプロイが可能",
    ],
    note: "サーバーを立てずに無料で動かせるのが強み",
  },
  {
    layout: "section",
    title: "処理の仕組み",
  },
  {
    layout: "content",
    title: "音声 → 予定登録の流れ",
    body: [
      "① LINEで音声メッセージを送信",
      "② Webhook URL が叩かれ GAS の処理が起動",
      "③ Speech-to-Text が音声をテキストに変換",
      "④ Gemini がテキストから日時・タイトルを抽出",
      "⑤ Google Calendar に予定を登録 → 結果をLINEに返信",
    ],
  },
  {
    layout: "section",
    title: "まさかの結果",
  },
  {
    layout: "content",
    title: "QRを配ったら…認証エラー 🚨",
    body: [
      "LINE公式アカウントのQRを配布 → 他の人に使ってもらおうとした",
      "いざ試すと自分以外のアカウントでなぜか認証エラー",
      "自分だけしか使えないツールが完成し無事ﾀﾋ亡",
    ],
  },
  {
    layout: "content",
    title: "原因：Googleの審査が必要だった",
    body: [
      "OAuthアプリを一般公開するにはGoogleの審査が必須",
      "審査未通過 = 作成者アカウント以外はブロックされる仕様",
      "つまり審査に通るまで他の人は使えない",
    ],
  },
  {
    layout: "content",
    title: "審査を通過するためにやること",
    body: [
      "① Google コンソールでプロジェクト作成",
      "② いろんな設定",
      "③ 利用規約・プライバシーポリシーページをわざわざ作る",
      "④ アプリの動作を動画で撮影してYouTubeにアップ",
      "⑤ Googleに申請 → 審査通過待ち",
    ],
    note: "現在審査中。通過したら誰でも使えるようになる予定",
  },
  {
    layout: "section",
    title: "分かったこと",
  },
  {
    layout: "content",
    title: "普段使いのツール × AI = 便利ツールに化ける",
    body: [
      "Discord・Slack など普段使うチャットツールが活用次第で強力なインターフェースになる",
      "LINEはスマホでの操作が一番楽 → 音声入力との相性が抜群",
      "AIとの組み合わせで「テキスト打つ」のハードルがゼロになる",
      "Googleプロジェクトにすると90日間 $300分の無料クレジットあり → 試しやすい",
    ],
    note: "最近 Discord × OpenAI などの連携事例も増えてきた",
  },
  {
    layout: "content",
    title: "AI活用が面白い",
    body: [
      "モデルの使い分け（速さ重視・精度重視など）が効いてくる",
      "Skillとして手順書を作ると繰り返し使える仕組みになる",
      "「道具」として育てていく感覚が楽しい",
    ],
  },
  {
    layout: "content",
    title: "Google申請は超めんどくさい",
    body: [
      "OAuthアプリを一般公開するにはGoogleの審査が必須",
      "審査未通過 = 作成者アカウント以外はブロックされる仕様",
      "つまり審査に通るまで他の人は使えない",
    ],
  },
  {
    layout: "section",
    title: "まとめ",
  },
  {
    layout: "content",
    title: "AIで身近な不便を手軽に解決できる",
    body: [
      "「これもっと効率化したい」はAIで手軽に手がつけられる時代",
      "普段使っているツールがAIで化けるのを見るのは純粋に面白い",
      "難しいインフラ不要 → AI × LINEなどの普段使いツール連携で誰でもアイデアを形にできる",
    ],
  },
  {
    layout: "content",
    title: "次回",
    body: [
      "開発業務以外をAIで自動化する方法を喋る予定",
      "Skillsの活用例も載せます",
      "ぶいつーは引き続きブラッシュアップ中（クレジット有効期間残り1週間なので審査出さないかも笑）",
    ],
  },
  {
    layout: "content",
    title: "リンク",
    tags: [
      {
        label: "ぶいつー（本体）",
        icon: "https://cdn.simpleicons.org/github",
        url: "https://github.com/TakayukiHirano117/line-google-calendar-speech-schedule",
      },
      {
        label: "LP（利規・PP）",
        icon: "https://cdn.simpleicons.org/github",
        url: "https://github.com/TakayukiHirano117/line-gas-schedule-lp",
      },
      {
        label: "スライドSkillをダウンロード",
        icon: "https://upload.wikimedia.org/wikipedia/commons/8/8a/Claude_AI_logo.svg",
        url: "/SKILL.md",
        download: true,
      },
    ],
  },
];
