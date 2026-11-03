import { expect } from '@esm-bundle/chai';

const {
  ALL_FILES,
  GB2,
  MB5,
  MB20,
  MB25,
  MB100,
  MB250,
  MULTI_ALL,
  PDF_ONLY,
  SINGLE_PDF,
  groupLimits,
} = await import('../../acrobat/scripts/uploadLimits.js');

describe('uploadLimits', () => {
  it('defines file sizes in bytes', () => {
    expect([MB5, MB20, MB25, MB100, MB250, GB2])
      .to.deep.equal([5242880, 20971520, 26214400, 104857600, 262144000, 2147483648]);
  });

  it('defines the shared upload presets', () => {
    expect(SINGLE_PDF).to.deep.equal({
      maxFileSize: MB100,
      acceptedFiles: PDF_ONLY,
      maxNumFiles: 1,
    });
    expect(MULTI_ALL).to.deep.equal({
      maxFileSize: MB100,
      acceptedFiles: ALL_FILES,
      multipleFiles: true,
    });
    expect(ALL_FILES).to.include.members(['.pdf', '.docx', '.psd', '.tiff']);
  });

  it('assigns one config to several verbs', () => {
    const config = { maxFileSize: MB20 };
    expect(groupLimits(['a', 'b'], config)).to.deep.equal({ a: config, b: config });
    expect(groupLimits([], config)).to.deep.equal({});
  });
});
