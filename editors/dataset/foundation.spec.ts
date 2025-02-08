/* eslint-disable import/no-extraneous-dependencies */
import { expect } from '@open-wc/testing';

import { addFCDAs, addFCDOs, getFcdaInstDesc } from './foundation.js';
import { fcdaDescriptions } from './foundation.testfiles.js';

describe('Utility functions for FCDA element', () => {
  describe('addFCDAs', () => {
    const dataSet = new DOMParser()
      .parseFromString(
        `<DataSet>
          <FCDA ldInst="someLdInst" lnClass="MMXU" lnInst="1" doName="A.phsA" daName="cVal.mag.f" fc="MX"/>
        </DataSet>`,
        'application/xml'
      )
      .querySelector('DataSet')!;

    const dataSet1 = new DOMParser()
      .parseFromString(
        `<DataSet>
          <FCDA ldInst="someLdInst" prefix="" lnClass="LLN0" doName="A.phsA" daName="cVal.mag.f" fc="MX"/>
        </DataSet>`,
        'application/xml'
      )
      .querySelector('DataSet')!;

    const lDevice = new DOMParser()
      .parseFromString(
        `<LDevice inst="someLdInst"></LDevice>`,
        'application/xml'
      )
      .querySelector('LDevice')!;

    const anyLn = new DOMParser()
      .parseFromString(
        `<LN prefix="" lnClass="MMXU" inst="1"></LN>`,
        'application/xml'
      )
      .querySelector('LN')!;

    const anyLn1 = new DOMParser()
      .parseFromString(`<LN lnClass="LLN0" inst=""></LN>`, 'application/xml')
      .querySelector('LN')!;

    const dO = new DOMParser()
      .parseFromString(`<DO name="A" />`, 'application/xml')
      .querySelector('DO')!;

    const sDO = new DOMParser()
      .parseFromString(`<SDO name="phsA" />`, 'application/xml')
      .querySelector('SDO')!;

    const dA = new DOMParser()
      .parseFromString(`<DA name="cVal" fc="MX" />`, 'application/xml')
      .querySelector('DA')!;

    const dA1 = new DOMParser()
      .parseFromString(`<DA name="cVal" />`, 'application/xml')
      .querySelector('DA')!;

    const bDA1 = new DOMParser()
      .parseFromString(`<BDA name="mag" />`, 'application/xml')
      .querySelector('BDA')!;

    const bDA2 = new DOMParser()
      .parseFromString(`<BDA name="f" />`, 'application/xml')
      .querySelector('BDA')!;

    const bDA3 = new DOMParser()
      .parseFromString(`<BDA name="i" />`, 'application/xml')
      .querySelector('BDA')!;

    it('return empty array with missing logical node', () => {
      const paths = [[lDevice, dO, sDO, dA, bDA1, bDA2]];
      expect(addFCDAs(dataSet, paths).length).to.equal(0);
    });

    it('return empty array with missing logical device', () => {
      const paths = [[anyLn, dO, sDO, dA, bDA1, bDA2]];
      expect(addFCDAs(dataSet, paths).length).to.equal(0);
    });

    it('return empty array with missing functional constraint', () => {
      const paths = [[lDevice, anyLn, dO, sDO, dA1, bDA1, bDA3]];
      expect(addFCDAs(dataSet, paths).length).to.equal(0);
    });

    it('return empty array with missing data object', () => {
      const paths = [[lDevice, anyLn, dA, bDA1, bDA3]];
      expect(addFCDAs(dataSet, paths).length).to.equal(0);
    });

    it('return empty array with missing data attribute', () => {
      const paths = [[lDevice, anyLn, dO, sDO]];
      expect(addFCDAs(dataSet, paths).length).to.equal(0);
    });

    it('return empty array on duplicates', () => {
      const paths = [[lDevice, anyLn, dO, sDO, dA, bDA1, bDA2]];
      expect(addFCDAs(dataSet, paths).length).to.equal(0);
    });

    it('return insert array with valid new FCDA', () => {
      const paths = [[lDevice, anyLn1, dO, sDO, dA, bDA1, bDA3]];
      expect(addFCDAs(dataSet1, paths).length).to.equal(1);
    });

    it('returns FCDA without lnInst for LLN0', () => {
      const paths = [[lDevice, anyLn1, dO, sDO, dA, bDA1, bDA3]];
      const insertEdit = addFCDAs(dataSet1, paths);
      const newFcda = insertEdit[0].node as Element;
      expect(newFcda.hasAttribute('lnInst')).to.equal(false);
    });

    it('allows multiple FCDA inserts', () => {
      const paths = [
        [lDevice, anyLn, dO, sDO, dA, bDA1, bDA2],
        [lDevice, anyLn, dO, sDO, dA, bDA1, bDA3],
      ];
      expect(addFCDAs(dataSet, paths).length).to.equal(1);
    });
  });

  describe('addFCDOs', () => {
    const dataSet = new DOMParser()
      .parseFromString(
        `<DataSet>
            <FCDA ldInst="someLdInst" lnClass="MMXU" lnInst="1" doName="A.phsA" fc="MX"/>
          </DataSet>`,
        'application/xml'
      )
      .querySelector('DataSet')!;

    const lDevice = new DOMParser()
      .parseFromString(
        `<LDevice inst="someLdInst"></LDevice>`,
        'application/xml'
      )
      .querySelector('LDevice')!;

    const anyLn = new DOMParser()
      .parseFromString(
        `<LN prefix="" lnClass="MMXU" inst="1"></LN>`,
        'application/xml'
      )
      .querySelector('LN')!;

    const dO = new DOMParser()
      .parseFromString(`<DO name="A" />`, 'application/xml')
      .querySelector('DO')!;

    const sDO = new DOMParser()
      .parseFromString(`<SDO name="phsA" />`, 'application/xml')
      .querySelector('SDO')!;

    const fc1 = 'MX';
    const fc2 = 'CF';

    it('return empty array with missing logical node', () => {
      const fcPaths = [{ path: [lDevice, dO, sDO], fc: fc1 }];
      expect(addFCDOs(dataSet, fcPaths).length).to.equal(0);
    });

    it('return empty array with missing logical device', () => {
      const fcPaths = [{ path: [anyLn, dO, sDO], fc: fc1 }];
      expect(addFCDOs(dataSet, fcPaths).length).to.equal(0);
    });

    it('return empty array with missing data object', () => {
      const fcPaths = [{ path: [lDevice, anyLn], fc: fc1 }];
      expect(addFCDOs(dataSet, fcPaths).length).to.equal(0);
    });

    it('return empty array on duplicates', () => {
      const fcPaths = [{ path: [lDevice, anyLn, dO, sDO], fc: fc1 }];
      expect(addFCDOs(dataSet, fcPaths).length).to.equal(0);
    });

    it('allows multiple FCDA inserts', () => {
      const fcPaths = [
        { path: [lDevice, anyLn, dO, sDO], fc: fc1 },
        { path: [lDevice, anyLn, dO, sDO], fc: fc2 },
      ];
      expect(addFCDOs(dataSet, fcPaths).length).to.equal(1);
    });
  });
});

