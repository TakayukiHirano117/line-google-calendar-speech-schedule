import { CONFIG } from '../../config/index';
import { OAuth2Manager } from './OAuth2Manager';
import { CustomLogger } from '../../helper/CustomLogger';

const CALENDAR_API_BASE = CONFIG.CALENDAR_API.BASE_URL;

/**
 * ユーザーカレンダー
 * OAuth2を使用したユーザー個別のGoogleカレンダー操作を担当
 */
export class UserCalendar {
  /**
   * @param userId LINEユーザーID
   * @param oauth2Manager OAuth2認証マネージャー
   */
  constructor(
    private readonly userId: string,
    private readonly oauth2Manager: OAuth2Manager
  ) { }

  /**
   * ユーザーのカレンダーにイベントを作成
   * @param eventData イベントデータ
   * @returns 作成結果
   */
  public createEvent(eventData: CalendarEventData): CreateEventResult {
    const accessToken = this.oauth2Manager.getAccessToken();
    if (!accessToken) {
      CustomLogger.logError('カレンダーイベント作成', 'アクセストークンがありません');
      return { success: false, error: 'NO_TOKEN', requiresReauth: true };
    }

    const endpoint = `${CALENDAR_API_BASE}/calendars/primary/events`;

    const calendarEvent = {
      summary: eventData.title,
      description: eventData.description || '',
      start: {
        dateTime: eventData.startTime,
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: eventData.endTime,
        timeZone: 'Asia/Tokyo',
      },
    };

    const options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
      method: 'post',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      payload: JSON.stringify(calendarEvent),
      muteHttpExceptions: true,
    };

