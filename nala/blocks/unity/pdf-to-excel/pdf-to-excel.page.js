import AcrobatWidget from '../../../widget/acrobat-widget.cjs';

export default class PdfToExcel extends AcrobatWidget {
  constructor(page, nth = 0) {
    super(page, '.pdf-to-excel.unity-enabled', nth);
  }
}
