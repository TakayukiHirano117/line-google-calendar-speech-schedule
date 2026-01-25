import { OAuth2Manager } from '../infra/google/OAuth2Manager';

/**
 * ユーザーの認証状態をチェックするUseCase
 */
export class CheckAuthenticationUseCase {
  /**
   * @param oauth2ClientId OAuth2クライアントID
   * @param oauth2ClientSecret OAuth2クライアントシークレット
   */
  public constructor(
    private readonly oauth2ClientId: string,
    private readonly oauth2ClientSecret: string
  ) {}

  /**
   * ユーザーの認証状態をチェック
   * @param userId LINEユーザーID
   * @returns 認証済みの場合true、未認証の場合false
   */
  public execute(userId: string): boolean {
    const oauth2Manager = new OAuth2Manager(
      userId,
      this.oauth2ClientId,
      this.oauth2ClientSecret
    );
    
    return oauth2Manager.hasValidToken();
  }
}
