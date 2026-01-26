import { CONFIG } from '../config/index';
import { CreateEventFromVoiceUseCase } from '../usecase/CreateEventFromVoiceUseCase';
import { ShowHelpUseCase } from '../usecase/ShowHelpUseCase';
import { ShowWeekScheduleUseCase } from '../usecase/ShowWeekScheduleUseCase';
import { ShowTodayScheduleUseCase } from '../usecase/ShowTodayScheduleUseCase';
import { ShowLogoutUseCase } from '../usecase/ShowLogoutUseCase';
import { InvalidRequestUseCase } from '../usecase/InvalidRequestUsecase';
import { SendAuthRequiredMessageUseCase } from '../usecase/SendAuthRequiredMessageUseCase';
import { CheckAuthenticationUseCase } from '../usecase/CheckAuthenticationUseCase';
import { ShowEventDetailUseCase } from '../usecase/ShowEventDetailUseCase';
import { DeleteEventUseCase } from '../usecase/DeleteEventUseCase';
import { StartEditEventUseCase } from '../usecase/StartEditEventUseCase';
import { UpdateEventFromVoiceUseCase } from '../usecase/UpdateEventFromVoiceUseCase';
import {
  getOAuth2ClientId,
  getOAuth2ClientSecret,
  getLineChannelAccessToken,
  getGeminiApiKey,
  getGcpProjectId
} from '../config/getProperty';
import { CustomLogger } from '../helper/CustomLogger';
import { LineMessaging } from '../infra/line/LineMessaging';
import { FlexMessageFactory } from '../infra/line/flexMessageFactory';
import { OAuth2Manager } from '../infra/google/OAuth2Manager';
import { UserCalendar } from '../infra/google/UserCalendar';
import { GoogleServiceAccountAuth } from '../infra/google/GoogleServiceAccountAuth';
import { SpeechToText } from '../infra/google/SpeechToText';
import { GeminiEventExtractor } from '../infra/google/GeminiEventExtractor';
import { MESSAGE } from '../constants/message';

/**
 * LINEからのWebhookイベントを処理するHandler
 */
export class LineWebHookHandler {
  /**
   * @param checkAuthenticationUseCase 認証チェックUseCase
   * @param createEventFromVoiceUseCase 音声からイベント作成UseCase
   * @param showHelpUseCase ヘルプ表示UseCase
   * @param showWeekScheduleUseCase 週間予定表示UseCase
   * @param showTodayScheduleUseCase 今日の予定表示UseCase
   * @param showLogoutUseCase ログアウトUseCase
   * @param invalidRequestUseCase 不正リクエスト処理UseCase
   * @param sendAuthRequiredMessageUseCase 認証要求メッセージ送信UseCase
   * @param showEventDetailUseCase イベント詳細表示UseCase
   * @param deleteEventUseCase イベント削除UseCase
   * @param startEditEventUseCase イベント編集開始UseCase
   * @param updateEventFromVoiceUseCase 音声からイベント更新UseCase
   */
  public constructor(
    private readonly checkAuthenticationUseCase: CheckAuthenticationUseCase,
    private readonly createEventFromVoiceUseCase: CreateEventFromVoiceUseCase,
    private readonly showHelpUseCase: ShowHelpUseCase,
    private readonly showWeekScheduleUseCase: ShowWeekScheduleUseCase,
    private readonly showTodayScheduleUseCase: ShowTodayScheduleUseCase,
    private readonly showLogoutUseCase: ShowLogoutUseCase,
    private readonly invalidRequestUseCase: InvalidRequestUseCase,
    private readonly sendAuthRequiredMessageUseCase: SendAuthRequiredMessageUseCase,
    private readonly showEventDetailUseCase: ShowEventDetailUseCase,
    private readonly deleteEventUseCase: DeleteEventUseCase,
    private readonly startEditEventUseCase: StartEditEventUseCase,
    private readonly updateEventFromVoiceUseCase: UpdateEventFromVoiceUseCase
  ) { }

