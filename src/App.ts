export const doPost = (e) => {
  // LINE から送られてくる JSON
  const body = JSON.parse(e.postData.contents);
  console.log(body);

  const replyToken = body.events[0].replyToken;
  console.log(replyToken);
  replyLineMessageAfterProcessingVoice(replyToken);
  // ログで確認（最初は必須）
  console.log(JSON.stringify(body, null, 2));

  return ContentService.createTextOutput(
    JSON.stringify({ status: 'ok' })
  ).setMimeType(ContentService.MimeType.JSON);

  // 実装手順
  // 音声入力を取得
  // 音声をテキストに変換
  // テキストを解析
  // 解析結果を元に処理
  // 処理結果に応じてLINEで返答を返す
};

export const replyLineMessageAfterProcessingVoice = (replyToken) => {
  const payload = {
    replyToken: replyToken,
    messages: [{ type: 'text', text: '受信したよ' }],
  };

  UrlFetchApp.fetch('https://api.line.me/v2/bot/message/reply', {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      Authorization:
        'Bearer ' +
        PropertiesService.getScriptProperties().getProperty(
          'CHANNEL_ACCESS_TOKEN'
        ),
    },
    payload: JSON.stringify(payload),
  });
};
