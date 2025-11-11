import AcrobatWidget from '../../../widget/acrobat-widget.cjs';

export default class RearrangePdf extends AcrobatWidget {
  constructor(page, nth = 0) {
    super(page, '.reorder-pages.unity-enabled', nth);
  }
}
