import { OAuth2Manager } from '../infra/google/OAuth2Manager';
import { getOAuth2ClientId, getOAuth2ClientSecret } from '../config/getProperty';
import { sendLineFlexReply } from '../infra/line/lineMessagingApi';
import { buildAuthRequiredFlexMessage } from '../infra/line/flexMessageFactory';

/**
 * 未認証ユーザーに認証を促すメッセージを送信
 * @param replyToken リプライトークン
 * @param userId LINEユーザーID
 */
export const sendAuthRequiredMessage = (replyToken: string, userId: string): void => {
  // OAuth2Managerインスタンスを作成
  const oauth2Service = new OAuth2Manager(
    userId,
    getOAuth2ClientId(),
    getOAuth2ClientSecret()
  );
  
  // 未認証ユーザーのため、強制的に同意画面を表示
  const authUrl = oauth2Service.getAuthorizationUrl(true);
  const flexMessage = buildAuthRequiredFlexMessage(authUrl);
  sendLineFlexReply(replyToken, flexMessage);
};
