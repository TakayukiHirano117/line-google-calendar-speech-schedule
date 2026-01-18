import { getWeekEvents } from '../infra/google/calendarApi';
import { buildWeekEventsFlexMessage } from '../infra/line/flexMessageFactory';
import { sendLineFlexReply } from '../infra/line/lineMessagingApi';
/**
 * 週間予定を表示（直近7日間）
 * @param {string} replyToken - LINEリプライトークン
 */
export const showWeekSchedule = (replyToken) => {
  // 1. Googleカレンダーから週間予定を取得
  const weekEvents = getWeekEvents();

  // 2. Flexメッセージを構築
  const flexMessage = buildWeekEventsFlexMessage(weekEvents);

  // 3. LINEに返信
  sendLineFlexReply(replyToken, flexMessage);
};