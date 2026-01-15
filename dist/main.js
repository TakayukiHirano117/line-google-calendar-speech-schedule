// ============================================
// 設定・定数
// ============================================

const CONFIG = {
  LINE_API: {
    REPLY_ENDPOINT: 'https://api.line.me/v2/bot/message/reply',
    CONTENT_ENDPOINT: 'https://api-data.line.me/v2/bot/message',
  },
  SPEECH_TO_TEXT: {
    LOCATION: 'global',
    MODEL: 'latest_long',
    LANGUAGE_CODE: 'ja-JP',
  },
  GEMINI: {
    MODEL: 'gemini-2.5-flash-lite',
    ENDPOINT: 'https://generativelanguage.googleapis.com/v1beta/models',
    TEMPERATURE: 0.3,
    MAX_OUTPUT_TOKENS: 1024,
  },
  CALENDAR: {
    DEFAULT_EVENT_DURATION_HOURS: 1,
  },
};

const MESSAGE = {
  REQUEST_AUDIO: '音声メッセージを送信してください',
  AUDIO_FETCH_FAILED: '音声の取得に失敗しました',
  SPEECH_RECOGNITION_FAILED: '音声の認識に失敗しました',
  CALENDAR_CREATION_FAILED: 'カレンダーへの追加に失敗しました',
  EVENT_CREATED: (title, dateTime) => 
    `✅ イベントを作成しました\n\n📅 ${title}\n🕒 ${dateTime}`,
  EVENT_EXTRACTION_FAILED: (transcribedText) => 
    `「${transcribedText}」\n\nイベント情報を抽出できませんでした。日付、時刻、内容を含めて話してください。`,
};


// ============================================
// メインエントリーポイント
// ============================================

const doPost = (e) => {
  const requestBody = JSON.parse(e.postData.contents);

  if (!hasValidEvents(requestBody)) {
    return createJsonResponse({ status: 'no events' });
  }

  const lineEvent = requestBody.events[0];
  processLineEvent(lineEvent);

  return createJsonResponse({ status: 'ok' });
};

const hasValidEvents = (requestBody) => {
  return requestBody.events && requestBody.events.length > 0;
};

const createJsonResponse = (data) => {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
};


// ============================================
// LINEイベント処理
// ============================================

const processLineEvent = (lineEvent) => {
  const replyToken = lineEvent.replyToken;

  if (isAudioMessage(lineEvent)) {
    processAudioMessageEvent(replyToken, lineEvent.message.id);
  } else {
    sendLineReply(replyToken, MESSAGE.REQUEST_AUDIO);
  }
};

const isAudioMessage = (lineEvent) => {
  return lineEvent.type === 'message' && lineEvent.message.type === 'audio';
};

const processAudioMessageEvent = (replyToken, messageId) => {
  // Step 1: LINEから音声データを取得
  const audioBlob = fetchAudioContentFromLine(messageId);
  if (!audioBlob) {
    sendLineReply(replyToken, MESSAGE.AUDIO_FETCH_FAILED);
    return;
  }

  // Step 2: 音声をテキストに変換
  const transcribedText = convertSpeechToText(audioBlob);
  if (!transcribedText) {
    sendLineReply(replyToken, MESSAGE.SPEECH_RECOGNITION_FAILED);
    return;
  }

  // Step 3: テキストからイベント情報を抽出
  const calendarEventData = extractCalendarEventFromText(transcribedText);
  if (!calendarEventData) {
    sendLineReply(replyToken, MESSAGE.EVENT_EXTRACTION_FAILED(transcribedText));
    return;
  }

  // Step 4: カレンダーにイベントを作成
  const isEventCreated = createGoogleCalendarEvent(calendarEventData);
  if (isEventCreated) {
    const formattedDateTime = formatDateTimeForDisplay(calendarEventData.startTime);
    sendLineReply(replyToken, MESSAGE.EVENT_CREATED(calendarEventData.title, formattedDateTime));
  } else {
    sendLineReply(replyToken, MESSAGE.CALENDAR_CREATION_FAILED);
  }
};


