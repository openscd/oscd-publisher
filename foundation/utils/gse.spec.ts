/* eslint-disable import/no-extraneous-dependencies */
import { expect } from '@open-wc/testing';

import { checkGSEDiff, referencedGSE } from './gse.js';
import {
  nulledGSE,
  orphanGSEControl,
  partlyInstType,
  simpleReferenceGSE,
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

  describe('referencedGSE', () => {
    it('return null for orphan GSEcontrol', () =>
      expect(referencedGSE(findElement(orphanGSEControl, 'GSEControl')!)).to.be
        .null);

    it('return null for missing GSE', () =>
      expect(referencedGSE(findElement(simpleReferenceGSE, 'GSEControl')!)).to
        .be.null);

    it('return null for missing GSE', () =>
      expect(
        referencedGSE(
          findElement(simpleReferenceGSE, 'GSEControl[name="someGse2"]')!
        )
      ).to.not.be.null);
  });
});
