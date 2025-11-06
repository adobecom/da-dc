import AcrobatWidget from '../../../widget/acrobat-widget.cjs';

export default class MergePdf extends AcrobatWidget {
  constructor(page, nth = 0) {
    super(page, '.combine-pdf.unity-enabled', nth);
  }
}
