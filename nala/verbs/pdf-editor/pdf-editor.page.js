export default class PdfEditor {
  constructor(page, nth = 0) {
    this.page = page;
    // compress-pdf widget locators
    this.section = this.page.locator('.section').nth(nth);
    this.PdfEditor = this.page.locator('.add-comment.unity-enabled').nth(nth);
    this.dropZone = this.PdfEditor.locator('#drop-zone');
    this.verbRow = this.PdfEditor.locator('.verb-row').nth(0);
    this.verbHeader = this.verbRow.locator('.verb-heading');
    this.verbCopy = this.verbRow.locator('.verb-copy');
    this.acrobatIcon = this.verbRow.locator('.acrobat-icon svg');
    this.verbTitle = this.verbRow.locator('.verb-title');
    this.verbImage = this.PdfEditor.locator('.verb-image');

    this.uploadButton = this.page.locator('button.verb-cta', { hasText: 'Select a file' }).nth(nth);
    this.fileInput = this.page.locator('input[type="file"]#file-upload');

    this.verbError = this.page.locator('.verb-error');
    this.verbErrorIcon = this.verbError.locator('.verb-errorIcon');
    this.verbErrorText = this.verbError.locator('.verb-errorText');
  }
}
