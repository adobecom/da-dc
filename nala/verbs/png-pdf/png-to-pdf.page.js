import AcrobatWidget from '../../widget/acrobat-widget.js';

export default class PngToPdf extends AcrobatWidget {
  constructor(page, nth = 0) {
    super(page, '.png-to-pdf.unity-enabled', nth);
  }
}
