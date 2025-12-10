import AcrobatWidget from '../../../widget/acrobat-widget.cjs';

export default class SplitPdf extends AcrobatWidget {
  constructor(page, nth = 0) {
    super(page, '.split-pdf.unity-enabled', nth);
  }
}
