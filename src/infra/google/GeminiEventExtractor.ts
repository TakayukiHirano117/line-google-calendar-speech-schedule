import { CONFIG } from '../../config/index';
import { CustomLogger } from '../../helper/CustomLogger';

/**
 * Gemini イベント抽出
 * Gemini APIによるテキスト解析とカレンダーイベント抽出を担当
 */
export class GeminiEventExtractor {
  /**
   * @param apiKey Gemini APIキー
   */
  constructor(private readonly apiKey: string) {}

  /**
   * テキストからカレンダーイベント情報を抽出
   * @param transcribedText 音声認識されたテキスト
   * @returns イベントデータ {title, startTime, endTime, description}
   */
  public extractCalendarEventFromText(transcribedText: string): any | null {
    const prompt = this.buildEventExtractionPrompt(transcribedText);
    const requestBody = this.buildRequestBody(prompt);
    const apiEndpoint = this.buildApiEndpoint();

    const requestOptions: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      payload: JSON.stringify(requestBody),
      muteHttpExceptions: true,
    };

    try {
      const response = UrlFetchApp.fetch(apiEndpoint, requestOptions);
      const responseData = JSON.parse(response.getContentText());

      CustomLogger.logDebug('Gemini ステータス', String(response.getResponseCode()));
      CustomLogger.logDebug('Gemini 結果', JSON.stringify(responseData));

      return this.parseResponseToEventData(responseData);
    } catch (error) {
      CustomLogger.logError('Gemini API', error);
      return null;
    }
  }

  /**
   * イベント抽出用プロンプトを構築
   * @param transcribedText 音声認識テキスト
   * @returns プロンプト
   */
  private buildEventExtractionPrompt(transcribedText: string): string {
    const todayDescription = this.formatTodayForPrompt();
    const currentTimeDescription = this.formatCurrentTimeForPrompt();

    return `以下の音声認識テキストからカレンダーイベント情報を抽出してください。
今日の日付は${todayDescription}、現在時刻は${currentTimeDescription}です。

音声認識テキスト: "${transcribedText}"

以下のJSON形式で出力してください：
{
  "title": "イベントのタイトル（簡潔に、絵文字を1つ含めて魅力的に）",
  "startTime": "YYYY-MM-DDTHH:MM:00+09:00",
  "endTime": "YYYY-MM-DDTHH:MM:00+09:00",
  "description": "詳細説明（元のテキストを含めて補足情報も）"
}

ルール：
- 開始時刻が指定されていない場合は、現在時刻を15分単位で切り上げた時刻にする（例: 9:03→9:15、9:47→10:00、9:00→9:00）
- 終了時刻の決定方法：
  - 「2時間」「30分」など所要時間が指定された場合は、開始時刻にその時間を加算する
  - 「14時まで」など終了時刻が明示された場合は、その時刻を使用する
  - どちらも指定されていない場合は、開始時刻の1時間後にする
- 「明日」「来週」などの相対的な日付表現を正確に変換する
- タイトルは30文字以内で、内容を端的に表現する
- descriptionには元の音声内容をもとに要約を書いて下さい。
- イベント情報が含まれていない場合はnullを返す
- タイトルや説明文に絵文字は使用しない

JSON形式のみを返し、他の説明は一切不要です。`;
  }

  /**
   * 今日の日付をプロンプト用にフォーマット
   * @returns フォーマット済み日付
   */
  private formatTodayForPrompt(): string {
    const today = new Date();
    const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
    const dayOfWeek = dayNames[today.getDay()];

    return `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日(${dayOfWeek}曜日)`;
  }

  /**
   * 現在時刻をプロンプト用にフォーマット
   * @returns フォーマット済み時刻
   */
  private formatCurrentTimeForPrompt(): string {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();

    return `${hour}時${String(minute)}分`;
  }

  /**
   * Geminiリクエストボディを構築
   * @param prompt プロンプト
   * @returns リクエストボディ
   */
  private buildRequestBody(prompt: string): object {
    return {
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: CONFIG.GEMINI.TEMPERATURE,
        maxOutputTokens: CONFIG.GEMINI.MAX_OUTPUT_TOKENS,
      },
    };
  }

  /**
   * Gemini APIエンドポイントを構築
   * @returns APIエンドポイント
   */
  private buildApiEndpoint(): string {
    return `${CONFIG.GEMINI.ENDPOINT}/${CONFIG.GEMINI.MODEL}:generateContent?key=${this.apiKey}`;
  }

  /**
   * Geminiレスポンスをイベントデータにパース
   * @param responseData APIレスポンス
   * @returns イベントデータ
   */
  private parseResponseToEventData(responseData: any): any | null {
    try {
      const generatedText = responseData?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!generatedText) {
        return null;
      }

      const jsonString = this.extractJsonFromText(generatedText);
      CustomLogger.logDebug('抽出されたJSON', jsonString);

      const eventData = JSON.parse(jsonString);
      return this.isValidEventData(eventData) ? eventData : null;
    } catch (error) {
      CustomLogger.logError('Gemini レスポンス解析', error);
      return null;
    }
  }

  /**
   * テキストからJSON部分を抽出
   * @param text テキスト
   * @returns JSON文字列
   */
  private extractJsonFromText(text: string): string {
    let cleanedText = text
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    const jsonStartIndex = cleanedText.indexOf('{');
    const jsonEndIndex = cleanedText.lastIndexOf('}');

    if (jsonStartIndex === -1 || jsonEndIndex === -1) {
      return cleanedText;
    }

    return cleanedText.substring(jsonStartIndex, jsonEndIndex + 1);
  }

  /**
   * イベントデータが有効かチェック
   * @param eventData イベントデータ
   * @returns 有効な場合true
   */
  private isValidEventData(eventData: any): boolean {
    return eventData && typeof eventData.title === 'string' && eventData.title.length > 0;
  }
}
