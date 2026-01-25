import { CONFIG } from '../../config/index';
import { MESSAGE } from '../../constants/message';

/**
 * イベント作成完了のFlexメッセージを構築
 * @param {Object} eventData - イベントデータ
 * @param {string} eventUrl - イベントURL
 * @returns {Object} Flexメッセージ
 */
export const buildEventCreatedFlexMessage = (eventData, eventUrl) => {
  const startDate = new Date(eventData.startTime);
  const endDate = new Date(eventData.endTime);
  const dateText = formatDateForFlex(startDate);
  const timeText = `${formatTimeForFlex(startDate)} 〜 ${formatTimeForFlex(endDate)}`;

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
};

/**
 * 今日の予定のFlexメッセージを構築
 * @param {Array} events - イベントリスト
 * @returns {Object} Flexメッセージ
 */
export const buildTodayEventsFlexMessage = (events) => {
  const today = new Date();
  const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
  const dateText = `${today.getMonth() + 1}/${today.getDate()}（${dayNames[today.getDay()]}）`;

  if (events.length === 0) {
    return buildNoEventsFlexMessage('今日の予定', dateText, MESSAGE.NO_EVENTS_TODAY);
  }

  events.sort((a, b) => a.startTime - b.startTime);

  const eventContents = events.map(event => buildEventRowContent(event));

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
            type: 'text',
            text: `${events.length}件の予定`,
            size: 'sm',
            color: CONFIG.COLORS.TEXT_SECONDARY,
            align: 'center',
          },
        ],
        paddingAll: 'md',
      },
    },
  };
};

/**
 * イベント行のコンテンツを構築
 * @param {Object} event - イベント
 * @returns {Object}
 */
export const buildEventRowContent = (event) => {
  const timeText = event.isAllDay
    ? '終日'
    : formatTimeForFlex(event.startTime);

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
  };
};

/**
 * 週間予定のFlexメッセージを構築
 * @param {Object} eventsByDate - 日付ごとのイベント辞書
 * @returns {Object} Flexメッセージ
 */
export const buildWeekEventsFlexMessage = (eventsByDate) => {
  const dateKeys = Object.keys(eventsByDate);

  let totalEvents = 0;
  dateKeys.forEach(key => {
    totalEvents += eventsByDate[key].events.length;
  });

  if (totalEvents === 0) {
    return buildNoEventsFlexMessage('今週の予定', '直近7日間', MESSAGE.NO_EVENTS_WEEK);
  }

  const dayContents = dateKeys.map(dateKey => {
    const dayData = eventsByDate[dateKey];
    const date = dayData.date;
    const events = dayData.events;
    const isToday = isSameDay(date, new Date());

    return buildDayRowContent(date, events, isToday);
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
            type: 'text',
            text: `合計 ${totalEvents}件の予定`,
            size: 'sm',
            color: CONFIG.COLORS.TEXT_SECONDARY,
            align: 'center',
          },
        ],
        paddingAll: 'md',
      },
    },
  };
};

/**
 * 日付行のコンテンツを構築
 * @param {Date} date - 日付
 * @param {Array} events - イベントリスト
 * @param {boolean} isToday - 今日かどうか
 * @returns {Object}
 */
export const buildDayRowContent = (date, events, isToday) => {
  const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dayOfWeek = dayNames[date.getDay()];
  const dateText = `${month}/${day}（${dayOfWeek}）`;

  const eventCount = events.length;
  const countText = eventCount === 0 ? '−' : `${eventCount}件`;
  const eventSummary = eventCount === 0
    ? '予定なし'
    : events.slice(0, 2).map(e => e.title).join(', ').substring(0, 20) + (events.slice(0, 2).map(e => e.title).join(', ').length > 20 || eventCount > 2 ? '...' : '');

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
        wrap: false,
        margin: 'md',
        flex: 1,
      },
    ],
    paddingAll: 'md',
    backgroundColor: backgroundColor,
    cornerRadius: 'md',
  };
};

/**
 * 予定なしのFlexメッセージを構築
 * @param {string} title - タイトル
 * @param {string} subtitle - サブタイトル
 * @param {string} message - メッセージ
 * @returns {Object} Flexメッセージ
 */
export const buildNoEventsFlexMessage = (title, subtitle, message) => {
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
};

/**
 * ヘルプのFlexメッセージを構築
 * @returns {Object} Flexメッセージ
 */
export const buildHelpFlexMessage = () => {
  const helpData = MESSAGE.HELP;

  const sectionContents = helpData.SECTIONS.flatMap((section, index) => {
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
          contents: section.items.map(item => ({
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
};

/**
 * 日付をFlex用にフォーマット
 * @param {Date} date - 日付
 * @returns {string}
 */
export const formatDateForFlex = (date) => {
  const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dayOfWeek = dayNames[date.getDay()];

  return `${month}月${day}日（${dayOfWeek}）`;
};

/**
 * 時刻をFlex用にフォーマット
 * @param {Date} date - 日付
 * @returns {string}
 */
export const formatTimeForFlex = (date) => {
  const hour = date.getHours();
  const minute = date.getMinutes().toString().padStart(2, '0');

  return `${hour}:${minute}`;
};

/**
 * 2つの日付が同じ日かチェック
 * @param {Date} date1 - 日付1
 * @param {Date} date2 - 日付2
 * @returns {boolean}
 */
export const isSameDay = (date1, date2) => {
  return date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate();
};

/**
 * 認証が必要な場合のFlexメッセージを構築
 * @param authUrl 認証URL
 * @returns Flexメッセージ
 */
export const buildAuthRequiredFlexMessage = (authUrl: string) => {
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
};

/**
 * 再認証が必要な場合のFlexメッセージを構築
 * @param authUrl 認証URL
 * @returns Flexメッセージ
 */
export const buildReauthRequiredFlexMessage = (authUrl: string) => {
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
};