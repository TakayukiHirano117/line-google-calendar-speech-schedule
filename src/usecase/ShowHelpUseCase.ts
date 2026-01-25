import { FlexMessageFactory } from '../infra/line/flexMessageFactory';
import { LineMessaging } from '../infra/line/LineMessaging';

/**
 * ヘルプメッセージを表示するUseCase
 */
export class ShowHelpUseCase {
  /**
   * @param lineMessaging LINE Messaging
   * @param flexMessageFactory Flexメッセージファクトリー
   */
  constructor(
    private readonly lineMessaging: LineMessaging,
    private readonly flexMessageFactory: FlexMessageFactory
  ) {}

  /**
   * ヘルプメッセージを表示
   * @param replyToken LINEリプライトークン
   */
  public execute(replyToken: string): void {
    // 1. Flexメッセージを構築
    const flexMessage = this.flexMessageFactory.buildHelpMessage();

    // 2. LINEに返信
    this.lineMessaging.sendFlexReply(replyToken, flexMessage);
  }
}
