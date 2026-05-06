import AcrobatWidget from '../../widget/acrobat-widget.js';

export default class WordToPdf extends AcrobatWidget {
  constructor(page, nth = 0) {
    super(page, '.word-to-pdf.unity-enabled', nth);
  }
}
