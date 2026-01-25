import { getServiceAccountKey } from '../../config/getProperty';

/**
 * Google サービスアカウント認証
 * Google Cloud Platform サービスアカウントを使用したアクセストークン生成を担当
 */
export class GoogleServiceAccountAuth {
  private readonly serviceAccountKey: any;

  constructor() {
    this.serviceAccountKey = getServiceAccountKey();
  }

  /**
   * サービスアカウントのアクセストークンを生成
   * @returns アクセストークン
   */
  public generateAccessToken(): string {
    const jwtToken = this.createSignedJwtToken();
    return this.exchangeJwtForAccessToken(jwtToken);
  }

  /**
   * 署名付きJWTトークンを作成
   * @returns JWTトークン
   */
  private createSignedJwtToken(): string {
    const header = this.createJwtHeader();
    const claims = this.createJwtClaims();

    const headerBase64 = Utilities.base64EncodeWebSafe(JSON.stringify(header));
    const claimsBase64 = Utilities.base64EncodeWebSafe(JSON.stringify(claims));

    const signatureInput = `${headerBase64}.${claimsBase64}`;
    const signature = Utilities.computeRsaSha256Signature(
      signatureInput,
      this.serviceAccountKey.private_key
    );
    const signatureBase64 = Utilities.base64EncodeWebSafe(signature);

    return `${signatureInput}.${signatureBase64}`;
  }

  /**
   * JWTヘッダーを作成
   * @returns JWTヘッダー
   */
  private createJwtHeader(): object {
    return {
      alg: 'RS256',
      typ: 'JWT',
    };
  }

  /**
   * JWTクレームを作成
   * @returns JWTクレーム
   */
  private createJwtClaims(): object {
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const expirationTimestamp = currentTimestamp + 3600;

    return {
      iss: this.serviceAccountKey.client_email,
      scope: 'https://www.googleapis.com/auth/cloud-platform',
      aud: 'https://oauth2.googleapis.com/token',
      exp: expirationTimestamp,
      iat: currentTimestamp,
    };
  }

  /**
   * JWTトークンをアクセストークンに交換
   * @param jwtToken JWTトークン
   * @returns アクセストークン
   */
  private exchangeJwtForAccessToken(jwtToken: string): string {
    const tokenEndpoint = 'https://oauth2.googleapis.com/token';

    const requestOptions: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
      method: 'post',
      payload: {
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwtToken,
      },
    };

    const response = UrlFetchApp.fetch(tokenEndpoint, requestOptions);
    const responseData = JSON.parse(response.getContentText());

    return responseData.access_token;
  }
}