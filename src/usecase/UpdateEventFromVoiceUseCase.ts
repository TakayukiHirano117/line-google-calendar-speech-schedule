import { LineMessaging } from '../infra/line/LineMessaging';
import { SpeechToText } from '../infra/google/SpeechToText';
import { GeminiEventExtractor } from '../infra/google/GeminiEventExtractor';
import { UserCalendar } from '../infra/google/UserCalendar';
import { FlexMessageFactory } from '../infra/line/flexMessageFactory';
import { MESSAGE } from '../constants/message';
import { OAuth2Manager } from '../infra/google/OAuth2Manager';

/**
 * 音声メッセージからイベントを更新するUseCase
 */
export class UpdateEventFromVoiceUseCase {
  /**
   * @param lineMessaging LINE Messaging
   * @param speechToText Speech-to-Text
   * @param geminiEventExtractor Gemini イベント抽出
   * @param userCalendar ユーザーカレンダー
   * @param flexMessageFactory Flexメッセージファクトリー
   * @param oauth2ClientId OAuth2クライアントID
   * @param oauth2ClientSecret OAuth2クライアントシークレット
   */
  public constructor(
    private readonly lineMessaging: LineMessaging,
    private readonly speechToText: SpeechToText,
    private readonly geminiEventExtractor: GeminiEventExtractor,
    private readonly userCalendar: UserCalendar,
    private readonly flexMessageFactory: FlexMessageFactory,
    private readonly oauth2ClientId: string,
    private readonly oauth2ClientSecret: string
  ) {}

  /**
   * 音声メッセージからイベントを更新
   * @param replyToken LINEリプライトークン
   * @param messageId LINEメッセージID
   * @param userId LINEユーザーID
   * @param eventId イベントID
   */
  public execute(replyToken: string, messageId: string, userId: string, eventId: string): void {
    // 1. LINE APIから音声を取得
    const audioBlob = this.lineMessaging.fetchAudioContent(messageId);
    if (!audioBlob) {
      this.lineMessaging.sendTextReply(replyToken, MESSAGE.AUDIO_FETCH_FAILED);
      return;
    }

    // 2. Speech-to-Textで音声をテキストに変換
    const transcribedText = this.speechToText.convertSpeechToText(audioBlob);
    if (!transcribedText) {
      this.lineMessaging.sendTextReply(replyToken, MESSAGE.SPEECH_RECOGNITION_FAILED);
      return;
    }

    // 3. Gemini APIでイベント情報を抽出
    const calendarEventData = this.geminiEventExtractor.extractCalendarEventFromText(transcribedText);
    if (!calendarEventData) {
      this.lineMessaging.sendTextReply(replyToken, MESSAGE.EVENT_EXTRACTION_FAILED(transcribedText));
      return;
    }

    // 4. イベントを更新
    const result = this.userCalendar.updateEvent(eventId, calendarEventData);

    if (result.success && result.eventId) {
      const eventUrl = this.userCalendar.buildEventUrl(result.eventId);
      const flexMessage = this.flexMessageFactory.buildEventUpdatedMessage(calendarEventData, eventUrl);
      this.lineMessaging.sendFlexReply(replyToken, flexMessage);
    } else if (result.requiresReauth) {
      const oauth2Manager = new OAuth2Manager(
        userId,
        this.oauth2ClientId,
        this.oauth2ClientSecret
      );
      const authUrl = oauth2Manager.getAuthorizationUrl();
      const flexMessage = this.flexMessageFactory.buildReauthRequiredMessage(authUrl);
      this.lineMessaging.sendFlexReply(replyToken, flexMessage);
    } else {
      this.lineMessaging.sendTextReply(replyToken, MESSAGE.EVENT_UPDATE_FAILED);
    }
  }
}
