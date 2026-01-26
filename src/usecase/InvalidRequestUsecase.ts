import { LineMessaging } from '../infra/line/LineMessaging';
import { MESSAGE } from '../constants/message';

/**
 * 不正なリクエストに対するエラーメッセージを返すUseCase
 */
export class InvalidRequestUseCase {
  /**
   * @param lineMessaging LINE Messaging
   */
  constructor(private readonly lineMessaging: LineMessaging) { }

  /**
   * 不正なリクエストに対するエラーメッセージを送信
   * @param replyToken LINEリプライトークン
   * @param customMessage カスタムメッセージ（オプション）
   */
  public execute(replyToken: string, customMessage?: string): void {
    const message = customMessage || MESSAGE.REQUEST_AUDIO;
    this.lineMessaging.sendTextReply(replyToken, message);
  }
}
