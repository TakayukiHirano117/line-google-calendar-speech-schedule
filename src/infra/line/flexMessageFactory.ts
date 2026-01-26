import { CONFIG } from '../../config/index';
import { MESSAGE } from '../../constants/message';

/**
 * LINE Flexメッセージファクトリー
 * Flexメッセージの構築を担当
 */
export class FlexMessageFactory {
  /**
   * イベント作成完了のFlexメッセージを構築
   * @param eventData イベントデータ
   * @param eventUrl イベントURL
   * @returns Flexメッセージ
   */
  public buildEventCreatedMessage(eventData: any, eventUrl: string): object {
    const startDate = new Date(eventData.startTime);
    const endDate = new Date(eventData.endTime);
    const dateText = this.formatDateForFlex(startDate);
    const timeText = `${this.formatTimeForFlex(startDate)} 〜 ${this.formatTimeForFlex(endDate)}`;

    return {
      altText: `✅ イベントを作成しました: ${eventData.title}`,
      contents: {
        type: 'bubble',
        size: 'kilo',
        header: {
          type: 'box',
          layout: 'horizontal',
          contents: [
            {
              type: 'text',
              text: '✅',
              size: 'lg',
              flex: 0,
            },
            {
              type: 'text',
              text: 'イベントを作成しました',
              size: 'md',
              weight: 'bold',
              color: CONFIG.COLORS.TEXT_PRIMARY,
              margin: 'sm',
              flex: 1,
            },
          ],
          backgroundColor: '#F0FFF0',
          paddingAll: 'lg',
        },
        body: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: eventData.title,
              size: 'lg',
              weight: 'bold',
              color: CONFIG.COLORS.TEXT_PRIMARY,
              wrap: true,
            },
            {
              type: 'separator',
              margin: 'lg',
            },
            {
              type: 'box',
              layout: 'horizontal',
              contents: [
                {
                  type: 'text',
                  text: '📅',
                  size: 'sm',
                  flex: 0,
                },
                {
                  type: 'text',
                  text: dateText,
                  size: 'sm',
                  color: CONFIG.COLORS.TEXT_SECONDARY,
                  margin: 'sm',
                  flex: 1,
                },
              ],
              margin: 'lg',
            },
            {
              type: 'box',
              layout: 'horizontal',
              contents: [
                {
                  type: 'text',
                  text: '🕒',
                  size: 'sm',
                  flex: 0,
                },
                {
                  type: 'text',
                  text: timeText,
                  size: 'sm',
                  color: CONFIG.COLORS.TEXT_SECONDARY,
                  margin: 'sm',
                  flex: 1,
                },
              ],
              margin: 'sm',
            },
          ],
          paddingAll: 'lg',
        },
        footer: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'button',
              action: {
                type: 'uri',
                label: 'カレンダーで見る',
                uri: eventUrl + (eventUrl.includes('?') ? '&' : '?') + 'openExternalBrowser=1',
              },
              style: 'primary',
              color: CONFIG.COLORS.PRIMARY,
            },
          ],
          paddingAll: 'lg',
        },
      },
    };
  }

  /**
   * 今日の予定のFlexメッセージを構築
   * @param events イベントリスト
   * @returns Flexメッセージ
   */
  public buildTodayEventsMessage(events: any[]): object {
    const today = new Date();
    const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
    const dateText = `${today.getMonth() + 1}/${today.getDate()}（${dayNames[today.getDay()]}）`;

    if (events.length === 0) {
      return this.buildNoEventsMessage('今日の予定', dateText, MESSAGE.NO_EVENTS_TODAY);
    }

    events.sort((a, b) => a.startTime - b.startTime);

    const eventContents = events.map(event => this.buildEventRowContent(event));

    return {
      altText: `📅 今日の予定（${events.length}件）`,
      contents: {
        type: 'bubble',
        size: 'mega',
        header: {
          type: 'box',
          layout: 'horizontal',
          contents: [
            {
              type: 'text',
              text: '📅',
              size: 'xl',
              flex: 0,
            },
            {
              type: 'box',
              layout: 'vertical',
              contents: [
                {
                  type: 'text',
                  text: '今日の予定',
                  size: 'lg',
                  weight: 'bold',
                  color: '#FFFFFF',
                },
                {
                  type: 'text',
                  text: dateText,
                  size: 'sm',
                  color: '#FFFFFFBB',
                },
              ],
              margin: 'md',
              flex: 1,
            },
          ],
          backgroundColor: CONFIG.COLORS.PRIMARY,
          paddingAll: 'lg',
        },
        body: {
          type: 'box',
          layout: 'vertical',
          contents: eventContents,
          paddingAll: 'lg',
          spacing: 'md',
        },
        footer: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'button',
              action: {
                type: 'uri',
                label: 'カレンダーで確認',
                uri: this.buildTodayCalendarUrl() + '?openExternalBrowser=1',
              },
              style: 'link',
              height: 'sm',
            },
            {
              type: 'text',
              text: `${events.length}件の予定`,
              size: 'sm',
              color: CONFIG.COLORS.TEXT_SECONDARY,
              align: 'center',
              margin: 'sm',
            },
          ],
          paddingAll: 'md',
        },
      },
    };
  }

  /**
   * 週間予定のFlexメッセージを構築
   * @param eventsByDate 日付ごとのイベント辞書
   * @returns Flexメッセージ
   */
  public buildWeekEventsMessage(eventsByDate: any): object {
    const dateKeys = Object.keys(eventsByDate);

    let totalEvents = 0;
    dateKeys.forEach(key => {
      totalEvents += eventsByDate[key].events.length;
    });

    if (totalEvents === 0) {
      return this.buildNoEventsMessage('今週の予定', '直近7日間', MESSAGE.NO_EVENTS_WEEK);
    }

    const dayContents = dateKeys.map(dateKey => {
      const dayData = eventsByDate[dateKey];
      const date = dayData.date;
      const events = dayData.events;
      const isToday = this.isSameDay(date, new Date());

      return this.buildDayRowContent(date, events, isToday);
    });

    return {
      altText: `📅 今週の予定（${totalEvents}件）`,
      contents: {
        type: 'bubble',
        size: 'mega',
        header: {
          type: 'box',
          layout: 'horizontal',
          contents: [
            {
              type: 'text',
              text: '📅',
              size: 'xl',
              flex: 0,
            },
            {
              type: 'box',
              layout: 'vertical',
              contents: [
                {
                  type: 'text',
                  text: '今週の予定',
                  size: 'lg',
                  weight: 'bold',
                  color: '#FFFFFF',
                },
                {
                  type: 'text',
                  text: '直近7日間',
                  size: 'sm',
                  color: '#FFFFFFBB',
                },
              ],
              margin: 'md',
              flex: 1,
            },
          ],
          backgroundColor: CONFIG.COLORS.ACCENT,
          paddingAll: 'lg',
        },
        body: {
          type: 'box',
          layout: 'vertical',
          contents: dayContents,
          paddingAll: 'lg',
          spacing: 'sm',
        },
        footer: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'button',
              action: {
                type: 'uri',
                label: 'カレンダーで確認',
                uri: this.buildWeekCalendarUrl() + '?openExternalBrowser=1',
              },
              style: 'link',
              height: 'sm',
            },
            {
              type: 'text',
              text: `合計 ${totalEvents}件の予定`,
              size: 'sm',
              color: CONFIG.COLORS.TEXT_SECONDARY,
              align: 'center',
              margin: 'sm',
            },
          ],
          paddingAll: 'md',
        },
      },
    };
  }

  /**
   * 認証が必要な場合のFlexメッセージを構築
   * @param authUrl 認証URL
   * @returns Flexメッセージ
   */
  public buildAuthRequiredMessage(authUrl: string): object {
    return {
      altText: 'Googleカレンダーとの連携が必要です',
      contents: {
        type: 'bubble',
        size: 'kilo',
        body: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: '🔐',
              size: '3xl',
              align: 'center',
            },
            {
              type: 'text',
              text: 'カレンダー連携',
              size: 'lg',
              weight: 'bold',
              align: 'center',
              margin: 'lg',
              color: CONFIG.COLORS.TEXT_PRIMARY,
            },
            {
              type: 'text',
              text: 'Googleカレンダーとの連携が必要です。\n下のボタンをタップして認証してください。',
              size: 'sm',
              color: CONFIG.COLORS.TEXT_SECONDARY,
              wrap: true,
              align: 'center',
              margin: 'lg',
            },
          ],
          paddingAll: 'xl',
        },
        footer: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'button',
              action: {
                type: 'uri',
                label: 'Googleアカウントで連携',
                uri: authUrl + (authUrl.includes('?') ? '&' : '?') + 'openExternalBrowser=1',
              },
              style: 'primary',
              color: CONFIG.COLORS.GOOGLE_BLUE,
            },
          ],
          paddingAll: 'lg',
        },
      },
    };
  }

  /**
   * 再認証が必要な場合のFlexメッセージを構築
   * @param authUrl 認証URL
   * @returns Flexメッセージ
   */
  public buildReauthRequiredMessage(authUrl: string): object {
    return {
      altText: '再認証が必要です',
      contents: {
        type: 'bubble',
        size: 'kilo',
        body: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: '🔄',
              size: '3xl',
              align: 'center',
            },
            {
              type: 'text',
              text: '再認証が必要です',
              size: 'lg',
              weight: 'bold',
              align: 'center',
              margin: 'lg',
              color: CONFIG.COLORS.TEXT_PRIMARY,
            },
            {
              type: 'text',
              text: 'カレンダーへのアクセス権限が無効になりました。\n再度認証してください。',
              size: 'sm',
              color: CONFIG.COLORS.TEXT_SECONDARY,
              wrap: true,
              align: 'center',
              margin: 'lg',
            },
          ],
          paddingAll: 'xl',
        },
        footer: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'button',
              action: {
                type: 'uri',
                label: '再認証する',
                uri: authUrl + (authUrl.includes('?') ? '&' : '?') + 'openExternalBrowser=1',
              },
              style: 'primary',
              color: CONFIG.COLORS.GOOGLE_BLUE,
            },
          ],
          paddingAll: 'lg',
        },
      },
    };
  }

  /**
   * ヘルプのFlexメッセージを構築
   * @returns Flexメッセージ
   */
  public buildHelpMessage(): object {
    const helpData = MESSAGE.HELP;

    const sectionContents = helpData.SECTIONS.flatMap((section: any, index: number) => {
      const sectionBox = {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              {
                type: 'text',
                text: section.icon,
                size: 'md',
                flex: 0,
              },
              {
                type: 'text',
                text: section.title,
                size: 'md',
                weight: 'bold',
                color: CONFIG.COLORS.TEXT_PRIMARY,
                margin: 'sm',
                flex: 1,
              },
            ],
          },
          {
            type: 'box',
            layout: 'vertical',
            contents: section.items.map((item: string) => ({
              type: 'text',
              text: item,
              size: 'sm',
              color: CONFIG.COLORS.TEXT_SECONDARY,
              wrap: true,
              margin: 'sm',
            })),
            margin: 'sm',
            paddingStart: 'lg',
          },
        ],
        margin: index === 0 ? 'none' : 'xl',
      };

      return sectionBox;
    });

    return {
      altText: 'ぶいつーの使い方',
      contents: {
        type: 'bubble',
        size: 'mega',
        header: {
          type: 'box',
          layout: 'horizontal',
          contents: [
            {
              type: 'text',
              text: '❓',
              size: 'xl',
              flex: 0,
            },
            {
              type: 'text',
              text: helpData.TITLE,
              size: 'lg',
              weight: 'bold',
              color: '#FFFFFF',
              margin: 'md',
              flex: 1,
            },
          ],
          backgroundColor: '#7B7B7B',
          paddingAll: 'lg',
        },
        body: {
          type: 'box',
          layout: 'vertical',
          contents: sectionContents,
          paddingAll: 'lg',
        },
      },
    };
  }

  /**
   * 予定なしのFlexメッセージを構築
   * @param title タイトル
   * @param subtitle サブタイトル
   * @param message メッセージ
   * @returns Flexメッセージ
   */
  public buildNoEventsMessage(title: string, subtitle: string, message: string): object {
    return {
      altText: message,
      contents: {
        type: 'bubble',
        size: 'kilo',
        body: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: '📅',
              size: '3xl',
              align: 'center',
            },
            {
              type: 'text',
              text: title,
              size: 'lg',
              weight: 'bold',
              align: 'center',
              margin: 'lg',
              color: CONFIG.COLORS.TEXT_PRIMARY,
            },
            {
              type: 'text',
              text: subtitle,
              size: 'sm',
              align: 'center',
              color: CONFIG.COLORS.TEXT_SECONDARY,
            },
            {
              type: 'separator',
              margin: 'xl',
            },
            {
              type: 'text',
              text: message,
              size: 'md',
              align: 'center',
              margin: 'xl',
              color: CONFIG.COLORS.TEXT_SECONDARY,
            },
          ],
          paddingAll: 'xl',
        },
      },
    };
  }

  /**
   * イベント行のコンテンツを構築
   * @param event イベント
   * @returns イベント行コンテンツ
   */
  private buildEventRowContent(event: any): object {
    const timeText = event.isAllDay
      ? '終日'
      : this.formatTimeForFlex(event.startTime);

    return {
      type: 'box',
      layout: 'horizontal',
      contents: [
        {
          type: 'text',
          text: timeText,
          size: 'sm',
          color: CONFIG.COLORS.ACCENT,
          weight: 'bold',
          flex: 0,
        },
        {
          type: 'text',
          text: event.title,
          size: 'sm',
          color: CONFIG.COLORS.TEXT_PRIMARY,
          wrap: true,
          margin: 'lg',
          flex: 1,
        },
      ],
      paddingAll: 'sm',
      backgroundColor: '#F8F8F8',
      cornerRadius: 'md',
      action: {
        type: 'postback',
        label: 'イベント詳細',
        data: `action=show_detail&eventId=${event.id}`,
        displayText: `${event.title}の詳細を表示`,
      },
    };
  }

  /**
   * 日付行のコンテンツを構築
   * @param date 日付
   * @param events イベントリスト
   * @param isToday 今日かどうか
   * @returns 日付行コンテンツ
   */
  private buildDayRowContent(date: Date, events: any[], isToday: boolean): object {
    const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayOfWeek = dayNames[date.getDay()];
    const dateText = `${month}/${day}（${dayOfWeek}）`;

    const eventCount = events.length;
    const countText = eventCount === 0 ? '−' : `${eventCount}件`;
    
    // 予定サマリーを構築（最大2件まで表示、文字数制限を50文字に拡張）
    let eventSummary = '予定なし';
    if (eventCount > 0) {
      const summaryText = events.slice(0, 2).map((e: any) => e.title).join(', ');
      if (summaryText.length > 50) {
        eventSummary = summaryText.substring(0, 50) + '...';
      } else if (eventCount > 2) {
        eventSummary = summaryText + '...';
      } else {
        eventSummary = summaryText;
      }
    }

    const backgroundColor = isToday ? '#E8F5E9' : '#F8F8F8';
    const dateColor = isToday ? CONFIG.COLORS.PRIMARY : CONFIG.COLORS.TEXT_PRIMARY;

    return {
      type: 'box',
      layout: 'horizontal',
      contents: [
        {
          type: 'text',
          text: dateText,
          size: 'sm',
          weight: 'bold',
          color: dateColor,
          flex: 0,
        },
        {
          type: 'text',
          text: countText,
          size: 'sm',
          color: eventCount === 0 ? CONFIG.COLORS.SECONDARY : CONFIG.COLORS.ACCENT,
          weight: eventCount === 0 ? 'regular' : 'bold',
          margin: 'lg',
          flex: 0,
        },
        {
          type: 'text',
          text: eventSummary,
          size: 'xs',
          color: CONFIG.COLORS.TEXT_SECONDARY,
          wrap: true,
          margin: 'md',
          flex: 1,
        },
      ],
      paddingAll: 'md',
      backgroundColor: backgroundColor,
      cornerRadius: 'md',
    };
  }

  /**
   * 日付をFlex用にフォーマット
   * @param date 日付
   * @returns フォーマット済み日付
   */
  private formatDateForFlex(date: Date): string {
    const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayOfWeek = dayNames[date.getDay()];

    return `${month}月${day}日（${dayOfWeek}）`;
  }

  /**
   * 時刻をFlex用にフォーマット
   * @param date 日付
   * @returns フォーマット済み時刻
   */
  private formatTimeForFlex(date: Date): string {
    const hour = date.getHours();
    const minute = date.getMinutes().toString().padStart(2, '0');

    return `${hour}:${minute}`;
  }

  /**
   * 2つの日付が同じ日かチェック
   * @param date1 日付1
   * @param date2 日付2
   * @returns 同じ日の場合true
   */
  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate();
  }

  /**
   * 今日のGoogleカレンダーURLを構築
   * @returns カレンダーURL
   */
  private buildTodayCalendarUrl(): string {
    return 'https://calendar.google.com/calendar/r/day';
  }

  /**
   * 週間ビューのGoogleカレンダーURLを構築
   * @returns カレンダーURL
   */
  private buildWeekCalendarUrl(): string {
    return 'https://calendar.google.com/calendar/r/week';
  }

  /**
   * イベント詳細のFlexメッセージを構築
   * @param event イベント
   * @returns Flexメッセージ
   */
  public buildEventDetailMessage(event: CalendarEvent): object {
    const startDate = event.startTime;
    const endDate = event.endTime;
    const dateText = this.formatDateForFlex(startDate);
    const timeText = event.isAllDay
      ? '終日'
      : `${this.formatTimeForFlex(startDate)} 〜 ${this.formatTimeForFlex(endDate)}`;

    const bodyContents: any[] = [
      {
        type: 'text',
        text: event.title,
        size: 'lg',
        weight: 'bold',
        color: CONFIG.COLORS.TEXT_PRIMARY,
        wrap: true,
      },
      {
        type: 'separator',
        margin: 'lg',
      },
      {
        type: 'box',
        layout: 'horizontal',
        contents: [
          {
            type: 'text',
            text: '📅',
            size: 'sm',
            flex: 0,
          },
          {
            type: 'text',
            text: dateText,
            size: 'sm',
            color: CONFIG.COLORS.TEXT_SECONDARY,
            margin: 'sm',
            flex: 1,
          },
        ],
        margin: 'lg',
      },
      {
        type: 'box',
        layout: 'horizontal',
        contents: [
          {
            type: 'text',
            text: '🕒',
            size: 'sm',
            flex: 0,
          },
          {
            type: 'text',
            text: timeText,
            size: 'sm',
            color: CONFIG.COLORS.TEXT_SECONDARY,
            margin: 'sm',
            flex: 1,
          },
        ],
        margin: 'sm',
      },
    ];

    // 説明がある場合は追加
    if (event.description) {
      bodyContents.push(
        {
          type: 'separator',
          margin: 'lg',
        },
        {
          type: 'text',
          text: '📝 説明',
          size: 'sm',
          weight: 'bold',
          color: CONFIG.COLORS.TEXT_PRIMARY,
          margin: 'lg',
        },
        {
          type: 'text',
          text: event.description,
          size: 'sm',
          color: CONFIG.COLORS.TEXT_SECONDARY,
          wrap: true,
          margin: 'sm',
        }
      );
    }

    return {
      altText: `📅 ${event.title}の詳細`,
      contents: {
        type: 'bubble',
        size: 'kilo',
        header: {
          type: 'box',
          layout: 'horizontal',
          contents: [
            {
              type: 'text',
              text: '📅',
              size: 'lg',
              flex: 0,
            },
            {
              type: 'text',
              text: 'イベント詳細',
              size: 'md',
              weight: 'bold',
              color: CONFIG.COLORS.TEXT_PRIMARY,
              margin: 'sm',
              flex: 1,
            },
          ],
          backgroundColor: '#F0F8FF',
          paddingAll: 'lg',
        },
        body: {
          type: 'box',
          layout: 'vertical',
          contents: bodyContents,
          paddingAll: 'lg',
        },
        footer: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'button',
              action: {
                type: 'postback',
                label: '✏️ 編集',
                data: `action=start_edit&eventId=${event.id}`,
                displayText: 'この予定を編集',
              },
              style: 'primary',
              color: CONFIG.COLORS.PRIMARY,
            },
            {
              type: 'button',
              action: {
                type: 'postback',
                label: '🗑️ 削除',
                data: `action=delete&eventId=${event.id}`,
                displayText: 'この予定を削除',
              },
              style: 'secondary',
              margin: 'sm',
            },
          ],
          paddingAll: 'lg',
        },
      },
    };
  }

  /**
   * 編集モード開始メッセージを構築
   * @param event イベント
   * @returns Flexメッセージ
   */
  public buildEditWaitingMessage(event: CalendarEvent): object {
    return {
      altText: `${event.title}を編集します`,
      contents: {
        type: 'bubble',
        size: 'kilo',
        body: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: '✏️',
              size: '3xl',
              align: 'center',
            },
            {
              type: 'text',
              text: '編集モード',
              size: 'lg',
              weight: 'bold',
              align: 'center',
              margin: 'lg',
              color: CONFIG.COLORS.TEXT_PRIMARY,
            },
            {
              type: 'text',
              text: `「${event.title}」を編集します`,
              size: 'md',
              align: 'center',
              color: CONFIG.COLORS.TEXT_SECONDARY,
              wrap: true,
              margin: 'md',
            },
            {
              type: 'separator',
              margin: 'xl',
            },
            {
              type: 'text',
              text: '🎤 音声で新しい内容を送信してください',
              size: 'sm',
              align: 'center',
              margin: 'xl',
              color: CONFIG.COLORS.PRIMARY,
              weight: 'bold',
            },
            {
              type: 'text',
              text: '例：「明日の15時から打ち合わせ」',
              size: 'xs',
              align: 'center',
              margin: 'sm',
              color: CONFIG.COLORS.TEXT_SECONDARY,
            },
          ],
          paddingAll: 'xl',
        },
      },
    };
  }

  /**
   * イベント削除完了メッセージを構築
   * @param eventTitle イベントタイトル
   * @returns Flexメッセージ
   */
  public buildEventDeletedMessage(eventTitle: string): object {
    return {
      altText: `✅ ${eventTitle}を削除しました`,
      contents: {
        type: 'bubble',
        size: 'kilo',
        header: {
          type: 'box',
          layout: 'horizontal',
          contents: [
            {
              type: 'text',
              text: '✅',
              size: 'lg',
              flex: 0,
            },
            {
              type: 'text',
              text: '削除しました',
              size: 'md',
              weight: 'bold',
              color: CONFIG.COLORS.TEXT_PRIMARY,
              margin: 'sm',
              flex: 1,
            },
          ],
          backgroundColor: '#FFE6E6',
          paddingAll: 'lg',
        },
        body: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: eventTitle,
              size: 'lg',
              weight: 'bold',
              color: CONFIG.COLORS.TEXT_PRIMARY,
              wrap: true,
            },
            {
              type: 'text',
              text: 'カレンダーから削除されました',
              size: 'sm',
              color: CONFIG.COLORS.TEXT_SECONDARY,
              margin: 'md',
            },
          ],
          paddingAll: 'lg',
        },
      },
    };
  }

  /**
   * イベント更新完了メッセージを構築
   * @param eventData イベントデータ
   * @param eventUrl イベントURL
   * @returns Flexメッセージ
   */
  public buildEventUpdatedMessage(eventData: any, eventUrl: string): object {
    const startDate = new Date(eventData.startTime);
    const endDate = new Date(eventData.endTime);
    const dateText = this.formatDateForFlex(startDate);
    const timeText = `${this.formatTimeForFlex(startDate)} 〜 ${this.formatTimeForFlex(endDate)}`;

    return {
      altText: `✅ イベントを更新しました: ${eventData.title}`,
      contents: {
        type: 'bubble',
        size: 'kilo',
        header: {
          type: 'box',
          layout: 'horizontal',
          contents: [
            {
              type: 'text',
              text: '✅',
              size: 'lg',
              flex: 0,
            },
            {
              type: 'text',
              text: 'イベントを更新しました',
              size: 'md',
              weight: 'bold',
              color: CONFIG.COLORS.TEXT_PRIMARY,
              margin: 'sm',
              flex: 1,
            },
          ],
          backgroundColor: '#FFF8DC',
          paddingAll: 'lg',
        },
        body: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: eventData.title,
              size: 'lg',
              weight: 'bold',
              color: CONFIG.COLORS.TEXT_PRIMARY,
              wrap: true,
            },
            {
              type: 'separator',
              margin: 'lg',
            },
            {
              type: 'box',
              layout: 'horizontal',
              contents: [
                {
                  type: 'text',
                  text: '📅',
                  size: 'sm',
                  flex: 0,
                },
                {
                  type: 'text',
                  text: dateText,
                  size: 'sm',
                  color: CONFIG.COLORS.TEXT_SECONDARY,
                  margin: 'sm',
                  flex: 1,
                },
              ],
              margin: 'lg',
            },
            {
              type: 'box',
              layout: 'horizontal',
              contents: [
                {
                  type: 'text',
                  text: '🕒',
                  size: 'sm',
                  flex: 0,
                },
                {
                  type: 'text',
                  text: timeText,
                  size: 'sm',
                  color: CONFIG.COLORS.TEXT_SECONDARY,
                  margin: 'sm',
                  flex: 1,
                },
              ],
              margin: 'sm',
            },
          ],
          paddingAll: 'lg',
        },
        footer: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'button',
              action: {
                type: 'uri',
                label: 'カレンダーで見る',
                uri: eventUrl + (eventUrl.includes('?') ? '&' : '?') + 'openExternalBrowser=1',
              },
              style: 'primary',
              color: CONFIG.COLORS.PRIMARY,
            },
          ],
          paddingAll: 'lg',
        },
      },
    };
  }
}
