import AcrobatWidget from '../../../widget/acrobat-widget.cjs';

export default class AiChatPdf extends AcrobatWidget {
  constructor(page, nth = 0) {
    super(page, '.chat-pdf.unity-enabled', nth);
  }
}
