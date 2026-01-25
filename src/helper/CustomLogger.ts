/**
 * アプリケーション全体のログ出力を担当するクラス
 */
export class CustomLogger {
  /**
   * デバッグログを出力
   * @param context - コンテキスト
   * @param message - メッセージ
   */
  public static logDebug(context: string, message: string): void {
    console.log(`${context}: ${message}`);
  }

  /**
   * エラーログを出力
   * @param context - コンテキスト
   * @param error - エラー
   */
  public static logError(context: string, error: unknown): void {
    console.log(`${context}エラー: ${error}`);
  }
}
