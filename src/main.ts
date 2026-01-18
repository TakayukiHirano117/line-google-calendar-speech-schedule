import { doPost } from "./index";
import { doGet } from "./index";

interface Global {
    doPost: typeof doPost;
    doGet: typeof doGet;
}
declare const global: Global;
// entryPoints
global.doPost = doPost;
global.doGet = doGet;
