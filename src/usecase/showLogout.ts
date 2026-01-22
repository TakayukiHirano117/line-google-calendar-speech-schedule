import { revokeToken } from '../infra/google/oauth2Service';
import { sendLineTextReply } from '../infra/line/lineMessagingApi';

/**
 * ログアウト処理を実行
 * @param replyToken LINEリプライトークン
 * @param userId LINEユーザーID
 */
export const showLogout = (replyToken: string, userId: string): void => {
  // トークンをリセット
  revokeToken(userId);
  
  // ログアウト完了メッセージを送信
  sendLineTextReply(replyToken, 'ログアウトしました。\n再度利用する場合は、認証が必要です。');
};
