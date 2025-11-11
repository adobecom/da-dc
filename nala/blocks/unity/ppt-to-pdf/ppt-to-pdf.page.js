import AcrobatWidget from '../../../widget/acrobat-widget.cjs';

export default class PptToPdf extends AcrobatWidget {
  constructor(page, nth = 0) {
    super(page, '.ppt-to-pdf.unity-enabled', nth);
  }
}
