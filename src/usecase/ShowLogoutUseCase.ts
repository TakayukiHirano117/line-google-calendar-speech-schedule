import { OAuth2Manager } from '../infra/google/OAuth2Manager';
import { getOAuth2ClientId, getOAuth2ClientSecret } from '../config/getProperty';
import { sendLineTextReply } from '../infra/line/lineMessagingApi';

/**
 * ログアウト処理を実行
 * @param replyToken LINEリプライトークン
 * @param userId LINEユーザーID
 */
export const showLogout = (replyToken: string, userId: string): void => {
  // OAuth2Managerインスタンスを作成
  const oauth2Service = new OAuth2Manager(
    userId,
    getOAuth2ClientId(),
    getOAuth2ClientSecret()
  );
  
  // トークンをリセット
  oauth2Service.revokeToken();
  
  // ログアウト完了メッセージを送信
  sendLineTextReply(replyToken, 'ログアウトしました。\n再度利用する場合は、認証が必要です。');
};
