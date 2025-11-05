import AcrobatWidget from '../../../widget/acrobat-widget.cjs';

export default class AddPdfPageNumbers extends AcrobatWidget {
  constructor(page, nth = 0) {
    super(page, '.insert-pdf.unity-enabled', nth);
  }
}
