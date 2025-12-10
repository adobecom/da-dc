import AcrobatWidget from '../../../widget/acrobat-widget.cjs';

export default class ProtectPdf extends AcrobatWidget {
  constructor(page, nth = 0) {
    super(page, '.protect-pdf.unity-enabled', nth);
  }
}
