import { CustomLogger } from '../../helper/CustomLogger';

/**
 * デフォルトカレンダー
 * CalendarApp.getDefaultCalendar()を使用したカレンダー操作を担当
 * 
 * 注意: このクラスは現在未使用です（UserCalendarに置き換えられています）
 * 将来的に削除される可能性があります
 */
export class DefaultCalendar {
  /**
   * Googleカレンダーにイベントを作成
   * @param eventData イベントデータ {title, startTime, endTime, description}
   * @returns イベントID
   */
  public createEvent(eventData: any): string | null {
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
  }

  /**
   * GoogleカレンダーイベントのURLを構築
   * @param eventId イベントID
   * @returns イベントURL
   */
  public buildEventUrl(eventId: string): string {
    const cleanEventId = eventId.replace('@google.com', '');
    return `https://www.google.com/calendar/event?eid=${this.encodeEventIdForUrl(cleanEventId)}`;
  }

  /**
   * 今日の予定を取得
   * @returns イベントリスト
   */
  public getTodayEvents(): any[] {
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
  }

  /**
   * 今週の予定を取得（7日間）
   * @returns 日付ごとのイベント辞書
   */
  public getWeekEvents(): any {
    const calendar = CalendarApp.getDefaultCalendar();
    const today = new Date();

    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
    const endOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7, 23, 59, 59);

    const events = calendar.getEvents(startOfToday, endOfWeek);

    const eventsByDate: any = {};

    for (let i = 0; i < 7; i++) {
      const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
      const dateKey = this.formatDateKey(date);
      eventsByDate[dateKey] = {
        date: date,
        events: [],
      };
    }

    events.forEach(event => {
      const eventDate = event.getStartTime();
      const dateKey = this.formatDateKey(new Date(eventDate.getTime()));

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
  }

  /**
   * イベントIDをURL用にエンコード
   * @param eventId イベントID
   * @returns エンコード済みイベントID
   */
  private encodeEventIdForUrl(eventId: string): string {
    const calendarId = CalendarApp.getDefaultCalendar().getId();
    const combined = `${eventId} ${calendarId}`;
    return Utilities.base64Encode(combined).replace(/=+$/, '');
  }

  /**
   * 日付をキー用にフォーマット
   * @param date 日付
   * @returns フォーマット済み日付キー
   */
  private formatDateKey(date: Date): string {
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  }
}
