import { OAuth2Manager } from '../infra/google/OAuth2Manager';
import { sendLineTextReply } from '../infra/line/lineMessagingApi';

/**
 * ログアウト処理を実行するUseCase
 */
export class ShowLogoutUseCase {
  /**
   * @param oauth2ClientId OAuth2クライアントID
   * @param oauth2ClientSecret OAuth2クライアントシークレット
   */
  public constructor(
    private readonly oauth2ClientId: string,
    private readonly oauth2ClientSecret: string
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
    sendLineTextReply(replyToken, 'ログアウトしました。\n再度利用する場合は、認証が必要です。');
  }
}
