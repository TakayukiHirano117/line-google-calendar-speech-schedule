import { OAuth2Manager } from '../infra/google/OAuth2Manager';
import { LineMessaging } from '../infra/line/LineMessaging';

/**
 * ログアウト処理を実行するUseCase
 */
export class ShowLogoutUseCase {
  /**
   * @param oauth2ClientId OAuth2クライアントID
   * @param oauth2ClientSecret OAuth2クライアントシークレット
   * @param lineMessaging LINE Messaging
   */
  public constructor(
    private readonly oauth2ClientId: string,
    private readonly oauth2ClientSecret: string,
    private readonly lineMessaging: LineMessaging
  ) {}

  /**
   * ログアウト処理を実行
   * @param replyToken LINEリプライトークン
   * @param userId LINEユーザーID
   */
  public execute(replyToken: string, userId: string): void {
    // OAuth2Managerインスタンスを作成
    const oauth2Manager = new OAuth2Manager(
      userId,
      this.oauth2ClientId,
      this.oauth2ClientSecret
    );
    
    // トークンをリセット
    oauth2Manager.revokeToken();
    
    // ログアウト完了メッセージを送信
    this.lineMessaging.sendTextReply(
      replyToken,
      'ログアウトしました。\n再度利用する場合は、認証が必要です。'
    );
  }
}