  /**
   * LINEイベントを処理（index.tsから呼び出されるstaticメソッド）
   * @param lineEvent LINEイベント
   */
  public static processLineEvent(lineEvent: LineWebhookEvent): void {
    // 1. OAuth2認証情報を取得
    const oauth2ClientId = getOAuth2ClientId();
    const oauth2ClientSecret = getOAuth2ClientSecret();

    // 2. 共通Infraサービスインスタンスを生成
    const lineChannelAccessToken = getLineChannelAccessToken();
    const lineMessaging = new LineMessaging(lineChannelAccessToken);
    const flexMessageFactory = new FlexMessageFactory();

    // 3. Google関連サービスを生成
    const auth = new GoogleServiceAccountAuth();
    const geminiApiKey = getGeminiApiKey();
    const geminiEventExtractor = new GeminiEventExtractor(geminiApiKey);
    const gcpProjectId = getGcpProjectId();
    const speechToText = new SpeechToText(auth, gcpProjectId);

    // 4. ユーザーIDを取得（後で使用）
    const userId = lineEvent.source?.userId || '';

    // 5. OAuth2ManagerとUserCalendarを生成（userId必要）
    const oauth2Manager = new OAuth2Manager(userId, oauth2ClientId, oauth2ClientSecret);
    const userCalendar = new UserCalendar(userId, oauth2Manager);

    // 6. 全UseCaseインスタンスを生成
    const checkAuthenticationUseCase = new CheckAuthenticationUseCase(
      oauth2ClientId,
      oauth2ClientSecret
    );
    const createEventFromVoiceUseCase = new CreateEventFromVoiceUseCase(
      lineMessaging,
      speechToText,
      geminiEventExtractor,
      userCalendar,
      flexMessageFactory,
      oauth2ClientId,
      oauth2ClientSecret
    );
    const showHelpUseCase = new ShowHelpUseCase(
      lineMessaging,
      flexMessageFactory
    );
    const showWeekScheduleUseCase = new ShowWeekScheduleUseCase(
      userCalendar,
      lineMessaging,
      flexMessageFactory
    );
    const showTodayScheduleUseCase = new ShowTodayScheduleUseCase(
      userCalendar,
      lineMessaging,
      flexMessageFactory
    );
    const showLogoutUseCase = new ShowLogoutUseCase(
      oauth2ClientId,
      oauth2ClientSecret,
      lineMessaging
    );
    const invalidRequestUseCase = new InvalidRequestUseCase(
      lineMessaging
    );
    const sendAuthRequiredMessageUseCase = new SendAuthRequiredMessageUseCase(
      oauth2ClientId,
      oauth2ClientSecret,
      lineMessaging,
      flexMessageFactory
    );
    const showEventDetailUseCase = new ShowEventDetailUseCase(
      userCalendar,
      lineMessaging,
      flexMessageFactory
    );
    const deleteEventUseCase = new DeleteEventUseCase(
      userCalendar,
      lineMessaging,
      flexMessageFactory,
      oauth2ClientId,
      oauth2ClientSecret,
      userId
    );
    const startEditEventUseCase = new StartEditEventUseCase(
      userCalendar,
      lineMessaging,
      flexMessageFactory
    );
    const updateEventFromVoiceUseCase = new UpdateEventFromVoiceUseCase(
      lineMessaging,
      speechToText,
      geminiEventExtractor,
      userCalendar,
      flexMessageFactory,
      oauth2ClientId,
      oauth2ClientSecret
    );

    // 7. LineWebHookHandlerインスタンス作成
    const handler = new LineWebHookHandler(
      checkAuthenticationUseCase,
      createEventFromVoiceUseCase,
      showHelpUseCase,
      showWeekScheduleUseCase,
      showTodayScheduleUseCase,
      showLogoutUseCase,
      invalidRequestUseCase,
      sendAuthRequiredMessageUseCase,
      showEventDetailUseCase,
      deleteEventUseCase,
      startEditEventUseCase,
      updateEventFromVoiceUseCase
    );

    // 8. イベント処理実行
    handler.handleEvent(lineEvent);
  }

