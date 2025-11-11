import AcrobatWidget from '../../../widget/acrobat-widget.cjs';

export default class StudyWithAcrobat extends AcrobatWidget {
  constructor(page, nth = 0) {
    super(page, '.chat-pdf-student.unity-enabled', nth);
  }
}
