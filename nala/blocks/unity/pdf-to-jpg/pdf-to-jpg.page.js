import AcrobatWidget from '../../../widget/acrobat-widget.cjs';

export default class PdfToJpg extends AcrobatWidget {
  constructor(page, nth = 0) {
    super(page, '.pdf-to-image.unity-enabled', nth);
  }
}
