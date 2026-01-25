var global = this;
function doPost() {}

function doGet() {}

function authCallback() {}
(() => {
  // src/config/index.ts
  var CONFIG = {
    LINE_API: {
      REPLY_ENDPOINT: "https://api.line.me/v2/bot/message/reply",
      CONTENT_ENDPOINT: "https://api-data.line.me/v2/bot/message",
      RICH_MENU_ENDPOINT: "https://api.line.me/v2/bot/richmenu"
    },
    SPEECH_TO_TEXT: {
      LOCATION: "global",
      MODEL: "latest_long",
      LANGUAGE_CODE: "ja-JP"
    },
    GEMINI: {
      MODEL: "gemini-2.5-flash-lite",
      ENDPOINT: "https://generativelanguage.googleapis.com/v1beta/models",
      TEMPERATURE: 0.3,
      MAX_OUTPUT_TOKENS: 1024
    },
    CALENDAR: {
      DEFAULT_EVENT_DURATION_HOURS: 1
    },
    COMMANDS: {
      TODAY: ["\u4ECA\u65E5\u306E\u4E88\u5B9A"],
      WEEK: ["\u4ECA\u9031\u306E\u4E88\u5B9A"],
      HELP: ["\u30D8\u30EB\u30D7"],
      LOGOUT: ["\u30ED\u30B0\u30A2\u30A6\u30C8"]
    },
    COLORS: {
      PRIMARY: "#06C755",
      SECONDARY: "#AAAAAA",
      BACKGROUND: "#FFFFFF",
      ACCENT: "#5B82DB",
      TEXT_PRIMARY: "#111111",
      TEXT_SECONDARY: "#666666",
      BORDER: "#EEEEEE",
      SUCCESS: "#06C755",
      WARNING: "#FFCC00",
      GOOGLE_BLUE: "#4285F4"
    },
    OAUTH2: {
      AUTHORIZATION_BASE_URL: "https://accounts.google.com/o/oauth2/v2/auth",
      TOKEN_URL: "https://oauth2.googleapis.com/token",
      SCOPE: "https://www.googleapis.com/auth/calendar",
      CALLBACK_FUNCTION: "authCallback"
    },
    CALENDAR_API: {
      BASE_URL: "https://www.googleapis.com/calendar/v3"
    }
  };

  // src/config/getProperty.ts
  var getScriptProperty = (propertyName) => {
    return PropertiesService.getScriptProperties().getProperty(propertyName);
  };
  var getLineChannelAccessToken = () => {
    return getScriptProperty("CHANNEL_ACCESS_TOKEN");
  };
  var getGcpProjectId = () => {
    return getScriptProperty("GCP_PROJECT_ID");
  };
  var getGeminiApiKey = () => {
    return getScriptProperty("GEMINI_API_KEY");
  };
  var getServiceAccountKey = () => {
    const keyJson = getScriptProperty("SERVICE_ACCOUNT_KEY");
    return JSON.parse(keyJson);
  };
  var getOAuth2ClientId = () => {
    return getScriptProperty("OAUTH2_CLIENT_ID");
  };
  var getOAuth2ClientSecret = () => {
    return getScriptProperty("OAUTH2_CLIENT_SECRET");
  };

  // src/Logger.ts
  var Logger2 = class {
    /**
     * デバッグログを出力
     * @param context - コンテキスト
     * @param message - メッセージ
     */
    static logDebug(context, message) {
      console.log(`${context}: ${message}`);
    }
    /**
     * エラーログを出力
     * @param context - コンテキスト
     * @param error - エラー
     */
    static logError(context, error) {
      console.log(`${context}\u30A8\u30E9\u30FC: ${error}`);
    }
  };

  // src/infra/line/lineMessagingApi.ts
  var fetchAudioContentFromLine = (messageId) => {
    const channelAccessToken = getLineChannelAccessToken();
    const contentUrl = `${CONFIG.LINE_API.CONTENT_ENDPOINT}/${messageId}/content`;
    const requestOptions = {
      method: "get",
      headers: {
        "Authorization": `Bearer ${channelAccessToken}`
      },
      muteHttpExceptions: true
    };
    try {
      const response = UrlFetchApp.fetch(contentUrl, requestOptions);
      return response.getBlob();
    } catch (error) {
      Logger2.logError("LINE\u97F3\u58F0\u30B3\u30F3\u30C6\u30F3\u30C4\u53D6\u5F97", error);
      return null;
    }
  };
  var sendLineTextReply = (replyToken, messageText) => {
    const channelAccessToken = getLineChannelAccessToken();
    const requestBody = {
      replyToken,
      messages: [
        {
          type: "text",
          text: messageText
        }
      ]
    };
    sendLineReplyRequest(channelAccessToken, requestBody);
  };
  var sendLineFlexReply = (replyToken, flexContent) => {
    const channelAccessToken = getLineChannelAccessToken();
    const requestBody = {
      replyToken,
      messages: [
        {
          type: "flex",
          altText: flexContent.altText,
          contents: flexContent.contents
        }
      ]
    };
    sendLineReplyRequest(channelAccessToken, requestBody);
  };
  var sendLineReplyRequest = (channelAccessToken, requestBody) => {
    const requestHeaders = {
      "Content-Type": "application/json; charset=UTF-8",
      "Authorization": `Bearer ${channelAccessToken}`
    };
    const requestOptions = {
      method: "post",
      headers: requestHeaders,
      payload: JSON.stringify(requestBody),
      muteHttpExceptions: true
    };
    const response = UrlFetchApp.fetch(CONFIG.LINE_API.REPLY_ENDPOINT, requestOptions);
    const responseCode = response.getResponseCode();
    if (responseCode !== 200) {
      Logger2.logError("LINE\u8FD4\u4FE1", response.getContentText());
    }
  };

  // src/infra/google/auth.ts
  var generateServiceAccountAccessToken = () => {
    const serviceAccountKey = getServiceAccountKey();
    const jwtToken = createSignedJwtToken(serviceAccountKey);
    return exchangeJwtForAccessToken(jwtToken);
  };
  var createSignedJwtToken = (serviceAccountKey) => {
    const header = createJwtHeader();
    const claims = createJwtClaims(serviceAccountKey.client_email);
    const headerBase64 = Utilities.base64EncodeWebSafe(JSON.stringify(header));
    const claimsBase64 = Utilities.base64EncodeWebSafe(JSON.stringify(claims));
    const signatureInput = `${headerBase64}.${claimsBase64}`;
    const signature = Utilities.computeRsaSha256Signature(signatureInput, serviceAccountKey.private_key);
    const signatureBase64 = Utilities.base64EncodeWebSafe(signature);
    return `${signatureInput}.${signatureBase64}`;
  };
  var createJwtHeader = () => {
    return {
      alg: "RS256",
      typ: "JWT"
    };
  };
  var createJwtClaims = (clientEmail) => {
    const currentTimestamp = Math.floor(Date.now() / 1e3);
    const expirationTimestamp = currentTimestamp + 3600;
    return {
      iss: clientEmail,
      scope: "https://www.googleapis.com/auth/cloud-platform",
      aud: "https://oauth2.googleapis.com/token",
      exp: expirationTimestamp,
      iat: currentTimestamp
    };
  };
  var exchangeJwtForAccessToken = (jwtToken) => {
    const tokenEndpoint = "https://oauth2.googleapis.com/token";
    const requestOptions = {
      method: "post",
      payload: {
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: jwtToken
      }
    };
    const response = UrlFetchApp.fetch(tokenEndpoint, requestOptions);
    const responseData = JSON.parse(response.getContentText());
    return responseData.access_token;
  };

  // src/infra/google/speechToTextApi.ts
  var convertSpeechToText = (audioBlob) => {
    const projectId = getGcpProjectId();
    const accessToken = generateServiceAccountAccessToken();
    const audioContentBase64 = Utilities.base64Encode(audioBlob.getBytes());
    const recognizerPath = buildRecognizerPath(projectId);
    const apiEndpoint = `https://speech.googleapis.com/v2/${recognizerPath}:recognize`;
    const requestBody = buildSpeechToTextRequestBody(audioContentBase64);
    const requestOptions = buildAuthorizedPostRequest(accessToken, requestBody);
    try {
      const response = UrlFetchApp.fetch(apiEndpoint, requestOptions);
      const responseData = JSON.parse(response.getContentText());
      Logger2.logDebug("Speech-to-Text v2 \u30B9\u30C6\u30FC\u30BF\u30B9", response.getResponseCode());
      Logger2.logDebug("Speech-to-Text v2 \u7D50\u679C", JSON.stringify(responseData));
      return extractTranscriptFromSpeechResponse(responseData);
    } catch (error) {
      Logger2.logError("Speech-to-Text v2", error);
      return null;
    }
  };
  var buildRecognizerPath = (projectId) => {
    return `projects/${projectId}/locations/${CONFIG.SPEECH_TO_TEXT.LOCATION}/recognizers/_`;
  };
  var buildSpeechToTextRequestBody = (audioContentBase64) => {
    return {
      config: {
        autoDecodingConfig: {},
        languageCodes: [CONFIG.SPEECH_TO_TEXT.LANGUAGE_CODE],
        model: CONFIG.SPEECH_TO_TEXT.MODEL
      },
      content: audioContentBase64
    };
  };
  var extractTranscriptFromSpeechResponse = (responseData) => {
    if (!responseData.results || responseData.results.length === 0) {
      return null;
    }
    const alternatives = responseData.results[0].alternatives;
    if (!alternatives || alternatives.length === 0) {
      return null;
    }
    return alternatives[0].transcript;
  };
  var buildAuthorizedPostRequest = (accessToken, requestBody) => {
    return {
      method: "post",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      payload: JSON.stringify(requestBody),
      muteHttpExceptions: true
    };
  };

  // src/infra/google/geminiApi.ts
  var extractCalendarEventFromText = (transcribedText) => {
    const geminiApiKey = getGeminiApiKey();
    const prompt = buildEventExtractionPrompt(transcribedText);
    const requestBody = buildGeminiRequestBody(prompt);
    const apiEndpoint = buildGeminiApiEndpoint(geminiApiKey);
    const requestOptions = {
      method: "post",
      headers: {
        "Content-Type": "application/json"
      },
      payload: JSON.stringify(requestBody),
      muteHttpExceptions: true
    };
    try {
      const response = UrlFetchApp.fetch(apiEndpoint, requestOptions);
      const responseData = JSON.parse(response.getContentText());
      Logger2.logDebug("Gemini \u30B9\u30C6\u30FC\u30BF\u30B9", response.getResponseCode());
      Logger2.logDebug("Gemini \u7D50\u679C", JSON.stringify(responseData));
      return parseGeminiResponseToEventData(responseData);
    } catch (error) {
      Logger2.logError("Gemini API", error);
      return null;
    }
  };
  var buildEventExtractionPrompt = (transcribedText) => {
    const todayDescription = formatTodayForPrompt();
    const currentTimeDescription = formatCurrentTimeForPrompt();
    return `\u4EE5\u4E0B\u306E\u97F3\u58F0\u8A8D\u8B58\u30C6\u30AD\u30B9\u30C8\u304B\u3089\u30AB\u30EC\u30F3\u30C0\u30FC\u30A4\u30D9\u30F3\u30C8\u60C5\u5831\u3092\u62BD\u51FA\u3057\u3066\u304F\u3060\u3055\u3044\u3002
\u4ECA\u65E5\u306E\u65E5\u4ED8\u306F${todayDescription}\u3001\u73FE\u5728\u6642\u523B\u306F${currentTimeDescription}\u3067\u3059\u3002

\u97F3\u58F0\u8A8D\u8B58\u30C6\u30AD\u30B9\u30C8: "${transcribedText}"

\u4EE5\u4E0B\u306EJSON\u5F62\u5F0F\u3067\u51FA\u529B\u3057\u3066\u304F\u3060\u3055\u3044\uFF1A
{
  "title": "\u30A4\u30D9\u30F3\u30C8\u306E\u30BF\u30A4\u30C8\u30EB\uFF08\u7C21\u6F54\u306B\u3001\u7D75\u6587\u5B57\u30921\u3064\u542B\u3081\u3066\u9B45\u529B\u7684\u306B\uFF09",
  "startTime": "YYYY-MM-DDTHH:MM:00+09:00",
  "endTime": "YYYY-MM-DDTHH:MM:00+09:00",
  "description": "\u8A73\u7D30\u8AAC\u660E\uFF08\u5143\u306E\u30C6\u30AD\u30B9\u30C8\u3092\u542B\u3081\u3066\u88DC\u8DB3\u60C5\u5831\u3082\uFF09"
}

\u30EB\u30FC\u30EB\uFF1A
- \u958B\u59CB\u6642\u523B\u304C\u6307\u5B9A\u3055\u308C\u3066\u3044\u306A\u3044\u5834\u5408\u306F\u3001\u73FE\u5728\u6642\u523B\u309215\u5206\u5358\u4F4D\u3067\u5207\u308A\u4E0A\u3052\u305F\u6642\u523B\u306B\u3059\u308B\uFF08\u4F8B: 9:03\u21929:15\u30019:47\u219210:00\u30019:00\u21929:00\uFF09
- \u7D42\u4E86\u6642\u523B\u306E\u6C7A\u5B9A\u65B9\u6CD5\uFF1A
  - \u300C2\u6642\u9593\u300D\u300C30\u5206\u300D\u306A\u3069\u6240\u8981\u6642\u9593\u304C\u6307\u5B9A\u3055\u308C\u305F\u5834\u5408\u306F\u3001\u958B\u59CB\u6642\u523B\u306B\u305D\u306E\u6642\u9593\u3092\u52A0\u7B97\u3059\u308B
  - \u300C14\u6642\u307E\u3067\u300D\u306A\u3069\u7D42\u4E86\u6642\u523B\u304C\u660E\u793A\u3055\u308C\u305F\u5834\u5408\u306F\u3001\u305D\u306E\u6642\u523B\u3092\u4F7F\u7528\u3059\u308B
  - \u3069\u3061\u3089\u3082\u6307\u5B9A\u3055\u308C\u3066\u3044\u306A\u3044\u5834\u5408\u306F\u3001\u958B\u59CB\u6642\u523B\u306E1\u6642\u9593\u5F8C\u306B\u3059\u308B
- \u300C\u660E\u65E5\u300D\u300C\u6765\u9031\u300D\u306A\u3069\u306E\u76F8\u5BFE\u7684\u306A\u65E5\u4ED8\u8868\u73FE\u3092\u6B63\u78BA\u306B\u5909\u63DB\u3059\u308B
- \u30BF\u30A4\u30C8\u30EB\u306F30\u6587\u5B57\u4EE5\u5185\u3067\u3001\u5185\u5BB9\u3092\u7AEF\u7684\u306B\u8868\u73FE\u3059\u308B
- description\u306B\u306F\u5143\u306E\u97F3\u58F0\u5185\u5BB9\u3092\u3082\u3068\u306B\u8981\u7D04\u3092\u66F8\u3044\u3066\u4E0B\u3055\u3044\u3002
- \u30A4\u30D9\u30F3\u30C8\u60C5\u5831\u304C\u542B\u307E\u308C\u3066\u3044\u306A\u3044\u5834\u5408\u306Fnull\u3092\u8FD4\u3059
- \u30BF\u30A4\u30C8\u30EB\u3084\u8AAC\u660E\u6587\u306B\u7D75\u6587\u5B57\u306F\u4F7F\u7528\u3057\u306A\u3044

JSON\u5F62\u5F0F\u306E\u307F\u3092\u8FD4\u3057\u3001\u4ED6\u306E\u8AAC\u660E\u306F\u4E00\u5207\u4E0D\u8981\u3067\u3059\u3002`;
  };
  var formatTodayForPrompt = () => {
    const today = /* @__PURE__ */ new Date();
    const dayNames = ["\u65E5", "\u6708", "\u706B", "\u6C34", "\u6728", "\u91D1", "\u571F"];
    const dayOfWeek = dayNames[today.getDay()];
    return `${today.getFullYear()}\u5E74${today.getMonth() + 1}\u6708${today.getDate()}\u65E5(${dayOfWeek}\u66DC\u65E5)`;
  };
  var formatCurrentTimeForPrompt = () => {
    const now = /* @__PURE__ */ new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    return `${hour}\u6642${minute}\u5206`;
  };
  var buildGeminiRequestBody = (prompt) => {
    return {
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ],
      generationConfig: {
        temperature: CONFIG.GEMINI.TEMPERATURE,
        maxOutputTokens: CONFIG.GEMINI.MAX_OUTPUT_TOKENS
      }
    };
  };
  var buildGeminiApiEndpoint = (apiKey) => {
    return `${CONFIG.GEMINI.ENDPOINT}/${CONFIG.GEMINI.MODEL}:generateContent?key=${apiKey}`;
  };
  var parseGeminiResponseToEventData = (responseData) => {
    var _a, _b, _c, _d, _e;
    try {
      const generatedText = (_e = (_d = (_c = (_b = (_a = responseData == null ? void 0 : responseData.candidates) == null ? void 0 : _a[0]) == null ? void 0 : _b.content) == null ? void 0 : _c.parts) == null ? void 0 : _d[0]) == null ? void 0 : _e.text;
      if (!generatedText) {
        return null;
      }
      const jsonString = extractJsonFromText(generatedText);
      Logger2.logDebug("\u62BD\u51FA\u3055\u308C\u305FJSON", jsonString);
      const eventData = JSON.parse(jsonString);
      return isValidEventData(eventData) ? eventData : null;
    } catch (error) {
      Logger2.logError("Gemini \u30EC\u30B9\u30DD\u30F3\u30B9\u89E3\u6790", error);
      return null;
    }
  };
  var extractJsonFromText = (text) => {
    let cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const jsonStartIndex = cleanedText.indexOf("{");
    const jsonEndIndex = cleanedText.lastIndexOf("}");
    if (jsonStartIndex === -1 || jsonEndIndex === -1) {
      return cleanedText;
    }
    return cleanedText.substring(jsonStartIndex, jsonEndIndex + 1);
  };
  var isValidEventData = (eventData) => {
    return eventData && typeof eventData.title === "string" && eventData.title.length > 0;
  };

  // src/infra/google/OAuth2Manager.ts
  var OAuth2Manager = class {
    /**
     * @param userId LINEユーザーID
     * @param clientId OAuth2クライアントID
     * @param clientSecret OAuth2クライアントシークレット
     */
    constructor(userId, clientId, clientSecret) {
      this.userId = userId;
      this.clientId = clientId;
      this.clientSecret = clientSecret;
    }
    /**
     * ユーザーが有効なトークンを持っているか確認
     */
    hasValidToken() {
      return this.createService(false).hasAccess();
    }
    /**
     * 認証URLを取得
     * stateパラメータにuserIdを埋め込む（ライブラリが自動的に暗号化）
     * コールバック時にrequest.parameter.userIdとして取得可能
     * @param forceConsent 強制的に同意画面を表示するか
     */
    getAuthorizationUrl(forceConsent = false) {
      return this.createService(forceConsent).getAuthorizationUrl({ userId: this.userId });
    }
    /**
     * アクセストークンを取得
     * トークンが期限切れの場合は自動的にリフレッシュ
     */
    getAccessToken() {
      const service = this.createService(false);
      return service.hasAccess() ? service.getAccessToken() : null;
    }
    /**
     * トークンをリセット（ログアウト）
     */
    revokeToken() {
      this.createService(false).reset();
    }
    /**
     * OAuth2コールバックを処理
     * @param request GETリクエスト
     * @returns 認証結果
     */
    handleCallback(request) {
      const service = this.createService(false);
      const authorized = service.handleCallback(request);
      if (authorized) {
        console.log(`[OAuth2] Authorization successful for user: ${this.userId}`);
        return { success: true };
      }
      const error = service.getLastError();
      console.error(`[OAuth2] Authorization failed for user: ${this.userId}, error: ${error}`);
      return { success: false, error: error || "\u8A8D\u8A3C\u304C\u62D2\u5426\u3055\u308C\u307E\u3057\u305F" };
    }
    /**
     * ユーザー専用のOAuth2サービスを作成
     * サービス名にuserIdを含めることで、ユーザーごとに別々のトークンを管理
     * @param forceConsent 強制的に同意画面を表示するか
     */
    createService(forceConsent) {
      const service = OAuth2.createService(`calendar-${this.userId}`).setAuthorizationBaseUrl(CONFIG.OAUTH2.AUTHORIZATION_BASE_URL).setTokenUrl(CONFIG.OAUTH2.TOKEN_URL).setClientId(this.clientId).setClientSecret(this.clientSecret).setCallbackFunction(CONFIG.OAUTH2.CALLBACK_FUNCTION).setPropertyStore(PropertiesService.getScriptProperties()).setScope(CONFIG.OAUTH2.SCOPE).setParam("access_type", "offline");
      if (forceConsent) {
        service.setParam("prompt", "consent");
      }
      return service;
    }
  };

  // src/infra/google/userCalendarApi.ts
  var CALENDAR_API_BASE = CONFIG.CALENDAR_API.BASE_URL;
  var createUserCalendarEvent = (userId, eventData) => {
    const oauth2Service = new OAuth2Manager(
      userId,
      getOAuth2ClientId(),
      getOAuth2ClientSecret()
    );
    const accessToken = oauth2Service.getAccessToken();
    if (!accessToken) {
      Logger2.logError("\u30AB\u30EC\u30F3\u30C0\u30FC\u30A4\u30D9\u30F3\u30C8\u4F5C\u6210", "\u30A2\u30AF\u30BB\u30B9\u30C8\u30FC\u30AF\u30F3\u304C\u3042\u308A\u307E\u305B\u3093");
      return { success: false, error: "NO_TOKEN", requiresReauth: true };
    }
    const endpoint = `${CALENDAR_API_BASE}/calendars/primary/events`;
    const calendarEvent = {
      summary: eventData.title,
      description: eventData.description || "",
      start: {
        dateTime: eventData.startTime,
        timeZone: "Asia/Tokyo"
      },
      end: {
        dateTime: eventData.endTime,
        timeZone: "Asia/Tokyo"
      }
    };
    const options = {
      method: "post",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      payload: JSON.stringify(calendarEvent),
      muteHttpExceptions: true
    };
    try {
      const response = UrlFetchApp.fetch(endpoint, options);
      const responseCode = response.getResponseCode();
      switch (responseCode) {
        case 200:
        case 201: {
          const result = JSON.parse(response.getContentText());
          Logger2.logDebug("\u30AB\u30EC\u30F3\u30C0\u30FC\u30A4\u30D9\u30F3\u30C8\u4F5C\u6210\u6210\u529F", result.id);
          return { success: true, eventId: result.id };
        }
        case 401:
          oauth2Service.revokeToken();
          return { success: false, error: "TOKEN_EXPIRED", requiresReauth: true };
        case 403:
          return { success: false, error: "ACCESS_DENIED", requiresReauth: true };
        case 429:
          return { success: false, error: "RATE_LIMITED", requiresReauth: false };
        default:
          Logger2.logError("\u30AB\u30EC\u30F3\u30C0\u30FC\u30A4\u30D9\u30F3\u30C8\u4F5C\u6210", response.getContentText());
          return { success: false, error: "API_ERROR", requiresReauth: false };
      }
    } catch (error) {
      Logger2.logError("\u30AB\u30EC\u30F3\u30C0\u30FC\u30A4\u30D9\u30F3\u30C8\u4F5C\u6210", error);
      return { success: false, error: String(error), requiresReauth: false };
    }
  };
  var getUserTodayEvents = (userId) => {
    const oauth2Service = new OAuth2Manager(
      userId,
      getOAuth2ClientId(),
      getOAuth2ClientSecret()
    );
    const accessToken = oauth2Service.getAccessToken();
    if (!accessToken) {
      Logger2.logError("\u4ECA\u65E5\u306E\u4E88\u5B9A\u53D6\u5F97", "\u30A2\u30AF\u30BB\u30B9\u30C8\u30FC\u30AF\u30F3\u304C\u3042\u308A\u307E\u305B\u3093");
      return [];
    }
    const today = /* @__PURE__ */ new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
    return fetchUserEvents(accessToken, startOfDay, endOfDay);
  };
  var getUserWeekEvents = (userId) => {
    const oauth2Service = new OAuth2Manager(
      userId,
      getOAuth2ClientId(),
      getOAuth2ClientSecret()
    );
    const accessToken = oauth2Service.getAccessToken();
    if (!accessToken) {
      Logger2.logError("\u9031\u9593\u4E88\u5B9A\u53D6\u5F97", "\u30A2\u30AF\u30BB\u30B9\u30C8\u30FC\u30AF\u30F3\u304C\u3042\u308A\u307E\u305B\u3093");
      return {};
    }
    const today = /* @__PURE__ */ new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
    const endOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7, 23, 59, 59);
    const events = fetchUserEvents(accessToken, startOfToday, endOfWeek);
    const eventsByDate = {};
    for (let i = 0; i < 7; i++) {
      const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
      const dateKey = formatDateKey(date);
      eventsByDate[dateKey] = { date, events: [] };
    }
    events.forEach((event) => {
      const eventDate = new Date(event.startTime);
      const dateKey = formatDateKey(eventDate);
      if (eventsByDate[dateKey]) {
        eventsByDate[dateKey].events.push(event);
      }
    });
    return eventsByDate;
  };
  var fetchUserEvents = (accessToken, timeMin, timeMax) => {
    const endpoint = `${CALENDAR_API_BASE}/calendars/primary/events`;
    const params = [
      `timeMin=${encodeURIComponent(timeMin.toISOString())}`,
      `timeMax=${encodeURIComponent(timeMax.toISOString())}`,
      "singleEvents=true",
      "orderBy=startTime"
    ].join("&");
    const options = {
      method: "get",
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      muteHttpExceptions: true
    };
    try {
      const response = UrlFetchApp.fetch(`${endpoint}?${params}`, options);
      const responseCode = response.getResponseCode();
      if (responseCode !== 200) {
        Logger2.logError("\u30A4\u30D9\u30F3\u30C8\u53D6\u5F97", response.getContentText());
        return [];
      }
      const result = JSON.parse(response.getContentText());
      return (result.items || []).map((item) => ({
        id: item.id,
        title: item.summary || "(\u30BF\u30A4\u30C8\u30EB\u306A\u3057)",
        startTime: new Date(item.start.dateTime || item.start.date),
        endTime: new Date(item.end.dateTime || item.end.date),
        isAllDay: !item.start.dateTime
      }));
    } catch (error) {
      Logger2.logError("\u30A4\u30D9\u30F3\u30C8\u53D6\u5F97", error);
      return [];
    }
  };
  var buildUserCalendarEventUrl = (eventId) => {
    const cleanEventId = eventId.split("_")[0];
    const eidString = `${cleanEventId} primary`;
    const eid = Utilities.base64Encode(eidString).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    return `https://www.google.com/calendar/event?eid=${eid}`;
  };
  var formatDateKey = (date) => {
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  };

  // src/constants/message.ts
  var MESSAGE = {
    AUTH_REQUIRED: "Google\u30AB\u30EC\u30F3\u30C0\u30FC\u3068\u306E\u9023\u643A\u304C\u5FC5\u8981\u3067\u3059\u3002\n\u4E0B\u306E\u30DC\u30BF\u30F3\u3092\u30BF\u30C3\u30D7\u3057\u3066\u8A8D\u8A3C\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
    AUTH_SUCCESS: "\u8A8D\u8A3C\u304C\u5B8C\u4E86\u3057\u307E\u3057\u305F\uFF01\n\u97F3\u58F0\u30E1\u30C3\u30BB\u30FC\u30B8\u3067\u4E88\u5B9A\u3092\u767B\u9332\u3067\u304D\u307E\u3059\u3002",
    AUTH_FAILED: "\u8A8D\u8A3C\u306B\u5931\u6557\u3057\u307E\u3057\u305F\u3002\u3082\u3046\u4E00\u5EA6\u304A\u8A66\u3057\u304F\u3060\u3055\u3044\u3002",
    AUTH_REVOKED: "Google\u30AB\u30EC\u30F3\u30C0\u30FC\u3068\u306E\u9023\u643A\u3092\u89E3\u9664\u3057\u307E\u3057\u305F\u3002",
    REQUEST_AUDIO: "\u97F3\u58F0\u30E1\u30C3\u30BB\u30FC\u30B8\u3092\u9001\u4FE1\u3057\u3066\u304F\u3060\u3055\u3044\n\n\u307E\u305F\u306F\u4EE5\u4E0B\u306E\u30B3\u30DE\u30F3\u30C9\u3092\u30C6\u30AD\u30B9\u30C8\u3067\u9001\u4FE1\uFF1A\n\u30FB\u300C\u4ECA\u65E5\u306E\u4E88\u5B9A\u300D\n\u30FB\u300C\u4ECA\u9031\u306E\u4E88\u5B9A\u300D",
    AUDIO_FETCH_FAILED: "\u97F3\u58F0\u306E\u53D6\u5F97\u306B\u5931\u6557\u3057\u307E\u3057\u305F",
    SPEECH_RECOGNITION_FAILED: "\u97F3\u58F0\u306E\u8A8D\u8B58\u306B\u5931\u6557\u3057\u307E\u3057\u305F",
    CALENDAR_CREATION_FAILED: "\u30AB\u30EC\u30F3\u30C0\u30FC\u3078\u306E\u8FFD\u52A0\u306B\u5931\u6557\u3057\u307E\u3057\u305F",
    EVENT_EXTRACTION_FAILED: (transcribedText) => `\u300C${transcribedText}\u300D

\u30A4\u30D9\u30F3\u30C8\u60C5\u5831\u3092\u62BD\u51FA\u3067\u304D\u307E\u305B\u3093\u3067\u3057\u305F\u3002\u65E5\u4ED8\u3001\u6642\u523B\u3001\u5185\u5BB9\u3092\u542B\u3081\u3066\u8A71\u3057\u3066\u304F\u3060\u3055\u3044\u3002`,
    NO_EVENTS_TODAY: "\u4ECA\u65E5\u306E\u4E88\u5B9A\u306F\u3042\u308A\u307E\u305B\u3093",
    NO_EVENTS_WEEK: "\u4ECA\u9031\u306E\u4E88\u5B9A\u306F\u3042\u308A\u307E\u305B\u3093",
    HELP: {
      TITLE: "Voice Calendar\u306E\u4F7F\u3044\u65B9",
      SECTIONS: [
        {
          title: "\u4E88\u5B9A\u3092\u767B\u9332\u3059\u308B",
          icon: "\u{1F3A4}",
          items: [
            "\u97F3\u58F0\u30E1\u30C3\u30BB\u30FC\u30B8\u3067\u4E88\u5B9A\u3092\u8A71\u3057\u3066\u304F\u3060\u3055\u3044",
            "\u3010\u57FA\u672C\u7684\u306A\u4F7F\u3044\u65B9\u3011",
            "\u4F8B\uFF1A\u300C\u660E\u65E5\u306E10\u6642\u304B\u3089\u4F1A\u8B70\u300D",
            "\u4F8B\uFF1A\u300C\u6765\u9031\u6708\u66DC14\u6642\u304B\u30892\u6642\u9593\u6253\u3061\u5408\u308F\u305B\u300D",
            "\u4F8B\uFF1A\u300C1\u670825\u65E5\u306E15\u6642\u304B\u3089\u6B6F\u533B\u8005\u300D",
            "\u3010\u65E5\u4ED8\u306E\u6307\u5B9A\u3011",
            "\u30FB\u6307\u5B9A\u306A\u3057 \u2192 \u4ECA\u65E5\u306E\u4E88\u5B9A\u3068\u3057\u3066\u767B\u9332",
            "\u30FB\u300C\u660E\u65E5\u300D\u300C\u6765\u9031\u6708\u66DC\u300D\u306A\u3069\u76F8\u5BFE\u7684\u306A\u8868\u73FE\u3082OK",
            "\u30FB\u300C1\u670825\u65E5\u300D\u306E\u3088\u3046\u306A\u5177\u4F53\u7684\u306A\u65E5\u4ED8\u3082OK",
            "\u3010\u6642\u523B\u306E\u6307\u5B9A\u3011",
            "\u30FB\u6307\u5B9A\u306A\u3057 \u2192 \u73FE\u5728\u6642\u523B\u309215\u5206\u5358\u4F4D\u3067\u5207\u308A\u4E0A\u3052",
            "\u3000(\u4F8B: 9:03\u21929:15\u30019:47\u219210:00)",
            "\u30FB\u958B\u59CB\u6642\u523B\u306E\u307F\u6307\u5B9A \u2192 1\u6642\u9593\u306E\u4E88\u5B9A\u3068\u3057\u3066\u767B\u9332",
            "\u30FB\u300C2\u6642\u9593\u300D\u306A\u3069\u6642\u9593\u3092\u6307\u5B9A \u2192 \u305D\u306E\u9577\u3055\u3067\u767B\u9332",
            "\u30FB\u300C14\u6642\u307E\u3067\u300D\u306A\u3069\u7D42\u4E86\u6642\u523B\u3092\u6307\u5B9A \u2192 \u305D\u306E\u6642\u523B\u307E\u3067"
          ]
        },
        {
          title: "\u4E88\u5B9A\u3092\u78BA\u8A8D\u3059\u308B",
          icon: "\u{1F4C5}",
          items: [
            "\u300C\u4ECA\u65E5\u306E\u4E88\u5B9A\u300D\u2192 \u4ECA\u65E5\u306E\u4E88\u5B9A\u4E00\u89A7",
            "\u300C\u4ECA\u9031\u306E\u4E88\u5B9A\u300D\u2192 \u76F4\u8FD17\u65E5\u9593\u306E\u4E88\u5B9A"
          ]
        },
        {
          title: "\u305D\u306E\u4ED6",
          icon: "\u{1F4A1}",
          items: [
            "\u300C\u30D8\u30EB\u30D7\u300D\u2192 \u3053\u306E\u4F7F\u3044\u65B9\u3092\u8868\u793A",
            "\u300C\u30ED\u30B0\u30A2\u30A6\u30C8\u300D\u2192 Google\u30AB\u30EC\u30F3\u30C0\u30FC\u3068\u306E\u9023\u643A\u3092\u89E3\u9664"
          ]
        }
      ]
    }
  };

  // src/infra/line/flexMessageFactory.ts
  var buildEventCreatedFlexMessage = (eventData, eventUrl) => {
    const startDate = new Date(eventData.startTime);
    const endDate = new Date(eventData.endTime);
    const dateText = formatDateForFlex(startDate);
    const timeText = `${formatTimeForFlex(startDate)} \u301C ${formatTimeForFlex(endDate)}`;
    return {
      altText: `\u2705 \u30A4\u30D9\u30F3\u30C8\u3092\u4F5C\u6210\u3057\u307E\u3057\u305F: ${eventData.title}`,
      contents: {
        type: "bubble",
        size: "kilo",
        header: {
          type: "box",
          layout: "horizontal",
          contents: [
            {
              type: "text",
              text: "\u2705",
              size: "lg",
              flex: 0
            },
            {
              type: "text",
              text: "\u30A4\u30D9\u30F3\u30C8\u3092\u4F5C\u6210\u3057\u307E\u3057\u305F",
              size: "md",
              weight: "bold",
              color: CONFIG.COLORS.TEXT_PRIMARY,
              margin: "sm",
              flex: 1
            }
          ],
          backgroundColor: "#F0FFF0",
          paddingAll: "lg"
        },
        body: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "text",
              text: eventData.title,
              size: "lg",
              weight: "bold",
              color: CONFIG.COLORS.TEXT_PRIMARY,
              wrap: true
            },
            {
              type: "separator",
              margin: "lg"
            },
            {
              type: "box",
              layout: "horizontal",
              contents: [
                {
                  type: "text",
                  text: "\u{1F4C5}",
                  size: "sm",
                  flex: 0
                },
                {
                  type: "text",
                  text: dateText,
                  size: "sm",
                  color: CONFIG.COLORS.TEXT_SECONDARY,
                  margin: "sm",
                  flex: 1
                }
              ],
              margin: "lg"
            },
            {
              type: "box",
              layout: "horizontal",
              contents: [
                {
                  type: "text",
                  text: "\u{1F552}",
                  size: "sm",
                  flex: 0
                },
                {
                  type: "text",
                  text: timeText,
                  size: "sm",
                  color: CONFIG.COLORS.TEXT_SECONDARY,
                  margin: "sm",
                  flex: 1
                }
              ],
              margin: "sm"
            }
          ],
          paddingAll: "lg"
        },
        footer: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "button",
              action: {
                type: "uri",
                label: "\u30AB\u30EC\u30F3\u30C0\u30FC\u3067\u898B\u308B",
                uri: eventUrl + (eventUrl.includes("?") ? "&" : "?") + "openExternalBrowser=1"
              },
              style: "primary",
              color: CONFIG.COLORS.PRIMARY
            }
          ],
          paddingAll: "lg"
        }
      }
    };
  };
  var buildTodayEventsFlexMessage = (events) => {
    const today = /* @__PURE__ */ new Date();
    const dayNames = ["\u65E5", "\u6708", "\u706B", "\u6C34", "\u6728", "\u91D1", "\u571F"];
    const dateText = `${today.getMonth() + 1}/${today.getDate()}\uFF08${dayNames[today.getDay()]}\uFF09`;
    if (events.length === 0) {
      return buildNoEventsFlexMessage("\u4ECA\u65E5\u306E\u4E88\u5B9A", dateText, MESSAGE.NO_EVENTS_TODAY);
    }
    events.sort((a, b) => a.startTime - b.startTime);
    const eventContents = events.map((event) => buildEventRowContent(event));
    return {
      altText: `\u{1F4C5} \u4ECA\u65E5\u306E\u4E88\u5B9A\uFF08${events.length}\u4EF6\uFF09`,
      contents: {
        type: "bubble",
        size: "mega",
        header: {
          type: "box",
          layout: "horizontal",
          contents: [
            {
              type: "text",
              text: "\u{1F4C5}",
              size: "xl",
              flex: 0
            },
            {
              type: "box",
              layout: "vertical",
              contents: [
                {
                  type: "text",
                  text: "\u4ECA\u65E5\u306E\u4E88\u5B9A",
                  size: "lg",
                  weight: "bold",
                  color: "#FFFFFF"
                },
                {
                  type: "text",
                  text: dateText,
                  size: "sm",
                  color: "#FFFFFFBB"
                }
              ],
              margin: "md",
              flex: 1
            }
          ],
          backgroundColor: CONFIG.COLORS.PRIMARY,
          paddingAll: "lg"
        },
        body: {
          type: "box",
          layout: "vertical",
          contents: eventContents,
          paddingAll: "lg",
          spacing: "md"
        },
        footer: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "text",
              text: `${events.length}\u4EF6\u306E\u4E88\u5B9A`,
              size: "sm",
              color: CONFIG.COLORS.TEXT_SECONDARY,
              align: "center"
            }
          ],
          paddingAll: "md"
        }
      }
    };
  };
  var buildEventRowContent = (event) => {
    const timeText = event.isAllDay ? "\u7D42\u65E5" : formatTimeForFlex(event.startTime);
    return {
      type: "box",
      layout: "horizontal",
      contents: [
        {
          type: "text",
          text: timeText,
          size: "sm",
          color: CONFIG.COLORS.ACCENT,
          weight: "bold",
          flex: 0
        },
        {
          type: "text",
          text: event.title,
          size: "sm",
          color: CONFIG.COLORS.TEXT_PRIMARY,
          wrap: true,
          margin: "lg",
          flex: 1
        }
      ],
      paddingAll: "sm",
      backgroundColor: "#F8F8F8",
      cornerRadius: "md"
    };
  };
  var buildWeekEventsFlexMessage = (eventsByDate) => {
    const dateKeys = Object.keys(eventsByDate);
    let totalEvents = 0;
    dateKeys.forEach((key) => {
      totalEvents += eventsByDate[key].events.length;
    });
    if (totalEvents === 0) {
      return buildNoEventsFlexMessage("\u4ECA\u9031\u306E\u4E88\u5B9A", "\u76F4\u8FD17\u65E5\u9593", MESSAGE.NO_EVENTS_WEEK);
    }
    const dayContents = dateKeys.map((dateKey) => {
      const dayData = eventsByDate[dateKey];
      const date = dayData.date;
      const events = dayData.events;
      const isToday = isSameDay(date, /* @__PURE__ */ new Date());
      return buildDayRowContent(date, events, isToday);
    });
    return {
      altText: `\u{1F4C5} \u4ECA\u9031\u306E\u4E88\u5B9A\uFF08${totalEvents}\u4EF6\uFF09`,
      contents: {
        type: "bubble",
        size: "mega",
        header: {
          type: "box",
          layout: "horizontal",
          contents: [
            {
              type: "text",
              text: "\u{1F4C5}",
              size: "xl",
              flex: 0
            },
            {
              type: "box",
              layout: "vertical",
              contents: [
                {
                  type: "text",
                  text: "\u4ECA\u9031\u306E\u4E88\u5B9A",
                  size: "lg",
                  weight: "bold",
                  color: "#FFFFFF"
                },
                {
                  type: "text",
                  text: "\u76F4\u8FD17\u65E5\u9593",
                  size: "sm",
                  color: "#FFFFFFBB"
                }
              ],
              margin: "md",
              flex: 1
            }
          ],
          backgroundColor: CONFIG.COLORS.ACCENT,
          paddingAll: "lg"
        },
        body: {
          type: "box",
          layout: "vertical",
          contents: dayContents,
          paddingAll: "lg",
          spacing: "sm"
        },
        footer: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "text",
              text: `\u5408\u8A08 ${totalEvents}\u4EF6\u306E\u4E88\u5B9A`,
              size: "sm",
              color: CONFIG.COLORS.TEXT_SECONDARY,
              align: "center"
            }
          ],
          paddingAll: "md"
        }
      }
    };
  };
  var buildDayRowContent = (date, events, isToday) => {
    const dayNames = ["\u65E5", "\u6708", "\u706B", "\u6C34", "\u6728", "\u91D1", "\u571F"];
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayOfWeek = dayNames[date.getDay()];
    const dateText = `${month}/${day}\uFF08${dayOfWeek}\uFF09`;
    const eventCount = events.length;
    const countText = eventCount === 0 ? "\u2212" : `${eventCount}\u4EF6`;
    const eventSummary = eventCount === 0 ? "\u4E88\u5B9A\u306A\u3057" : events.slice(0, 2).map((e) => e.title).join(", ").substring(0, 20) + (events.slice(0, 2).map((e) => e.title).join(", ").length > 20 || eventCount > 2 ? "..." : "");
    const backgroundColor = isToday ? "#E8F5E9" : "#F8F8F8";
    const dateColor = isToday ? CONFIG.COLORS.PRIMARY : CONFIG.COLORS.TEXT_PRIMARY;
    return {
      type: "box",
      layout: "horizontal",
      contents: [
        {
          type: "text",
          text: dateText,
          size: "sm",
          weight: "bold",
          color: dateColor,
          flex: 0
        },
        {
          type: "text",
          text: countText,
          size: "sm",
          color: eventCount === 0 ? CONFIG.COLORS.SECONDARY : CONFIG.COLORS.ACCENT,
          weight: eventCount === 0 ? "regular" : "bold",
          margin: "lg",
          flex: 0
        },
        {
          type: "text",
          text: eventSummary,
          size: "xs",
          color: CONFIG.COLORS.TEXT_SECONDARY,
          wrap: false,
          margin: "md",
          flex: 1
        }
      ],
      paddingAll: "md",
      backgroundColor,
      cornerRadius: "md"
    };
  };
  var buildNoEventsFlexMessage = (title, subtitle, message) => {
    return {
      altText: message,
      contents: {
        type: "bubble",
        size: "kilo",
        body: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "text",
              text: "\u{1F4C5}",
              size: "3xl",
              align: "center"
            },
            {
              type: "text",
              text: title,
              size: "lg",
              weight: "bold",
              align: "center",
              margin: "lg",
              color: CONFIG.COLORS.TEXT_PRIMARY
            },
            {
              type: "text",
              text: subtitle,
              size: "sm",
              align: "center",
              color: CONFIG.COLORS.TEXT_SECONDARY
            },
            {
              type: "separator",
              margin: "xl"
            },
            {
              type: "text",
              text: message,
              size: "md",
              align: "center",
              margin: "xl",
              color: CONFIG.COLORS.TEXT_SECONDARY
            }
          ],
          paddingAll: "xl"
        }
      }
    };
  };
  var buildHelpFlexMessage = () => {
    const helpData = MESSAGE.HELP;
    const sectionContents = helpData.SECTIONS.flatMap((section, index) => {
      const sectionBox = {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "box",
            layout: "horizontal",
            contents: [
              {
                type: "text",
                text: section.icon,
                size: "md",
                flex: 0
              },
              {
                type: "text",
                text: section.title,
                size: "md",
                weight: "bold",
                color: CONFIG.COLORS.TEXT_PRIMARY,
                margin: "sm",
                flex: 1
              }
            ]
          },
          {
            type: "box",
            layout: "vertical",
            contents: section.items.map((item) => ({
              type: "text",
              text: item,
              size: "sm",
              color: CONFIG.COLORS.TEXT_SECONDARY,
              wrap: true,
              margin: "sm"
            })),
            margin: "sm",
            paddingStart: "lg"
          }
        ],
        margin: index === 0 ? "none" : "xl"
      };
      return sectionBox;
    });
    return {
      altText: "Voical\u306E\u4F7F\u3044\u65B9",
      contents: {
        type: "bubble",
        size: "mega",
        header: {
          type: "box",
          layout: "horizontal",
          contents: [
            {
              type: "text",
              text: "\u2753",
              size: "xl",
              flex: 0
            },
            {
              type: "text",
              text: helpData.TITLE,
              size: "lg",
              weight: "bold",
              color: "#FFFFFF",
              margin: "md",
              flex: 1
            }
          ],
          backgroundColor: "#7B7B7B",
          paddingAll: "lg"
        },
        body: {
          type: "box",
          layout: "vertical",
          contents: sectionContents,
          paddingAll: "lg"
        }
      }
    };
  };
  var formatDateForFlex = (date) => {
    const dayNames = ["\u65E5", "\u6708", "\u706B", "\u6C34", "\u6728", "\u91D1", "\u571F"];
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayOfWeek = dayNames[date.getDay()];
    return `${month}\u6708${day}\u65E5\uFF08${dayOfWeek}\uFF09`;
  };
  var formatTimeForFlex = (date) => {
    const hour = date.getHours();
    const minute = date.getMinutes().toString().padStart(2, "0");
    return `${hour}:${minute}`;
  };
  var isSameDay = (date1, date2) => {
    return date1.getFullYear() === date2.getFullYear() && date1.getMonth() === date2.getMonth() && date1.getDate() === date2.getDate();
  };
  var buildAuthRequiredFlexMessage = (authUrl) => {
    return {
      altText: "Google\u30AB\u30EC\u30F3\u30C0\u30FC\u3068\u306E\u9023\u643A\u304C\u5FC5\u8981\u3067\u3059",
      contents: {
        type: "bubble",
        size: "kilo",
        body: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "text",
              text: "\u{1F510}",
              size: "3xl",
              align: "center"
            },
            {
              type: "text",
              text: "\u30AB\u30EC\u30F3\u30C0\u30FC\u9023\u643A",
              size: "lg",
              weight: "bold",
              align: "center",
              margin: "lg",
              color: CONFIG.COLORS.TEXT_PRIMARY
            },
            {
              type: "text",
              text: "Google\u30AB\u30EC\u30F3\u30C0\u30FC\u3068\u306E\u9023\u643A\u304C\u5FC5\u8981\u3067\u3059\u3002\n\u4E0B\u306E\u30DC\u30BF\u30F3\u3092\u30BF\u30C3\u30D7\u3057\u3066\u8A8D\u8A3C\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
              size: "sm",
              color: CONFIG.COLORS.TEXT_SECONDARY,
              wrap: true,
              align: "center",
              margin: "lg"
            }
          ],
          paddingAll: "xl"
        },
        footer: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "button",
              action: {
                type: "uri",
                label: "Google\u30A2\u30AB\u30A6\u30F3\u30C8\u3067\u9023\u643A",
                uri: authUrl + (authUrl.includes("?") ? "&" : "?") + "openExternalBrowser=1"
              },
              style: "primary",
              color: CONFIG.COLORS.GOOGLE_BLUE
            }
          ],
          paddingAll: "lg"
        }
      }
    };
  };
  var buildReauthRequiredFlexMessage = (authUrl) => {
    return {
      altText: "\u518D\u8A8D\u8A3C\u304C\u5FC5\u8981\u3067\u3059",
      contents: {
        type: "bubble",
        size: "kilo",
        body: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "text",
              text: "\u{1F504}",
              size: "3xl",
              align: "center"
            },
            {
              type: "text",
              text: "\u518D\u8A8D\u8A3C\u304C\u5FC5\u8981\u3067\u3059",
              size: "lg",
              weight: "bold",
              align: "center",
              margin: "lg",
              color: CONFIG.COLORS.TEXT_PRIMARY
            },
            {
              type: "text",
              text: "\u30AB\u30EC\u30F3\u30C0\u30FC\u3078\u306E\u30A2\u30AF\u30BB\u30B9\u6A29\u9650\u304C\u7121\u52B9\u306B\u306A\u308A\u307E\u3057\u305F\u3002\n\u518D\u5EA6\u8A8D\u8A3C\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
              size: "sm",
              color: CONFIG.COLORS.TEXT_SECONDARY,
              wrap: true,
              align: "center",
              margin: "lg"
            }
          ],
          paddingAll: "xl"
        },
        footer: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "button",
              action: {
                type: "uri",
                label: "\u518D\u8A8D\u8A3C\u3059\u308B",
                uri: authUrl + (authUrl.includes("?") ? "&" : "?") + "openExternalBrowser=1"
              },
              style: "primary",
              color: CONFIG.COLORS.GOOGLE_BLUE
            }
          ],
          paddingAll: "lg"
        }
      }
    };
  };

  // src/usecase/CreateEventFromVoiceUseCase.ts
  var CreateEventFromVoiceUseCase = class {
    /**
     * @param oauth2ClientId OAuth2クライアントID
     * @param oauth2ClientSecret OAuth2クライアントシークレット
     */
    constructor(oauth2ClientId, oauth2ClientSecret) {
      this.oauth2ClientId = oauth2ClientId;
      this.oauth2ClientSecret = oauth2ClientSecret;
    }
    /**
     * 音声メッセージからカレンダーイベントを作成
     * @param replyToken LINEリプライトークン
     * @param messageId LINEメッセージID
     * @param userId LINEユーザーID
     */
    execute(replyToken, messageId, userId) {
      const audioBlob = fetchAudioContentFromLine(messageId);
      if (!audioBlob) {
        sendLineTextReply(replyToken, MESSAGE.AUDIO_FETCH_FAILED);
        return;
      }
      const transcribedText = convertSpeechToText(audioBlob);
      if (!transcribedText) {
        sendLineTextReply(replyToken, MESSAGE.SPEECH_RECOGNITION_FAILED);
        return;
      }
      const calendarEventData = extractCalendarEventFromText(transcribedText);
      if (!calendarEventData) {
        sendLineTextReply(replyToken, MESSAGE.EVENT_EXTRACTION_FAILED(transcribedText));
        return;
      }
      const result = createUserCalendarEvent(userId, calendarEventData);
      if (result.success && result.eventId) {
        const eventUrl = buildUserCalendarEventUrl(result.eventId);
        const flexMessage = buildEventCreatedFlexMessage(calendarEventData, eventUrl);
        sendLineFlexReply(replyToken, flexMessage);
      } else if (result.requiresReauth) {
        const oauth2Manager = new OAuth2Manager(
          userId,
          this.oauth2ClientId,
          this.oauth2ClientSecret
        );
        const authUrl = oauth2Manager.getAuthorizationUrl();
        const flexMessage = buildReauthRequiredFlexMessage(authUrl);
        sendLineFlexReply(replyToken, flexMessage);
      } else {
        sendLineTextReply(replyToken, MESSAGE.CALENDAR_CREATION_FAILED);
      }
    }
  };

  // src/usecase/ShowHelpUseCase.ts
  var ShowHelpUseCase = class {
    /**
     * ヘルプメッセージを表示
     * @param replyToken LINEリプライトークン
     */
    execute(replyToken) {
      const flexMessage = buildHelpFlexMessage();
      sendLineFlexReply(replyToken, flexMessage);
    }
  };

  // src/usecase/ShowWeekScheduleUseCase.ts
  var ShowWeekScheduleUseCase = class {
    /**
     * 週間予定を表示（直近7日間）
     * @param replyToken LINEリプライトークン
     * @param userId LINEユーザーID
     */
    execute(replyToken, userId) {
      const weekEvents = getUserWeekEvents(userId);
      const flexMessage = buildWeekEventsFlexMessage(weekEvents);
      sendLineFlexReply(replyToken, flexMessage);
    }
  };

  // src/usecase/ShowTodayScheduleUseCase.ts
  var ShowTodayScheduleUseCase = class {
    /**
     * 今日の予定を表示
     * @param replyToken LINEリプライトークン
     * @param userId LINEユーザーID
     */
    execute(replyToken, userId) {
      const todayEvents = getUserTodayEvents(userId);
      const flexMessage = buildTodayEventsFlexMessage(todayEvents);
      sendLineFlexReply(replyToken, flexMessage);
    }
  };

  // src/usecase/ShowLogoutUseCase.ts
  var ShowLogoutUseCase = class {
    /**
     * @param oauth2ClientId OAuth2クライアントID
     * @param oauth2ClientSecret OAuth2クライアントシークレット
     */
    constructor(oauth2ClientId, oauth2ClientSecret) {
      this.oauth2ClientId = oauth2ClientId;
      this.oauth2ClientSecret = oauth2ClientSecret;
    }
    /**
     * ログアウト処理を実行
     * @param replyToken LINEリプライトークン
     * @param userId LINEユーザーID
     */
    execute(replyToken, userId) {
      const oauth2Manager = new OAuth2Manager(
        userId,
        this.oauth2ClientId,
        this.oauth2ClientSecret
      );
      oauth2Manager.revokeToken();
      sendLineTextReply(replyToken, "\u30ED\u30B0\u30A2\u30A6\u30C8\u3057\u307E\u3057\u305F\u3002\n\u518D\u5EA6\u5229\u7528\u3059\u308B\u5834\u5408\u306F\u3001\u8A8D\u8A3C\u304C\u5FC5\u8981\u3067\u3059\u3002");
    }
  };

  // src/usecase/InvalidRequestUseCase.ts
  var InvalidRequestUseCase = class {
    /**
     * 不正なリクエストに対するエラーメッセージを送信
     * @param replyToken LINEリプライトークン
     */
    execute(replyToken) {
      sendLineTextReply(replyToken, MESSAGE.REQUEST_AUDIO);
    }
  };

  // src/usecase/SendAuthRequiredMessageUseCase.ts
  var SendAuthRequiredMessageUseCase = class {
    /**
     * @param oauth2ClientId OAuth2クライアントID
     * @param oauth2ClientSecret OAuth2クライアントシークレット
     */
    constructor(oauth2ClientId, oauth2ClientSecret) {
      this.oauth2ClientId = oauth2ClientId;
      this.oauth2ClientSecret = oauth2ClientSecret;
    }
    /**
     * 未認証ユーザーに認証を促すメッセージを送信
     * @param replyToken リプライトークン
     * @param userId LINEユーザーID
     */
    execute(replyToken, userId) {
      const oauth2Manager = new OAuth2Manager(
        userId,
        this.oauth2ClientId,
        this.oauth2ClientSecret
      );
      const authUrl = oauth2Manager.getAuthorizationUrl(true);
      const flexMessage = buildAuthRequiredFlexMessage(authUrl);
      sendLineFlexReply(replyToken, flexMessage);
    }
  };

  // src/usecase/CheckAuthenticationUseCase.ts
  var CheckAuthenticationUseCase = class {
    /**
     * @param oauth2ClientId OAuth2クライアントID
     * @param oauth2ClientSecret OAuth2クライアントシークレット
     */
    constructor(oauth2ClientId, oauth2ClientSecret) {
      this.oauth2ClientId = oauth2ClientId;
      this.oauth2ClientSecret = oauth2ClientSecret;
    }
    /**
     * ユーザーの認証状態をチェック
     * @param userId LINEユーザーID
     * @returns 認証済みの場合true、未認証の場合false
     */
    execute(userId) {
      const oauth2Manager = new OAuth2Manager(
        userId,
        this.oauth2ClientId,
        this.oauth2ClientSecret
      );
      return oauth2Manager.hasValidToken();
    }
  };

  // src/handler/lineWebhookHandler.ts
  var LineWebHookHandler = class _LineWebHookHandler {
    /**
     * @param checkAuthenticationUseCase 認証チェックUseCase
     * @param createEventFromVoiceUseCase 音声からイベント作成UseCase
     * @param showHelpUseCase ヘルプ表示UseCase
     * @param showWeekScheduleUseCase 週間予定表示UseCase
     * @param showTodayScheduleUseCase 今日の予定表示UseCase
     * @param showLogoutUseCase ログアウトUseCase
     * @param invalidRequestUseCase 不正リクエスト処理UseCase
     * @param sendAuthRequiredMessageUseCase 認証要求メッセージ送信UseCase
     */
    constructor(checkAuthenticationUseCase, createEventFromVoiceUseCase, showHelpUseCase, showWeekScheduleUseCase, showTodayScheduleUseCase, showLogoutUseCase, invalidRequestUseCase, sendAuthRequiredMessageUseCase) {
      this.checkAuthenticationUseCase = checkAuthenticationUseCase;
      this.createEventFromVoiceUseCase = createEventFromVoiceUseCase;
      this.showHelpUseCase = showHelpUseCase;
      this.showWeekScheduleUseCase = showWeekScheduleUseCase;
      this.showTodayScheduleUseCase = showTodayScheduleUseCase;
      this.showLogoutUseCase = showLogoutUseCase;
      this.invalidRequestUseCase = invalidRequestUseCase;
      this.sendAuthRequiredMessageUseCase = sendAuthRequiredMessageUseCase;
    }
    /**
     * LINEイベントを処理（index.tsから呼び出されるstaticメソッド）
     * @param lineEvent LINEイベント
     */
    static processLineEvent(lineEvent) {
      const oauth2ClientId = getOAuth2ClientId();
      const oauth2ClientSecret = getOAuth2ClientSecret();
      const checkAuthenticationUseCase = new CheckAuthenticationUseCase(
        oauth2ClientId,
        oauth2ClientSecret
      );
      const createEventFromVoiceUseCase = new CreateEventFromVoiceUseCase(
        oauth2ClientId,
        oauth2ClientSecret
      );
      const showHelpUseCase = new ShowHelpUseCase();
      const showWeekScheduleUseCase = new ShowWeekScheduleUseCase();
      const showTodayScheduleUseCase = new ShowTodayScheduleUseCase();
      const showLogoutUseCase = new ShowLogoutUseCase(
        oauth2ClientId,
        oauth2ClientSecret
      );
      const invalidRequestUseCase = new InvalidRequestUseCase();
      const sendAuthRequiredMessageUseCase = new SendAuthRequiredMessageUseCase(
        oauth2ClientId,
        oauth2ClientSecret
      );
      const handler = new _LineWebHookHandler(
        checkAuthenticationUseCase,
        createEventFromVoiceUseCase,
        showHelpUseCase,
        showWeekScheduleUseCase,
        showTodayScheduleUseCase,
        showLogoutUseCase,
        invalidRequestUseCase,
        sendAuthRequiredMessageUseCase
      );
      handler.handleEvent(lineEvent);
    }
    /**
     * LINEイベントを処理
     * @param lineEvent LINEイベント
     */
    handleEvent(lineEvent) {
      const replyToken = lineEvent.replyToken;
      const userId = this.extractUserId(lineEvent);
      if (!userId) {
        Logger2.logError("handleEvent", "userId\u3092\u53D6\u5F97\u3067\u304D\u307E\u305B\u3093\u3067\u3057\u305F");
        this.invalidRequestUseCase.execute(replyToken);
        return;
      }
      if (this.isFollowEvent(lineEvent)) {
        Logger2.logDebug("handleEvent", "follow\u30A4\u30D9\u30F3\u30C8\u3092\u53D7\u4FE1\u3057\u307E\u3057\u305F");
        return;
      }
      if (!this.checkAuthenticationUseCase.execute(userId)) {
        this.sendAuthRequiredMessageUseCase.execute(replyToken, userId);
        return;
      }
      if (this.isAudioMessage(lineEvent)) {
        this.createEventFromVoiceUseCase.execute(replyToken, lineEvent.message.id, userId);
      } else if (this.isTextMessage(lineEvent)) {
        this.processTextMessage(replyToken, lineEvent.message.text, userId);
      } else if (this.isPostbackEvent(lineEvent)) {
        this.processPostbackEvent(replyToken, lineEvent.postback.data, userId);
      } else {
        this.invalidRequestUseCase.execute(replyToken);
      }
    }
    /**
     * LINEイベントからuserIdを抽出
     * @param lineEvent LINEイベント
     * @returns userId または undefined
     */
    extractUserId(lineEvent) {
      var _a;
      return (_a = lineEvent.source) == null ? void 0 : _a.userId;
    }
    /**
     * テキストメッセージを処理
     * @param replyToken リプライトークン
     * @param messageText メッセージテキスト
     * @param userId LINEユーザーID
     */
    processTextMessage(replyToken, messageText, userId) {
      const normalizedText = messageText.trim();
      if (this.isHelpCommand(normalizedText)) {
        this.showHelpUseCase.execute(replyToken);
      } else if (this.isWeekCommand(normalizedText)) {
        this.showWeekScheduleUseCase.execute(replyToken, userId);
      } else if (this.isTodayCommand(normalizedText)) {
        this.showTodayScheduleUseCase.execute(replyToken, userId);
      } else if (this.isLogoutCommand(normalizedText)) {
        this.showLogoutUseCase.execute(replyToken, userId);
      } else {
        this.invalidRequestUseCase.execute(replyToken);
      }
    }
    /**
     * Postbackイベントを処理
     * @param replyToken リプライトークン
     * @param postbackData Postbackデータ
     * @param userId LINEユーザーID
     */
    processPostbackEvent(replyToken, postbackData, userId) {
      const actionMatch = postbackData.match(/action=([^&]+)/);
      const action = actionMatch ? actionMatch[1] : null;
      switch (action) {
        case "logout":
          this.showLogoutUseCase.execute(replyToken, userId);
          break;
        case "today":
          this.showTodayScheduleUseCase.execute(replyToken, userId);
          break;
        case "week":
          this.showWeekScheduleUseCase.execute(replyToken, userId);
          break;
        case "help":
          this.showHelpUseCase.execute(replyToken);
          break;
        default:
          this.invalidRequestUseCase.execute(replyToken);
      }
    }
    /**
     * 音声メッセージかチェック
     * @param lineEvent LINEイベント
     * @returns 音声メッセージの場合true
     */
    isAudioMessage(lineEvent) {
      return lineEvent.type === "message" && lineEvent.message.type === "audio";
    }
    /**
     * テキストメッセージかチェック
     * @param lineEvent LINEイベント
     * @returns テキストメッセージの場合true
     */
    isTextMessage(lineEvent) {
      return lineEvent.type === "message" && lineEvent.message.type === "text";
    }
    /**
     * 今日の予定コマンドかチェック
     * @param text テキスト
     * @returns 今日の予定コマンドの場合true
     */
    isTodayCommand(text) {
      return CONFIG.COMMANDS.TODAY.some((command) => text.includes(command));
    }
    /**
     * 週間予定コマンドかチェック
     * @param text テキスト
     * @returns 週間予定コマンドの場合true
     */
    isWeekCommand(text) {
      return CONFIG.COMMANDS.WEEK.some((command) => text.includes(command));
    }
    /**
     * ヘルプコマンドかチェック
     * @param text テキスト
     * @returns ヘルプコマンドの場合true
     */
    isHelpCommand(text) {
      return CONFIG.COMMANDS.HELP.some((command) => text.includes(command));
    }
    /**
     * ログアウトコマンドかチェック
     * @param text テキスト
     * @returns ログアウトコマンドの場合true
     */
    isLogoutCommand(text) {
      return CONFIG.COMMANDS.LOGOUT.some((command) => text.includes(command));
    }
    /**
     * Postbackイベントかチェック
     * @param lineEvent LINEイベント
     * @returns Postbackイベントの場合true
     */
    isPostbackEvent(lineEvent) {
      return lineEvent.type === "postback" && lineEvent.postback;
    }
    /**
     * Followイベントかチェック
     * @param lineEvent LINEイベント
     * @returns Followイベントの場合true
     */
    isFollowEvent(lineEvent) {
      return lineEvent.type === "follow";
    }
  };

  // src/usecase/HandleOAuthCallbackUseCase.ts
  var HandleOAuthCallbackUseCase = class {
    constructor() {
    }
    /**
     * OAuth2コールバックを処理してビジネスロジックを実行
     * @param request GETリクエスト
     * @param userId ユーザーID
     * @param clientId OAuth2クライアントID
     * @param clientSecret OAuth2クライアントシークレット
     * @returns 認証結果
     */
    execute(request, userId, clientId, clientSecret) {
      const oauth2Service = new OAuth2Manager(userId, clientId, clientSecret);
      const result = oauth2Service.handleCallback(request);
      if (result.success) {
        return { success: true, userId };
      }
      return { success: false, userId, error: result.error };
    }
  };

  // src/helper/view/TemplateHelper.ts
  var TemplateHelper = class {
    /**
     * テンプレート変数を置換
     * @param template テンプレート文字列
     * @param variables 置換する変数の辞書
     * @returns 変数が置換されたテンプレート文字列
     */
    applyVariables(template, variables) {
      let result = template;
      for (const [key, value] of Object.entries(variables)) {
        result = result.replace(new RegExp(`{{${key}}}`, "g"), value);
      }
      return result;
    }
    /**
     * HTMLエスケープ
     * @param text エスケープ対象のテキスト
     * @returns エスケープされたテキスト
     */
    escapeHtml(text) {
      return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    }
  };

  // src/view/oauth/success.html
  var success_default = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>\u8A8D\u8A3C\u5B8C\u4E86</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: linear-gradient(135deg, {{PRIMARY_COLOR}} 0%, #00a040 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      background: white;
      border-radius: 20px;
      padding: 40px 30px;
      text-align: center;
      max-width: 400px;
      width: 100%;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    }
    .icon {
      width: 80px;
      height: 80px;
      background: {{PRIMARY_COLOR}};
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 24px;
    }
    .icon svg {
      width: 40px;
      height: 40px;
      fill: white;
    }
    h1 {
      color: {{TEXT_PRIMARY}};
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 12px;
    }
    p {
      color: {{TEXT_SECONDARY}};
      font-size: 16px;
      line-height: 1.6;
      margin-bottom: 8px;
    }
    .note {
      font-size: 14px;
      color: #999;
      margin-top: 24px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
      </svg>
    </div>
    <h1>\u8A8D\u8A3C\u304C\u5B8C\u4E86\u3057\u307E\u3057\u305F</h1>
    <p>Google\u30AB\u30EC\u30F3\u30C0\u30FC\u3068\u306E\u9023\u643A\u304C\u5B8C\u4E86\u3057\u307E\u3057\u305F\u3002</p>
    <p>LINE\u306B\u623B\u3063\u3066\u97F3\u58F0\u30E1\u30C3\u30BB\u30FC\u30B8\u3092\u9001\u4FE1\u3057\u3066\u304F\u3060\u3055\u3044\u3002</p>
    <p class="note">\u3053\u306E\u30DA\u30FC\u30B8\u306F\u9589\u3058\u3066OK\u3067\u3059</p>
  </div>
</body>
</html>`;

  // src/view/oauth/error.html
  var error_default = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>\u8A8D\u8A3C\u30A8\u30E9\u30FC</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: linear-gradient(135deg, #ff6b6b 0%, #ee5a5a 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      background: white;
      border-radius: 20px;
      padding: 40px 30px;
      text-align: center;
      max-width: 400px;
      width: 100%;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    }
    .icon {
      width: 80px;
      height: 80px;
      background: #ff6b6b;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 24px;
    }
    .icon svg {
      width: 40px;
      height: 40px;
      fill: white;
    }
    h1 {
      color: {{TEXT_PRIMARY}};
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 12px;
    }
    p {
      color: {{TEXT_SECONDARY}};
      font-size: 16px;
      line-height: 1.6;
      margin-bottom: 8px;
    }
    .error-detail {
      background: #f8f8f8;
      border-radius: 8px;
      padding: 12px;
      margin-top: 16px;
      font-size: 14px;
      color: #666;
      word-break: break-word;
    }
    .note {
      font-size: 14px;
      color: #999;
      margin-top: 24px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
      </svg>
    </div>
    <h1>\u8A8D\u8A3C\u306B\u5931\u6557\u3057\u307E\u3057\u305F</h1>
    <p>Google\u30AB\u30EC\u30F3\u30C0\u30FC\u3068\u306E\u9023\u643A\u306B\u5931\u6557\u3057\u307E\u3057\u305F\u3002</p>
    <p>LINE\u304B\u3089\u518D\u5EA6\u8A8D\u8A3C\u3092\u304A\u8A66\u3057\u304F\u3060\u3055\u3044\u3002</p>
    <div class="error-detail">{{ERROR_MESSAGE}}</div>
    <p class="note">\u3053\u306E\u30DA\u30FC\u30B8\u306F\u9589\u3058\u3066OK\u3067\u3059</p>
  </div>
</body>
</html>`;

  // src/handler/oauthCallbackHandler.ts
  var OAuthCallbackHandler = class {
    constructor() {
      this.handleOAuthCallbackUseCase = new HandleOAuthCallbackUseCase();
      this.templateHelper = new TemplateHelper();
    }
    handleOAuthCallback(e) {
      var _a;
      const userId = (_a = e.parameter) == null ? void 0 : _a.userId;
      if (!userId) {
        return HtmlService.createHtmlOutput(
          this.buildErrorHtml("\u30E6\u30FC\u30B6\u30FC\u60C5\u5831\u304C\u53D6\u5F97\u3067\u304D\u307E\u305B\u3093\u3067\u3057\u305F")
        );
      }
      const result = this.handleOAuthCallbackUseCase.execute(
        e,
        userId,
        getOAuth2ClientId(),
        getOAuth2ClientSecret()
      );
      if (result.success) {
        return HtmlService.createHtmlOutput(this.buildSuccessHtml());
      }
      return HtmlService.createHtmlOutput(this.buildErrorHtml(result.error || "\u4E0D\u660E\u306A\u30A8\u30E9\u30FC"));
    }
    buildSuccessHtml() {
      return this.templateHelper.applyVariables(success_default, {
        PRIMARY_COLOR: CONFIG.COLORS.PRIMARY,
        TEXT_PRIMARY: CONFIG.COLORS.TEXT_PRIMARY,
        TEXT_SECONDARY: CONFIG.COLORS.TEXT_SECONDARY
      });
    }
    buildErrorHtml(error) {
      return this.templateHelper.applyVariables(error_default, {
        TEXT_PRIMARY: CONFIG.COLORS.TEXT_PRIMARY,
        TEXT_SECONDARY: CONFIG.COLORS.TEXT_SECONDARY
      }).replace("{{ERROR_MESSAGE}}", this.templateHelper.escapeHtml(error));
    }
  };

  // src/index.ts
  function doPost(e) {
    const requestBody = JSON.parse(e.postData.contents);
    if (!hasValidEvents(requestBody)) {
      return createJsonResponse({ status: "no events" });
    }
    const lineEvent = requestBody.events[0];
    LineWebHookHandler.processLineEvent(lineEvent);
    return createJsonResponse({ status: "ok" });
  }
  function doGet(e) {
    if (e.parameter && e.parameter.code) {
      return new OAuthCallbackHandler().handleOAuthCallback(e);
    }
    const userId = e.parameter.userId;
    const oauth2Service = new OAuth2Manager(
      userId,
      getOAuth2ClientId(),
      getOAuth2ClientSecret()
    );
    const authorized = oauth2Service.handleCallback(e);
    if (!authorized.success) {
      const error = authorized.error;
      Logger.log("Error details: " + error);
    }
    return ContentService.createTextOutput("\u2705 \u5168\u30B5\u30FC\u30D3\u30B9\u306E\u8A8D\u8A3C\u304C\u5B8C\u4E86\u3057\u307E\u3057\u305F\u3002\u3053\u306E\u30DA\u30FC\u30B8\u306F\u9589\u3058\u3066OK\u3067\u3059\u3002").setMimeType(ContentService.MimeType.TEXT);
  }
  function authCallback(request) {
    return new OAuthCallbackHandler().handleOAuthCallback(request);
  }
  var hasValidEvents = (requestBody) => {
    return requestBody.events && requestBody.events.length > 0;
  };
  var createJsonResponse = (response) => {
    return ContentService.createTextOutput(JSON.stringify(response)).setMimeType(ContentService.MimeType.JSON);
  };

  // src/main.ts
  global.doPost = doPost;
  global.doGet = doGet;
  global.authCallback = authCallback;
})();
