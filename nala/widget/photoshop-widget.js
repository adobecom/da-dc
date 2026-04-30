// photoshop-upload.cjs
export default class PhotoshopWidget {
  constructor(page, widgetSelector, nth = 0) {
    this.page = page;
    this.section = page.locator('.section').nth(nth);
    this.widget = page.locator(widgetSelector).nth(nth);

    // Headings and description
    this.detailText = this.section.locator('p.detail-m');
    this.heading = this.section.locator('h1.heading-xxl');
    this.description = this.section.locator('p.body-l');

    // Media preview image
    this.mediaImage = this.widget.locator('.media-container img');

    // Drop zone
    this.dropZone = this.widget.locator('.drop-zone').nth(2);
    this.dropZoneText = this.dropZone.locator('p').nth(0);
    this.dropZoneFileInfo = this.dropZone.locator('p').nth(1);

    // Upload button & file input
    this.uploadButton = this.widget.locator('button.action-button', { hasText: 'Upload your photo' });
    this.fileInput = this.widget.locator('input[type="file"]#file-upload');

    // Terms and policies links
    this.termsLink = this.widget.locator('a', { hasText: 'Terms of Use' });
    this.privacyLink = this.widget.locator('a', { hasText: 'Privacy Policy' });

    // Error messages
    this.errorList = this.section.locator('.unity.workflow-upload ul li');
    this.errorFileSize = this.errorList.filter({ hasText: 'File size larger than 40MB' });
    this.errorRequest = this.errorList.filter({ hasText: 'Unable to process the request' });
    this.errorFileType = this.errorList.filter({ hasText: 'process this file type' });
    this.errorFileCount = this.errorList.filter({ hasText: 'Only one file can be uploaded' });
    this.errorFileDimension = this.errorList.filter({ hasText: 'Image exceeds maximum dimensions' });
  }

  async getErrors() {
    return this.errorList.allTextContents();
  }
}
