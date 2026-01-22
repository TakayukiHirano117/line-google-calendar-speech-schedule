var global = this;
function doPost() {}

function doGet() {}

function authCallback() {}
(()=>{var n={LINE_API:{REPLY_ENDPOINT:"https://api.line.me/v2/bot/message/reply",CONTENT_ENDPOINT:"https://api-data.line.me/v2/bot/message",RICH_MENU_ENDPOINT:"https://api.line.me/v2/bot/richmenu"},SPEECH_TO_TEXT:{LOCATION:"global",MODEL:"latest_long",LANGUAGE_CODE:"ja-JP"},GEMINI:{MODEL:"gemini-2.5-flash-lite",ENDPOINT:"https://generativelanguage.googleapis.com/v1beta/models",TEMPERATURE:.3,MAX_OUTPUT_TOKENS:1024},CALENDAR:{DEFAULT_EVENT_DURATION_HOURS:1},COMMANDS:{TODAY:["\u4ECA\u65E5\u306E\u4E88\u5B9A"],WEEK:["\u4ECA\u9031\u306E\u4E88\u5B9A"],HELP:["\u30D8\u30EB\u30D7"],LOGOUT:["\u30ED\u30B0\u30A2\u30A6\u30C8"]},COLORS:{PRIMARY:"#06C755",SECONDARY:"#AAAAAA",BACKGROUND:"#FFFFFF",ACCENT:"#5B82DB",TEXT_PRIMARY:"#111111",TEXT_SECONDARY:"#666666",BORDER:"#EEEEEE",SUCCESS:"#06C755",WARNING:"#FFCC00",GOOGLE_BLUE:"#4285F4"},OAUTH2:{AUTHORIZATION_BASE_URL:"https://accounts.google.com/o/oauth2/v2/auth",TOKEN_URL:"https://oauth2.googleapis.com/token",SCOPE:"https://www.googleapis.com/auth/calendar",CALLBACK_FUNCTION:"authCallback"},CALENDAR_API:{BASE_URL:"https://www.googleapis.com/calendar/v3"}};var h=e=>PropertiesService.getScriptProperties().getProperty(e),O=()=>h("CHANNEL_ACCESS_TOKEN"),D=()=>h("GCP_PROJECT_ID"),v=()=>h("GEMINI_API_KEY"),I=()=>{let e=h("SERVICE_ACCOUNT_KEY");return JSON.parse(e)},_=()=>h("OAUTH2_CLIENT_ID"),M=()=>h("OAUTH2_CLIENT_SECRET");var U=e=>{let t=O(),o=`${n.LINE_API.CONTENT_ENDPOINT}/${e}/content`,r={method:"get",headers:{Authorization:`Bearer ${t}`},muteHttpExceptions:!0};try{return UrlFetchApp.fetch(o,r).getBlob()}catch(s){return g("LINE\u97F3\u58F0\u30B3\u30F3\u30C6\u30F3\u30C4\u53D6\u5F97",s),null}},m=(e,t)=>{let o=O();w(o,{replyToken:e,messages:[{type:"text",text:t}]})},u=(e,t)=>{let o=O(),r={replyToken:e,messages:[{type:"flex",altText:t.altText,contents:t.contents}]};w(o,r)},w=(e,t)=>{let r={method:"post",headers:{"Content-Type":"application/json; charset=UTF-8",Authorization:`Bearer ${e}`},payload:JSON.stringify(t),muteHttpExceptions:!0},s=UrlFetchApp.fetch(n.LINE_API.REPLY_ENDPOINT,r);s.getResponseCode()!==200&&g("LINE\u8FD4\u4FE1",s.getContentText())};var k=()=>{let e=I(),t=ue(e);return xe(t)},ue=e=>{let t=de(),o=me(e.client_email),r=Utilities.base64EncodeWebSafe(JSON.stringify(t)),s=Utilities.base64EncodeWebSafe(JSON.stringify(o)),a=`${r}.${s}`,i=Utilities.computeRsaSha256Signature(a,e.private_key),l=Utilities.base64EncodeWebSafe(i);return`${a}.${l}`},de=()=>({alg:"RS256",typ:"JWT"}),me=e=>{let t=Math.floor(Date.now()/1e3),o=t+3600;return{iss:e,scope:"https://www.googleapis.com/auth/cloud-platform",aud:"https://oauth2.googleapis.com/token",exp:o,iat:t}},xe=e=>{let t="https://oauth2.googleapis.com/token",o={method:"post",payload:{grant_type:"urn:ietf:params:oauth:grant-type:jwt-bearer",assertion:e}},r=UrlFetchApp.fetch(t,o);return JSON.parse(r.getContentText()).access_token};var z=e=>{let t=D(),o=k(),r=Utilities.base64Encode(e.getBytes()),a=`https://speech.googleapis.com/v2/${Ee(t)}:recognize`,i=he(r),l=Oe(o,i);try{let c=UrlFetchApp.fetch(a,l),p=JSON.parse(c.getContentText());return x("Speech-to-Text v2 \u30B9\u30C6\u30FC\u30BF\u30B9",c.getResponseCode()),x("Speech-to-Text v2 \u7D50\u679C",JSON.stringify(p)),Te(p)}catch(c){return g("Speech-to-Text v2",c),null}},Ee=e=>`projects/${e}/locations/${n.SPEECH_TO_TEXT.LOCATION}/recognizers/_`,he=e=>({config:{autoDecodingConfig:{},languageCodes:[n.SPEECH_TO_TEXT.LANGUAGE_CODE],model:n.SPEECH_TO_TEXT.MODEL},content:e}),Te=e=>{if(!e.results||e.results.length===0)return null;let t=e.results[0].alternatives;return!t||t.length===0?null:t[0].transcript},Oe=(e,t)=>({method:"post",headers:{Authorization:`Bearer ${e}`,"Content-Type":"application/json"},payload:JSON.stringify(t),muteHttpExceptions:!0});var G=e=>{let t=v(),o=ye(e),r=Ce(o),s=Re(t),a={method:"post",headers:{"Content-Type":"application/json"},payload:JSON.stringify(r),muteHttpExceptions:!0};try{let i=UrlFetchApp.fetch(s,a),l=JSON.parse(i.getContentText());return x("Gemini \u30B9\u30C6\u30FC\u30BF\u30B9",i.getResponseCode()),x("Gemini \u7D50\u679C",JSON.stringify(l)),be(l)}catch(i){return g("Gemini API",i),null}},ye=e=>{let t=fe(),o=Ae();return`\u4EE5\u4E0B\u306E\u97F3\u58F0\u8A8D\u8B58\u30C6\u30AD\u30B9\u30C8\u304B\u3089\u30AB\u30EC\u30F3\u30C0\u30FC\u30A4\u30D9\u30F3\u30C8\u60C5\u5831\u3092\u62BD\u51FA\u3057\u3066\u304F\u3060\u3055\u3044\u3002
\u4ECA\u65E5\u306E\u65E5\u4ED8\u306F${t}\u3001\u73FE\u5728\u6642\u523B\u306F${o}\u3067\u3059\u3002

\u97F3\u58F0\u8A8D\u8B58\u30C6\u30AD\u30B9\u30C8: "${e}"

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

JSON\u5F62\u5F0F\u306E\u307F\u3092\u8FD4\u3057\u3001\u4ED6\u306E\u8AAC\u660E\u306F\u4E00\u5207\u4E0D\u8981\u3067\u3059\u3002`},fe=()=>{let e=new Date,o=["\u65E5","\u6708","\u706B","\u6C34","\u6728","\u91D1","\u571F"][e.getDay()];return`${e.getFullYear()}\u5E74${e.getMonth()+1}\u6708${e.getDate()}\u65E5(${o}\u66DC\u65E5)`},Ae=()=>{let e=new Date,t=e.getHours(),o=e.getMinutes();return`${t}\u6642${o}\u5206`},Ce=e=>({contents:[{parts:[{text:e}]}],generationConfig:{temperature:n.GEMINI.TEMPERATURE,maxOutputTokens:n.GEMINI.MAX_OUTPUT_TOKENS}}),Re=e=>`${n.GEMINI.ENDPOINT}/${n.GEMINI.MODEL}:generateContent?key=${e}`,be=e=>{try{let t=e?.candidates?.[0]?.content?.parts?.[0]?.text;if(!t)return null;let o=Se(t);x("\u62BD\u51FA\u3055\u308C\u305FJSON",o);let r=JSON.parse(o);return Ne(r)?r:null}catch(t){return g("Gemini \u30EC\u30B9\u30DD\u30F3\u30B9\u89E3\u6790",t),null}},Se=e=>{let t=e.replace(/```json/g,"").replace(/```/g,"").trim(),o=t.indexOf("{"),r=t.lastIndexOf("}");return o===-1||r===-1?t:t.substring(o,r+1)},Ne=e=>e&&typeof e.title=="string"&&e.title.length>0;var E=(e,t=!1)=>{let o=OAuth2.createService(`calendar-${e}`).setAuthorizationBaseUrl(n.OAUTH2.AUTHORIZATION_BASE_URL).setTokenUrl(n.OAUTH2.TOKEN_URL).setClientId(_()).setClientSecret(M()).setCallbackFunction(n.OAUTH2.CALLBACK_FUNCTION).setPropertyStore(PropertiesService.getUserProperties()).setScope(n.OAUTH2.SCOPE).setParam("access_type","offline");return t&&o.setParam("prompt","consent"),o},P=e=>E(e).hasAccess(),y=(e,t=!1)=>E(e,t).getAuthorizationUrl({userId:e}),f=e=>{let t=E(e);return t.hasAccess()?t.getAccessToken():null},A=e=>{E(e).reset()},$=e=>{let t=e.parameter?.userId;if(!t)return console.error("[OAuth2] Callback failed: userId not found in state"),{success:!1,error:"\u30E6\u30FC\u30B6\u30FC\u60C5\u5831\u304C\u53D6\u5F97\u3067\u304D\u307E\u305B\u3093\u3067\u3057\u305F"};let o=E(t);if(o.handleCallback(e))return console.log(`[OAuth2] Authorization successful for user: ${t}`),{success:!0,userId:t};let s=o.getLastError();return console.error(`[OAuth2] Authorization failed for user: ${t}, error: ${s}`),{success:!1,userId:t,error:s||"\u8A8D\u8A3C\u304C\u62D2\u5426\u3055\u308C\u307E\u3057\u305F"}};var Y=n.CALENDAR_API.BASE_URL,B=(e,t)=>{let o=f(e);if(!o)return g("\u30AB\u30EC\u30F3\u30C0\u30FC\u30A4\u30D9\u30F3\u30C8\u4F5C\u6210","\u30A2\u30AF\u30BB\u30B9\u30C8\u30FC\u30AF\u30F3\u304C\u3042\u308A\u307E\u305B\u3093"),{success:!1,error:"NO_TOKEN",requiresReauth:!0};let r=`${Y}/calendars/primary/events`,s={summary:t.title,description:t.description||"",start:{dateTime:t.startTime,timeZone:"Asia/Tokyo"},end:{dateTime:t.endTime,timeZone:"Asia/Tokyo"}},a={method:"post",headers:{Authorization:`Bearer ${o}`,"Content-Type":"application/json"},payload:JSON.stringify(s),muteHttpExceptions:!0};try{let i=UrlFetchApp.fetch(r,a);switch(i.getResponseCode()){case 200:case 201:{let c=JSON.parse(i.getContentText());return x("\u30AB\u30EC\u30F3\u30C0\u30FC\u30A4\u30D9\u30F3\u30C8\u4F5C\u6210\u6210\u529F",c.id),{success:!0,eventId:c.id}}case 401:return A(e),{success:!1,error:"TOKEN_EXPIRED",requiresReauth:!0};case 403:return{success:!1,error:"ACCESS_DENIED",requiresReauth:!0};case 429:return{success:!1,error:"RATE_LIMITED",requiresReauth:!1};default:return g("\u30AB\u30EC\u30F3\u30C0\u30FC\u30A4\u30D9\u30F3\u30C8\u4F5C\u6210",i.getContentText()),{success:!1,error:"API_ERROR",requiresReauth:!1}}}catch(i){return g("\u30AB\u30EC\u30F3\u30C0\u30FC\u30A4\u30D9\u30F3\u30C8\u4F5C\u6210",i),{success:!1,error:String(i),requiresReauth:!1}}},q=e=>{let t=f(e);if(!t)return g("\u4ECA\u65E5\u306E\u4E88\u5B9A\u53D6\u5F97","\u30A2\u30AF\u30BB\u30B9\u30C8\u30FC\u30AF\u30F3\u304C\u3042\u308A\u307E\u305B\u3093"),[];let o=new Date,r=new Date(o.getFullYear(),o.getMonth(),o.getDate(),0,0,0),s=new Date(o.getFullYear(),o.getMonth(),o.getDate(),23,59,59);return J(t,r,s)},X=e=>{let t=f(e);if(!t)return g("\u9031\u9593\u4E88\u5B9A\u53D6\u5F97","\u30A2\u30AF\u30BB\u30B9\u30C8\u30FC\u30AF\u30F3\u304C\u3042\u308A\u307E\u305B\u3093"),{};let o=new Date,r=new Date(o.getFullYear(),o.getMonth(),o.getDate(),0,0,0),s=new Date(o.getFullYear(),o.getMonth(),o.getDate()+7,23,59,59),a=J(t,r,s),i={};for(let l=0;l<7;l++){let c=new Date(o.getFullYear(),o.getMonth(),o.getDate()+l),p=H(c);i[p]={date:c,events:[]}}return a.forEach(l=>{let c=new Date(l.startTime),p=H(c);i[p]&&i[p].events.push(l)}),i},J=(e,t,o)=>{let r=`${Y}/calendars/primary/events`,s=[`timeMin=${encodeURIComponent(t.toISOString())}`,`timeMax=${encodeURIComponent(o.toISOString())}`,"singleEvents=true","orderBy=startTime"].join("&"),a={method:"get",headers:{Authorization:`Bearer ${e}`},muteHttpExceptions:!0};try{let i=UrlFetchApp.fetch(`${r}?${s}`,a);return i.getResponseCode()!==200?(g("\u30A4\u30D9\u30F3\u30C8\u53D6\u5F97",i.getContentText()),[]):(JSON.parse(i.getContentText()).items||[]).map(p=>({id:p.id,title:p.summary||"(\u30BF\u30A4\u30C8\u30EB\u306A\u3057)",startTime:new Date(p.start.dateTime||p.start.date),endTime:new Date(p.end.dateTime||p.end.date),isAllDay:!p.start.dateTime}))}catch(i){return g("\u30A4\u30D9\u30F3\u30C8\u53D6\u5F97",i),[]}},K=e=>{let t=e.replace("@google.com","");return`https://www.google.com/calendar/event?eid=${Le(t)}`},Le=e=>Utilities.base64Encode(e).replace(/=+$/,""),H=e=>`${e.getFullYear()}-${e.getMonth()+1}-${e.getDate()}`;var d={AUTH_REQUIRED:`Google\u30AB\u30EC\u30F3\u30C0\u30FC\u3068\u306E\u9023\u643A\u304C\u5FC5\u8981\u3067\u3059\u3002
\u4E0B\u306E\u30DC\u30BF\u30F3\u3092\u30BF\u30C3\u30D7\u3057\u3066\u8A8D\u8A3C\u3057\u3066\u304F\u3060\u3055\u3044\u3002`,AUTH_SUCCESS:`\u8A8D\u8A3C\u304C\u5B8C\u4E86\u3057\u307E\u3057\u305F\uFF01
\u97F3\u58F0\u30E1\u30C3\u30BB\u30FC\u30B8\u3067\u4E88\u5B9A\u3092\u767B\u9332\u3067\u304D\u307E\u3059\u3002`,AUTH_FAILED:"\u8A8D\u8A3C\u306B\u5931\u6557\u3057\u307E\u3057\u305F\u3002\u3082\u3046\u4E00\u5EA6\u304A\u8A66\u3057\u304F\u3060\u3055\u3044\u3002",AUTH_REVOKED:"Google\u30AB\u30EC\u30F3\u30C0\u30FC\u3068\u306E\u9023\u643A\u3092\u89E3\u9664\u3057\u307E\u3057\u305F\u3002",REQUEST_AUDIO:`\u97F3\u58F0\u30E1\u30C3\u30BB\u30FC\u30B8\u3092\u9001\u4FE1\u3057\u3066\u304F\u3060\u3055\u3044

\u307E\u305F\u306F\u4EE5\u4E0B\u306E\u30B3\u30DE\u30F3\u30C9\u3092\u30C6\u30AD\u30B9\u30C8\u3067\u9001\u4FE1\uFF1A
\u30FB\u300C\u4ECA\u65E5\u306E\u4E88\u5B9A\u300D
\u30FB\u300C\u4ECA\u9031\u306E\u4E88\u5B9A\u300D`,AUDIO_FETCH_FAILED:"\u97F3\u58F0\u306E\u53D6\u5F97\u306B\u5931\u6557\u3057\u307E\u3057\u305F",SPEECH_RECOGNITION_FAILED:"\u97F3\u58F0\u306E\u8A8D\u8B58\u306B\u5931\u6557\u3057\u307E\u3057\u305F",CALENDAR_CREATION_FAILED:"\u30AB\u30EC\u30F3\u30C0\u30FC\u3078\u306E\u8FFD\u52A0\u306B\u5931\u6557\u3057\u307E\u3057\u305F",EVENT_EXTRACTION_FAILED:e=>`\u300C${e}\u300D

\u30A4\u30D9\u30F3\u30C8\u60C5\u5831\u3092\u62BD\u51FA\u3067\u304D\u307E\u305B\u3093\u3067\u3057\u305F\u3002\u65E5\u4ED8\u3001\u6642\u523B\u3001\u5185\u5BB9\u3092\u542B\u3081\u3066\u8A71\u3057\u3066\u304F\u3060\u3055\u3044\u3002`,NO_EVENTS_TODAY:"\u4ECA\u65E5\u306E\u4E88\u5B9A\u306F\u3042\u308A\u307E\u305B\u3093",NO_EVENTS_WEEK:"\u4ECA\u9031\u306E\u4E88\u5B9A\u306F\u3042\u308A\u307E\u305B\u3093",HELP:{TITLE:"Voice Calendar\u306E\u4F7F\u3044\u65B9",SECTIONS:[{title:"\u4E88\u5B9A\u3092\u767B\u9332\u3059\u308B",icon:"\u{1F3A4}",items:["\u97F3\u58F0\u30E1\u30C3\u30BB\u30FC\u30B8\u3067\u4E88\u5B9A\u3092\u8A71\u3057\u3066\u304F\u3060\u3055\u3044","\u3010\u57FA\u672C\u7684\u306A\u4F7F\u3044\u65B9\u3011","\u4F8B\uFF1A\u300C\u660E\u65E5\u306E10\u6642\u304B\u3089\u4F1A\u8B70\u300D","\u4F8B\uFF1A\u300C\u6765\u9031\u6708\u66DC14\u6642\u304B\u30892\u6642\u9593\u6253\u3061\u5408\u308F\u305B\u300D","\u4F8B\uFF1A\u300C1\u670825\u65E5\u306E15\u6642\u304B\u3089\u6B6F\u533B\u8005\u300D","\u3010\u65E5\u4ED8\u306E\u6307\u5B9A\u3011","\u30FB\u6307\u5B9A\u306A\u3057 \u2192 \u4ECA\u65E5\u306E\u4E88\u5B9A\u3068\u3057\u3066\u767B\u9332","\u30FB\u300C\u660E\u65E5\u300D\u300C\u6765\u9031\u6708\u66DC\u300D\u306A\u3069\u76F8\u5BFE\u7684\u306A\u8868\u73FE\u3082OK","\u30FB\u300C1\u670825\u65E5\u300D\u306E\u3088\u3046\u306A\u5177\u4F53\u7684\u306A\u65E5\u4ED8\u3082OK","\u3010\u6642\u523B\u306E\u6307\u5B9A\u3011","\u30FB\u6307\u5B9A\u306A\u3057 \u2192 \u73FE\u5728\u6642\u523B\u309215\u5206\u5358\u4F4D\u3067\u5207\u308A\u4E0A\u3052","\u3000(\u4F8B: 9:03\u21929:15\u30019:47\u219210:00)","\u30FB\u958B\u59CB\u6642\u523B\u306E\u307F\u6307\u5B9A \u2192 1\u6642\u9593\u306E\u4E88\u5B9A\u3068\u3057\u3066\u767B\u9332","\u30FB\u300C2\u6642\u9593\u300D\u306A\u3069\u6642\u9593\u3092\u6307\u5B9A \u2192 \u305D\u306E\u9577\u3055\u3067\u767B\u9332","\u30FB\u300C14\u6642\u307E\u3067\u300D\u306A\u3069\u7D42\u4E86\u6642\u523B\u3092\u6307\u5B9A \u2192 \u305D\u306E\u6642\u523B\u307E\u3067"]},{title:"\u4E88\u5B9A\u3092\u78BA\u8A8D\u3059\u308B",icon:"\u{1F4C5}",items:["\u300C\u4ECA\u65E5\u306E\u4E88\u5B9A\u300D\u2192 \u4ECA\u65E5\u306E\u4E88\u5B9A\u4E00\u89A7","\u300C\u4ECA\u9031\u306E\u4E88\u5B9A\u300D\u2192 \u76F4\u8FD17\u65E5\u9593\u306E\u4E88\u5B9A"]},{title:"\u305D\u306E\u4ED6",icon:"\u{1F4A1}",items:["\u300C\u30D8\u30EB\u30D7\u300D\u2192 \u3053\u306E\u4F7F\u3044\u65B9\u3092\u8868\u793A","\u300C\u30ED\u30B0\u30A2\u30A6\u30C8\u300D\u2192 Google\u30AB\u30EC\u30F3\u30C0\u30FC\u3068\u306E\u9023\u643A\u3092\u89E3\u9664"]}]}};var j=(e,t)=>{let o=new Date(e.startTime),r=new Date(e.endTime),s=ve(o),a=`${R(o)} \u301C ${R(r)}`;return{altText:`\u2705 \u30A4\u30D9\u30F3\u30C8\u3092\u4F5C\u6210\u3057\u307E\u3057\u305F: ${e.title}`,contents:{type:"bubble",size:"kilo",header:{type:"box",layout:"horizontal",contents:[{type:"text",text:"\u2705",size:"lg",flex:0},{type:"text",text:"\u30A4\u30D9\u30F3\u30C8\u3092\u4F5C\u6210\u3057\u307E\u3057\u305F",size:"md",weight:"bold",color:n.COLORS.TEXT_PRIMARY,margin:"sm",flex:1}],backgroundColor:"#F0FFF0",paddingAll:"lg"},body:{type:"box",layout:"vertical",contents:[{type:"text",text:e.title,size:"lg",weight:"bold",color:n.COLORS.TEXT_PRIMARY,wrap:!0},{type:"separator",margin:"lg"},{type:"box",layout:"horizontal",contents:[{type:"text",text:"\u{1F4C5}",size:"sm",flex:0},{type:"text",text:s,size:"sm",color:n.COLORS.TEXT_SECONDARY,margin:"sm",flex:1}],margin:"lg"},{type:"box",layout:"horizontal",contents:[{type:"text",text:"\u{1F552}",size:"sm",flex:0},{type:"text",text:a,size:"sm",color:n.COLORS.TEXT_SECONDARY,margin:"sm",flex:1}],margin:"sm"}],paddingAll:"lg"},footer:{type:"box",layout:"vertical",contents:[{type:"button",action:{type:"uri",label:"\u30AB\u30EC\u30F3\u30C0\u30FC\u3067\u898B\u308B",uri:t},style:"primary",color:n.COLORS.PRIMARY}],paddingAll:"lg"}}}},W=e=>{let t=new Date,o=["\u65E5","\u6708","\u706B","\u6C34","\u6728","\u91D1","\u571F"],r=`${t.getMonth()+1}/${t.getDate()}\uFF08${o[t.getDay()]}\uFF09`;if(e.length===0)return Z("\u4ECA\u65E5\u306E\u4E88\u5B9A",r,d.NO_EVENTS_TODAY);e.sort((a,i)=>a.startTime-i.startTime);let s=e.map(a=>Fe(a));return{altText:`\u{1F4C5} \u4ECA\u65E5\u306E\u4E88\u5B9A\uFF08${e.length}\u4EF6\uFF09`,contents:{type:"bubble",size:"mega",header:{type:"box",layout:"horizontal",contents:[{type:"text",text:"\u{1F4C5}",size:"xl",flex:0},{type:"box",layout:"vertical",contents:[{type:"text",text:"\u4ECA\u65E5\u306E\u4E88\u5B9A",size:"lg",weight:"bold",color:"#FFFFFF"},{type:"text",text:r,size:"sm",color:"#FFFFFFBB"}],margin:"md",flex:1}],backgroundColor:n.COLORS.PRIMARY,paddingAll:"lg"},body:{type:"box",layout:"vertical",contents:s,paddingAll:"lg",spacing:"md"},footer:{type:"box",layout:"vertical",contents:[{type:"text",text:`${e.length}\u4EF6\u306E\u4E88\u5B9A`,size:"sm",color:n.COLORS.TEXT_SECONDARY,align:"center"}],paddingAll:"md"}}}},Fe=e=>({type:"box",layout:"horizontal",contents:[{type:"text",text:e.isAllDay?"\u7D42\u65E5":R(e.startTime),size:"sm",color:n.COLORS.ACCENT,weight:"bold",flex:0},{type:"text",text:e.title,size:"sm",color:n.COLORS.TEXT_PRIMARY,wrap:!0,margin:"lg",flex:1}],paddingAll:"sm",backgroundColor:"#F8F8F8",cornerRadius:"md"}),V=e=>{let t=Object.keys(e),o=0;if(t.forEach(s=>{o+=e[s].events.length}),o===0)return Z("\u4ECA\u9031\u306E\u4E88\u5B9A","\u76F4\u8FD17\u65E5\u9593",d.NO_EVENTS_WEEK);let r=t.map(s=>{let a=e[s],i=a.date,l=a.events,c=Ie(i,new Date);return De(i,l,c)});return{altText:`\u{1F4C5} \u4ECA\u9031\u306E\u4E88\u5B9A\uFF08${o}\u4EF6\uFF09`,contents:{type:"bubble",size:"mega",header:{type:"box",layout:"horizontal",contents:[{type:"text",text:"\u{1F4C5}",size:"xl",flex:0},{type:"box",layout:"vertical",contents:[{type:"text",text:"\u4ECA\u9031\u306E\u4E88\u5B9A",size:"lg",weight:"bold",color:"#FFFFFF"},{type:"text",text:"\u76F4\u8FD17\u65E5\u9593",size:"sm",color:"#FFFFFFBB"}],margin:"md",flex:1}],backgroundColor:n.COLORS.ACCENT,paddingAll:"lg"},body:{type:"box",layout:"vertical",contents:r,paddingAll:"lg",spacing:"sm"},footer:{type:"box",layout:"vertical",contents:[{type:"text",text:`\u5408\u8A08 ${o}\u4EF6\u306E\u4E88\u5B9A`,size:"sm",color:n.COLORS.TEXT_SECONDARY,align:"center"}],paddingAll:"md"}}}},De=(e,t,o)=>{let r=["\u65E5","\u6708","\u706B","\u6C34","\u6728","\u91D1","\u571F"],s=e.getMonth()+1,a=e.getDate(),i=r[e.getDay()],l=`${s}/${a}\uFF08${i}\uFF09`,c=t.length,p=c===0?"\u2212":`${c}\u4EF6`,le=c===0?"\u4E88\u5B9A\u306A\u3057":t.slice(0,2).map(C=>C.title).join(", ").substring(0,20)+(t.slice(0,2).map(C=>C.title).join(", ").length>20||c>2?"...":""),pe=o?"#E8F5E9":"#F8F8F8",ge=o?n.COLORS.PRIMARY:n.COLORS.TEXT_PRIMARY;return{type:"box",layout:"horizontal",contents:[{type:"text",text:l,size:"sm",weight:"bold",color:ge,flex:0},{type:"text",text:p,size:"sm",color:c===0?n.COLORS.SECONDARY:n.COLORS.ACCENT,weight:c===0?"regular":"bold",margin:"lg",flex:0},{type:"text",text:le,size:"xs",color:n.COLORS.TEXT_SECONDARY,wrap:!1,margin:"md",flex:1}],paddingAll:"md",backgroundColor:pe,cornerRadius:"md"}},Z=(e,t,o)=>({altText:o,contents:{type:"bubble",size:"kilo",body:{type:"box",layout:"vertical",contents:[{type:"text",text:"\u{1F4C5}",size:"3xl",align:"center"},{type:"text",text:e,size:"lg",weight:"bold",align:"center",margin:"lg",color:n.COLORS.TEXT_PRIMARY},{type:"text",text:t,size:"sm",align:"center",color:n.COLORS.TEXT_SECONDARY},{type:"separator",margin:"xl"},{type:"text",text:o,size:"md",align:"center",margin:"xl",color:n.COLORS.TEXT_SECONDARY}],paddingAll:"xl"}}}),Q=()=>{let e=d.HELP,t=e.SECTIONS.flatMap((o,r)=>({type:"box",layout:"vertical",contents:[{type:"box",layout:"horizontal",contents:[{type:"text",text:o.icon,size:"md",flex:0},{type:"text",text:o.title,size:"md",weight:"bold",color:n.COLORS.TEXT_PRIMARY,margin:"sm",flex:1}]},{type:"box",layout:"vertical",contents:o.items.map(a=>({type:"text",text:a,size:"sm",color:n.COLORS.TEXT_SECONDARY,wrap:!0,margin:"sm"})),margin:"sm",paddingStart:"lg"}],margin:r===0?"none":"xl"}));return{altText:"Voical\u306E\u4F7F\u3044\u65B9",contents:{type:"bubble",size:"mega",header:{type:"box",layout:"horizontal",contents:[{type:"text",text:"\u2753",size:"xl",flex:0},{type:"text",text:e.TITLE,size:"lg",weight:"bold",color:"#FFFFFF",margin:"md",flex:1}],backgroundColor:"#7B7B7B",paddingAll:"lg"},body:{type:"box",layout:"vertical",contents:t,paddingAll:"lg"}}}},ve=e=>{let t=["\u65E5","\u6708","\u706B","\u6C34","\u6728","\u91D1","\u571F"],o=e.getMonth()+1,r=e.getDate(),s=t[e.getDay()];return`${o}\u6708${r}\u65E5\uFF08${s}\uFF09`},R=e=>{let t=e.getHours(),o=e.getMinutes().toString().padStart(2,"0");return`${t}:${o}`},Ie=(e,t)=>e.getFullYear()===t.getFullYear()&&e.getMonth()===t.getMonth()&&e.getDate()===t.getDate(),ee=e=>({altText:"Google\u30AB\u30EC\u30F3\u30C0\u30FC\u3068\u306E\u9023\u643A\u304C\u5FC5\u8981\u3067\u3059",contents:{type:"bubble",size:"kilo",body:{type:"box",layout:"vertical",contents:[{type:"text",text:"\u{1F510}",size:"3xl",align:"center"},{type:"text",text:"\u30AB\u30EC\u30F3\u30C0\u30FC\u9023\u643A",size:"lg",weight:"bold",align:"center",margin:"lg",color:n.COLORS.TEXT_PRIMARY},{type:"text",text:`Google\u30AB\u30EC\u30F3\u30C0\u30FC\u3068\u306E\u9023\u643A\u304C\u5FC5\u8981\u3067\u3059\u3002
\u4E0B\u306E\u30DC\u30BF\u30F3\u3092\u30BF\u30C3\u30D7\u3057\u3066\u8A8D\u8A3C\u3057\u3066\u304F\u3060\u3055\u3044\u3002`,size:"sm",color:n.COLORS.TEXT_SECONDARY,wrap:!0,align:"center",margin:"lg"}],paddingAll:"xl"},footer:{type:"box",layout:"vertical",contents:[{type:"button",action:{type:"uri",label:"Google\u30A2\u30AB\u30A6\u30F3\u30C8\u3067\u9023\u643A",uri:e+(e.includes("?")?"&":"?")+"openExternalBrowser=1"},style:"primary",color:n.COLORS.GOOGLE_BLUE}],paddingAll:"lg"}}}),te=e=>({altText:"\u518D\u8A8D\u8A3C\u304C\u5FC5\u8981\u3067\u3059",contents:{type:"bubble",size:"kilo",body:{type:"box",layout:"vertical",contents:[{type:"text",text:"\u{1F504}",size:"3xl",align:"center"},{type:"text",text:"\u518D\u8A8D\u8A3C\u304C\u5FC5\u8981\u3067\u3059",size:"lg",weight:"bold",align:"center",margin:"lg",color:n.COLORS.TEXT_PRIMARY},{type:"text",text:`\u30AB\u30EC\u30F3\u30C0\u30FC\u3078\u306E\u30A2\u30AF\u30BB\u30B9\u6A29\u9650\u304C\u7121\u52B9\u306B\u306A\u308A\u307E\u3057\u305F\u3002
\u518D\u5EA6\u8A8D\u8A3C\u3057\u3066\u304F\u3060\u3055\u3044\u3002`,size:"sm",color:n.COLORS.TEXT_SECONDARY,wrap:!0,align:"center",margin:"lg"}],paddingAll:"xl"},footer:{type:"box",layout:"vertical",contents:[{type:"button",action:{type:"uri",label:"\u518D\u8A8D\u8A3C\u3059\u308B",uri:e+(e.includes("?")?"&":"?")+"openExternalBrowser=1"},style:"primary",color:n.COLORS.GOOGLE_BLUE}],paddingAll:"lg"}}});var oe=(e,t,o)=>{let r=U(t);if(!r){m(e,d.AUDIO_FETCH_FAILED);return}let s=z(r);if(!s){m(e,d.SPEECH_RECOGNITION_FAILED);return}let a=G(s);if(!a){m(e,d.EVENT_EXTRACTION_FAILED(s));return}let i=B(o,a);if(i.success&&i.eventId){let l=K(i.eventId),c=j(a,l);u(e,c)}else if(i.requiresReauth){let l=y(o),c=te(l);u(e,c)}else m(e,d.CALENDAR_CREATION_FAILED)};var b=e=>{let t=Q();u(e,t)};var S=(e,t)=>{let o=X(t),r=V(o);u(e,r)};var N=(e,t)=>{let o=q(t),r=W(o);u(e,r)};var L=(e,t)=>{A(t),m(e,`\u30ED\u30B0\u30A2\u30A6\u30C8\u3057\u307E\u3057\u305F\u3002
\u518D\u5EA6\u5229\u7528\u3059\u308B\u5834\u5408\u306F\u3001\u8A8D\u8A3C\u304C\u5FC5\u8981\u3067\u3059\u3002`)};var T=e=>{m(e,d.REQUEST_AUDIO)};var re=(e,t)=>{let o=y(t,!0),r=ee(o);u(e,r)};var ne=e=>{let t=e.replyToken,o=_e(e);if(!o){g("processLineEvent","userId\u3092\u53D6\u5F97\u3067\u304D\u307E\u305B\u3093\u3067\u3057\u305F"),T(t);return}if(!P(o)){re(t,o);return}Ue(e)?oe(t,e.message.id,o):we(e)?Me(t,e.message.text,o):$e(e)?He(t,e.postback.data,o):T(t)},_e=e=>e.source?.userId,Me=(e,t,o)=>{let r=t.trim();Ge(r)?b(e):ze(r)?S(e,o):ke(r)?N(e,o):Pe(r)?L(e,o):T(e)},Ue=e=>e.type==="message"&&e.message.type==="audio",we=e=>e.type==="message"&&e.message.type==="text",ke=e=>n.COMMANDS.TODAY.some(t=>e.includes(t)),ze=e=>n.COMMANDS.WEEK.some(t=>e.includes(t)),Ge=e=>n.COMMANDS.HELP.some(t=>e.includes(t)),Pe=e=>n.COMMANDS.LOGOUT.some(t=>e.includes(t)),$e=e=>e.type==="postback"&&e.postback,He=(e,t,o)=>{let r=t.match(/action=([^&]+)/);switch(r?r[1]:null){case"logout":L(e,o);break;case"today":N(e,o);break;case"week":S(e,o);break;case"help":b(e);break;default:T(e)}},x=(e,t)=>{console.log(`${e}: ${t}`)},g=(e,t)=>{console.log(`${e}\u30A8\u30E9\u30FC: ${t}`)};var F=e=>{let t=$(e);return t.success?HtmlService.createHtmlOutput(Ye()):HtmlService.createHtmlOutput(Be(t.error||"\u4E0D\u660E\u306A\u30A8\u30E9\u30FC"))},Ye=()=>`
<!DOCTYPE html>
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
      background: linear-gradient(135deg, ${n.COLORS.PRIMARY} 0%, #00a040 100%);
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
      background: ${n.COLORS.PRIMARY};
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
      color: ${n.COLORS.TEXT_PRIMARY};
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 12px;
    }
    p {
      color: ${n.COLORS.TEXT_SECONDARY};
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
</html>
  `.trim(),Be=e=>`
<!DOCTYPE html>
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
      color: ${n.COLORS.TEXT_PRIMARY};
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 12px;
    }
    p {
      color: ${n.COLORS.TEXT_SECONDARY};
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
    <div class="error-detail">${qe(e)}</div>
    <p class="note">\u3053\u306E\u30DA\u30FC\u30B8\u306F\u9589\u3058\u3066OK\u3067\u3059</p>
  </div>
</body>
</html>
  `.trim(),qe=e=>e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;");function ie(e){let t=JSON.parse(e.postData.contents);if(!Xe(t))return se({status:"no events"});let o=t.events[0];return ne(o),se({status:"ok"})}function ae(e){if(Logger.log("DoGETTTTTTTTTTTTTTTT"),e.parameter&&e.parameter.code)return F(e);let t=E(e.parameter.userId);if(!t.handleCallback(e)){let r=t.getLastError();Logger.log("Error details: "+r)}return ContentService.createTextOutput("\u2705 \u5168\u30B5\u30FC\u30D3\u30B9\u306E\u8A8D\u8A3C\u304C\u5B8C\u4E86\u3057\u307E\u3057\u305F\u3002\u3053\u306E\u30DA\u30FC\u30B8\u306F\u9589\u3058\u3066OK\u3067\u3059\u3002").setMimeType(ContentService.MimeType.TEXT)}function ce(e){return F(e)}var Xe=e=>e.events&&e.events.length>0,se=e=>ContentService.createTextOutput(JSON.stringify(e)).setMimeType(ContentService.MimeType.JSON);global.doPost=ie;global.doGet=ae;global.authCallback=ce;})();
