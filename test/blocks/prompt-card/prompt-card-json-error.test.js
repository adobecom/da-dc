/* eslint-disable compat/compat */
import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';

const { default: init } = await import('../../../acrobat/blocks/prompt-card/prompt-card.js');

describe('prompt-cards using json feature', () => {
  let originalLana;
  let section;

  beforeEach(() => {
    originalLana = window.lana;
    window.lana = { log: sinon.stub() };
    sinon.stub(window, 'fetch');
    section = document.createElement('div');
    section.innerHTML = `
      <div class="prompt-card json">
        <div><div>Json</div><div>/dc-shared/promptcards.json</div></div>
      </div>`;
    document.body.append(section);
  });

  afterEach(() => {
    sinon.restore();
    section.remove();
    window.lana = originalLana;
  });

  it('logs an unsuccessful response once and removes the block', async () => {
    window.fetch.resolves(new Response('Not Found', { status: 404 }));

    await init(section.querySelector('.prompt-card'));

    expect(section.querySelector('.prompt-card')).to.be.null;
    expect(window.lana.log.calledOnce).to.be.true;
    expect(window.lana.log.firstCall.args).to.deep.equal([
      'Prompt Card: data request failed; HTTP 404',
      { severity: 'error', tags: 'DC_Milo,prompt-card' },
    ]);
  });

  it('renders valid data without a failure log', async () => {
    const data = [{ prefix: 'Ask', title: 'Summary', prompt: 'Summarize this document.' }];
    window.fetch.resolves(new Response(JSON.stringify({ data })));

    await init(section.querySelector('.prompt-card'));

    expect(section.querySelector('.prompt-copy').textContent).to.equal('Summarize this document.');
    expect(window.lana.log.called).to.be.false;
  });
});
