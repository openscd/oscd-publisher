/* eslint-disable import/no-extraneous-dependencies */
import { expect } from '@open-wc/testing';
import { isRemove, isUpdate, Update } from '@openscd/open-scd-core';

import { addFCDAs, addFCDOs, isSubscribed, removeFCDA } from './fcda.js';
import {
  multipleConnectionsEd1,
  multipleConnectionsEd2,
  orphanDataSet,
  singleConnection,
  singleConnectionEd2,
} from './fcda.testfiles.js';

function findElement(str: string, selector: string): Element | null {
  return new DOMParser()
    .parseFromString(str, 'application/xml')
    .querySelector(selector);
}

describe('Utility functions for FCDA element', () => {
  describe('isSubscribed', () => {
    it('returns false for orphan FCDA', () =>
      expect(isSubscribed(findElement(orphanDataSet, 'FCDA')!)).to.be.false);

    it('returns true for a connected FCDA', () =>
      expect(
        isSubscribed(
          findElement(singleConnection, 'DataSet[name="someDataSet1"] FCDA')!
        )
      ).to.be.true);

    it('returns false for a un connected FCDA', () =>
      expect(
        isSubscribed(
          findElement(singleConnection, 'DataSet[name="someDataSet2"] FCDA')!
        )
      ).to.be.false);

    it('returns true for a connected FCDA', () =>
      expect(isSubscribed(findElement(multipleConnectionsEd1, 'FCDA')!)).to.be
        .true);

    it('is control block sensitive for Ed2 files', () =>
      expect(
        isSubscribed(
          findElement(
            multipleConnectionsEd2,
            'DataSet[name="someDataSet1"] FCDA'
          )!
        )
      ).to.be.false);

    it('checks serviceType in Ed2 files', () =>
      expect(
        isSubscribed(
          findElement(
            multipleConnectionsEd2,
            'DataSet[name="someDataSet3"] FCDA'
          )!
        )
      ).to.be.false);

    it('finds functional constraint data object', () =>
      expect(
        isSubscribed(
          findElement(
            multipleConnectionsEd2,
            'DataSet[name="someDataSet4"] FCDA'
          )!
        )
      ).to.be.true);

    it('returns true for connected FCDA in Ed2 files', () =>
      expect(
        isSubscribed(
          findElement(
            multipleConnectionsEd2,
            'DataSet[name="someDataSet2"] FCDA'
          )!
        )
      ).to.be.true);

    it('returns true for single connected FCDA in Ed2 files', () =>
      expect(
        isSubscribed(
          findElement(singleConnectionEd2, 'DataSet[name="someName"] FCDA')!
        )
      ).to.be.true);
  });

  describe('removeFcda', () => {
    it('only removes FCDA if no subscription is found', () => {
      const fCDA = findElement(
        singleConnection,
        'DataSet[name="someDataSet2"] FCDA'
      );
      expect(removeFCDA(fCDA!)[0]).to.deep.equal({
        node: fCDA,
      });
    });

    it('removes Ed1 subscription if any found', () => {
      const fCDA = findElement(singleConnection, 'FCDA');
      expect(removeFCDA(fCDA!).length).to.equal(3);
      expect(removeFCDA(fCDA!)[1]).to.satisfies(isRemove);
      expect(removeFCDA(fCDA!)[2]).to.satisfies(isRemove);
    });

    it('removes multiple Ed1 subscriptions if any found', () => {
      const fCDA = findElement(multipleConnectionsEd1, 'FCDA');
      expect(removeFCDA(fCDA!).length).to.equal(4);
      expect(removeFCDA(fCDA!)[1]).to.satisfies(isUpdate);
      expect(removeFCDA(fCDA!)[2]).to.satisfies(isRemove);
      expect(removeFCDA(fCDA!)[3]).to.satisfies(isRemove);
    });

    it('removes Ed2 subscriptions if any found', () => {
      const fCDA = findElement(
        multipleConnectionsEd2,
        'DataSet[name="someDataSet2"] FCDA'
      );
      expect(removeFCDA(fCDA!).length).to.equal(2);
      expect(removeFCDA(fCDA!)[1]).to.satisfies(isUpdate);
      expect((removeFCDA(fCDA!)[1] as Update).attributes).to.deep.equal({
        iedName: null,
        ldInst: null,
        prefix: null,
        lnClass: null,
        lnInst: null,
        doName: null,
        daName: null,
        srcLDInst: null,
        srcPrefix: null,
        srcLNClass: null,
        srcLNInst: null,
        srcCBName: null,
        serviceType: null,
      });
    });
  });

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
