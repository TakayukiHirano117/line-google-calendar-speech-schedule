export const CONFIG = {
  LINE_API: {
    REPLY_ENDPOINT: 'https://api.line.me/v2/bot/message/reply',
    CONTENT_ENDPOINT: 'https://api-data.line.me/v2/bot/message',
    RICH_MENU_ENDPOINT: 'https://api.line.me/v2/bot/richmenu',
  },
  SPEECH_TO_TEXT: {
    LOCATION: 'global',
    MODEL: 'latest_long',
    LANGUAGE_CODE: 'ja-JP',
  },
  GEMINI: {
    MODEL: 'gemini-2.5-flash-lite',
    ENDPOINT: 'https://generativelanguage.googleapis.com/v1beta/models',
    TEMPERATURE: 0.3,
    MAX_OUTPUT_TOKENS: 1024,
  },
  CALENDAR: {
    DEFAULT_EVENT_DURATION_HOURS: 1,
  },
  COMMANDS: {
    TODAY: ['今日の予定'],
    WEEK: ['今週の予定'],
    HELP: ['ヘルプ'],
    LOGOUT: ['ログアウト'],
  },
  COLORS: {
    PRIMARY: '#06C755',
    SECONDARY: '#AAAAAA',
    BACKGROUND: '#FFFFFF',
    ACCENT: '#5B82DB',
    TEXT_PRIMARY: '#111111',
    TEXT_SECONDARY: '#666666',
    BORDER: '#EEEEEE',
    SUCCESS: '#06C755',
    WARNING: '#FFCC00',
    GOOGLE_BLUE: '#4285F4',
  },
  OAUTH2: {
    AUTHORIZATION_BASE_URL: 'https://accounts.google.com/o/oauth2/v2/auth',
    TOKEN_URL: 'https://oauth2.googleapis.com/token',
    SCOPE: 'https://www.googleapis.com/auth/calendar.events',
    CALLBACK_FUNCTION: 'authCallback',
  },
  CALENDAR_API: {
    BASE_URL: 'https://www.googleapis.com/calendar/v3',
  },
};