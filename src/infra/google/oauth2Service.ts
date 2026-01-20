import { CONFIG } from '../../config/index';
import { getOAuth2ClientId, getOAuth2ClientSecret } from '../../config/getProperty';

/**
 * ユーザー固有のOAuth2サービスを取得
 */
export const getCalendarOAuth2Service = (userId: string): OAuth2Service => {
  return OAuth2.createService(`calendar-${userId}`)
    .setAuthorizationBaseUrl(CONFIG.OAUTH2.AUTHORIZATION_BASE_URL)
    .setTokenUrl(CONFIG.OAUTH2.TOKEN_URL)
    .setClientId(getOAuth2ClientId())
    .setClientSecret(getOAuth2ClientSecret())
    .setCallbackFunction(CONFIG.OAUTH2.CALLBACK_FUNCTION)
    .setPropertyStore(PropertiesService.getScriptProperties())
    .setScope(CONFIG.OAUTH2.SCOPE)
    .setParam('access_type', 'offline')
    .setParam('prompt', 'consent');
};

/**
 * ユーザーが有効なトークンを持っているか確認
 */
export const hasValidToken = (userId: string): boolean => {
  const service = getCalendarOAuth2Service(userId);
  return service.hasAccess();
};

/**
 * 認証URLを取得し、state → userId マッピングを保存
 */
export const getAuthorizationUrl = (userId: string): string => {
  const service = getCalendarOAuth2Service(userId);
  const authUrl = service.getAuthorizationUrl();

  // URL から state パラメータを抽出してマッピングを保存
  const stateMatch = authUrl.match(/[?&]state=([^&]+)/);
  if (stateMatch) {
    const state = decodeURIComponent(stateMatch[1]);
    const props = PropertiesService.getScriptProperties();
    props.setProperty(`pending_oauth_${state}`, userId);
  }

  return authUrl;
};

/**
 * アクセストークンを取得
 */
export const getAccessToken = (userId: string): string | null => {
  const service = getCalendarOAuth2Service(userId);
  if (service.hasAccess()) {
    return service.getAccessToken();
  }
  return null;
};

/**
 * トークンをリセット（ログアウト）
 */
export const revokeToken = (userId: string): void => {
  const service = getCalendarOAuth2Service(userId);
  service.reset();
};

/**
 * OAuth2コールバックを処理
 */
export const handleOAuth2Callback = (request: GoogleAppsScript.Events.DoGet): { success: boolean; error?: string } => {
  const state = request.parameter?.state;
  if (!state) {
    return { success: false, error: 'stateパラメータがありません' };
  }

  // PropertyStore から userId を取得（state をデコードしない）
  const props = PropertiesService.getScriptProperties();
  const userId = props.getProperty(`pending_oauth_${state}`);

  if (!userId) {
    return { success: false, error: 'ユーザーIDが見つかりません' };
  }

  const service = getCalendarOAuth2Service(userId);
  const authorized = service.handleCallback(request);

  // マッピングをクリーンアップ
  props.deleteProperty(`pending_oauth_${state}`);

  if (authorized) {
    return { success: true };
  }
  return { success: false, error: service.getLastError() || '認証が拒否されました' };
};
