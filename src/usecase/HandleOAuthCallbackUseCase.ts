import { OAuth2Manager } from '../infra/google/OAuth2Manager';

/**
 * OAuth2認証コールバック処理のユースケース
 */
export class HandleOAuthCallbackUseCase {
  constructor() { }

  /**
   * OAuth2コールバックを処理してビジネスロジックを実行
   * @param request GETリクエスト
   * @param userId ユーザーID
   * @param clientId OAuth2クライアントID
   * @param clientSecret OAuth2クライアントシークレット
   * @returns 認証結果
   */
  public execute(
    request: GoogleAppsScript.Events.DoGet,
    userId: string,
    clientId: string,
    clientSecret: string
  ): { success: boolean; userId?: string; error?: string } {
    // UseCase層でOAuth2Managerを生成
    const oauth2Service = new OAuth2Manager(userId, clientId, clientSecret);

    // OAuth2Serviceを使って認証コールバック処理を実行
    const result = oauth2Service.handleCallback(request);

    if (result.success) {
      return { success: true, userId };
    }

    return { success: false, userId, error: result.error };
  }
}
