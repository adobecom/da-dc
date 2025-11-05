import AcrobatWidget from '../../../widget/acrobat-widget.cjs';

export default class DeletePdfPages extends AcrobatWidget {
  constructor(page, nth = 0) {
    super(page, '.delete-pages.unity-enabled', nth);
  }
}
