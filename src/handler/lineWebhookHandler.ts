import { CONFIG } from '../config/index';
import { createEventFromVoice } from '../usecase/createEventFromVoice';

import { showHelp } from '../usecase/showHelp';
import { showWeekSchedule } from '../usecase/showWeekSchedule';
import { showTodaySchedule } from '../usecase/showTodaySchedule';
import { InvalidRequestUsecase } from '../usecase/InvalidRequestUsecase';
/**
 * LINEイベントを処理
 * @param {Object} lineEvent - LINEイベント
 */
export const processLineEvent = (lineEvent) => {
  const replyToken = lineEvent.replyToken;

  if (isAudioMessage(lineEvent)) {
    createEventFromVoice(replyToken, lineEvent.message.id);
  } else if (isTextMessage(lineEvent)) {
    processTextMessage(replyToken, lineEvent.message.text);
  } else {
    InvalidRequestUsecase(replyToken);
  }
};

/**
 * テキストメッセージを処理
 * @param {string} replyToken - リプライトークン
 * @param {string} messageText - メッセージテキスト
 */
const processTextMessage = (replyToken, messageText) => {
  const normalizedText = messageText.trim();

  if (isHelpCommand(normalizedText)) {
    showHelp(replyToken);
  } else if (isWeekCommand(normalizedText)) {
    showWeekSchedule(replyToken);
  } else if (isTodayCommand(normalizedText)) {
    showTodaySchedule(replyToken);
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