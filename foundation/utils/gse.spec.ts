/* eslint-disable import/no-extraneous-dependencies */
import { expect } from '@open-wc/testing';
import { Insert, isInsert, isRemove, Remove } from '@openscd/open-scd-core';

import { checkGSEDiff, updateGSE } from './gse.js';
import {
  nulledGSE,
  partlyInstType,
  withInstType,
  woInstType,
} from './gse.testfiles.js';

function findElement(str: string, selector: string): Element | null {
  return new DOMParser()
    .parseFromString(str, 'application/xml')
    .querySelector(selector);
}

function buildAttr(nulled = false): Record<string, string | null> {
  if (nulled)
    return {
      'MAC-Address': null,
      APPID: null,
      'VLAN-ID': null,
      'VLAN-PRIORITY': null,
      MinTime: null,
      MaxTime: null,
    };

  return {
    'MAC-Address': '01-0C-CD-01-00-03',
    APPID: '0004',
    'VLAN-ID': '000',
    'VLAN-PRIORITY': '4',
    MinTime: '8',
    MaxTime: '4096',
  };
}

function testPTypeChange(
  gSE: Element,
  key: string,
  value: string | null,
  instType?: boolean
): void {
  const oldAddress = gSE.querySelector('Address');

  const attrs = buildAttr();
  attrs[key] = value;
  const actions = updateGSE(gSE, attrs, instType);

  expect(actions.length).to.equal(2);
  expect(actions[0]).to.satisfies(isInsert);
  expect((actions[0] as Insert).parent).to.equal(gSE);
  expect(
    ((actions[0] as Insert).node as Element).querySelector(
      `Address > P[type="${key}"]`
    )?.textContent ?? null
  ).to.equal(value);
  // eslint-disable-next-line no-unused-expressions
  expect((actions[0] as Insert).reference).to.exist;
  expect(actions[1]).to.satisfies(isRemove);
  expect((actions[1] as Remove).node).to.equal(oldAddress);
}

function testTimeChange(gSE: Element, key: string, value: string | null): void {
  const oldTime = gSE.querySelector(key);

  const attrs = buildAttr();
  attrs[key] = value;
  const actions = updateGSE(gSE, attrs);

  const offset = key === 'MinTime' ? 0 : 2;
  expect(actions.length).to.equal(4);
  expect(actions[0 + offset]).to.satisfies(isInsert);
  expect((actions[0 + offset] as Insert).parent).to.equal(gSE);
  expect(
    ((actions[0 + offset] as Insert).node as Element)?.textContent ?? null
  ).to.equal(value);
  // eslint-disable-next-line no-unused-expressions
  expect((actions[0 + offset] as Insert).reference).to.exist;
  expect(actions[1 + offset]).to.satisfies(isRemove);
  expect((actions[1 + offset] as Remove).node).to.equal(oldTime);
}