    try {
      const response = UrlFetchApp.fetch(endpoint, options);
      const responseCode = response.getResponseCode();

      switch (responseCode) {
        case 200:
        case 201: {
          const result = JSON.parse(response.getContentText());
          CustomLogger.logDebug('カレンダーイベント作成成功', result.id);
          return { success: true, eventId: result.id };
        }
        case 401:
          this.oauth2Manager.revokeToken();
          return { success: false, error: 'TOKEN_EXPIRED', requiresReauth: true };
        case 403:
          return { success: false, error: 'ACCESS_DENIED', requiresReauth: true };
        case 429:
          return { success: false, error: 'RATE_LIMITED', requiresReauth: false };
        default:
          CustomLogger.logError('カレンダーイベント作成', response.getContentText());
          return { success: false, error: 'API_ERROR', requiresReauth: false };
      }
    } catch (error) {
      CustomLogger.logError('カレンダーイベント作成', error);
      return { success: false, error: String(error), requiresReauth: false };
    }
  }

  /**
   * ユーザーの今日の予定を取得
   * @returns イベントリスト
   */
  public getTodayEvents(): CalendarEvent[] {
    const accessToken = this.oauth2Manager.getAccessToken();
    if (!accessToken) {
      CustomLogger.logError('今日の予定取得', 'アクセストークンがありません');
      return [];
    }

    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    return this.fetchEvents(accessToken, startOfDay, endOfDay);
  }

  /**
   * ユーザーの週間予定を取得（7日間）
   * @returns 日付ごとのイベント辞書
   */
  public getWeekEvents(): EventsByDate {
    const accessToken = this.oauth2Manager.getAccessToken();
    if (!accessToken) {
      CustomLogger.logError('週間予定取得', 'アクセストークンがありません');
      return {};
    }

    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
    const endOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7, 23, 59, 59);

    const events = this.fetchEvents(accessToken, startOfToday, endOfWeek);

    // 日付ごとに整理
    const eventsByDate: EventsByDate = {};
    for (let i = 0; i < 7; i++) {
      const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
      const dateKey = this.formatDateKey(date);
      eventsByDate[dateKey] = { date, events: [] };
    }

    events.forEach(event => {
      const eventDate = new Date(event.startTime);
      const dateKey = this.formatDateKey(eventDate);
      if (eventsByDate[dateKey]) {
        eventsByDate[dateKey].events.push(event);
      }
    });

    return eventsByDate;
  }

  /**
   * GoogleカレンダーイベントのURLを構築（ユーザー用）
   * @param eventId イベントID
   * @returns カレンダーイベントURL
   */
  public buildEventUrl(eventId: string): string {
    // イベントIDから不要な部分を除去
    // Google Calendar APIが返すIDの形式: "eventId_ランダム文字列" または "eventId"
    const cleanEventId = eventId.split('_')[0];

    // eidパラメータを生成
    // eidの形式: Base64Encode("cleanEventId primary@group.calendar.google.com")
    // primaryカレンダーの場合は "primary" でもOK
    const eidString = `${cleanEventId} primary`;
    const eid = Utilities.base64Encode(eidString)
      .replace(/\+/g, '-')   // URL safe: + -> -
      .replace(/\//g, '_')   // URL safe: / -> _
      .replace(/=+$/, '');   // paddingを除去

    // 閲覧用のイベントURL（編集ではなく閲覧）
    return `https://www.google.com/calendar/event?eid=${eid}`;
  }

  /**
   * 今日のGoogleカレンダーURLを構築
   * @returns カレンダーURL
   */
  public buildTodayCalendarUrl(): string {
    return 'https://calendar.google.com/calendar/r/day';
  }

  /**
   * 週間ビューのGoogleカレンダーURLを構築
   * @returns カレンダーURL
   */
  public buildWeekCalendarUrl(): string {
    return 'https://calendar.google.com/calendar/r/week';
  }

  /**
   * Calendar APIからイベントを取得
   * @param accessToken アクセストークン
   * @param timeMin 開始日時
   * @param timeMax 終了日時
   * @returns イベントリスト
   */
  private fetchEvents(
    accessToken: string,
    timeMin: Date,
    timeMax: Date
  ): CalendarEvent[] {
    const endpoint = `${CALENDAR_API_BASE}/calendars/primary/events`;
    const params = [
      `timeMin=${encodeURIComponent(timeMin.toISOString())}`,
      `timeMax=${encodeURIComponent(timeMax.toISOString())}`,
      'singleEvents=true',
      'orderBy=startTime',
    ].join('&');

    const options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
      method: 'get',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      muteHttpExceptions: true,
    };

    try {
      const response = UrlFetchApp.fetch(`${endpoint}?${params}`, options);
      const responseCode = response.getResponseCode();

      if (responseCode !== 200) {
        CustomLogger.logError('イベント取得', response.getContentText());
        return [];
      }

      const result = JSON.parse(response.getContentText());
      return (result.items || []).map((item: any) => ({
        id: item.id,
        title: item.summary || '(タイトルなし)',
        startTime: new Date(item.start.dateTime || item.start.date),
        endTime: new Date(item.end.dateTime || item.end.date),
        isAllDay: !item.start.dateTime,
        description: item.description || '',
      }));
    } catch (error) {
      CustomLogger.logError('イベント取得', error);
      return [];
    }
  }

  /**
   * 日付をキー用にフォーマット
   * @param date 日付
   * @returns フォーマット済み日付キー
   */
  private formatDateKey(date: Date): string {
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  }

  /**
   * 特定のイベント詳細を取得
   * @param eventId イベントID
   * @returns イベント詳細 または null
   */
  public getEventById(eventId: string): CalendarEvent | null {
    const accessToken = this.oauth2Manager.getAccessToken();
    if (!accessToken) {
      CustomLogger.logError('イベント詳細取得', 'アクセストークンがありません');
      return null;
    }

    const endpoint = `${CALENDAR_API_BASE}/calendars/primary/events/${eventId}`;
    const options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
      method: 'get',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      muteHttpExceptions: true,
    };

    try {
      const response = UrlFetchApp.fetch(endpoint, options);
      const responseCode = response.getResponseCode();

      if (responseCode !== 200) {
        CustomLogger.logError('イベント詳細取得', response.getContentText());
        return null;
      }

      const item = JSON.parse(response.getContentText());
      return {
        id: item.id,
        title: item.summary || '(タイトルなし)',
        startTime: new Date(item.start.dateTime || item.start.date),
        endTime: new Date(item.end.dateTime || item.end.date),
        isAllDay: !item.start.dateTime,
        description: item.description || '',
      };
    } catch (error) {
      CustomLogger.logError('イベント詳細取得', error);
      return null;
    }
  }

  /**
   * イベントを更新
   * @param eventId イベントID
   * @param eventData 更新するイベントデータ
   * @returns 更新結果
   */
  public updateEvent(eventId: string, eventData: CalendarEventData): UpdateEventResult {
    const accessToken = this.oauth2Manager.getAccessToken();
    if (!accessToken) {
      CustomLogger.logError('イベント更新', 'アクセストークンがありません');
      return { success: false, error: 'NO_TOKEN', requiresReauth: true };
    }

    const endpoint = `${CALENDAR_API_BASE}/calendars/primary/events/${eventId}`;
    const calendarEvent = {
      summary: eventData.title,
      description: eventData.description || '',
      start: {
        dateTime: eventData.startTime,
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: eventData.endTime,
        timeZone: 'Asia/Tokyo',
      },
    };

    const options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
      method: 'put',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      payload: JSON.stringify(calendarEvent),
      muteHttpExceptions: true,
    };

    try {
      const response = UrlFetchApp.fetch(endpoint, options);
      const responseCode = response.getResponseCode();

      switch (responseCode) {
        case 200:
          CustomLogger.logDebug('イベント更新成功', eventId);
          return { success: true, eventId };
        case 401:
          this.oauth2Manager.revokeToken();
          return { success: false, error: 'TOKEN_EXPIRED', requiresReauth: true };
        case 403:
          return { success: false, error: 'ACCESS_DENIED', requiresReauth: true };
        case 429:
          return { success: false, error: 'RATE_LIMITED', requiresReauth: false };
        default:
          CustomLogger.logError('イベント更新', response.getContentText());
          return { success: false, error: 'API_ERROR', requiresReauth: false };
      }
    } catch (error) {
      CustomLogger.logError('イベント更新', error);
      return { success: false, error: String(error), requiresReauth: false };
    }
  }

  /**
   * イベントを削除
   * @param eventId イベントID
   * @returns 削除結果
   */
  public deleteEvent(eventId: string): DeleteEventResult {
    const accessToken = this.oauth2Manager.getAccessToken();
    if (!accessToken) {
      CustomLogger.logError('イベント削除', 'アクセストークンがありません');
      return { success: false, error: 'NO_TOKEN', requiresReauth: true };
    }

    const endpoint = `${CALENDAR_API_BASE}/calendars/primary/events/${eventId}`;
    const options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
      method: 'delete',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      muteHttpExceptions: true,
    };

    try {
      const response = UrlFetchApp.fetch(endpoint, options);
      const responseCode = response.getResponseCode();

      switch (responseCode) {
        case 204: // 削除成功
          CustomLogger.logDebug('イベント削除成功', eventId);
          return { success: true };
        case 401:
          this.oauth2Manager.revokeToken();
          return { success: false, error: 'TOKEN_EXPIRED', requiresReauth: true };
        case 403:
          return { success: false, error: 'ACCESS_DENIED', requiresReauth: true };
        case 410: // すでに削除済み
          CustomLogger.logDebug('イベントは既に削除済み', eventId);
          return { success: true }; // 削除済みも成功扱い
        default:
          CustomLogger.logError('イベント削除', response.getContentText());
          return { success: false, error: 'API_ERROR', requiresReauth: false };
      }
    } catch (error) {
      CustomLogger.logError('イベント削除', error);
      return { success: false, error: String(error), requiresReauth: false };
    }
  }
}
