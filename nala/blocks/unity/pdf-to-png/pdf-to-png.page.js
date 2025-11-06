import AcrobatWidget from '../../../widget/acrobat-widget.cjs';

export default class PdfToPng extends AcrobatWidget {
  constructor(page, nth = 0) {
    super(page, '.pdf-to-png.unity-enabled', nth);
  }
}
