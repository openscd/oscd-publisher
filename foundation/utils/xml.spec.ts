/* eslint-disable no-unused-expressions */
/* eslint-disable import/no-extraneous-dependencies */
import { expect } from '@open-wc/testing';
import { iedWithLDevice, copyControlDoc } from './xml.testfiles.js';
import { queryLDevice, queryLN } from './xml.js';

function parseXml(str: string): Document {
  return new DOMParser().parseFromString(str, 'application/xml');
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function findElement(str: string, selector: string): Element | null {
  return parseXml(str).querySelector(selector);
}

describe('Xml utility', () => {
  let doc: Document;

  beforeEach(() => {
    doc = parseXml(copyControlDoc);
  });

  describe('queryLDevice', () => {
    it('find LDevice in ied', () => {
      const ied = parseXml(iedWithLDevice).documentElement;
      const lDeviceInst = 'someLDInst';
      const lDevice = queryLDevice(ied, lDeviceInst);

      expect(lDevice).to.not.be.null;
      expect(lDevice?.getAttribute('inst')).to.equal(lDeviceInst);
    });
  });

  describe('queryLN', () => {
    it('finds LN0', () => {
      const lDevice = doc.querySelector(
        'IED[name="ToBeCopied"] LDevice[inst="LD1"]'
      )!;

      const ln = queryLN(lDevice, 'LLN0', '', null);

      expect(ln).to.not.be.null;
      expect(ln?.getAttribute('id')).to.equal('ToBeCopied_LN0');
    });

    it('find LN with inst and prefix', () => {
      const lDevice = doc.querySelector(
        'IED[name="ToBeCopied"] LDevice[inst="LD1"]'
      )!;

      const ln = queryLN(lDevice, 'CILO', '1', 'CBHost');

      expect(ln).to.not.be.null;
      expect(ln?.getAttribute('id')).to.equal('ToBeCopied_CBHost1');
    });

    it('find LN with inst and missing prefix', () => {
      const lDevice = doc.querySelector(
        'IED[name="ToBeCopied"] LDevice[inst="LD1"]'
      )!;

      const ln = queryLN(lDevice, 'MMXU', '1', '');

      expect(ln).to.not.be.null;
      expect(ln?.getAttribute('id')).to.equal('ToBeCopied_MMXU');
    });
  });
});
