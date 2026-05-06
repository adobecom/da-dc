import AcrobatWidget from '../../widget/acrobat-widget.js';

export default class OcrPdf extends AcrobatWidget {
  constructor(page, nth = 0) {
    super(page, '.ocr-pdf.unity-enabled', nth);
  }
}
