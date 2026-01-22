import { handleOAuth2Callback } from '../infra/google/oauth2Service';
import { CONFIG } from '../config/index';

/**
 * OAuth2コールバックを処理してHTMLレスポンスを返す
 * userIdはstateパラメータから自動的に取得される
 */
export const handleOAuthCallback = (e: GoogleAppsScript.Events.DoGet): GoogleAppsScript.HTML.HtmlOutput => {
  const result = handleOAuth2Callback(e);

  if (result.success) {
    return HtmlService.createHtmlOutput(buildSuccessHtml());
  }
  return HtmlService.createHtmlOutput(buildErrorHtml(result.error || '不明なエラー'));
};

/**
 * 認証成功時のHTMLを生成
 */
const buildSuccessHtml = (): string => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>認証完了</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: linear-gradient(135deg, ${CONFIG.COLORS.PRIMARY} 0%, #00a040 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      background: white;
      border-radius: 20px;
      padding: 40px 30px;
      text-align: center;
      max-width: 400px;
      width: 100%;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    }
    .icon {
      width: 80px;
      height: 80px;
      background: ${CONFIG.COLORS.PRIMARY};
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 24px;
    }
    .icon svg {
      width: 40px;
      height: 40px;
      fill: white;
    }
    h1 {
      color: ${CONFIG.COLORS.TEXT_PRIMARY};
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 12px;
    }
    p {
      color: ${CONFIG.COLORS.TEXT_SECONDARY};
      font-size: 16px;
      line-height: 1.6;
      margin-bottom: 8px;
    }
    .note {
      font-size: 14px;
      color: #999;
      margin-top: 24px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
      </svg>
    </div>
    <h1>認証が完了しました</h1>
    <p>Googleカレンダーとの連携が完了しました。</p>
    <p>LINEに戻って音声メッセージを送信してください。</p>
    <p class="note">このページは閉じてOKです</p>
  </div>
</body>
</html>
  `.trim();
};

/**
 * 認証失敗時のHTMLを生成
 */
const buildErrorHtml = (error: string): string => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>認証エラー</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: linear-gradient(135deg, #ff6b6b 0%, #ee5a5a 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      background: white;
      border-radius: 20px;
      padding: 40px 30px;
      text-align: center;
      max-width: 400px;
      width: 100%;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    }
    .icon {
      width: 80px;
      height: 80px;
      background: #ff6b6b;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 24px;
    }
    .icon svg {
      width: 40px;
      height: 40px;
      fill: white;
    }
    h1 {
      color: ${CONFIG.COLORS.TEXT_PRIMARY};
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 12px;
    }
    p {
      color: ${CONFIG.COLORS.TEXT_SECONDARY};
      font-size: 16px;
      line-height: 1.6;
      margin-bottom: 8px;
    }
    .error-detail {
      background: #f8f8f8;
      border-radius: 8px;
      padding: 12px;
      margin-top: 16px;
      font-size: 14px;
      color: #666;
      word-break: break-word;
    }
    .note {
      font-size: 14px;
      color: #999;
      margin-top: 24px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
      </svg>
    </div>
    <h1>認証に失敗しました</h1>
    <p>Googleカレンダーとの連携に失敗しました。</p>
    <p>LINEから再度認証をお試しください。</p>
    <div class="error-detail">${escapeHtml(error)}</div>
    <p class="note">このページは閉じてOKです</p>
  </div>
</body>
</html>
  `.trim();
};

/**
 * HTMLエスケープ
 */
const escapeHtml = (text: string): string => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};
