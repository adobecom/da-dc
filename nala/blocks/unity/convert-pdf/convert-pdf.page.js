import AcrobatWidget from '../../../widget/acrobat-widget.cjs';

export default class ConvertPdf extends AcrobatWidget {
  constructor(page, nth = 0) {
    super(page, '.createpdf.unity-enabled', nth);
  }
}
