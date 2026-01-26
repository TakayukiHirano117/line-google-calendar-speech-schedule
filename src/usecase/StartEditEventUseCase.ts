import { UserCalendar } from '../infra/google/UserCalendar';
import { FlexMessageFactory } from '../infra/line/flexMessageFactory';
import { LineMessaging } from '../infra/line/LineMessaging';
import { MESSAGE } from '../constants/message';

/**
 * イベント編集モードを開始するUseCase
 */
export class StartEditEventUseCase {
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
   * 編集モードを開始
   * @param replyToken LINEリプライトークン
   * @param eventId イベントID
   * @param userId LINEユーザーID
   */
  public execute(replyToken: string, eventId: string, userId: string): void {
    // 1. イベント詳細を取得
    const event = this.userCalendar.getEventById(eventId);

    if (!event) {
      this.lineMessaging.sendTextReply(replyToken, MESSAGE.EVENT_NOT_FOUND);
      return;
    }

    // 2. 編集モード状態を保存（GAS PropertiesService）
    const userProperties = PropertiesService.getUserProperties();
    userProperties.setProperty(`edit_mode_${userId}`, JSON.stringify({
      eventId: event.id,
      timestamp: Date.now(),
    }));

    // 3. 編集待機メッセージを送信
    const flexMessage = this.flexMessageFactory.buildEditWaitingMessage(event);
    this.lineMessaging.sendFlexReply(replyToken, flexMessage);
  }
}
