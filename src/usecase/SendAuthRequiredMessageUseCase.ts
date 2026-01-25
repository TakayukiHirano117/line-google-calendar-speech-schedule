import { OAuth2Manager } from '../infra/google/OAuth2Manager';
import { sendLineFlexReply } from '../infra/line/lineMessagingApi';
import { buildAuthRequiredFlexMessage } from '../infra/line/flexMessageFactory';

/**
 * 未認証ユーザーに認証を促すメッセージを送信するUseCase
 */
export class SendAuthRequiredMessageUseCase {
  /**
   * @param oauth2ClientId OAuth2クライアントID
   * @param oauth2ClientSecret OAuth2クライアントシークレット
   */
  public constructor(
    private readonly oauth2ClientId: string,
    private readonly oauth2ClientSecret: string
  ) {}

  /**
   * 未認証ユーザーに認証を促すメッセージを送信
   * @param replyToken リプライトークン
   * @param userId LINEユーザーID
   */
  public execute(replyToken: string, userId: string): void {
    // OAuth2Managerインスタンスを作成
    const oauth2Manager = new OAuth2Manager(
      userId,
      this.oauth2ClientId,
      this.oauth2ClientSecret
    );
    
    // 未認証ユーザーのため、強制的に同意画面を表示
    const authUrl = oauth2Manager.getAuthorizationUrl(true);
    const flexMessage = buildAuthRequiredFlexMessage(authUrl);
    sendLineFlexReply(replyToken, flexMessage);
  }
}
