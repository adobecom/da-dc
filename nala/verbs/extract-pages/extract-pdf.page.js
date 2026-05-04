export default class ExtractPages {
  constructor(page, nth = 0) {
    this.page = page;
    // Extract Pages Pdf widget locators
    this.section = this.page.locator('.section').nth(nth);
    this.extractPages = this.page.locator('.extract-pages.unity-enabled').nth(nth);
    this.dropZone = this.extractPages.locator('#drop-zone');
    this.verbRow = this.extractPages.locator('.verb-row').nth(0);
    this.verbHeader = this.verbRow.locator('.verb-heading');
    this.verbCopy = this.verbRow.locator('.verb-copy');
    this.acrobatIcon = this.verbRow.locator('.acrobat-icon svg');
    this.verbTitle = this.verbRow.locator('.verb-title');
    this.verbImage = this.extractPages.locator('.verb-image');
    // file upload locators
    this.uploadButton = this.page.locator('button.verb-cta', { hasText: 'Select a file' }).nth(nth);
    this.fileInput = this.page.locator('input[type="file"]#file-upload');
    // file upload error locators
    this.verbError = this.page.locator('.verb-error');
    this.verbErrorIcon = this.verbError.locator('.verb-errorIcon');
    this.verbErrorText = this.verbError.locator('.verb-errorText');
  }
}
