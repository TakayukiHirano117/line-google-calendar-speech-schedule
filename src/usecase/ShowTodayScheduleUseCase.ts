import { UserCalendar } from '../infra/google/UserCalendar';
import { FlexMessageFactory } from '../infra/line/flexMessageFactory';
import { LineMessaging } from '../infra/line/LineMessaging';

/**
 * 今日の予定を表示するUseCase
 */
export class ShowTodayScheduleUseCase {
  /**
   * @param userCalendar ユーザーカレンダー
   * @param lineMessaging LINE Messaging
   * @param flexMessageFactory Flexメッセージファクトリー
   */
  constructor(
    private readonly userCalendar: UserCalendar,
    private readonly lineMessaging: LineMessaging,
    private readonly flexMessageFactory: FlexMessageFactory
  ) {}

  /**
   * 今日の予定を表示
   * @param replyToken LINEリプライトークン
   */
  public execute(replyToken: string): void {
    // 1. ユーザーのGoogleカレンダーから今日の予定を取得
    const todayEvents = this.userCalendar.getTodayEvents();

    // 2. Flexメッセージを構築
    const flexMessage = this.flexMessageFactory.buildTodayEventsMessage(todayEvents);

    // 3. LINEに返信
    this.lineMessaging.sendFlexReply(replyToken, flexMessage);
  }
}
