import { processLineEvent } from './handler/lineWebhookHandler';
/**
 * LINEからのPOSTリクエストを処理
 * @param {Object} e - イベントオブジェクト
 * @returns {Object} JSONレスポンス
 */
export function doPost(e) {
  const requestBody = JSON.parse(e.postData.contents);

  if (!hasValidEvents(requestBody)) {
    return createJsonResponse({ status: 'no events' });
  }

  const lineEvent = requestBody.events[0];
  processLineEvent(lineEvent);

  return createJsonResponse({ status: 'ok' });
}

/**
 * 認証確認用GETリクエストを処理
 * @param {Object} e - イベントオブジェクト
 * @returns {Object} テキストレスポンス
 */
export function doGet(e) {
  // 各サービスへのアクセス権限を確認
  CalendarApp.getDefaultCalendar();
  PropertiesService.getScriptProperties();
  UrlFetchApp.fetch('https://www.google.com', { muteHttpExceptions: true });
  Utilities.base64Encode('test');

  return ContentService
    .createTextOutput('✅ 全サービスの認証が完了しました。このページは閉じてOKです。')
    .setMimeType(ContentService.MimeType.TEXT);
}

/**
 * リクエストボディに有効なイベントがあるかチェック
 * @param {Object} requestBody - リクエストボディ
 * @returns {boolean}
 */
const hasValidEvents = (requestBody) => {
  return requestBody.events && requestBody.events.length > 0;
};

/**
 * JSONレスポンスを作成
 * @param {Object} data - レスポンスデータ
 * @returns {Object}
 */
const createJsonResponse = (data) => {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
};