import { getAuthorizationUrl } from '../infra/google/oauth2Service';
import { sendLineFlexReply } from '../infra/line/lineMessagingApi';
import { buildAuthRequiredFlexMessage } from '../infra/line/flexMessageFactory';

/**
 * 未認証ユーザーに認証を促すメッセージを送信
 * @param replyToken リプライトークン
 * @param userId LINEユーザーID
 */
export const sendAuthRequiredMessage = (replyToken: string, userId: string): void => {
  const authUrl = getAuthorizationUrl(userId);
  const flexMessage = buildAuthRequiredFlexMessage(authUrl);
  sendLineFlexReply(replyToken, flexMessage);
};
