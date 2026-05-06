import AcrobatWidget from '../../widget/acrobat-widget.js';

export default class PdfToPpt extends AcrobatWidget {
  constructor(page, nth = 0) {
    super(page, '.pdf-to-ppt.unity-enabled', nth);
  }
}
