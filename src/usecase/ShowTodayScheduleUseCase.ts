import { getUserTodayEvents } from '../infra/google/userCalendarApi';
import { buildTodayEventsFlexMessage } from '../infra/line/flexMessageFactory';
import { sendLineFlexReply } from '../infra/line/lineMessagingApi';

/**
 * 今日の予定を表示するUseCase
 */
export class ShowTodayScheduleUseCase {
  /**
   * 今日の予定を表示
   * @param replyToken LINEリプライトークン
   * @param userId LINEユーザーID
   */
  public execute(replyToken: string, userId: string): void {
    // 1. ユーザーのGoogleカレンダーから今日の予定を取得
    const todayEvents = getUserTodayEvents(userId);

    // 2. Flexメッセージを構築
    const flexMessage = buildTodayEventsFlexMessage(todayEvents);

    // 3. LINEに返信
    sendLineFlexReply(replyToken, flexMessage);
  }
}
