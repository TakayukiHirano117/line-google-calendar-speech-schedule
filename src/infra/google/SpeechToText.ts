import { CONFIG } from '../../config/index';
import { CustomLogger } from '../../helper/CustomLogger';
import { GoogleServiceAccountAuth } from './GoogleServiceAccountAuth';

/**
 * Speech-to-Text
 * Google Cloud Speech-to-Text APIによる音声認識を担当
 */
export class SpeechToText {
  /**
   * @param auth サービスアカウント認証
   * @param projectId GCPプロジェクトID
   */
  constructor(
    private readonly auth: GoogleServiceAccountAuth,
    private readonly projectId: string
  ) {}

  /**
   * 音声をテキストに変換
   * @param audioBlob 音声データ
   * @returns 認識されたテキスト
   */
  public convertSpeechToText(audioBlob: GoogleAppsScript.Base.Blob): string | null {
    const accessToken = this.auth.generateAccessToken();
    const audioContentBase64 = Utilities.base64Encode(audioBlob.getBytes());

    const recognizerPath = this.buildRecognizerPath();
    const apiEndpoint = `https://speech.googleapis.com/v2/${recognizerPath}:recognize`;

    const requestBody = this.buildRequestBody(audioContentBase64);
    const requestOptions = this.buildAuthorizedPostRequest(accessToken, requestBody);

    try {
      const response = UrlFetchApp.fetch(apiEndpoint, requestOptions);
      const responseData = JSON.parse(response.getContentText());

      CustomLogger.logDebug('Speech-to-Text v2 ステータス', String(response.getResponseCode()));
      CustomLogger.logDebug('Speech-to-Text v2 結果', JSON.stringify(responseData));

      return this.extractTranscript(responseData);
    } catch (error) {
      CustomLogger.logError('Speech-to-Text v2', error);
      return null;
    }
  }

  /**
   * Recognizerパスを構築
   * @returns Recognizerパス
   */
  private buildRecognizerPath(): string {
    return `projects/${this.projectId}/locations/${CONFIG.SPEECH_TO_TEXT.LOCATION}/recognizers/_`;
  }

  /**
   * Speech-to-Textリクエストボディを構築
   * @param audioContentBase64 Base64エンコードされた音声データ
   * @returns リクエストボディ
   */
  private buildRequestBody(audioContentBase64: string): object {
    return {
      config: {
        autoDecodingConfig: {},
        languageCodes: [CONFIG.SPEECH_TO_TEXT.LANGUAGE_CODE],
        model: CONFIG.SPEECH_TO_TEXT.MODEL,
      },
      content: audioContentBase64,
    };
  }

  /**
   * Speech-to-Textレスポンスからテキストを抽出
   * @param responseData APIレスポンス
   * @returns 認識されたテキスト
   */
  private extractTranscript(responseData: any): string | null {
    if (!responseData.results || responseData.results.length === 0) {
      return null;
    }

    const alternatives = responseData.results[0].alternatives;
    if (!alternatives || alternatives.length === 0) {
      return null;
    }

    return alternatives[0].transcript;
  }

  /**
   * 認証付きPOSTリクエストを構築
   * @param accessToken アクセストークン
   * @param requestBody リクエストボディ
   * @returns リクエストオプション
   */
  private buildAuthorizedPostRequest(
    accessToken: string,
    requestBody: object
  ): GoogleAppsScript.URL_Fetch.URLFetchRequestOptions {
    return {
      method: 'post',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      payload: JSON.stringify(requestBody),
      muteHttpExceptions: true,
    };
  }
}
