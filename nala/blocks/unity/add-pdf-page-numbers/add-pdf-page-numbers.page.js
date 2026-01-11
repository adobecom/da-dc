import AcrobatWidget from '../../../widget/acrobat-widget.cjs';

export default class AddPdfPageNumbers extends AcrobatWidget {
  constructor(page, nth = 0) {
    super(page, '.number-pages.unity-enabled', nth);
  }
}
