/* eslint-disable import/no-extraneous-dependencies */
import { expect } from '@open-wc/testing';

import { matchExtRefCtrlBlockAttr } from './extRef.js';

function findElement(str: string, selector: string): Element | null {
  return new DOMParser()
    .parseFromString(str, 'application/xml')
    .querySelector(selector);
}

describe('Utility functions for FCDA element', () => {
  describe('matchExtRefFcda', () => {
    const extRefStr = `<ExtRef 
      srcLDInst="ldInst" 
      srcPrefix="prefix" 
      srcLNClass="USER" 
      srcLNInst="1" 
      srcCBName="gse" 
      serviceType="GOOSE" />`;
    const extRef = findElement(extRefStr, 'ExtRef');

    const ldInstStr = `<LDevice inst="ldInst" />`;
    const ln0Str = `<LN0 lnClass="LLN0" inst="1" />`;
    const lnStr = `<LN prefix="prefix" lnClass="USER" inst="1" />`;
    const gseStr = `<GSEControl name="gse" />`;
    const smvStr = `<SampledValueControl name="smv" />`;
    const rpStr = `<ReportControl name="rp" />`;
    const LDevice = findElement(ldInstStr, 'LDevice');
    const ln0 = findElement(ln0Str, 'LN0');
    const ln = findElement(lnStr, 'LN');
    const gse = findElement(gseStr, 'GSEControl');
    const smv = findElement(smvStr, 'SampledValueControl');
    const rp = findElement(rpStr, 'ReportControl');

    it('return false with orphan control block', () =>
      expect(matchExtRefCtrlBlockAttr(extRef!, gse!)).to.equal(false));

    it('return true with equal values', () => {
      LDevice!.appendChild(ln!);
      ln!.appendChild(gse!);

      expect(matchExtRefCtrlBlockAttr(extRef!, gse!)).to.equal(true);
    });

    it('is insensitive to null prefix', () => {
      ln?.removeAttribute('prefix');
      extRef?.setAttribute('srcPrefix', '');

      LDevice!.appendChild(ln!);
      ln!.appendChild(gse!);

      expect(matchExtRefCtrlBlockAttr(extRef!, gse!)).to.equal(true);
    });

    it('is insensitive to empty string prefix', () => {
      extRef?.removeAttribute('prefix');
      ln?.setAttribute('srcPrefix', '');

      LDevice!.appendChild(ln!);
      ln!.appendChild(gse!);

      expect(matchExtRefCtrlBlockAttr(extRef!, gse!)).to.equal(true);
    });

    it('allows LN0 as parent', () => {
      extRef?.removeAttribute('srcPrefix');
      extRef?.setAttribute('srcLNClass', 'LLN0');

      LDevice!.appendChild(ln0!);
      ln0!.appendChild(gse!);

      expect(matchExtRefCtrlBlockAttr(extRef!, gse!)).to.equal(true);
    });

    it('checks cbName and serviceType', () => {
      extRef?.setAttribute('srcCBName', 'rp');
      extRef?.setAttribute('serviceType', 'Report');

      LDevice!.appendChild(ln0!);
      ln0!.appendChild(rp!);

      expect(matchExtRefCtrlBlockAttr(extRef!, rp!)).to.equal(true);
    });

    it('checks cbName and serviceType with SampledValueControl', () => {
      extRef?.setAttribute('srcCBName', 'smv');
      extRef?.setAttribute('serviceType', 'SMV');

      LDevice!.appendChild(ln0!);
      ln0!.appendChild(smv!);

      expect(matchExtRefCtrlBlockAttr(extRef!, smv!)).to.equal(true);
    });
  });
});