describe('Utility function for GSE element', () => {
  describe('checkGSEDiff', () => {
    it('shows changes in instType with missing instType', () =>
      expect(
        checkGSEDiff(findElement(woInstType, 'GSE')!, buildAttr(), true)
      ).to.equal(true));

    it('identifies now changes in instType with missing instType', () =>
      expect(
        checkGSEDiff(findElement(woInstType, 'GSE')!, buildAttr(), false)
      ).to.equal(false));

    it('shows changes in instType with existing instType', () =>
      expect(
        checkGSEDiff(findElement(withInstType, 'GSE')!, buildAttr(), false)
      ).to.equal(true));

    it('identifies now changes in instType with existing instType', () =>
      expect(
        checkGSEDiff(findElement(withInstType, 'GSE')!, buildAttr(), true)
      ).to.equal(false));

    it('ignores instType check if instType is undefined', () => {
      expect(
        checkGSEDiff(findElement(withInstType, 'GSE')!, buildAttr())
      ).to.equal(false);

      expect(
        checkGSEDiff(findElement(woInstType, 'GSE')!, buildAttr())
      ).to.equal(false);
    });

    it('always returns true with partially instType', () => {
      expect(
        checkGSEDiff(findElement(partlyInstType, 'GSE')!, buildAttr(), false)
      ).to.equal(true);

      expect(
        checkGSEDiff(findElement(partlyInstType, 'GSE')!, buildAttr(), true)
      ).to.equal(true);
    });

    it('ignores if instType is undefined', () => {
      expect(
        checkGSEDiff(findElement(withInstType, 'GSE')!, buildAttr())
      ).to.equal(false);

      expect(
        checkGSEDiff(findElement(woInstType, 'GSE')!, buildAttr())
      ).to.equal(false);
    });

    it('checks also missing parts', () =>
      expect(
        checkGSEDiff(findElement(nulledGSE, 'GSE')!, buildAttr(true))
      ).to.equal(false));

    it('checks instType in empty GSE', () => {
      expect(
        checkGSEDiff(findElement(nulledGSE, 'GSE')!, buildAttr(true), true)
      ).to.equal(false);

      expect(
        checkGSEDiff(findElement(nulledGSE, 'GSE')!, buildAttr(true), false)
      ).to.equal(false);
    });

    it('checks MAC-Address changes', () => {
      const attr = buildAttr();
      attr['MAC-Address'] = null;
      expect(checkGSEDiff(findElement(woInstType, 'GSE')!, attr)).to.equal(
        true
      );

      const attrsNulled = buildAttr(true);
      attrsNulled['MAC-Address'] = '01-0C-CD-01-00-03';
      expect(
        checkGSEDiff(findElement(nulledGSE, 'GSE')!, attrsNulled)
      ).to.equal(true);
    });

    it('checks APPID changes', () => {
      const attrs = buildAttr();
      attrs.APPID = null;
      expect(checkGSEDiff(findElement(woInstType, 'GSE')!, attrs)).to.equal(
        true
      );

      const attrsNulled = buildAttr(true);
      attrsNulled.APPID = '0345';
      expect(
        checkGSEDiff(findElement(nulledGSE, 'GSE')!, attrsNulled)
      ).to.equal(true);
    });

    it('checks VLAN-ID changes', () => {
      const attrs = buildAttr();
      attrs['VLAN-ID'] = null;
      expect(checkGSEDiff(findElement(woInstType, 'GSE')!, attrs)).to.equal(
        true
      );

      const attrsNulled = buildAttr(true);
      attrsNulled['VLAN-ID'] = '001';
      expect(
        checkGSEDiff(findElement(nulledGSE, 'GSE')!, attrsNulled)
      ).to.equal(true);
    });

    it('checks VLAN-PRIORITY changes', () => {
      const attrs = buildAttr();
      attrs['VLAN-PRIORITY'] = null;
      expect(checkGSEDiff(findElement(woInstType, 'GSE')!, attrs)).to.equal(
        true
      );

      const attrsNulled = buildAttr(true);
      attrsNulled['VLAN-PRIORITY'] = '3';
      expect(
        checkGSEDiff(findElement(nulledGSE, 'GSE')!, attrsNulled)
      ).to.equal(true);
    });

    it('checks MinTime changes', () => {
      const attrs = buildAttr();
      attrs.MinTime = null;
      expect(checkGSEDiff(findElement(woInstType, 'GSE')!, attrs)).to.equal(
        true
      );

      const attrsNulled = buildAttr(true);
      attrsNulled.MinTime = '076';
      expect(
        checkGSEDiff(findElement(nulledGSE, 'GSE')!, attrsNulled)
      ).to.equal(true);
    });
  });

  describe('updateGSE', () => {
    it('returns empty action array with no updates ', () => {
      const gSE = findElement(woInstType, 'GSE')!;
      const actions = updateGSE(gSE, buildAttr());

      expect(actions.length).to.equal(0);
    });

    it('returns action array to update the MAC-Address ', () => {
      const gSE = findElement(woInstType, 'GSE')!;

      testPTypeChange(gSE, 'MAC-Address', '01-0C-CD-01-00-01');
    });

    it('returns action array to remove the MAC-Address ', () => {
      const gSE = findElement(woInstType, 'GSE')!;

      testPTypeChange(gSE, 'MAC-Address', null);
    });

    it('returns action array to update the APPID ', () => {
      const gSE = findElement(woInstType, 'GSE')!;

      testPTypeChange(gSE, 'APPID', '0003');
    });

    it('returns action array to remove the APPID ', () => {
      const gSE = findElement(woInstType, 'GSE')!;

      testPTypeChange(gSE, 'APPID', null);
    });

    it('returns action array to update the VLAN-ID ', () => {
      const gSE = findElement(woInstType, 'GSE')!;

      testPTypeChange(gSE, 'VLAN-ID', '001');
    });

    it('returns action array to remove the VLAN-ID ', () => {
      const gSE = findElement(woInstType, 'GSE')!;

      testPTypeChange(gSE, 'VLAN-ID', null);
    });

    it('returns action array to update the VLAN-PRIORITY ', () => {
      const gSE = findElement(woInstType, 'GSE')!;

      testPTypeChange(gSE, 'VLAN-PRIORITY', '0');
    });

    it('returns action array to remove the VLAN-PRIORITY ', () => {
      const gSE = findElement(woInstType, 'GSE')!;

      testPTypeChange(gSE, 'VLAN-PRIORITY', null);
    });

    it('returns action array to update the MinTime ', () => {
      const gSE = findElement(woInstType, 'GSE')!;

      testTimeChange(gSE, 'MinTime', '54');
    });

    it('adds instType ', () => {
      const gSE = findElement(woInstType, 'GSE')!;

      const oldAddress = gSE.querySelector('Address');

      const attrs = buildAttr();
      const actions = updateGSE(gSE, attrs, true);

      expect(actions.length).to.equal(2);
      expect(actions[0]).to.satisfies(isInsert);
      expect((actions[0] as Insert).parent).to.equal(gSE);
      for (const p of Array.from(
        ((actions[0] as Insert).node as Element).children
      ))
        expect(p).to.have.attribute('xsi:type');
      // eslint-disable-next-line no-unused-expressions
      expect((actions[0] as Insert).reference).to.exist;
      expect(actions[1]).to.satisfies(isRemove);
      expect((actions[1] as Remove).node).to.equal(oldAddress);
    });

    it('removes instType ', () => {
      const gSE = findElement(withInstType, 'GSE')!;

      const oldAddress = gSE.querySelector('Address');

      const attrs = buildAttr();
      const actions = updateGSE(gSE, attrs, false);

      expect(actions.length).to.equal(2);
      expect(actions[0]).to.satisfies(isInsert);
      expect((actions[0] as Insert).parent).to.equal(gSE);
      for (const p of Array.from(
        ((actions[0] as Insert).node as Element).children
      ))
        expect(p).to.not.have.attribute('xsi:type');
      // eslint-disable-next-line no-unused-expressions
      expect((actions[0] as Insert).reference).to.exist;
      expect(actions[1]).to.satisfies(isRemove);
      expect((actions[1] as Remove).node).to.equal(oldAddress);
    });

    it('returns action array to update the MinTime ', () => {
      const gSE = findElement(woInstType, 'GSE')!;

      testTimeChange(gSE, 'MinTime', '54');
    });

    it('returns action array to update MinTime ', () => {
      const gSE = findElement(woInstType, 'GSE')!;

      const oldTime = gSE.querySelector('MinTime');

      const attrs = buildAttr();
      attrs.MinTime = null;
      const actions = updateGSE(gSE, attrs);

      expect(actions.length).to.equal(3);
      expect(actions[0]).to.satisfies(isRemove);
      expect((actions[0] as Remove).node).to.equal(oldTime);
    });

    it('returns action array to update the MinTime ', () => {
      const gSE = findElement(nulledGSE, 'GSE')!;

      const attrs = buildAttr(true);
      attrs.MinTime = '65';
      const actions = updateGSE(gSE, attrs);

      expect(actions.length).to.equal(1);
      expect(actions[0]).to.satisfies(isInsert);
      expect((actions[0] as Insert).parent).to.equal(gSE);
      expect(
        ((actions[0] as Insert).node as Element)?.textContent ?? null
      ).to.equal('65');
    });

    it('returns action array to update the MaxTime ', () => {
      const gSE = findElement(woInstType, 'GSE')!;

      testTimeChange(gSE, 'MinTime', '2342');
    });

    it('returns action array to update MaxTime ', () => {
      const gSE = findElement(woInstType, 'GSE')!;

      const oldTime = gSE.querySelector('MaxTime');

      const attrs = buildAttr();
      attrs.MinTime = null;
      const actions = updateGSE(gSE, attrs);

      expect(actions.length).to.equal(3);
      expect(actions[2]).to.satisfies(isRemove);
      expect((actions[2] as Remove).node).to.equal(oldTime);
    });

    it('returns action array to update the MaxTime ', () => {
      const gSE = findElement(nulledGSE, 'GSE')!;

      const attrs = buildAttr(true);
      attrs.MaxTime = '1234';
      const actions = updateGSE(gSE, attrs);

      expect(actions.length).to.equal(1);
      expect(actions[0]).to.satisfies(isInsert);
      expect((actions[0] as Insert).parent).to.equal(gSE);
      expect(
        ((actions[0] as Insert).node as Element)?.textContent ?? null
      ).to.equal('1234');
    });
  });
});
