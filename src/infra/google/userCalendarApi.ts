import { CONFIG } from '../../config/index';
import { getAccessToken, revokeToken } from './oauth2Service';
import { logDebug, logError } from '../../handler/lineWebhookHandler';

const CALENDAR_API_BASE = CONFIG.CALENDAR_API.BASE_URL;

/**
 * ユーザーのカレンダーにイベントを作成
 * @param userId LINEユーザーID
 * @param eventData イベントデータ
 * @returns 作成結果
 */
export const createUserCalendarEvent = (
  userId: string,
  eventData: CalendarEventData
): CreateEventResult => {
  const accessToken = getAccessToken(userId);
  if (!accessToken) {
    logError('カレンダーイベント作成', 'アクセストークンがありません');
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
        logDebug('カレンダーイベント作成成功', result.id);
        return { success: true, eventId: result.id };
      }
      case 401:
        revokeToken(userId);
        return { success: false, error: 'TOKEN_EXPIRED', requiresReauth: true };
      case 403:
        return { success: false, error: 'ACCESS_DENIED', requiresReauth: true };
      case 429:
        return { success: false, error: 'RATE_LIMITED', requiresReauth: false };
      default:
        logError('カレンダーイベント作成', response.getContentText());
        return { success: false, error: 'API_ERROR', requiresReauth: false };
    }
  } catch (error) {
    logError('カレンダーイベント作成', error);
    return { success: false, error: String(error), requiresReauth: false };
  }
};

/**
 * ユーザーの今日の予定を取得
 * @param userId LINEユーザーID
 * @returns イベントリスト
 */
export const getUserTodayEvents = (userId: string): CalendarEvent[] => {
  const accessToken = getAccessToken(userId);
  if (!accessToken) {
    logError('今日の予定取得', 'アクセストークンがありません');
    return [];
  }

  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

  return fetchUserEvents(accessToken, startOfDay, endOfDay);
};

/**
 * ユーザーの週間予定を取得（7日間）
 * @param userId LINEユーザーID
 * @returns 日付ごとのイベント辞書
 */
export const getUserWeekEvents = (userId: string): EventsByDate => {
  const accessToken = getAccessToken(userId);
  if (!accessToken) {
    logError('週間予定取得', 'アクセストークンがありません');
    return {};
  }

  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
  const endOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7, 23, 59, 59);

  const events = fetchUserEvents(accessToken, startOfToday, endOfWeek);

  // 日付ごとに整理
  const eventsByDate: EventsByDate = {};
  for (let i = 0; i < 7; i++) {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
    const dateKey = formatDateKey(date);
    eventsByDate[dateKey] = { date, events: [] };
  }

  events.forEach(event => {
    const eventDate = new Date(event.startTime);
    const dateKey = formatDateKey(eventDate);
    if (eventsByDate[dateKey]) {
      eventsByDate[dateKey].events.push(event);
    }
  });

  return eventsByDate;
};

/**
 * Calendar APIからイベントを取得
 * @param accessToken アクセストークン
 * @param timeMin 開始日時
 * @param timeMax 終了日時
 * @returns イベントリスト
 */
const fetchUserEvents = (
  accessToken: string,
  timeMin: Date,
  timeMax: Date
): CalendarEvent[] => {
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
      logError('イベント取得', response.getContentText());
      return [];
    }

    const result = JSON.parse(response.getContentText());
    return (result.items || []).map((item: any) => ({
      id: item.id,
      title: item.summary || '(タイトルなし)',
      startTime: new Date(item.start.dateTime || item.start.date),
      endTime: new Date(item.end.dateTime || item.end.date),
      isAllDay: !item.start.dateTime,
    }));
  } catch (error) {
    logError('イベント取得', error);
    return [];
  }
};

/**
 * GoogleカレンダーイベントのURLを構築（ユーザー用）
 * @param eventId イベントID
 * @returns カレンダーイベントURL
 */
export const buildUserCalendarEventUrl = (eventId: string): string => {
  // primary カレンダーの場合、ユーザーのメールアドレスがカレンダーIDになる
  // しかしOAuth2ではメールアドレスを取得していないため、
  // イベントIDのみでURLを構築する（Googleカレンダーが自動的に解決）
  const cleanEventId = eventId.replace('@google.com', '');
  // シンプルなイベントリンク形式を使用
  return `https://www.google.com/calendar/event?eid=${encodeEventId(cleanEventId)}`;
};

/**
 * イベントIDをURL用にエンコード
 * @param eventId イベントID
 * @returns エンコード済みイベントID
 */
const encodeEventId = (eventId: string): string => {
  // カレンダーIDがない場合は、イベントIDのみでBase64エンコード
  // Googleカレンダーはこの形式でもイベントを解決できる
  return Utilities.base64Encode(eventId).replace(/=+$/, '');
};

/**
 * 日付をキー用にフォーマット
 * @param date 日付
 * @returns フォーマット済み日付キー
 */
export const formatDateKey = (date: Date): string => {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
};
