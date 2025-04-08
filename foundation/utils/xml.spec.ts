/* eslint-disable no-unused-expressions */
/* eslint-disable import/no-extraneous-dependencies */
import { expect } from '@open-wc/testing';
import { iedWithLDevice, copyControlDoc } from './xml.testfiles.js';
import {
  isFCDACompatibleWithIED,
  queryDataTypeLeaf,
  queryLDevice,
  queryLN,
} from './xml.js';

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

  describe('queryDataTypeLeaf', () => {
    it('should fetch DO leaf', () => {
      const dataTypeTemplates = doc.querySelector('DataTypeTemplates')!;
      const lnType = 'CILO$oscd$_eb5ec6bb69650d07';

      const leaf = queryDataTypeLeaf(dataTypeTemplates, lnType, ['EnaOpn'], []);

      expect(leaf).to.not.be.null;
      expect(leaf?.tagName).to.equal('DOType');
      expect(leaf?.getAttribute('id')).to.equal(
        'EnaOpn$oscd$_55462dcb3eb76dd6'
      );
    });

    it('should return null if dataType is not found', () => {
      const dataTypeTemplates = doc.querySelector('DataTypeTemplates')!;
      const lnType = 'MMXU$oscd$_8046c36011040649';

      const leaf = queryDataTypeLeaf(
        dataTypeTemplates,
        lnType,
        ['A', 'phsA'],
        ['cVal', 'ang', 'f']
      );

      expect(leaf).to.be.null;
    });

    it('should fetch DA leaf', () => {
      const dataTypeTemplates = doc.querySelector('DataTypeTemplates')!;
      const lnType = 'MMXU$oscd$_bcec88edb16399a2';

      const leaf = queryDataTypeLeaf(
        dataTypeTemplates,
        lnType,
        ['A', 'phsA'],
        ['cVal', 'ang', 'f']
      );

      expect(leaf).to.not.be.null;
      expect(leaf?.tagName).to.equal('DAType');
      expect(leaf?.getAttribute('id')).to.equal('ang$oscd$_ed49c2f7a55ad05a');
    });
  });

  describe('isFCDACompatibleWithIED', () => {
    it('should return true for compatible FCDA', () => {
      const fcda = doc.querySelector(
        'IED[name="ToBeCopied"] LDevice[inst="LD1"] > LN0 > DataSet > FCDA'
      )!;
      const ied = doc.querySelector('IED[name="ToCopieTo8"]')!;

      const isCompatible = isFCDACompatibleWithIED(fcda, ied);
      expect(isCompatible).to.be.true;
    });

    it('should return false if IED is missing LDevice', () => {
      const fcda = doc.querySelector(
        'IED[name="ToBeCopied"] LDevice[inst="LD1"] > LN0 > DataSet > FCDA'
      )!;
      const ied = doc.querySelector('IED[name="ToCopieTo1"]')!;

      const isCompatible = isFCDACompatibleWithIED(fcda, ied);
      expect(isCompatible).to.be.false;
    });

    it('should return false if data type is incompatible', () => {
      const fcda = doc.querySelector(
        'IED[name="ToBeCopied"] LDevice[inst="LD1"] > LN0 > DataSet > FCDA'
      )!;
      const ied = doc.querySelector('IED[name="ToCopieTo4"]')!;

      const isCompatible = isFCDACompatibleWithIED(fcda, ied);
      expect(isCompatible).to.be.false;
    });
  });
});
