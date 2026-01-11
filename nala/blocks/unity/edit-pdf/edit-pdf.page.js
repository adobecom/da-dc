import AcrobatWidget from '../../../widget/acrobat-widget.cjs';

export default class EditPdf extends AcrobatWidget {
  constructor(page, nth = 0) {
    super(page, '.add-comment.unity-enabled', nth);
  }
}
