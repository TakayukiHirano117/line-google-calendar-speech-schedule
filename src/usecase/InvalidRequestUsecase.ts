import { LineMessaging } from '../infra/line/LineMessaging';
import { MESSAGE } from '../constants/message';

/**
 * 不正なリクエストに対するエラーメッセージを返すUseCase
 */
export class InvalidRequestUseCase {
  /**
   * @param lineMessaging LINE Messaging
   */
  constructor(private readonly lineMessaging: LineMessaging) {}

  /**
   * 不正なリクエストに対するエラーメッセージを送信
   * @param replyToken LINEリプライトークン
   */
  public execute(replyToken: string): void {
    this.lineMessaging.sendTextReply(replyToken, MESSAGE.REQUEST_AUDIO);
  }
}
