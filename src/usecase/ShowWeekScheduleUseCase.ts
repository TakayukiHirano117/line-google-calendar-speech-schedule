import { UserCalendar } from '../infra/google/UserCalendar';
import { FlexMessageFactory } from '../infra/line/flexMessageFactory';
import { LineMessaging } from '../infra/line/LineMessaging';

/**
 * 週間予定を表示するUseCase（直近7日間）
 */
export class ShowWeekScheduleUseCase {
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
   * 週間予定を表示（直近7日間）
   * @param replyToken LINEリプライトークン
   */
  public execute(replyToken: string): void {
    // 1. ユーザーのGoogleカレンダーから週間予定を取得
    const weekEvents = this.userCalendar.getWeekEvents();

    // 2. Flexメッセージを構築
    const flexMessage = this.flexMessageFactory.buildWeekEventsMessage(weekEvents);

    // 3. LINEに返信
    this.lineMessaging.sendFlexReply(replyToken, flexMessage);
  }
}
