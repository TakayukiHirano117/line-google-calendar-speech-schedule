## 概要
LINEからの音声入力でGoogle Calendarへ予定を追加できるツールです。

現状はtakaponの個人Google Calendarに全予定が入ってしまうのでイタズラしないでください（爆笑）

※ 本番環境へ公開するためにGoogleの審査中です。なのでこのツールは俺以外使えません。しばしお待ちを。

あとあと個人のカレンダーに追加できるように改良予定です。

またOutlookに追加できるツールとしての要望が大きいので

後日別リポジトリでOutlook対応版を作成予定です。

## 友達追加方法
LINEID: @175ublzc

QRコード

![LINE QRコード](./src/assets/images/qr/M_gainfriends_2dbarcodes_GW.png)

## 構成
擬似オニオンアーキテクチャです。

クラスではなく関数で全ての処理を記述しています。

ちなみに私に関数DDDの知識はないのでよくわからないアーキテクチャになっています。保守性は高くないですたぶん

整合性を保って永続化したいものはないのでDomain層はありません。

またInfra層は外部APIを叩く用途で使用します。

Handlerは1つのみで、

processLineEventがStrategyパターンで作成されており、

新しい処理を追加したい場合はここに条件分岐とusecaseを追加します。

```
export const processLineEvent = (lineEvent) => {
  const replyToken = lineEvent.replyToken;

  if (isAudioMessage(lineEvent)) {
    createEventFromVoice(replyToken, lineEvent.message.id);
  } else if (isTextMessage(lineEvent)) {
    processTextMessage(replyToken, lineEvent.message.text);
  } else {
    InvalidRequestUsecase(replyToken);
  }
};

```

InfraはUseCaseからのみ呼ばれるようにします。

またconfig, constantsは今のところどの層からの依存も許すようにしています。

## 使用技術
- TS
- Google Cloud Speech-to-Text API
- Gemini 2.5 Flash Lite
- GAS
- clasp

ローカルでTSで開発したものをコンパイルしてGASに変換します。

package.jsonのdeployコマンドを確認して下さい。

doPost, doGetをmain.tsでglobalに読み込むことでエントリーポイントを定義しています。

## 開発方法
1. clone
2. npm i
3. usecase, infraの作成
4. src/handler/lineWebhookHandler.tsに条件分岐を追加し、その中でusecaseを呼び出す。

基本的に処理ごとにusecaseを切って必要ならinfraを追加してhandlerで呼び出します。

現状必要なhelperなどを使う側のファイルに直接書いているので別ディレクトリでも切ろうかと思うなどしています。
