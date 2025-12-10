import AcrobatWidget from '../../../widget/acrobat-widget.cjs';

export default class ExcelToPdf extends AcrobatWidget {
  constructor(page, nth = 0) {
    super(page, '.excel-to-pdf.unity-enabled', nth);
  }
}
