import { getTodayEvents } from '../infra/google/calendarApi';
import { buildTodayEventsFlexMessage } from '../infra/line/flexMessageFactory';
import { sendLineFlexReply } from '../infra/line/lineMessagingApi';

/**
 * 今日の予定を表示
 * @param {string} replyToken - LINEリプライトークン
 */
export const showTodaySchedule = (replyToken) => {
  // 1. Googleカレンダーから今日の予定を取得
  const todayEvents = getTodayEvents();

  // 2. Flexメッセージを構築
  const flexMessage = buildTodayEventsFlexMessage(todayEvents);

  // 3. LINEに返信
  sendLineFlexReply(replyToken, flexMessage);
};