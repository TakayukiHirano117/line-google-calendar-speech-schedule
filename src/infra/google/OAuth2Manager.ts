import { CONFIG } from '../../config/index';

/**
 * OAuth2認証管理クラス
 * ユーザーごとのOAuth2トークン管理とGoogle OAuth2 APIとの通信を担当
 */
export class OAuth2Manager {
  /**
   * @param userId LINEユーザーID
   * @param clientId OAuth2クライアントID
   * @param clientSecret OAuth2クライアントシークレット
   */
  constructor(
    private readonly userId: string,
    private readonly clientId: string,
    private readonly clientSecret: string
  ) { }

  /**
   * ユーザーが有効なトークンを持っているか確認
   */
  public hasValidToken(): boolean {
    return this.createService(false).hasAccess();
  }

  /**
   * 認証URLを取得
   * stateパラメータにuserIdを埋め込む（ライブラリが自動的に暗号化）
   * コールバック時にrequest.parameter.userIdとして取得可能
   * @param forceConsent 強制的に同意画面を表示するか
   */
  public getAuthorizationUrl(forceConsent: boolean = false): string {
    return this.createService(forceConsent).getAuthorizationUrl({ userId: this.userId });
  }

  /**
   * アクセストークンを取得
   * トークンが期限切れの場合は自動的にリフレッシュ
   */
  public getAccessToken(): string | null {
    const service = this.createService(false);
    return service.hasAccess() ? service.getAccessToken() : null;
  }

  /**
   * トークンをリセット（ログアウト）
   */
  public revokeToken(): void {
    this.createService(false).reset();
  }

  /**
   * OAuth2コールバックを処理
   * @param request GETリクエスト
   * @returns 認証結果
   */
  public handleCallback(
    request: GoogleAppsScript.Events.DoGet
  ): { success: boolean; error?: string } {
    const service = this.createService(false);
    const authorized = service.handleCallback(request);

    if (authorized) {
      console.log(`[OAuth2] Authorization successful for user: ${this.userId}`);
      return { success: true };
    }

    const error = service.getLastError();
    console.error(`[OAuth2] Authorization failed for user: ${this.userId}, error: ${error}`);
    return { success: false, error: error || '認証が拒否されました' };
  }

  /**
   * ユーザー専用のOAuth2サービスを作成
   * サービス名にuserIdを含めることで、ユーザーごとに別々のトークンを管理
   * @param forceConsent 強制的に同意画面を表示するか
   */
  private createService(forceConsent: boolean): OAuth2Service {
    const service = OAuth2.createService(`calendar-${this.userId}`)
      .setAuthorizationBaseUrl(CONFIG.OAUTH2.AUTHORIZATION_BASE_URL)
      .setTokenUrl(CONFIG.OAUTH2.TOKEN_URL)
      .setClientId(this.clientId)
      .setClientSecret(this.clientSecret)
      .setCallbackFunction(CONFIG.OAUTH2.CALLBACK_FUNCTION)
      .setPropertyStore(PropertiesService.getScriptProperties())
      .setScope(CONFIG.OAUTH2.SCOPE)
      .setParam('access_type', 'offline');

    // 強制的に同意画面を表示する場合のみprompt=consentを設定
    // 初回認証時は呼び出し元でforceConsent=trueを指定
    if (forceConsent) {
      service.setParam('prompt', 'consent');
    }

    return service;
  }
}
