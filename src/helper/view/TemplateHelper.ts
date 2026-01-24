/**
 * HTMLテンプレート処理のヘルパークラス
 */
export class TemplateHelper {
  /**
   * テンプレート変数を置換
   * @param template テンプレート文字列
   * @param variables 置換する変数の辞書
   * @returns 変数が置換されたテンプレート文字列
   */
  public applyVariables(template: string, variables: Record<string, string>): string {
    let result = template;
    for (const [key, value] of Object.entries(variables)) {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }
    return result;
  }

  /**
   * HTMLエスケープ
   * @param text エスケープ対象のテキスト
   * @returns エスケープされたテキスト
   */
  public escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
