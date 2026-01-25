import { CONFIG } from '../../config/index';
import { CustomLogger } from '../../helper/CustomLogger';

/**
 * LINE Messaging
 * LINE APIとの通信を担当
 */
export class LineMessaging {
  /**
   * @param channelAccessToken LINEチャンネルアクセストークン
   */
  constructor(private readonly channelAccessToken: string) {}

  /**
   * LINEから音声コンテンツを取得
   * @param messageId メッセージID
   * @returns 音声データ
   */
  public fetchAudioContent(messageId: string): GoogleAppsScript.Base.Blob | null {
    const contentUrl = `${CONFIG.LINE_API.CONTENT_ENDPOINT}/${messageId}/content`;

    const requestOptions: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
      method: 'get',
      headers: {
        'Authorization': `Bearer ${this.channelAccessToken}`,
      },
      muteHttpExceptions: true,
    };

    try {
      const response = UrlFetchApp.fetch(contentUrl, requestOptions);
      return response.getBlob();
    } catch (error) {
      CustomLogger.logError('LINE音声コンテンツ取得', error);
      return null;
    }
  }

  /**
   * LINEにテキストメッセージを返信
   * @param replyToken リプライトークン
   * @param messageText メッセージテキスト
   */
  public sendTextReply(replyToken: string, messageText: string): void {
    const requestBody = {
      replyToken: replyToken,
      messages: [
        {
          type: 'text',
          text: messageText,
        },
      ],
    };

    this.sendReplyRequest(requestBody);
  }

  /**
   * LINEにFlexメッセージを返信
   * @param replyToken リプライトークン
   * @param flexContent Flexメッセージコンテンツ {altText, contents}
   */
  public sendFlexReply(replyToken: string, flexContent: any): void {
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

    this.sendReplyRequest(requestBody);
  }

  /**
   * LINE返信リクエストを送信
   * @param requestBody リクエストボディ
   */
  private sendReplyRequest(requestBody: any): void {
    const requestHeaders = {
      'Content-Type': 'application/json; charset=UTF-8',
      'Authorization': `Bearer ${this.channelAccessToken}`,
    };

    const requestOptions: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
      method: 'post',
      headers: requestHeaders,
      payload: JSON.stringify(requestBody),
      muteHttpExceptions: true,
    };

    const response = UrlFetchApp.fetch(CONFIG.LINE_API.REPLY_ENDPOINT, requestOptions);
    const responseCode = response.getResponseCode();

    if (responseCode !== 200) {
      CustomLogger.logError('LINE返信', response.getContentText());
    }
  }
}