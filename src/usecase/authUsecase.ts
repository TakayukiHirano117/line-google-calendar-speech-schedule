import { getAuthorizationUrl } from '../infra/google/oauth2Service';
import { sendLineFlexReply } from '../infra/line/lineMessagingApi';
import { buildAuthRequiredFlexMessage } from '../infra/line/flexMessageFactory';

/**
 * 未認証ユーザーに認証を促すメッセージを送信
 * @param replyToken リプライトークン
 * @param userId LINEユーザーID
 */
export const sendAuthRequiredMessage = (replyToken: string, userId: string): void => {
  // 未認証ユーザーのため、強制的に同意画面を表示
  const authUrl = getAuthorizationUrl(userId, true);
  const flexMessage = buildAuthRequiredFlexMessage(authUrl);
  sendLineFlexReply(replyToken, flexMessage);
};