  /**
   * LINEイベントを処理
   * @param lineEvent LINEイベント
   */
  private handleEvent(lineEvent: LineWebhookEvent): void {
    const replyToken = lineEvent.replyToken;
    const userId = this.extractUserId(lineEvent);

    // userIdが取得できない場合はエラー
    if (!userId) {
      CustomLogger.logError('handleEvent', 'userIdを取得できませんでした');
      this.invalidRequestUseCase.execute(replyToken);
      return;
    }

    // followイベントの処理（LINE Console側でwelcomeメッセージ設定済みのため、何もせず終了）
    if (this.isFollowEvent(lineEvent)) {
      CustomLogger.logDebug('handleEvent', 'followイベントを受信しました');
      return;
    }

    // 認証状態をチェック
    if (!this.checkAuthenticationUseCase.execute(userId)) {
      // 未認証の場合は認証URLを送信
      this.sendAuthRequiredMessageUseCase.execute(replyToken, userId);
      return;
    }

    // 認証済みの場合は通常処理
    if (this.isAudioMessage(lineEvent)) {
      // 編集モード中かチェック
      const userProperties = PropertiesService.getUserProperties();
      const editModeData = userProperties.getProperty(`edit_mode_${userId}`);

      if (editModeData) {
        // 編集モード中
        const editMode = JSON.parse(editModeData);

        // タイムアウトチェック（5分）
        if (Date.now() - editMode.timestamp < 5 * 60 * 1000) {
          // 編集モード状態をクリア
          userProperties.deleteProperty(`edit_mode_${userId}`);

          // イベント更新処理
          this.updateEventFromVoiceUseCase.execute(
            replyToken,
            lineEvent.message.id,
            userId,
            editMode.eventId
          );
          return;
        } else {
          // タイムアウト
          userProperties.deleteProperty(`edit_mode_${userId}`);
          this.invalidRequestUseCase.execute(replyToken, MESSAGE.EDIT_MODE_TIMEOUT);
          return;
        }
      }

      // 通常の新規作成
      this.createEventFromVoiceUseCase.execute(replyToken, lineEvent.message.id, userId);
    } else if (this.isTextMessage(lineEvent)) {
      this.processTextMessage(replyToken, lineEvent.message.text, userId);
    } else if (this.isPostbackEvent(lineEvent)) {
      this.processPostbackEvent(replyToken, lineEvent.postback.data, userId);
    } else {
      this.invalidRequestUseCase.execute(replyToken);
    }
  }

  /**
   * LINEイベントからuserIdを抽出
   * @param lineEvent LINEイベント
   * @returns userId または undefined
   */
  private extractUserId(lineEvent: LineWebhookEvent): string | undefined {
    return lineEvent.source?.userId;
  }

  /**
   * テキストメッセージを処理
   * @param replyToken リプライトークン
   * @param messageText メッセージテキスト
   * @param userId LINEユーザーID
   */
  private processTextMessage(replyToken: string, messageText: string, userId: string): void {
    const normalizedText = messageText.trim();

    if (this.isHelpCommand(normalizedText)) {
      this.showHelpUseCase.execute(replyToken);
    } else if (this.isWeekCommand(normalizedText)) {
      this.showWeekScheduleUseCase.execute(replyToken);
    } else if (this.isTodayCommand(normalizedText)) {
      this.showTodayScheduleUseCase.execute(replyToken);
    } else if (this.isLogoutCommand(normalizedText)) {
      this.showLogoutUseCase.execute(replyToken, userId);
    } else {
      this.invalidRequestUseCase.execute(replyToken);
    }
  }

