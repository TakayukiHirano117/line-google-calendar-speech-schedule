import { getUserWeekEvents } from '../infra/google/userCalendarApi';
import { buildWeekEventsFlexMessage } from '../infra/line/flexMessageFactory';
import { sendLineFlexReply } from '../infra/line/lineMessagingApi';

/**
 * 週間予定を表示するUseCase（直近7日間）
 */
export class ShowWeekScheduleUseCase {
  /**
   * 週間予定を表示（直近7日間）
   * @param replyToken LINEリプライトークン
   * @param userId LINEユーザーID
   */
  public execute(replyToken: string, userId: string): void {
    // 1. ユーザーのGoogleカレンダーから週間予定を取得
    const weekEvents = getUserWeekEvents(userId);

    // 2. Flexメッセージを構築
    const flexMessage = buildWeekEventsFlexMessage(weekEvents);

    // 3. LINEに返信
    sendLineFlexReply(replyToken, flexMessage);
  }
}
