/**
 * Google Apps Script OAuth2 ライブラリの型定義
 * @see https://github.com/googleworkspace/apps-script-oauth2
 */

declare namespace OAuth2 {
  /**
   * 新しいOAuth2サービスを作成
   * @param serviceName サービス名（ユーザーごとに一意にする）
   */
  function createService(serviceName: string): OAuth2Service;
}

interface OAuth2Service {
  /**
   * 認可エンドポイントのベースURLを設定
   */
  setAuthorizationBaseUrl(url: string): OAuth2Service;

  /**
   * トークンエンドポイントのURLを設定
   */
  setTokenUrl(url: string): OAuth2Service;

  /**
   * クライアントIDを設定
   */
  setClientId(clientId: string): OAuth2Service;

  /**
   * クライアントシークレットを設定
   */
  setClientSecret(clientSecret: string): OAuth2Service;

  /**
   * コールバック関数名を設定
   */
  setCallbackFunction(callback: string): OAuth2Service;

  /**
   * トークン保存先のPropertiesServiceを設定
   */
  setPropertyStore(store: GoogleAppsScript.Properties.Properties): OAuth2Service;

  /**
   * 要求するスコープを設定
   */
  setScope(scope: string): OAuth2Service;

  /**
   * 追加のパラメータを設定
   */
  setParam(key: string, value: string): OAuth2Service;

  /**
   * キャッシュサービスを設定（パフォーマンス最適化）
   */
  setCache(cache: GoogleAppsScript.Cache.Cache): OAuth2Service;

  /**
   * ロックサービスを設定（並列実行の競合防止）
   */
  setLock(lock: GoogleAppsScript.Lock.Lock): OAuth2Service;

  /**
   * 有効なアクセストークンを持っているか確認
   */
  hasAccess(): boolean;

  /**
   * アクセストークンを取得（期限切れの場合は自動更新）
   */
  getAccessToken(): string;

  /**
   * 認可URLを取得
   */
  getAuthorizationUrl(): string;

  /**
   * OAuth2コールバックを処理
   * @param request コールバックリクエスト
   * @returns 認可が成功したかどうか
   */
  handleCallback(request: object): boolean;

  /**
   * トークンをリセット（ログアウト）
   */
  reset(): void;

  /**
   * トークンを強制的に更新
   */
  refresh(): void;

  /**
   * 最後に発生したエラーを取得
   * トークンの生成やリフレッシュ時にエラーが発生した場合に返される
   * @returns エラーオブジェクト、またはエラーがない場合はnull/undefined
   */
  getLastError(): any;
}

/**
 * LINE Webhookイベントのソース情報
 */
interface LineEventSource {
  type: 'user' | 'group' | 'room';
  userId?: string;
  groupId?: string;
  roomId?: string;
}

/**
 * LINE Webhookイベント
 */
interface LineWebhookEvent {
  type: string;
  replyToken: string;
  source: LineEventSource;
  timestamp: number;
  message?: {
    type: string;
    id: string;
    text?: string;
  };
}

/**
 * カレンダーイベントデータ
 */
interface CalendarEventData {
  title: string;
  startTime: string;
  endTime: string;
  description?: string;
}

/**
 * カレンダーイベント
 */
interface CalendarEvent {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  isAllDay: boolean;
}

/**
 * 日付ごとのイベント
 */
interface EventsByDate {
  [dateKey: string]: {
    date: Date;
    events: CalendarEvent[];
  };
}

/**
 * カレンダーイベント作成結果
 */
interface CreateEventResult {
  success: boolean;
  eventId?: string;
  error?: string;
  requiresReauth?: boolean;
}
