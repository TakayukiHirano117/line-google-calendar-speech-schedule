## 概要
LINEからの音声入力でGoogle Calendarへ予定を追加できるツールです。

現状はtakaponの個人Google Calendarに全予定が入ってしまうのでイタズラしないでください（爆笑）

あとあと個人のカレンダーに追加できるように改良予定です。

またOutlookに追加できるツールとしての要望が大きいので

後日別リポジトリでOutlook対応版を作成予定です。

## 友達追加方法
LINEID: @175ublzc

QRコード

![LINE QRコード](./src/assets/images/qr/M_gainfriends_2dbarcodes_GW.png)

## 構成
擬似オニオンアーキテクチャです。

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
