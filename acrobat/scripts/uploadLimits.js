const MB = 1024 * 1024;

export const MB5 = 5 * MB;
export const MB20 = 20 * MB;
export const MB25 = 25 * MB;
export const MB100 = 100 * MB;
export const MB250 = 250 * MB;
export const GB2 = 2048 * MB;

export const PDF_ONLY = ['.pdf'];
export const ALL_FILES = ['.pdf', '.doc', '.docx', '.xml', '.ppt', '.pptx', '.xls', '.xlsx', '.rtf', '.txt', '.text', '.ai', '.form', '.bmp', '.gif', '.indd', '.jpeg', '.jpg', '.png', '.psd', '.tif', '.tiff'];

export const SINGLE_PDF = { maxFileSize: MB100, acceptedFiles: PDF_ONLY, maxNumFiles: 1 };
export const MULTI_ALL = { maxFileSize: MB100, acceptedFiles: ALL_FILES, multipleFiles: true };

export const groupLimits = (verbs, config) => verbs.reduce((acc, verb) => {
  acc[verb] = config;
  return acc;
}, {});
