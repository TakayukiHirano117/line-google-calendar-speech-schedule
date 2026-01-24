import { CONFIG } from '../../config/index';
import { getOAuth2ClientId, getOAuth2ClientSecret } from '../../config/getProperty';

/**
 * ユーザー専用のOAuth2サービスを作成
 * サービス名にuserIdを含めることで、ユーザーごとに別々のトークンを管理
 */
export const createOAuth2Service = (userId: string, forceConsent: boolean = false): OAuth2Service => {
  const service = OAuth2.createService(`calendar-${userId}`)
    .setAuthorizationBaseUrl(CONFIG.OAUTH2.AUTHORIZATION_BASE_URL)
    .setTokenUrl(CONFIG.OAUTH2.TOKEN_URL)
    .setClientId(getOAuth2ClientId())
    .setClientSecret(getOAuth2ClientSecret())
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
};

/**
 * ユーザーが有効なトークンを持っているか確認
 */
export const hasValidToken = (userId: string): boolean => {
  return createOAuth2Service(userId).hasAccess();
};

/**
 * 認証URLを取得
 * stateパラメータにuserIdを埋め込む（ライブラリが自動的に暗号化）
 * コールバック時にrequest.parameter.userIdとして取得可能
 */
export const getAuthorizationUrl = (userId: string, forceConsent: boolean = false): string => {
  return createOAuth2Service(userId, forceConsent).getAuthorizationUrl({ userId });
};

/**
 * アクセストークンを取得
 * トークンが期限切れの場合は自動的にリフレッシュ
 */
export const getAccessToken = (userId: string): string | null => {
  const service = createOAuth2Service(userId);
  return service.hasAccess() ? service.getAccessToken() : null;
};

/**
 * トークンをリセット（ログアウト）
 */
export const revokeToken = (userId: string): void => {
  createOAuth2Service(userId).reset();
};

/**
 * OAuth2コールバックを処理
 * stateパラメータからuserIdを取得してトークンを保存
 */
export const handleOAuth2Callback = (
  request: GoogleAppsScript.Events.DoGet
): { success: boolean; userId?: string; error?: string } => {
  // stateパラメータからuserIdを取得（ライブラリが自動復号）
  const userId = request.parameter?.userId;

  if (!userId) {
    console.error('[OAuth2] Callback failed: userId not found in state');
    return { success: false, error: 'ユーザー情報が取得できませんでした' };
  }

  const service = createOAuth2Service(userId);
  const authorized = service.handleCallback(request);

  if (authorized) {
    console.log(`[OAuth2] Authorization successful for user: ${userId}`);
    return { success: true, userId };
  }

  const error = service.getLastError();
  console.error(`[OAuth2] Authorization failed for user: ${userId}, error: ${error}`);
  return { success: false, userId, error: error || '認証が拒否されました' };
};
