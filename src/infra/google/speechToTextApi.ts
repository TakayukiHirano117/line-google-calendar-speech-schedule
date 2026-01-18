import { getGcpProjectId } from '../../config/getProperty';
import { generateServiceAccountAccessToken } from './auth';
import { logDebug, logError } from '../../handler/lineWebhookHandler';
import { CONFIG } from '../../config/index';

/**
 * 音声をテキストに変換
 * @param {Blob} audioBlob - 音声データ
 * @returns {string|null} 認識されたテキスト
 */
export const convertSpeechToText = (audioBlob) => {
  const projectId = getGcpProjectId();
  const accessToken = generateServiceAccountAccessToken();
  const audioContentBase64 = Utilities.base64Encode(audioBlob.getBytes());

  const recognizerPath = buildRecognizerPath(projectId);
  const apiEndpoint = `https://speech.googleapis.com/v2/${recognizerPath}:recognize`;

  const requestBody = buildSpeechToTextRequestBody(audioContentBase64);
  const requestOptions = buildAuthorizedPostRequest(accessToken, requestBody) satisfies GoogleAppsScript.URL_Fetch.URLFetchRequestOptions;

  try {
    const response = UrlFetchApp.fetch(apiEndpoint, requestOptions);
    const responseData = JSON.parse(response.getContentText());

    logDebug('Speech-to-Text v2 ステータス', response.getResponseCode());
    logDebug('Speech-to-Text v2 結果', JSON.stringify(responseData));

    return extractTranscriptFromSpeechResponse(responseData);
  } catch (error) {
    logError('Speech-to-Text v2', error);
    return null;
  }
};

/**
 * Recognizerパスを構築
 * @param {string} projectId - GCPプロジェクトID
 * @returns {string}
 */
export const buildRecognizerPath = (projectId) => {
  return `projects/${projectId}/locations/${CONFIG.SPEECH_TO_TEXT.LOCATION}/recognizers/_`;
};

/**
 * Speech-to-Textリクエストボディを構築
 * @param {string} audioContentBase64 - Base64エンコードされた音声データ
 * @returns {Object}
 */
export const buildSpeechToTextRequestBody = (audioContentBase64) => {
  return {
    config: {
      autoDecodingConfig: {},
      languageCodes: [CONFIG.SPEECH_TO_TEXT.LANGUAGE_CODE],
      model: CONFIG.SPEECH_TO_TEXT.MODEL,
    },
    content: audioContentBase64,
  };
};

/**
 * Speech-to-Textレスポンスからテキストを抽出
 * @param {Object} responseData - APIレスポンス
 * @returns {string|null}
 */
export const extractTranscriptFromSpeechResponse = (responseData) => {
  if (!responseData.results || responseData.results.length === 0) {
    return null;
  }

  const alternatives = responseData.results[0].alternatives;
  if (!alternatives || alternatives.length === 0) {
    return null;
  }

  return alternatives[0].transcript;
};

/**
 * 認証付きPOSTリクエストを構築
 * @param {string} accessToken - アクセストークン
 * @param {Object} requestBody - リクエストボディ
 * @returns {Object}
 */
export const buildAuthorizedPostRequest = (accessToken, requestBody) => {
  return {
    method: 'post',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    payload: JSON.stringify(requestBody),
    muteHttpExceptions: true,
  } satisfies GoogleAppsScript.URL_Fetch.URLFetchRequestOptions;
};