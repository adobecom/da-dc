/* eslint-disable compat/compat */
import { expect } from '@esm-bundle/chai';

const {
  validateFiles,
  encryptAndStore,
  storeEncryptedLocalFile,
  openIDB,
  IDB_NAME,
  IDB_STORE,
} = await import(
  '../../../acrobat/blocks/verb-widget-client-upload/verb-widget-client-upload.js'
);

const VERB = 'image-to-pdf';

function makeFile(bytes, name, type) {
  return new File([bytes], name, { type });
}

function readRecord(id) {
  return openIDB().then((db) => new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readonly');
    const req = tx.objectStore(IDB_STORE).get(id);
    req.onsuccess = () => { resolve(req.result); db.close(); };
    req.onerror = ({ target: { error } }) => { reject(error); db.close(); };
  }));
}

function deleteDB() {
  return new Promise((resolve) => {
    const req = indexedDB.deleteDatabase(IDB_NAME);
    req.onsuccess = resolve;
    req.onerror = resolve;
    req.onblocked = resolve;
  });
}

describe('verb-widget-client-upload', () => {
  beforeEach(() => {
    window.mph = {};
  });

  afterEach(async () => {
    await deleteDB();
  });

  describe('validateFiles', () => {
    it('accepts a valid single image', () => {
      const file = makeFile(new Uint8Array([1, 2, 3]), 'photo.jpg', 'image/jpeg');
      expect(validateFiles([file], VERB)).to.deep.equal({ valid: true });
    });

    it('accepts png by extension and mime', () => {
      const file = makeFile(new Uint8Array([1]), 'photo.png', 'image/png');
      expect(validateFiles([file], VERB).valid).to.be.true;
    });

    it('rejects an unknown verb', () => {
      const file = makeFile(new Uint8Array([1]), 'photo.jpg', 'image/jpeg');
      expect(validateFiles([file], 'not-a-verb')).to.include({ valid: false, code: 'error_generic' });
    });

    it('rejects when no files are provided', () => {
      expect(validateFiles([], VERB)).to.include({ valid: false, code: 'error_generic' });
    });

    it('rejects more than one file (single-file tool)', () => {
      const a = makeFile(new Uint8Array([1]), 'a.jpg', 'image/jpeg');
      const b = makeFile(new Uint8Array([1]), 'b.jpg', 'image/jpeg');
      expect(validateFiles([a, b], VERB)).to.include({ valid: false, code: 'error_only_accept_one_file' });
    });

    it('rejects an empty file', () => {
      const file = makeFile(new Uint8Array([]), 'empty.jpg', 'image/jpeg');
      expect(validateFiles([file], VERB)).to.include({ valid: false, code: 'error_empty_file' });
    });

    it('rejects a file over the 25 MB limit', () => {
      const tooBig = { name: 'huge.jpg', type: 'image/jpeg', size: 26214400 + 1 };
      expect(validateFiles([tooBig], VERB)).to.include({ valid: false, code: 'error_file_too_large' });
    });

    it('rejects an unsupported extension', () => {
      const file = makeFile(new Uint8Array([1]), 'doc.pdf', 'application/pdf');
      expect(validateFiles([file], VERB)).to.include({ valid: false, code: 'error_unsupported_type' });
    });

    it('rejects a mismatched mime type for a supported extension', () => {
      const file = makeFile(new Uint8Array([1]), 'photo.jpg', 'application/pdf');
      expect(validateFiles([file], VERB)).to.include({ valid: false, code: 'error_unsupported_type' });
    });
  });

  describe('storeEncryptedLocalFile', () => {
    it('stores an encrypted record whose ciphertext decrypts back to the original bytes', async () => {
      const original = new Uint8Array([10, 20, 30, 40, 50]);
      const file = makeFile(original, 'photo.jpg', 'image/jpeg');
      const id = 'test-id-1';

      await storeEncryptedLocalFile(id, file);
      const record = await readRecord(id);

      expect(record).to.exist;
      expect(record.fileName).to.equal('photo.jpg');
      expect(record.mimeType).to.equal('image/jpeg');
      expect(record.iv).to.be.instanceOf(Uint8Array);
      expect(record.iv.length).to.equal(12);
      expect(record.key).to.be.instanceOf(CryptoKey);
      // The stored bytes must not be the plaintext.
      expect(new Uint8Array(record.ciphertext)).to.not.deep.equal(original);

      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: record.iv },
        record.key,
        record.ciphertext,
      );
      expect(new Uint8Array(decrypted)).to.deep.equal(original);
    });
  });

  describe('encryptAndStore', () => {
    it('returns a UUID and persists a matching record', async () => {
      const file = makeFile(new Uint8Array([1, 2, 3, 4]), 'photo.png', 'image/png');
      const id = await encryptAndStore(file);

      expect(id).to.match(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      );
      const record = await readRecord(id);
      expect(record).to.exist;
      expect(record.fileName).to.equal('photo.png');
    });

    it('produces a unique id and a unique key per call', async () => {
      const file = makeFile(new Uint8Array([9, 9, 9]), 'photo.jpg', 'image/jpeg');
      const id1 = await encryptAndStore(file);
      const id2 = await encryptAndStore(file);
      expect(id1).to.not.equal(id2);

      const [r1, r2] = await Promise.all([readRecord(id1), readRecord(id2)]);
      expect(r1.key).to.not.equal(r2.key);
      // Random IV per file means identical plaintext yields different ciphertext.
      expect(new Uint8Array(r1.ciphertext)).to.not.deep.equal(new Uint8Array(r2.ciphertext));
    });
  });
});
