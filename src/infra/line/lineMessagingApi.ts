import { getLineChannelAccessToken } from '../../config/getProperty';
import { CONFIG } from '../../config/index';
import { Logger } from '../../Logger';

/**
 * LINEから音声コンテンツを取得
 * @param {string} messageId - メッセージID
 * @returns {Blob|null} 音声データ
 */
export const fetchAudioContentFromLine = (messageId) => {
  const channelAccessToken = getLineChannelAccessToken();
  const contentUrl = `${CONFIG.LINE_API.CONTENT_ENDPOINT}/${messageId}/content`;

  const requestOptions = {
    method: 'get',
    headers: {
      'Authorization': `Bearer ${channelAccessToken}`,
    },
    muteHttpExceptions: true,
  } satisfies GoogleAppsScript.URL_Fetch.URLFetchRequestOptions;

  try {
    const response = UrlFetchApp.fetch(contentUrl, requestOptions);
    return response.getBlob();
  } catch (error) {
    Logger.logError('LINE音声コンテンツ取得', error);
    return null;
  }
};

/**
 * LINEにテキストメッセージを返信
 * @param {string} replyToken - リプライトークン
 * @param {string} messageText - メッセージテキスト
 */
export const sendLineTextReply = (replyToken, messageText) => {
  const channelAccessToken = getLineChannelAccessToken();

  const requestBody = {
    replyToken: replyToken,
    messages: [
      {
        type: 'text',
        text: messageText,
      },
    ],
  };

  sendLineReplyRequest(channelAccessToken, requestBody);
};

/**
 * LINEにFlexメッセージを返信
 * @param {string} replyToken - リプライトークン
 * @param {Object} flexContent - Flexメッセージコンテンツ {altText, contents}
 */
export const sendLineFlexReply = (replyToken, flexContent) => {
  const channelAccessToken = getLineChannelAccessToken();

  const requestBody = {
    replyToken: replyToken,
    messages: [
      {
        type: 'flex',
        altText: flexContent.altText,
        contents: flexContent.contents,
      },
    ],
  };

  sendLineReplyRequest(channelAccessToken, requestBody);
};

/**
 * LINE返信リクエストを送信
 * @param {string} channelAccessToken - チャンネルアクセストークン
 * @param {Object} requestBody - リクエストボディ
 */
export const sendLineReplyRequest = (channelAccessToken, requestBody) => {
  const requestHeaders = {
    'Content-Type': 'application/json; charset=UTF-8',
    'Authorization': `Bearer ${channelAccessToken}`,
  };

  const requestOptions = {
    method: 'post',
    headers: requestHeaders,
    payload: JSON.stringify(requestBody),
    muteHttpExceptions: true,
  } satisfies GoogleAppsScript.URL_Fetch.URLFetchRequestOptions;

  const response = UrlFetchApp.fetch(CONFIG.LINE_API.REPLY_ENDPOINT, requestOptions);
  const responseCode = response.getResponseCode();
  
  if (responseCode !== 200) {
    Logger.logError('LINE返信', response.getContentText());
  }
};