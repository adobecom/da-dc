import AcrobatWidget from '../../widget/acrobat-widget.js';

export default class PdfToPng extends AcrobatWidget {
  constructor(page, nth = 0) {
    super(page, '.pdf-to-png.unity-enabled', nth);
  }
}
