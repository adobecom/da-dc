import AcrobatWidget from '../../widget/acrobat-widget.js';
import ConverterPage from '../../libs/blocks/converter-page.js';

export default class PdfFiller extends AcrobatWidget {
  constructor(page, nth = 0) {
    super(page, '.verb-widget.fillsign.unity-enabled', nth);

    this.selectFilesButton = this.widget.locator('button.verb-cta');
    this.fileInput = page.locator('input[type="file"]#file-upload');

    this.sections = new ConverterPage(page);
  }
}
