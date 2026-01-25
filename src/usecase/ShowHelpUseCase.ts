import { buildHelpFlexMessage } from '../infra/line/flexMessageFactory';
import { sendLineFlexReply } from '../infra/line/lineMessagingApi';

/**
 * ヘルプメッセージを表示するUseCase
 */
export class ShowHelpUseCase {
  /**
   * ヘルプメッセージを表示
   * @param replyToken LINEリプライトークン
   */
  public execute(replyToken: string): void {
    // 1. Flexメッセージを構築
    const flexMessage = buildHelpFlexMessage();

    // 2. LINEに返信
    sendLineFlexReply(replyToken, flexMessage);
  }
}
