import AcrobatWidget from '../../../widget/acrobat-widget.cjs';

export default class ExtractPdfPages extends AcrobatWidget {
  constructor(page, nth = 0) {
    super(page, '.extract-pages.unity-enabled', nth);
  }
}
