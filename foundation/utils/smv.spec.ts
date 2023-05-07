/* eslint-disable no-unused-expressions */
/* eslint-disable import/no-extraneous-dependencies */
import { expect } from '@open-wc/testing';
import { Insert, Remove, isInsert, isRemove } from '@openscd/open-scd-core';

import {
  nulledSMV,
  partlyInstType,
  withInstType,
  woInstType,
} from './smv.testfiels.js';

import { checkSMVDiff, updateSmvAddress } from './smv.js';

function findElement(str: string, selector: string): Element | null {
  return new DOMParser()
    .parseFromString(str, 'application/xml')
    .querySelector(selector);
}

const pTypeOff = {
  'MAC-Address': null,
  APPID: null,
  'VLAN-ID': null,
  'VLAN-PRIORITY': null,
};

const pTypeOn = {
  'MAC-Address': '01-0C-CD-04-00-03',
  APPID: '4004',
  'VLAN-ID': '000',
  'VLAN-PRIORITY': '4',
};

function testPTypeChange(
  sMV: Element,
  key: string,
  value: string | null,
  instType?: boolean
): void {
  const oldAddress = sMV.querySelector('Address');

  const pTypes: Record<string, string | null> = { ...pTypeOn };
  pTypes[key] = value;
  const actions = updateSmvAddress(sMV, { pTypes, instType });

  expect(actions.length).to.equal(2);
  expect(actions[0]).to.satisfies(isInsert);
  expect((actions[0] as Insert).parent).to.equal(sMV);
  expect(
    ((actions[0] as Insert).node as Element).querySelector(
      `Address > P[type="${key}"]`
    )?.textContent ?? null
  ).to.equal(value);

  expect((actions[0] as Insert).reference).to.be.undefined;
  expect(actions[1]).to.satisfies(isRemove);
  expect((actions[1] as Remove).node).to.equal(oldAddress);
}

