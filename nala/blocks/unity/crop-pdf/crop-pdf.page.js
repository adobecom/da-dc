import AcrobatWidget from '../../../widget/acrobat-widget.cjs';

export default class CropPdf extends AcrobatWidget {
  constructor(page, nth = 0) {
    super(page, '.crop-pages.unity-enabled', nth);
  }
}
