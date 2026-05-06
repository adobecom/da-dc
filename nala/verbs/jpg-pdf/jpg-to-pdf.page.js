import AcrobatWidget from '../../widget/acrobat-widget.js';

export default class PdfToJpg extends AcrobatWidget {
  constructor(page, nth = 0) {
    super(page, '.jpg-to-pdf.unity-enabled', nth);
  }
}
