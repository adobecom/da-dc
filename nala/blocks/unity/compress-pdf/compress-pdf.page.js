import AcrobatWidget from '../../../widget/acrobat-widget.cjs';

export default class CompressPdf extends AcrobatWidget {
  constructor(page, nth = 0) {
    super(page, '.compress-pdf.unity-enabled', nth);
  }
}