// ============================================
// LINE API クライアント
// ============================================

const fetchAudioContentFromLine = (messageId) => {
  const channelAccessToken = getScriptProperty('CHANNEL_ACCESS_TOKEN');
  const contentUrl = `${CONFIG.LINE_API.CONTENT_ENDPOINT}/${messageId}/content`;

  const requestOptions = {
    method: 'get',
    headers: {
      'Authorization': `Bearer ${channelAccessToken}`,
    },
    muteHttpExceptions: true,
  };

  try {
    const response = UrlFetchApp.fetch(contentUrl, requestOptions);
    return response.getBlob();
  } catch (error) {
    logError('LINE音声コンテンツ取得', error);
    return null;
  }
};

const sendLineReply = (replyToken, messageText) => {
  const channelAccessToken = getScriptProperty('CHANNEL_ACCESS_TOKEN');

  const requestHeaders = {
    'Content-Type': 'application/json; charset=UTF-8',
    'Authorization': `Bearer ${channelAccessToken}`,
  };

  const requestBody = {
    replyToken: replyToken,
    messages: [
      {
        type: 'text',
        text: messageText,
      },
    ],
  };

  const requestOptions = {
    method: 'post',
    headers: requestHeaders,
    payload: JSON.stringify(requestBody),
  };

  UrlFetchApp.fetch(CONFIG.LINE_API.REPLY_ENDPOINT, requestOptions);
};


// ============================================
// Google Speech-to-Text API クライアント
// ============================================

const convertSpeechToText = (audioBlob) => {
  const projectId = getScriptProperty('GCP_PROJECT_ID');
  const accessToken = generateServiceAccountAccessToken();
  const audioContentBase64 = Utilities.base64Encode(audioBlob.getBytes());

  const recognizerPath = buildRecognizerPath(projectId);
  const apiEndpoint = `https://speech.googleapis.com/v2/${recognizerPath}:recognize`;

  const requestBody = buildSpeechToTextRequestBody(audioContentBase64);
  const requestOptions = buildAuthorizedPostRequest(accessToken, requestBody);

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

const buildRecognizerPath = (projectId) => {
  return `projects/${projectId}/locations/${CONFIG.SPEECH_TO_TEXT.LOCATION}/recognizers/_`;
};

const buildSpeechToTextRequestBody = (audioContentBase64) => {
  return {
    config: {
      autoDecodingConfig: {},
      languageCodes: [CONFIG.SPEECH_TO_TEXT.LANGUAGE_CODE],
      model: CONFIG.SPEECH_TO_TEXT.MODEL,
    },
    content: audioContentBase64,
  };
};

const extractTranscriptFromSpeechResponse = (responseData) => {
  if (!responseData.results || responseData.results.length === 0) {
    return null;
  }

  const alternatives = responseData.results[0].alternatives;
  if (!alternatives || alternatives.length === 0) {
    return null;
  }

  return alternatives[0].transcript;
};


// ============================================
// Gemini API クライアント
// ============================================

const extractCalendarEventFromText = (transcribedText) => {
  const geminiApiKey = getScriptProperty('GEMINI_API_KEY');
  const prompt = buildEventExtractionPrompt(transcribedText);

  const requestBody = buildGeminiRequestBody(prompt);
  const apiEndpoint = buildGeminiApiEndpoint(geminiApiKey);

  const requestOptions = {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
    },
    payload: JSON.stringify(requestBody),
    muteHttpExceptions: true,
  };

  try {
    const response = UrlFetchApp.fetch(apiEndpoint, requestOptions);
    const responseData = JSON.parse(response.getContentText());

    logDebug('Gemini ステータス', response.getResponseCode());
    logDebug('Gemini 結果', JSON.stringify(responseData));

    return parseGeminiResponseToEventData(responseData);
  } catch (error) {
    logError('Gemini API', error);
    return null;
  }
};

