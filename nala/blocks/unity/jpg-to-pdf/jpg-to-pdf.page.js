import AcrobatWidget from '../../../widget/acrobat-widget.cjs';

export default class JpgToPdf extends AcrobatWidget {
  constructor(page, nth = 0) {
    super(page, '.jpg-to-pdf.unity-enabled', nth);
  }
}
