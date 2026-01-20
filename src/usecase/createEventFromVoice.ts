import { fetchAudioContentFromLine } from '../infra/line/lineMessagingApi';
import { convertSpeechToText } from '../infra/google/speechToTextApi';
import { extractCalendarEventFromText } from '../infra/google/geminiApi';
import { createUserCalendarEvent, buildUserCalendarEventUrl } from '../infra/google/userCalendarApi';
import { buildEventCreatedFlexMessage, buildReauthRequiredFlexMessage } from '../infra/line/flexMessageFactory';
import { sendLineFlexReply } from '../infra/line/lineMessagingApi';
import { sendLineTextReply } from '../infra/line/lineMessagingApi';
import { MESSAGE } from '../constants/message';
import { getAuthorizationUrl } from '../infra/google/oauth2Service';

/**
 * 音声メッセージからカレンダーイベントを作成
 * @param replyToken LINEリプライトークン
 * @param messageId LINEメッセージID
 * @param userId LINEユーザーID
 */
export const createEventFromVoice = (replyToken: string, messageId: string, userId: string) => {
  // 1. LINE APIから音声を取得
  const audioBlob = fetchAudioContentFromLine(messageId);
  if (!audioBlob) {
    sendLineTextReply(replyToken, MESSAGE.AUDIO_FETCH_FAILED);
    return;
  }

  // 2. Speech-to-Textで音声をテキストに変換
  const transcribedText = convertSpeechToText(audioBlob);
  if (!transcribedText) {
    sendLineTextReply(replyToken, MESSAGE.SPEECH_RECOGNITION_FAILED);
    return;
  }

  // 3. Gemini APIでイベント情報を抽出
  const calendarEventData = extractCalendarEventFromText(transcribedText);
  if (!calendarEventData) {
    sendLineTextReply(replyToken, MESSAGE.EVENT_EXTRACTION_FAILED(transcribedText));
    return;
  }

  // 4. ユーザーのGoogleカレンダーにイベントを作成
  const result = createUserCalendarEvent(userId, calendarEventData);

  if (result.success && result.eventId) {
    const eventUrl = buildUserCalendarEventUrl(result.eventId);
    const flexMessage = buildEventCreatedFlexMessage(calendarEventData, eventUrl);
    sendLineFlexReply(replyToken, flexMessage);
  } else if (result.requiresReauth) {
    // 再認証が必要な場合
    const authUrl = getAuthorizationUrl(userId);
    const flexMessage = buildReauthRequiredFlexMessage(authUrl);
    sendLineFlexReply(replyToken, flexMessage);
  } else {
    sendLineTextReply(replyToken, MESSAGE.CALENDAR_CREATION_FAILED);
  }
};