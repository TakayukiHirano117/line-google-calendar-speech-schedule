import { sendLineTextReply } from "../infra/line/lineMessagingApi";
import { MESSAGE } from "../constants/message";

export const InvalidRequestUsecase = (replyToken: string) => {
  sendLineTextReply(replyToken, MESSAGE.REQUEST_AUDIO);
};