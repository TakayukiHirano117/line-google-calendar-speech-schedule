import { doPost, doGet, authCallback } from "./index";

interface Global {
    doPost: typeof doPost;
    doGet: typeof doGet;
    authCallback: typeof authCallback;
}
declare const global: Global;
// entryPoints
global.doPost = doPost;
global.doGet = doGet;
global.authCallback = authCallback;
