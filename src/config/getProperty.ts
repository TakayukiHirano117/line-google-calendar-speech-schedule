/**
 * スクリプトプロパティを取得
 * @param {string} propertyName - プロパティ名
 * @returns {string} プロパティ値
 */
export const getScriptProperty = (propertyName) => {
  return PropertiesService.getScriptProperties().getProperty(propertyName);
};

/**
 * LINEチャンネルアクセストークンを取得
 * @returns {string}
 */
export const getLineChannelAccessToken = () => {
  return getScriptProperty('CHANNEL_ACCESS_TOKEN');
};

/**
 * GCPプロジェクトIDを取得
 * @returns {string}
 */
export const getGcpProjectId = () => {
  return getScriptProperty('GCP_PROJECT_ID');
};

/**
 * Gemini APIキーを取得
 * @returns {string}
 */
export const getGeminiApiKey = () => {
  return getScriptProperty('GEMINI_API_KEY');
};

/**
 * サービスアカウントキー(JSON)を取得
 * @returns {Object}
 */
export const getServiceAccountKey = () => {
  const keyJson = getScriptProperty('SERVICE_ACCOUNT_KEY');
  return JSON.parse(keyJson);
};

/**
 * OAuth2クライアントIDを取得
 * @returns {string}
 */
export const getOAuth2ClientId = () => {
  return getScriptProperty('OAUTH2_CLIENT_ID');
};

/**
 * OAuth2クライアントシークレットを取得
 * @returns {string}
 */
export const getOAuth2ClientSecret = () => {
  return getScriptProperty('OAUTH2_CLIENT_SECRET');
};