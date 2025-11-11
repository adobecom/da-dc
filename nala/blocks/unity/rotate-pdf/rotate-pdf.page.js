import AcrobatWidget from '../../../widget/acrobat-widget.cjs';

export default class RotatePdf extends AcrobatWidget {
  constructor(page, nth = 0) {
    super(page, '.rotate-pages.unity-enabled', nth);
  }
}
