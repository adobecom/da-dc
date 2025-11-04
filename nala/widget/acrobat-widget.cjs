// AcrobatUnityWidget.js
export default class AcrobatWidget {
  constructor(page, widgetSelector, nth = 0) {
    this.page = page;
    this.section = page.locator('.section').nth(nth);
    this.widget = page.locator(widgetSelector).nth(nth);

    this.dropZone = this.widget.locator('#drop-zone');
    this.verbRow = this.widget.locator('.verb-row').nth(0);
    this.verbHeader = this.verbRow.locator('.verb-heading');
    this.verbCopy = this.verbRow.locator('.verb-copy');
    this.acrobatIcon = this.verbRow.locator('.acrobat-icon svg');
    this.verbTitle = this.verbRow.locator('.verb-title');
    this.verbImage = this.widget.locator('.verb-image');

    this.uploadButton = page.locator('button.verb-cta', { hasText: 'Select a file' }).nth(nth);
    this.fileInput = page.locator('input[type="file"]#file-upload');

    this.verbError = page.locator('.verb-error');
    this.verbErrorIcon = this.verbError.locator('.verb-errorIcon');
    this.verbErrorText = this.verbError.locator('.verb-errorText');
  }
}
