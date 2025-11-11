import AcrobatWidget from '../../../widget/acrobat-widget.cjs';

export default class RequestSignature extends AcrobatWidget {
  constructor(page, nth = 0) {
    super(page, '.sendforsignature.unity-enabled', nth);
  }
}
