import AcrobatWidget from '../../widget/acrobat-widget.js';

export default class PdfToWord extends AcrobatWidget {
  constructor(page, nth = 0) {
    super(page, '.pdf-to-word.unity-enabled', nth);
  }
}
