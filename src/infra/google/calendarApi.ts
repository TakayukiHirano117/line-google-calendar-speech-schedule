import { CustomLogger } from '../../helper/CustomLogger';

/**
 * Googleカレンダーにイベントを作成
 * @param {Object} eventData - イベントデータ {title, startTime, endTime, description}
 * @returns {string|null} イベントID
 */
export const createGoogleCalendarEvent = (eventData) => {
  try {
    const calendar = CalendarApp.getDefaultCalendar();
    const startTime = new Date(eventData.startTime);
    const endTime = new Date(eventData.endTime);

    const eventOptions = {
      description: eventData.description || '',
    };

    const createdEvent = calendar.createEvent(eventData.title, startTime, endTime, eventOptions);
    const eventId = createdEvent.getId();

    CustomLogger.logDebug('カレンダーイベント作成成功', eventData.title);
    CustomLogger.logDebug('イベントID', eventId);

    return eventId;
  } catch (error) {
    CustomLogger.logError('カレンダーイベント作成', error);
    return null;
  }
};

/**
 * GoogleカレンダーイベントのURLを構築
 * @param {string} eventId - イベントID
 * @returns {string}
 */
export const buildGoogleCalendarEventUrl = (eventId) => {
  const cleanEventId = eventId.replace('@google.com', '');
  return `https://www.google.com/calendar/event?eid=${encodeEventIdForUrl(cleanEventId)}`;
};

/**
 * イベントIDをURL用にエンコード
 * @param {string} eventId - イベントID
 * @returns {string}
 */
export const encodeEventIdForUrl = (eventId) => {
  const calendarId = CalendarApp.getDefaultCalendar().getId();
  const combined = `${eventId} ${calendarId}`;
  return Utilities.base64Encode(combined).replace(/=+$/, '');
};

/**
 * 今日の予定を取得
 * @returns {Array} イベントリスト
 */
export const getTodayEvents = () => {
  const calendar = CalendarApp.getDefaultCalendar();
  const today = new Date();

  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

  const events = calendar.getEvents(startOfDay, endOfDay);

  return events.map(event => ({
    title: event.getTitle(),
    startTime: event.getStartTime(),
    endTime: event.getEndTime(),
    isAllDay: event.isAllDayEvent(),
  }));
};

/**
 * 今週の予定を取得（7日間）
 * @returns {Object} 日付ごとのイベント辞書
 */
export const getWeekEvents = () => {
  const calendar = CalendarApp.getDefaultCalendar();
  const today = new Date();

  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
  const endOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7, 23, 59, 59);

  const events = calendar.getEvents(startOfToday, endOfWeek);

  const eventsByDate = {};

  for (let i = 0; i < 7; i++) {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
    const dateKey = formatDateKey(date);
    eventsByDate[dateKey] = {
      date: date,
      events: [],
    };
  }

  events.forEach(event => {
    const eventDate = event.getStartTime();
    const dateKey = formatDateKey(eventDate);

    if (eventsByDate[dateKey]) {
      eventsByDate[dateKey].events.push({
        title: event.getTitle(),
        startTime: event.getStartTime(),
        endTime: event.getEndTime(),
        isAllDay: event.isAllDayEvent(),
      });
    }
  });

  return eventsByDate;
};

/**
 * 日付をキー用にフォーマット
 * @param {Date} date - 日付
 * @returns {string}
 */
export const formatDateKey = (date) => {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
};