describe('Utility function for SMV element', () => {
  describe('checkSMVDiff', () => {
    it('indicates xsi:type discrepancy with missing xsi:type ', () =>
      expect(
        checkSMVDiff(findElement(woInstType, 'SMV')!, {
          pTypes: pTypeOn,
          instType: true,
        })
      ).to.equal(true));

    it('indicates xsi:type fit with missing xsi:type ', () =>
      expect(
        checkSMVDiff(findElement(woInstType, 'SMV')!, {
          pTypes: pTypeOn,
          instType: false,
        })
      ).to.equal(false));

    it('indicates xsi:type discrepancy with existing xsi:type', () =>
      expect(
        checkSMVDiff(findElement(withInstType, 'SMV')!, {
          pTypes: pTypeOn,
          instType: false,
        })
      ).to.equal(true));

    it('indicates xsi:type fit with existing xsi:type', () =>
      expect(
        checkSMVDiff(findElement(withInstType, 'SMV')!, {
          pTypes: pTypeOn,
          instType: true,
        })
      ).to.equal(false));

    it('ignores xsi:type check if instType is undefined', () => {
      expect(
        checkSMVDiff(findElement(withInstType, 'SMV')!, { pTypes: pTypeOn })
      ).to.equal(false);

      expect(
        checkSMVDiff(findElement(woInstType, 'SMV')!, { pTypes: pTypeOn })
      ).to.equal(false);
    });

    it('always returns true with partially xsi:type', () => {
      expect(
        checkSMVDiff(findElement(partlyInstType, 'SMV')!, {
          pTypes: pTypeOn,
          instType: false,
        })
      ).to.equal(true);

      expect(
        checkSMVDiff(findElement(partlyInstType, 'SMV')!, {
          pTypes: pTypeOn,
          instType: true,
        })
      ).to.equal(true);
    });

    it('return true with fitting missing pTypes', () =>
      expect(
        checkSMVDiff(findElement(nulledSMV, 'SMV')!, { pTypes: pTypeOff })
      ).to.equal(false));

    it('default pType to null with missing pTypes', () =>
      expect(checkSMVDiff(findElement(nulledSMV, 'SMV')!)).to.equal(false));

    it('checks instType in empty GSE', () => {
      expect(
        checkSMVDiff(findElement(nulledSMV, 'SMV')!, {
          pTypes: pTypeOff,
          instType: true,
        })
      ).to.equal(false);

      expect(
        checkSMVDiff(findElement(nulledSMV, 'SMV')!, {
          pTypes: pTypeOff,
          instType: false,
        })
      ).to.equal(false);
    });

    it('checks MAC-Address changes', () => {
      let pTypes: Record<string, string | null> = { ...pTypeOn };
      pTypes['MAC-Address'] = null;

      expect(
        checkSMVDiff(findElement(woInstType, 'SMV')!, { pTypes })
      ).to.equal(true);

      pTypes = { ...pTypeOff };
      pTypes['MAC-Address'] = '01-0C-CD-01-00-03';

      expect(checkSMVDiff(findElement(nulledSMV, 'SMV')!, { pTypes })).to.equal(
        true
      );
    });

    it('checks APPID changes', () => {
      let pTypes: Record<string, string | null> = { ...pTypeOn };
      pTypes.APPID = null;

      expect(
        checkSMVDiff(findElement(woInstType, 'SMV')!, { pTypes })
      ).to.equal(true);

      pTypes = { ...pTypeOff };
      pTypes.APPID = '4067';

      expect(checkSMVDiff(findElement(nulledSMV, 'SMV')!, { pTypes })).to.equal(
        true
      );
    });

    it('checks VLAN-ID changes', () => {
      let pTypes: Record<string, string | null> = { ...pTypeOn };
      pTypes['VLAN-ID'] = null;

      expect(
        checkSMVDiff(findElement(woInstType, 'SMV')!, { pTypes })
      ).to.equal(true);

      pTypes = { ...pTypeOff };
      pTypes['VLAN-ID'] = '12';

      expect(checkSMVDiff(findElement(nulledSMV, 'SMV')!, { pTypes })).to.equal(
        true
      );
    });

    it('checks VLAN-PRIORITY changes', () => {
      let pTypes: Record<string, string | null> = { ...pTypeOn };
      pTypes['VLAN-PRIORITY'] = null;

      expect(
        checkSMVDiff(findElement(woInstType, 'SMV')!, { pTypes })
      ).to.equal(true);

      pTypes = { ...pTypeOff };
      pTypes['VLAN-PRIORITY'] = '3';

      expect(checkSMVDiff(findElement(nulledSMV, 'SMV')!, { pTypes })).to.equal(
        true
      );
    });
  });

  describe('updateSmvAddress', () => {
    it('returns action array to update the MAC-Address ', () => {
      const sMV = findElement(woInstType, 'SMV')!;

      testPTypeChange(sMV, 'MAC-Address', '01-0C-CD-04-00-01');
    });

    it('returns action array to remove the MAC-Address ', () => {
      const sMV = findElement(woInstType, 'SMV')!;

      testPTypeChange(sMV, 'MAC-Address', null);
    });

    it('returns action array to update the APPID ', () => {
      const sMV = findElement(woInstType, 'SMV')!;

      testPTypeChange(sMV, 'APPID', '0003');
    });

    it('returns action array to remove the APPID ', () => {
      const sMV = findElement(woInstType, 'SMV')!;

      testPTypeChange(sMV, 'APPID', null);
    });

    it('returns action array to update the VLAN-ID ', () => {
      const sMV = findElement(woInstType, 'SMV')!;

      testPTypeChange(sMV, 'VLAN-ID', '001');
    });

    it('returns action array to remove the VLAN-ID ', () => {
      const sMV = findElement(woInstType, 'SMV')!;

      testPTypeChange(sMV, 'VLAN-ID', null);
    });

    it('returns action array to update the VLAN-PRIORITY ', () => {
      const sMV = findElement(woInstType, 'SMV')!;

      testPTypeChange(sMV, 'VLAN-PRIORITY', '0');
    });

    it('returns action array to remove the VLAN-PRIORITY ', () => {
      const sMV = findElement(woInstType, 'SMV')!;

      testPTypeChange(sMV, 'VLAN-PRIORITY', null);
    });

    it('returns actions to add instType ', () => {
      const sMV = findElement(woInstType, 'SMV')!;

      const oldAddress = sMV.querySelector('Address');

      const actions = updateSmvAddress(sMV, {
        pTypes: pTypeOn,
        instType: true,
      });

      expect(actions.length).to.equal(2);
      expect(actions[0]).to.satisfies(isInsert);
      expect((actions[0] as Insert).parent).to.equal(sMV);
      for (const p of Array.from(
        ((actions[0] as Insert).node as Element).children
      ))
        expect(p).to.have.attribute('xsi:type');

      expect((actions[0] as Insert).reference).to.be.undefined;
      expect(actions[1]).to.satisfies(isRemove);
      expect((actions[1] as Remove).node).to.equal(oldAddress);
    });

    it('return actions to remove instType ', () => {
      const sMV = findElement(withInstType, 'SMV')!;

      const oldAddress = sMV.querySelector('Address');

      const actions = updateSmvAddress(sMV, {
        pTypes: pTypeOn,
        instType: false,
      });

      expect(actions.length).to.equal(2);
      expect(actions[0]).to.satisfies(isInsert);
      expect((actions[0] as Insert).parent).to.equal(sMV);
      for (const p of Array.from(
        ((actions[0] as Insert).node as Element).children
      ))
        expect(p).to.not.have.attribute('xsi:type');

      expect((actions[0] as Insert).reference).to.be.undefined;
      expect(actions[1]).to.satisfies(isRemove);
      expect((actions[1] as Remove).node).to.equal(oldAddress);
    });
  });
});
