import { sendLineTextReply } from '../infra/line/lineMessagingApi';
import { MESSAGE } from '../constants/message';

/**
 * 不正なリクエストに対するエラーメッセージを返すUseCase
 */
export class InvalidRequestUseCase {
  /**
   * 不正なリクエストに対するエラーメッセージを送信
   * @param replyToken LINEリプライトークン
   */
  public execute(replyToken: string): void {
    sendLineTextReply(replyToken, MESSAGE.REQUEST_AUDIO);
  }
}
