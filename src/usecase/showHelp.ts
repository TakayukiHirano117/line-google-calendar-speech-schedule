import { buildHelpFlexMessage } from '../infra/line/flexMessageFactory';
import { sendLineFlexReply } from '../infra/line/lineMessagingApi';

/**
 * ヘルプメッセージを表示
 * @param {string} replyToken - LINEリプライトークン
 */
export const showHelp = (replyToken) => {
  // 1. Flexメッセージを構築
  const flexMessage = buildHelpFlexMessage();

  // 2. LINEに返信
  sendLineFlexReply(replyToken, flexMessage);
};