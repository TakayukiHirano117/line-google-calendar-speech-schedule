import { HandleOAuthCallbackUseCase } from '../usecase/HandleOAuthCallbackUseCase';
import { TemplateHelper } from '../helper/view/TemplateHelper';
import { getOAuth2ClientId, getOAuth2ClientSecret } from '../config/getProperty';
import { CONFIG } from '../config/index';
import successTemplate from '../view/oauth/success.html';
import errorTemplate from '../view/oauth/error.html';

export class OAuthCallbackHandler {
  private readonly handleOAuthCallbackUseCase: HandleOAuthCallbackUseCase;
  private readonly templateHelper: TemplateHelper;

  constructor() {
    this.handleOAuthCallbackUseCase = new HandleOAuthCallbackUseCase();
    this.templateHelper = new TemplateHelper();
  }
  
  public handleOAuthCallback(e: GoogleAppsScript.Events.DoGet): GoogleAppsScript.HTML.HtmlOutput {
    const userId = e.parameter?.userId;

    if (!userId) {
      return HtmlService.createHtmlOutput(
        this.buildErrorHtml('ユーザー情報が取得できませんでした')
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
    return HtmlService.createHtmlOutput(this.buildErrorHtml(result.error || '不明なエラー'));
  }

  private  buildSuccessHtml(): string {
    return this.templateHelper.applyVariables(successTemplate, {
      PRIMARY_COLOR: CONFIG.COLORS.PRIMARY,
      TEXT_PRIMARY: CONFIG.COLORS.TEXT_PRIMARY,
      TEXT_SECONDARY: CONFIG.COLORS.TEXT_SECONDARY,
    });
  }

  private buildErrorHtml(error: string): string {
    return this.templateHelper
      .applyVariables(errorTemplate, {
        TEXT_PRIMARY: CONFIG.COLORS.TEXT_PRIMARY,
        TEXT_SECONDARY: CONFIG.COLORS.TEXT_SECONDARY,
      })
      .replace('{{ERROR_MESSAGE}}', this.templateHelper.escapeHtml(error));
  }
}