describe('Descriptions for FCDAs', () => {
  let doc: Document;
  describe('addFCDAs', () => {
    beforeEach(async () => {
      doc = new DOMParser().parseFromString(fcdaDescriptions, 'text/xml');
    });

    it('retrieves descriptions of LDevice, LN0, DOI and DAI using desc', () => {
      const fcda = Array.from(doc.querySelectorAll('DataSet > FCDA'))[0]!;
      expect(getFcdaInstDesc(fcda)).to.deep.equal({
        LDevice: 'First logical device',
        LN: 'Configuration LN',
        DOI: 'Behaviour',
        DAI: 'State',
      });
    });

    it('retrieves descriptions of DOI using d attribute', () => {
      const fcda = Array.from(doc.querySelectorAll('DataSet > FCDA')!)[3];
      expect(getFcdaInstDesc(fcda).DOI).to.equal('Mode');
    });

    it('retrieves descriptions of LN SDI objects using d attribute', () => {
      const fcda = Array.from(doc.querySelectorAll('DataSet > FCDA')!)[8];
      expect(getFcdaInstDesc(fcda).SDI![0]).to.equal('Red Phase');
    });

    it('retrieves descriptions of LN SDI objects using desc attribute', () => {
      const fcda = Array.from(doc.querySelectorAll('DataSet > FCDA')!)[9];
      expect(getFcdaInstDesc(fcda).SDI![0]).to.equal('Phase B');
    });

    it('provides SDI desc with LDevice, LN, DOI not having the desc attribute', () => {
      const fcda = Array.from(doc.querySelectorAll('DataSet > FCDA')!)[10];
      expect(getFcdaInstDesc(fcda)).to.deep.equal({
        SDI: ['Phase B+'],
      });
    });

    it('provides nested SDI desc', () => {
      const fcda = Array.from(doc.querySelectorAll('DataSet > FCDA')!)[17];
      expect(getFcdaInstDesc(fcda)).to.deep.equal({
        DAI: 'fundamental',
        LDevice: 'First logical device',
        LN: 'Line',
        SDI: ['Phase C', 'complex value', 'magnitude'],
      });
    });

    it('correctly handles a missing DOI', () => {
      const fcda = Array.from(doc.querySelectorAll('DataSet > FCDA')!)[13];
      expect(getFcdaInstDesc(fcda)).to.deep.equal({});
    });

    it('correctly handles a missing DAI', () => {
      const fcda = Array.from(doc.querySelectorAll('DataSet > FCDA')!)[14];
      expect(getFcdaInstDesc(fcda)).to.deep.equal({});
    });

    it('correctly handles a missing SDI', () => {
      const fcda = Array.from(doc.querySelectorAll('DataSet > FCDA')!)[15];
      expect(getFcdaInstDesc(fcda)).to.deep.equal({});
    });

    it('correctly handles a missing LDevice', () => {
      const fcda = Array.from(doc.querySelectorAll('DataSet > FCDA')!)[16];
      expect(getFcdaInstDesc(fcda)).to.deep.equal({});
    });
  });
});
