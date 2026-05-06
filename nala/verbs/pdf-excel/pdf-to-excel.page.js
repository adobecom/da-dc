import AcrobatWidget from '../../widget/acrobat-widget.js';

export default class PdfToExcel extends AcrobatWidget {
  constructor(page, nth = 0) {
    super(page, '.pdf-to-excel.unity-enabled', nth);
  }
}
