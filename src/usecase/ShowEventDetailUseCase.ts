import { UserCalendar } from '../infra/google/UserCalendar';
import { FlexMessageFactory } from '../infra/line/flexMessageFactory';
import { LineMessaging } from '../infra/line/LineMessaging';
import { MESSAGE } from '../constants/message';

/**
 * イベント詳細を表示するUseCase
 */
export class ShowEventDetailUseCase {
  /**
   * @param userCalendar ユーザーカレンダー
   * @param lineMessaging LINE Messaging
   * @param flexMessageFactory Flexメッセージファクトリー
   */
  public constructor(
    private readonly userCalendar: UserCalendar,
    private readonly lineMessaging: LineMessaging,
    private readonly flexMessageFactory: FlexMessageFactory
  ) {}

  /**
   * イベント詳細を表示
   * @param replyToken LINEリプライトークン
   * @param eventId イベントID
   */
  public execute(replyToken: string, eventId: string): void {
    // 1. イベント詳細を取得
    const event = this.userCalendar.getEventById(eventId);

    if (!event) {
      this.lineMessaging.sendTextReply(replyToken, MESSAGE.EVENT_NOT_FOUND);
      return;
    }

    // 2. Flexメッセージを構築
    const flexMessage = this.flexMessageFactory.buildEventDetailMessage(event);

    // 3. LINEに返信
    this.lineMessaging.sendFlexReply(replyToken, flexMessage);
  }
}
