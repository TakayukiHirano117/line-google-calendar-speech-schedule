import { getServiceAccountKey } from '../../config/getProperty';

/**
 * サービスアカウントのアクセストークンを生成
 * @returns {string} アクセストークン
 */
export const generateServiceAccountAccessToken = () => {
  const serviceAccountKey = getServiceAccountKey();
  const jwtToken = createSignedJwtToken(serviceAccountKey);
  return exchangeJwtForAccessToken(jwtToken);
};

/**
 * 署名付きJWTトークンを作成
 * @param {Object} serviceAccountKey - サービスアカウントキー
 * @returns {string} JWTトークン
 */
export const createSignedJwtToken = (serviceAccountKey) => {
  const header = createJwtHeader();
  const claims = createJwtClaims(serviceAccountKey.client_email);

  const headerBase64 = Utilities.base64EncodeWebSafe(JSON.stringify(header));
  const claimsBase64 = Utilities.base64EncodeWebSafe(JSON.stringify(claims));

  const signatureInput = `${headerBase64}.${claimsBase64}`;
  const signature = Utilities.computeRsaSha256Signature(signatureInput, serviceAccountKey.private_key);
  const signatureBase64 = Utilities.base64EncodeWebSafe(signature);

  return `${signatureInput}.${signatureBase64}`;
};

/**
 * JWTヘッダーを作成
 * @returns {Object}
 */
const createJwtHeader = () => {
  return {
    alg: 'RS256',
    typ: 'JWT',
  };
};

/**
 * JWTクレームを作成
 * @param {string} clientEmail - クライアントメール
 * @returns {Object}
 */
export const createJwtClaims = (clientEmail) => {
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const expirationTimestamp = currentTimestamp + 3600;

  return {
    iss: clientEmail,
    scope: 'https://www.googleapis.com/auth/cloud-platform',
    aud: 'https://oauth2.googleapis.com/token',
    exp: expirationTimestamp,
    iat: currentTimestamp,
  };
};

/**
 * JWTトークンをアクセストークンに交換
 * @param {string} jwtToken - JWTトークン
 * @returns {string} アクセストークン
 */
export const exchangeJwtForAccessToken = (jwtToken) => {
  const tokenEndpoint = 'https://oauth2.googleapis.com/token';

  const requestOptions = {
    method: 'post',
    payload: {
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwtToken,
    },
  } satisfies GoogleAppsScript.URL_Fetch.URLFetchRequestOptions;

  const response = UrlFetchApp.fetch(tokenEndpoint, requestOptions);
  const responseData = JSON.parse(response.getContentText());

  return responseData.access_token;
};