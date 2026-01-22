import { CONFIG } from '../config/index';
import { createEventFromVoice } from '../usecase/createEventFromVoice';

import { showHelp } from '../usecase/showHelp';
import { showWeekSchedule } from '../usecase/showWeekSchedule';
import { showTodaySchedule } from '../usecase/showTodaySchedule';
import { showLogout } from '../usecase/showLogout';
import { InvalidRequestUsecase } from '../usecase/InvalidRequestUsecase';
import { hasValidToken } from '../infra/google/oauth2Service';
import { sendAuthRequiredMessage } from '../usecase/authUsecase';

/**
 * LINEイベントを処理
 * @param {Object} lineEvent - LINEイベント
 */
export const processLineEvent = (lineEvent: LineWebhookEvent) => {
  const replyToken = lineEvent.replyToken;
  const userId = extractUserId(lineEvent);

  // userIdが取得できない場合はエラー
  if (!userId) {
    logError('processLineEvent', 'userIdを取得できませんでした');
    InvalidRequestUsecase(replyToken);
    return;
  }

  // followイベントの処理（LINE Console側でwelcomeメッセージ設定済みのため、何もせず終了）
  if (isFollowEvent(lineEvent)) {
    logDebug('processLineEvent', 'followイベントを受信しました');
    return;
  }

  // 認証状態をチェック まずみるこれ
  if (!hasValidToken(userId)) {
    // 未認証の場合は認証URLを送信
    sendAuthRequiredMessage(replyToken, userId);
    return;
  }

  // 認証済みの場合は通常処理
  if (isAudioMessage(lineEvent)) {
    createEventFromVoice(replyToken, lineEvent.message.id, userId);
  } else if (isTextMessage(lineEvent)) {
    processTextMessage(replyToken, lineEvent.message.text, userId);
  } else if (isPostbackEvent(lineEvent)) {
    processPostbackEvent(replyToken, lineEvent.postback.data, userId);
  } else {
    InvalidRequestUsecase(replyToken);
  }
};

/**
 * LINEイベントからuserIdを抽出
 * @param lineEvent LINEイベント
 * @returns userId または undefined
 */
const extractUserId = (lineEvent: LineWebhookEvent): string | undefined => {
  return lineEvent.source?.userId;
};

/**
 * テキストメッセージを処理
 * @param replyToken リプライトークン
 * @param messageText メッセージテキスト
 * @param userId LINEユーザーID
 */
const processTextMessage = (replyToken: string, messageText: string, userId: string) => {
  const normalizedText = messageText.trim();

  if (isHelpCommand(normalizedText)) {
    showHelp(replyToken);
  } else if (isWeekCommand(normalizedText)) {
    showWeekSchedule(replyToken, userId);
  } else if (isTodayCommand(normalizedText)) {
    showTodaySchedule(replyToken, userId);
  } else if (isLogoutCommand(normalizedText)) {
    showLogout(replyToken, userId);
  } else {
    InvalidRequestUsecase(replyToken);
  }
};

/**
 * 音声メッセージかチェック
 * @param {Object} lineEvent - LINEイベント
 * @returns {boolean}
 */
const isAudioMessage = (lineEvent) => {
  return lineEvent.type === 'message' && lineEvent.message.type === 'audio';
};

/**
 * テキストメッセージかチェック
 * @param {Object} lineEvent - LINEイベント
 * @returns {boolean}
 */
const isTextMessage = (lineEvent) => {
  return lineEvent.type === 'message' && lineEvent.message.type === 'text';
};

/**
 * 今日の予定コマンドかチェック
 * @param {string} text - テキスト
 * @returns {boolean}
 */
const isTodayCommand = (text) => {
  return CONFIG.COMMANDS.TODAY.some(command => text.includes(command));
};

/**
 * 週間予定コマンドかチェック
 * @param {string} text - テキスト
 * @returns {boolean}
 */
const isWeekCommand = (text) => {
  return CONFIG.COMMANDS.WEEK.some(command => text.includes(command));
};

/**
 * ヘルプコマンドかチェック
 * @param {string} text - テキスト
 * @returns {boolean}
 */
const isHelpCommand = (text) => {
  return CONFIG.COMMANDS.HELP.some(command => text.includes(command));
};

/**
 * ログアウトコマンドかチェック
 * @param {string} text - テキスト
 * @returns {boolean}
 */
const isLogoutCommand = (text) => {
  return CONFIG.COMMANDS.LOGOUT.some(command => text.includes(command));
};

/**
 * Postbackイベントかチェック
 * @param {Object} lineEvent - LINEイベント
 * @returns {boolean}
 */
const isPostbackEvent = (lineEvent) => {
  return lineEvent.type === 'postback' && lineEvent.postback;
};

/**
 * Followイベントかチェック
 * @param {Object} lineEvent - LINEイベント
 * @returns {boolean}
 */
const isFollowEvent = (lineEvent) => {
  return lineEvent.type === 'follow';
};

/**
 * Postbackイベントを処理
 * @param replyToken リプライトークン
 * @param postbackData Postbackデータ
 * @param userId LINEユーザーID
 */
const processPostbackEvent = (replyToken: string, postbackData: string, userId: string) => {
  // Postbackデータをパース（例: "action=logout"）
  const actionMatch = postbackData.match(/action=([^&]+)/);
  const action = actionMatch ? actionMatch[1] : null;

  switch (action) {
    case 'logout':
      showLogout(replyToken, userId);
      break;
    case 'today':
      showTodaySchedule(replyToken, userId);
      break;
    case 'week':
      showWeekSchedule(replyToken, userId);
      break;
    case 'help':
      showHelp(replyToken);
      break;
    default:
      InvalidRequestUsecase(replyToken);
  }
};

// ============================================
// ロギングユーティリティ
// ============================================

/**
 * デバッグログを出力
 * @param {string} context - コンテキスト
 * @param {string} message - メッセージ
 */
export const logDebug = (context, message) => {
  console.log(`${context}: ${message}`);
};

/**
 * エラーログを出力
 * @param {string} context - コンテキスト
 * @param {*} error - エラー
 */
export const logError = (context, error) => {
  console.log(`${context}エラー: ${error}`);
};