  /**
   * Postbackイベントを処理
   * @param replyToken リプライトークン
   * @param postbackData Postbackデータ
   * @param userId LINEユーザーID
   */
  private processPostbackEvent(replyToken: string, postbackData: string, userId: string): void {
    // postbackDataをパース（例: "action=show_detail&eventId=abc123"）
    const params = this.parseQueryString(postbackData);
    const action = params['action'];
    const eventId = params['eventId'];

    switch (action) {
      case 'show_detail':
        if (eventId) {
          this.showEventDetailUseCase.execute(replyToken, eventId);
        } else {
          this.invalidRequestUseCase.execute(replyToken);
        }
        break;
      case 'start_edit':
        if (eventId) {
          this.startEditEventUseCase.execute(replyToken, eventId, userId);
        } else {
          this.invalidRequestUseCase.execute(replyToken);
        }
        break;
      case 'delete':
        if (eventId) {
          this.deleteEventUseCase.execute(replyToken, eventId);
        } else {
          this.invalidRequestUseCase.execute(replyToken);
        }
        break;
      case 'logout':
        this.showLogoutUseCase.execute(replyToken, userId);
        break;
      case 'today':
        this.showTodayScheduleUseCase.execute(replyToken);
        break;
      case 'week':
        this.showWeekScheduleUseCase.execute(replyToken);
        break;
      case 'help':
        this.showHelpUseCase.execute(replyToken);
        break;
      default:
        this.invalidRequestUseCase.execute(replyToken);
    }
  }

  /**
   * クエリ文字列をパースしてオブジェクトに変換
   * @param queryString クエリ文字列（例: "action=show_detail&eventId=abc123"）
   * @returns パース結果のオブジェクト
   */
  private parseQueryString(queryString: string): Record<string, string> {
    const params: Record<string, string> = {};

    if (!queryString) {
      return params;
    }

    // "&" で分割
    const pairs = queryString.split('&');

    for (const pair of pairs) {
      // "=" で分割
      const [key, value] = pair.split('=');
      if (key) {
        // URLデコード
        params[decodeURIComponent(key)] = value ? decodeURIComponent(value) : '';
      }
    }

    return params;
  }

  /**
   * 音声メッセージかチェック
   * @param lineEvent LINEイベント
   * @returns 音声メッセージの場合true
   */
  private isAudioMessage(lineEvent): boolean {
    return lineEvent.type === 'message' && lineEvent.message.type === 'audio';
  }

  /**
   * テキストメッセージかチェック
   * @param lineEvent LINEイベント
   * @returns テキストメッセージの場合true
   */
  private isTextMessage(lineEvent): boolean {
    return lineEvent.type === 'message' && lineEvent.message.type === 'text';
  }

  /**
   * 今日の予定コマンドかチェック
   * @param text テキスト
   * @returns 今日の予定コマンドの場合true
   */
  private isTodayCommand(text): boolean {
    return CONFIG.COMMANDS.TODAY.some(command => text.includes(command));
  }

  /**
   * 週間予定コマンドかチェック
   * @param text テキスト
   * @returns 週間予定コマンドの場合true
   */
  private isWeekCommand(text): boolean {
    return CONFIG.COMMANDS.WEEK.some(command => text.includes(command));
  }

  /**
   * ヘルプコマンドかチェック
   * @param text テキスト
   * @returns ヘルプコマンドの場合true
   */
  private isHelpCommand(text): boolean {
    return CONFIG.COMMANDS.HELP.some(command => text.includes(command));
  }

  /**
   * ログアウトコマンドかチェック
   * @param text テキスト
   * @returns ログアウトコマンドの場合true
   */
  private isLogoutCommand(text): boolean {
    return CONFIG.COMMANDS.LOGOUT.some(command => text.includes(command));
  }

  /**
   * Postbackイベントかチェック
   * @param lineEvent LINEイベント
   * @returns Postbackイベントの場合true
   */
  private isPostbackEvent(lineEvent): boolean {
    return lineEvent.type === 'postback' && lineEvent.postback;
  }

  /**
   * Followイベントかチェック
   * @param lineEvent LINEイベント
   * @returns Followイベントの場合true
   */
  private isFollowEvent(lineEvent): boolean {
    return lineEvent.type === 'follow';
  }
}
