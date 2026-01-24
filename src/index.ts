import { processLineEvent } from './handler/lineWebhookHandler';
import { OAuthCallbackHandler } from './handler/oauthCallbackHandler';
import { OAuth2Manager } from './infra/google/OAuth2Manager';
import { getOAuth2ClientId, getOAuth2ClientSecret } from './config/getProperty';

/**
 * LINEからのPOSTリクエストを処理
 */
export function doPost(e: GoogleAppsScript.Events.DoPost): GoogleAppsScript.Content.TextOutput {
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
 * OAuth2コールバック
 */
export function doGet(e: GoogleAppsScript.Events.DoGet): GoogleAppsScript.Content.TextOutput | GoogleAppsScript.HTML.HtmlOutput {
  // OAuth2コールバックかどうかを判定
  if (e.parameter && e.parameter.code) {
    return new OAuthCallbackHandler().handleOAuthCallback(e);
  }

  // 通常の認証確認処理
  // PropertiesService.getScriptProperties();
  // UrlFetchApp.fetch('https://www.google.com', { muteHttpExceptions: true });
  // Utilities.base64Encode('test');
  const userId = e.parameter.userId;
  const oauth2Service = new OAuth2Manager(
    userId,
    getOAuth2ClientId(),
    getOAuth2ClientSecret()
  );
  const authorized = oauth2Service.handleCallback(e);
  if (!authorized.success) {
    const error = authorized.error;
    Logger.log('Error details: ' + error);  // ← これを見て
  }

  return ContentService
    .createTextOutput('✅ 全サービスの認証が完了しました。このページは閉じてOKです。')
    .setMimeType(ContentService.MimeType.TEXT);
}

/**
 * OAuth2コールバック関数
 * OAuth2ライブラリが内部で呼び出す
 */
export function authCallback(request: GoogleAppsScript.Events.DoGet): GoogleAppsScript.HTML.HtmlOutput {
  return new OAuthCallbackHandler().handleOAuthCallback(request);
}

/**
 * リクエストボディに有効なイベントがあるかチェック
 */
const hasValidEvents = (requestBody) => {
  return requestBody.events && requestBody.events.length > 0;
};

/**
 * JSONレスポンスを作成
 */
const createJsonResponse = (response) => {
  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
};
