import { UserCalendar } from '../infra/google/UserCalendar';
import { FlexMessageFactory } from '../infra/line/flexMessageFactory';
import { LineMessaging } from '../infra/line/LineMessaging';
import { OAuth2Manager } from '../infra/google/OAuth2Manager';
import { MESSAGE } from '../constants/message';

/**
 * イベントを削除するUseCase
 */
export class DeleteEventUseCase {
  /**
   * @param userCalendar ユーザーカレンダー
   * @param lineMessaging LINE Messaging
   * @param flexMessageFactory Flexメッセージファクトリー
   * @param oauth2ClientId OAuth2クライアントID
   * @param oauth2ClientSecret OAuth2クライアントシークレット
   * @param userId LINEユーザーID
   */
  public constructor(
    private readonly userCalendar: UserCalendar,
    private readonly lineMessaging: LineMessaging,
    private readonly flexMessageFactory: FlexMessageFactory,
    private readonly oauth2ClientId: string,
    private readonly oauth2ClientSecret: string,
    private readonly userId: string
  ) {}

  /**
   * イベントを削除
   * @param replyToken LINEリプライトークン
   * @param eventId イベントID
   */
  public execute(replyToken: string, eventId: string): void {
    // 1. まずイベント情報を取得（削除前にタイトルを保存）
    const event = this.userCalendar.getEventById(eventId);

    if (!event) {
      this.lineMessaging.sendTextReply(replyToken, MESSAGE.EVENT_NOT_FOUND);
      return;
    }

    // 2. イベントを削除
    const result = this.userCalendar.deleteEvent(eventId);

    if (result.success) {
      const flexMessage = this.flexMessageFactory.buildEventDeletedMessage(event.title);
      this.lineMessaging.sendFlexReply(replyToken, flexMessage);
    } else if (result.requiresReauth) {
      // 再認証が必要な場合
      const oauth2Manager = new OAuth2Manager(
        this.userId,
        this.oauth2ClientId,
        this.oauth2ClientSecret
      );
      const authUrl = oauth2Manager.getAuthorizationUrl();
      const flexMessage = this.flexMessageFactory.buildReauthRequiredMessage(authUrl);
      this.lineMessaging.sendFlexReply(replyToken, flexMessage);
    } else {
      this.lineMessaging.sendTextReply(replyToken, MESSAGE.EVENT_DELETE_FAILED);
    }
  }
}