const buildEventExtractionPrompt = (transcribedText) => {
  const todayDescription = formatTodayForPrompt();

  return `以下の音声認識テキストからカレンダーイベント情報を抽出してください。
今日の日付は${todayDescription}です。

音声認識テキスト: "${transcribedText}"

以下のJSON形式で出力してください：
{
  "title": "イベントのタイトル（簡潔に、絵文字を1つ含めて魅力的に）",
  "startTime": "YYYY-MM-DDTHH:MM:00+09:00",
  "endTime": "YYYY-MM-DDTHH:MM:00+09:00",
  "description": "詳細説明（元のテキストを含めて補足情報も）"
}

ルール：
- 終了時刻が指定されていない場合は、開始時刻の1時間後にする
- 「明日」「来週」などの相対的な日付表現を正確に変換する
- タイトルは30文字以内で、内容を端的に表現する
- descriptionには元の音声内容と補足を含める
- イベント情報が含まれていない場合はnullを返す

JSON形式のみを返し、他の説明は一切不要です。`;
};

const formatTodayForPrompt = () => {
  const today = new Date();
  const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
  const dayOfWeek = dayNames[today.getDay()];

  return `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日(${dayOfWeek}曜日)`;
};

const buildGeminiRequestBody = (prompt) => {
  return {
    contents: [
      {
        parts: [
          {
            text: prompt,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: CONFIG.GEMINI.TEMPERATURE,
      maxOutputTokens: CONFIG.GEMINI.MAX_OUTPUT_TOKENS,
    },
  };
};

const buildGeminiApiEndpoint = (apiKey) => {
  return `${CONFIG.GEMINI.ENDPOINT}/${CONFIG.GEMINI.MODEL}:generateContent?key=${apiKey}`;
};

const parseGeminiResponseToEventData = (responseData) => {
  try {
    const generatedText = responseData?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!generatedText) {
      return null;
    }

    const jsonString = extractJsonFromText(generatedText);
    logDebug('抽出されたJSON', jsonString);

    const eventData = JSON.parse(jsonString);
    return isValidEventData(eventData) ? eventData : null;
  } catch (error) {
    logError('Gemini レスポンス解析', error);
    return null;
  }
};

const extractJsonFromText = (text) => {
  // Markdownのコードブロックを除去
  let cleanedText = text
    .replace(/```json/g, '')
    .replace(/```/g, '')
    .trim();

  // JSONオブジェクトの開始と終了位置を特定
  const jsonStartIndex = cleanedText.indexOf('{');
  const jsonEndIndex = cleanedText.lastIndexOf('}');

  if (jsonStartIndex === -1 || jsonEndIndex === -1) {
    return cleanedText;
  }

  return cleanedText.substring(jsonStartIndex, jsonEndIndex + 1);
};

const isValidEventData = (eventData) => {
  return eventData && typeof eventData.title === 'string' && eventData.title.length > 0;
};


// ============================================
// Google Calendar API クライアント
// ============================================

const createGoogleCalendarEvent = (eventData) => {
  try {
    const calendar = CalendarApp.getDefaultCalendar();
    const startTime = new Date(eventData.startTime);
    const endTime = new Date(eventData.endTime);

    const eventOptions = {
      description: eventData.description || '',
    };

    calendar.createEvent(eventData.title, startTime, endTime, eventOptions);

    logDebug('カレンダーイベント作成成功', eventData.title);
    return true;
  } catch (error) {
    logError('カレンダーイベント作成', error);
    return false;
  }
};


// ============================================
// 認証・トークン生成
// ============================================

const generateServiceAccountAccessToken = () => {
  const serviceAccountKey = getServiceAccountKey();
  const jwtToken = createSignedJwtToken(serviceAccountKey);

  return exchangeJwtForAccessToken(jwtToken);
};

const getServiceAccountKey = () => {
  const keyJson = getScriptProperty('SERVICE_ACCOUNT_KEY');
  return JSON.parse(keyJson);
};

const createSignedJwtToken = (serviceAccountKey) => {
  const header = createJwtHeader();
  const claims = createJwtClaims(serviceAccountKey.client_email);

  const headerBase64 = Utilities.base64EncodeWebSafe(JSON.stringify(header));
  const claimsBase64 = Utilities.base64EncodeWebSafe(JSON.stringify(claims));

  const signatureInput = `${headerBase64}.${claimsBase64}`;
  const signature = Utilities.computeRsaSha256Signature(signatureInput, serviceAccountKey.private_key);
  const signatureBase64 = Utilities.base64EncodeWebSafe(signature);

  return `${signatureInput}.${signatureBase64}`;
};

const createJwtHeader = () => {
  return {
    alg: 'RS256',
    typ: 'JWT',
  };
};

const createJwtClaims = (clientEmail) => {
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

const exchangeJwtForAccessToken = (jwtToken) => {
  const tokenEndpoint = 'https://oauth2.googleapis.com/token';

  const requestOptions = {
    method: 'post',
    payload: {
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwtToken,
    },
  };

  const response = UrlFetchApp.fetch(tokenEndpoint, requestOptions);
  const responseData = JSON.parse(response.getContentText());

  return responseData.access_token;
};


// ============================================
// ユーティリティ関数
// ============================================

const getScriptProperty = (propertyName) => {
  return PropertiesService.getScriptProperties().getProperty(propertyName);
};

const buildAuthorizedPostRequest = (accessToken, requestBody) => {
  return {
    method: 'post',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    payload: JSON.stringify(requestBody),
    muteHttpExceptions: true,
  };
};

const formatDateTimeForDisplay = (isoDateTimeString) => {
  const date = new Date(isoDateTimeString);

  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes().toString().padStart(2, '0');

  return `${month}月${day}日 ${hour}:${minute}`;
};


// ============================================
// ロギング
// ============================================

const logDebug = (context, message) => {
  console.log(`${context}: ${message}`);
};

const logError = (context, error) => {
  console.log(`${context}エラー: ${error}`);
};


// ============================================
// テスト用関数
// ============================================

const testCalendarAccess = () => {
  const calendar = CalendarApp.getDefaultCalendar();
  logDebug('カレンダー名', calendar.getName());

  const now = new Date();
  const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

  const testEvent = calendar.createEvent('テストイベント（削除してOK）', now, oneHourLater);
  logDebug('テストイベント作成成功', testEvent.getId());
};

const testSpeechToTextConnection = () => {
  const projectId = getScriptProperty('GCP_PROJECT_ID');
  const accessToken = generateServiceAccountAccessToken();

  logDebug('プロジェクトID', projectId);
  logDebug('アクセストークン取得', accessToken ? '成功' : '失敗');
};

const testGeminiConnection = () => {
  const testText = '明日の10時からミーティング';
  const eventData = extractCalendarEventFromText(testText);

  logDebug('Gemini テスト結果', JSON.stringify(eventData));
};



// 初回認証用（ブラウザでWebアプリURLにアクセスすると全サービスの認証ダイアログが出る）
const doGet = (e) => {
  // Calendar API
  CalendarApp.getDefaultCalendar();
  
  // Google Drive
  DriveApp.getRootFolder();
  
  // Gmail
  GmailApp.getAliases();
  
  // Google Sheets
  SpreadsheetApp.getActiveSpreadsheet();
  
  // Google Docs
  DocumentApp.getActiveDocument();
  
  // Google Forms
  FormApp.getActiveForm();
  
  // Google Slides
  SlidesApp.getActivePresentation();
  
  // Script Properties
  PropertiesService.getScriptProperties();
  
  // URL Fetch（外部API呼び出し）
  UrlFetchApp.fetch('https://www.google.com', { muteHttpExceptions: true });
  
  // Utilities
  Utilities.base64Encode('test');
  
  return ContentService
    .createTextOutput('✅ 全サービスの認証が完了しました。このページは閉じてOKです。')
    .setMimeType(ContentService.MimeType.TEXT);
};