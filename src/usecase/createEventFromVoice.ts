import { fetchAudioContentFromLine } from '../infra/line/lineMessagingApi';
import { convertSpeechToText } from '../infra/google/speechToTextApi';
import { extractCalendarEventFromText } from '../infra/google/geminiApi';
import { createGoogleCalendarEvent } from '../infra/google/calendarApi';
import { buildGoogleCalendarEventUrl } from '../infra/google/calendarApi';
import { buildEventCreatedFlexMessage } from '../infra/line/flexMessageFactory';
import { sendLineFlexReply } from '../infra/line/lineMessagingApi';
import { sendLineTextReply } from '../infra/line/lineMessagingApi';
import { MESSAGE } from '../constants/message';
/**
 * 音声メッセージからカレンダーイベントを作成
 * @param {string} replyToken - LINEリプライトークン
 * @param {string} messageId - LINEメッセージID
 */
export const createEventFromVoice = (replyToken, messageId) => {
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

  // 4. Googleカレンダーにイベントを作成
  const createdEventId = createGoogleCalendarEvent(calendarEventData);
  if (createdEventId) {
    const eventUrl = buildGoogleCalendarEventUrl(createdEventId);
    const flexMessage = buildEventCreatedFlexMessage(calendarEventData, eventUrl);
    sendLineFlexReply(replyToken, flexMessage);
  } else {
    sendLineTextReply(replyToken, MESSAGE.CALENDAR_CREATION_FAILED);
  }
};